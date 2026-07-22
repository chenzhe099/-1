"""
从 frontend/data/*.json 生成 MySQL 迁移脚本
输出: docs/database/migrations/V1__init_schema.sql
      docs/database/migrations/V2__seed_data.sql
      docs/database/migrations/V3__add_indexes.sql
"""
import json
import os
import re

DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'frontend', 'data')
MIGRATIONS_DIR = os.path.join(os.path.dirname(__file__), '..', 'docs', 'database', 'migrations')

# 表名映射: JSON文件名 -> SQL表名
TABLE_MAP = {
    'users': 'users', 'roles': 'roles', 'crops': 'crops', 'fields': 'fields',
    'farming_tasks': 'farming_tasks', 'devices': 'devices',
    'irrigation_plans': 'irrigation_plans', 'fertilization_plans': 'fertilization_plans',
    'maintenance_records': 'maintenance_records', 'disease_records': 'disease_records',
    'pest_knowledge_base': 'pest_knowledge_base', 'products': 'products',
    'production_timeline': 'production_timeline',
    'quality_certifications': 'quality_certifications',
    'yield_predictions': 'yield_predictions',
    'environment_readings': 'environment_readings', 'soil_readings': 'soil_readings',
    'alerts': 'alerts', 'operation_logs': 'operation_logs',
    'inventory': 'inventory', 'personnel': 'personnel',
    'farms': 'farms', 'planting_cycles': 'planting_cycles',
    'weather_records': 'weather_records', 'market_prices': 'market_prices',
    'knowledge_documents': 'knowledge_documents', 'model_versions': 'model_versions',
}

# 外键关系
FOREIGN_KEYS = {
    'users': [('role', 'roles', 'id')],
    'fields': [('cropId', 'crops', 'id')],
    'farming_tasks': [('fieldId', 'fields', 'id'), ('assignedTo', 'users', 'id')],
    'irrigation_plans': [('fieldId', 'fields', 'id')],
    'fertilization_plans': [('fieldId', 'fields', 'id')],
    'maintenance_records': [('deviceId', 'devices', 'id')],
    'disease_records': [('fieldId', 'fields', 'id')],
    'products': [('cropId', 'crops', 'id'), ('fieldId', 'fields', 'id')],
    'production_timeline': [('productId', 'products', 'id')],
    'quality_certifications': [('productId', 'products', 'id')],
    'yield_predictions': [('cropId', 'crops', 'id')],
    'environment_readings': [('deviceId', 'devices', 'id')],
    'soil_readings': [('fieldId', 'fields', 'id')],
    'alerts': [('fieldId', 'fields', 'id')],
    'operation_logs': [('userId', 'users', 'id')],
    'planting_cycles': [('fieldId', 'fields', 'id'), ('farmId', 'farms', 'id'), ('cropId', 'crops', 'id')],
}

# JSON类型字段 (存储为TEXT/JSON)
JSON_FIELDS = {
    'roles': ['permissions'],
    'fields': ['location'],
    'devices': ['metrics'],
    'disease_records': ['treatmentPlan'],
    'pest_knowledge_base': ['prevention', 'chemicalControl', 'biologicalControl', 'agriculturalControl', 'affectedCrops'],
    'products': ['certifications'],
    'knowledge_documents': ['keywords'],
    'personnel': ['assignedFields'],
}

# 索引
INDEXES = [
    ('users', 'idx_users_username', ['username'], True),
    ('users', 'idx_users_role', ['role'], False),
    ('fields', 'idx_fields_crop', ['cropId'], False),
    ('farming_tasks', 'idx_ft_status', ['status'], False),
    ('farming_tasks', 'idx_ft_scheduled', ['scheduledTime'], False),
    ('farming_tasks', 'idx_ft_field', ['fieldId'], False),
    ('irrigation_plans', 'idx_ip_field', ['fieldId'], False),
    ('fertilization_plans', 'idx_fp_field', ['fieldId'], False),
    ('disease_records', 'idx_dr_field', ['fieldId'], False),
    ('alerts', 'idx_alerts_unresolved', ['isResolved'], False),
    ('alerts', 'idx_alerts_created', ['createdAt'], False),
    ('environment_readings', 'idx_er_device', ['deviceId'], False),
    ('environment_readings', 'idx_er_ts', ['timestamp'], False),
    ('soil_readings', 'idx_sr_field', ['fieldId'], False),
    ('soil_readings', 'idx_sr_ts', ['timestamp'], False),
    ('products', 'idx_products_field', ['fieldId'], False),
    ('production_timeline', 'idx_pt_product', ['productId'], False),
    ('quality_certifications', 'idx_qc_product', ['productId'], False),
    ('operation_logs', 'idx_ol_user', ['userId'], False),
    ('operation_logs', 'idx_ol_ts', ['timestamp'], False),
    ('market_prices', 'idx_mp_crop', ['cropName'], False),
    ('market_prices', 'idx_mp_date', ['date'], False),
    ('weather_records', 'idx_wr_date', ['date'], False),
    ('planting_cycles', 'idx_pc_farm', ['farmId'], False),
    ('planting_cycles', 'idx_pc_field', ['fieldId'], False),
    ('knowledge_documents', 'idx_kd_category', ['category'], False),
    ('model_versions', 'idx_mv_status', ['status'], False),
    ('yield_predictions', 'idx_yp_crop', ['cropId'], False),
]


def infer_sql_type(key, value, table_name):
    """根据 JSON 值推断 SQL 列类型"""
    if key in JSON_FIELDS.get(table_name, []):
        return 'JSON'
    if key == 'id':
        return 'VARCHAR(36) NOT NULL'
    if isinstance(value, bool):
        return 'TINYINT(1) DEFAULT 0'
    if isinstance(value, int):
        return 'INT'
    if isinstance(value, float):
        if key in ('pricePerKg', 'cost', 'changePercent', 'driftScore', 'unknownRate',
                    'accuracy', 'area', 'soilMoisture', 'soilPh', 'waterVolume',
                    'quantityTons', 'temperature', 'humidity', 'rainfall_mm',
                    'windSpeed', 'nLevel', 'pLevel', 'kLevel'):
            return 'DECIMAL(10,2)'
        return 'DOUBLE'
    if isinstance(value, list):
        return 'JSON'
    if isinstance(value, dict):
        return 'JSON'
    # 字符串
    if key.endswith('At') or key.endswith('Date') or key == 'timestamp':
        if 'T' in str(value) if value else False:
            return 'DATETIME'
        return 'VARCHAR(30)'
    if key in ('description', 'notes', 'originalText', 'symptoms', 'causes',
                'treatmentPlan', 'details', 'message', 'address'):
        return 'TEXT'
    if key in ('imageUrl', 'qrCode'):
        return 'VARCHAR(500)'
    if key == 'email':
        return 'VARCHAR(100)'
    if len(str(value)) > 100:
        return 'TEXT'
    if len(str(value)) > 50:
        return 'VARCHAR(200)'
    return 'VARCHAR(100)'


def escape_sql(val):
    """转义 SQL 字符串值"""
    if val is None:
        return 'NULL'
    if isinstance(val, bool):
        return '1' if val else '0'
    if isinstance(val, (int, float)):
        return str(val)
    if isinstance(val, (list, dict)):
        s = json.dumps(val, ensure_ascii=False)
        s = s.replace('\\', '\\\\').replace("'", "\\'")
        return f"'{s}'"
    s = str(val).replace('\\', '\\\\').replace("'", "\\'")
    return f"'{s}'"


def generate_v1_schema():
    """生成 V1__init_schema.sql"""
    lines = [
        '-- V1: 初始化数据库表结构',
        '-- 智慧农业管理系统 - Smart Farm Management System',
        '-- 字符集: utf8mb4 (支持中文)',
        '',
        'CREATE DATABASE IF NOT EXISTS smartfarm',
        "  DEFAULT CHARACTER SET utf8mb4",
        "  DEFAULT COLLATE utf8mb4_unicode_ci;",
        '',
        'USE smartfarm;',
        '',
    ]

    # 按依赖关系排序 (先创建被引用的表)
    ordered_tables = [
        'roles', 'users', 'farms', 'crops', 'fields',
        'farming_tasks', 'irrigation_plans', 'fertilization_plans',
        'devices', 'maintenance_records',
        'disease_records', 'pest_knowledge_base',
        'products', 'production_timeline', 'quality_certifications',
        'yield_predictions', 'environment_readings', 'soil_readings',
        'alerts', 'operation_logs', 'inventory', 'personnel',
        'planting_cycles', 'weather_records', 'market_prices',
        'knowledge_documents', 'model_versions',
    ]

    for table_name in ordered_tables:
        json_file = table_name + '.json'
        json_path = os.path.join(DATA_DIR, json_file)

        if not os.path.exists(json_path):
            print(f'  WARNING: {json_path} not found, skipping table {table_name}')
            continue

        with open(json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)

        rows = data if isinstance(data, list) else [data]
        if not rows:
            print(f'  WARNING: {json_file} is empty, using fallback schema')
            continue

        sample = rows[0]
        lines.append(f'-- {"="*60}')
        lines.append(f'-- Table: {table_name}')
        lines.append(f'-- {"="*60}')
        lines.append(f'DROP TABLE IF EXISTS `{table_name}`;')
        lines.append(f'CREATE TABLE `{table_name}` (')

        col_defs = []
        primary_key = None

        for key, value in sample.items():
            sql_type = infer_sql_type(key, value, table_name)
            col_def = f'  `{key}` {sql_type}'

            if key == 'id':
                primary_key = key
            elif key == 'username' and table_name == 'users':
                col_def += ' UNIQUE'

            col_defs.append(col_def)

        # Add password column for users table (not in JSON)
        if table_name == 'users':
            col_defs.append('  `password` VARCHAR(255) DEFAULT \'$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy\'')

        if primary_key:
            col_defs.append(f'  PRIMARY KEY (`{primary_key}`)')

        lines.append(',\n'.join(col_defs))
        lines.append(f") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;")

        # Add foreign keys
        if table_name in FOREIGN_KEYS:
            for fk_col, ref_table, ref_col in FOREIGN_KEYS[table_name]:
                fk_name = f'fk_{table_name}_{fk_col}'
                lines.append(f'ALTER TABLE `{table_name}` ADD CONSTRAINT `{fk_name}` '
                           f'FOREIGN KEY (`{fk_col}`) REFERENCES `{ref_table}`(`{ref_col}`) '
                           f'ON DELETE SET NULL ON UPDATE CASCADE;')

        lines.append('')

    return '\n'.join(lines)


def generate_v2_seed_data():
    """生成 V2__seed_data.sql"""
    lines = [
        '-- V2: 种子数据',
        '-- 从 frontend/data/*.json 自动生成',
        '',
        'USE smartfarm;',
        '',
    ]

    # 按依赖顺序
    ordered_tables = [
        'roles', 'users', 'farms', 'crops', 'fields',
        'farming_tasks', 'irrigation_plans', 'fertilization_plans',
        'devices', 'maintenance_records', 'disease_records', 'pest_knowledge_base',
        'products', 'production_timeline', 'quality_certifications',
        'yield_predictions', 'environment_readings', 'soil_readings',
        'alerts', 'operation_logs', 'inventory', 'personnel',
        'planting_cycles', 'weather_records', 'market_prices',
        'knowledge_documents', 'model_versions',
    ]

    for table_name in ordered_tables:
        json_file = table_name + '.json'
        json_path = os.path.join(DATA_DIR, json_file)

        if not os.path.exists(json_path):
            continue

        with open(json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)

        rows = data if isinstance(data, list) else [data]
        if not rows:
            continue

        lines.append(f'-- Table: {table_name} ({len(rows)} rows)')

        for i, row in enumerate(rows):
            cols = list(row.keys())
            values = [escape_sql(row[c]) for c in cols]

            # 每10行一组 INSERT
            if i % 10 == 0:
                col_list = ', '.join(f'`{c}`' for c in cols)
                lines.append(f'INSERT INTO `{table_name}` ({col_list}) VALUES')

            comma = ',' if (i + 1) % 10 != 0 and i < len(rows) - 1 else ';'
            lines.append(f'  ({", ".join(values)}){comma}')

            if (i + 1) % 10 == 0 and i < len(rows) - 1:
                pass  # next iteration will start new INSERT

        lines.append('')

    return '\n'.join(lines)


def generate_v3_indexes():
    """生成 V3__add_indexes.sql"""
    lines = [
        '-- V3: 添加索引以优化查询性能',
        '',
        'USE smartfarm;',
        '',
    ]

    for table, idx_name, cols, is_unique in INDEXES:
        unique_str = 'UNIQUE ' if is_unique else ''
        col_str = ', '.join(f'`{c}`' for c in cols)
        lines.append(f'CREATE {unique_str}INDEX `{idx_name}` ON `{table}` ({col_str});')

    lines.append('')
    return '\n'.join(lines)


if __name__ == '__main__':
    os.makedirs(MIGRATIONS_DIR, exist_ok=True)

    print('Generating V1__init_schema.sql ...')
    v1 = generate_v1_schema()
    v1_path = os.path.join(MIGRATIONS_DIR, 'V1__init_schema.sql')
    with open(v1_path, 'w', encoding='utf-8') as f:
        f.write(v1)
    print(f'  -> {v1_path} ({len(v1)} chars)')

    print('Generating V2__seed_data.sql ...')
    v2 = generate_v2_seed_data()
    v2_path = os.path.join(MIGRATIONS_DIR, 'V2__seed_data.sql')
    with open(v2_path, 'w', encoding='utf-8') as f:
        f.write(v2)
    print(f'  -> {v2_path} ({len(v2)} chars)')

    print('Generating V3__add_indexes.sql ...')
    v3 = generate_v3_indexes()
    v3_path = os.path.join(MIGRATIONS_DIR, 'V3__add_indexes.sql')
    with open(v3_path, 'w', encoding='utf-8') as f:
        f.write(v3)
    print(f'  -> {v3_path} ({len(v3)} chars)')

    print('\nDone! All migration files generated.')
