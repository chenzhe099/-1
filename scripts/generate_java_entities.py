"""
从 frontend/data/*.json 自动生成 Spring Boot JPA Entity 和 Repository 类
"""
import json
import os

DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'frontend', 'data')
ENTITY_DIR = os.path.join(os.path.dirname(__file__), '..', 'backend', 'src', 'main', 'java', 'com', 'smartfarm', 'entity')
REPO_DIR = os.path.join(os.path.dirname(__file__), '..', 'backend', 'src', 'main', 'java', 'com', 'smartfarm', 'repository')

# 表名 -> Java 类名
def table_to_class(table_name):
    parts = table_name.split('_')
    return ''.join(p.capitalize() for p in parts)

# JSON 字段类型 -> Java 类型
def json_to_java_type(key, value):
    if key in ('id', 'farmId', 'fieldId', 'cropId', 'productId', 'deviceId',
                'userId', 'managerId', 'assignedTo', 'username', 'displayName',
                'name', 'cropName', 'fieldCode', 'batchNumber', 'diseaseName',
                'cropAffected', 'type', 'role', 'status', 'category', 'icon',
                'color', 'unit', 'market', 'condition', 'forecast', 'modelName',
                'version', 'stage', 'location', 'operator', 'avatar', 'phone',
                'email', 'ipAddress', 'firmwareVersion', 'nameEn', 'scientificName',
                'category', 'trend', 'severity', 'qualityGrade', 'growthStage'):
        return 'String'
    if isinstance(value, bool):
        return 'Boolean'
    if isinstance(value, int):
        return 'Integer'
    if isinstance(value, float):
        return 'Double'
    if isinstance(value, list):
        return 'String'  # JSON stored as String
    if isinstance(value, dict):
        return 'String'  # JSON stored as String
    if len(str(value)) > 200:
        return 'String'  # TEXT
    return 'String'


# JSON -> Java 注解
def column_annotation(key, value, table_name):
    """生成 @Column 注解"""
    parts = []
    parts.append(f'name = "{key}"')

    if len(str(value)) > 500:
        parts.append('columnDefinition = "TEXT"')
    elif key in ('id',):
        parts.append('length = 36')

    if key == 'id':
        return '@Id\n    @Column(length = 36)'
    return f'@Column({", ".join(parts)})'


def generate_entity(table_name, sample_row):
    """生成单个 Entity 类"""
    class_name = table_to_class(table_name)

    imports = [
        'import jakarta.persistence.*;',
        'import lombok.*;',
    ]
    if any(isinstance(v, (list, dict)) for v in sample_row.values()):
        pass  # String fields don't need special imports

    lines = [
        'package com.smartfarm.entity;',
        '',
    ] + imports + [
        '',
        f'@Entity',
        f'@Table(name = "{table_name}")',
        '@Data',
        '@NoArgsConstructor',
        '@AllArgsConstructor',
        '@Builder',
        f'public class {class_name} {{',
    ]

    for key, value in sample_row.items():
        java_type = json_to_java_type(key, value)
        col_anno = column_annotation(key, value, table_name)
        # 生成 field
        lines.append(f'    {col_anno}')
        lines.append(f'    private {java_type} {key};')
        lines.append('')

    # Add password for users
    if table_name == 'users':
        lines.append('    @Column(length = 255)')
        lines.append('    private String password;')
        lines.append('')

    lines.append('}')

    return '\n'.join(lines)


def generate_repository(table_name, sample_row):
    """生成单个 Repository 接口"""
    class_name = table_to_class(table_name)
    pk_type = 'String'

    lines = [
        'package com.smartfarm.repository;',
        '',
        f'import com.smartfarm.entity.{class_name};',
        'import org.springframework.data.jpa.repository.JpaRepository;',
        'import org.springframework.stereotype.Repository;',
        'import java.util.List;',
        'import java.util.Optional;',
        '',
        '@Repository',
        f'public interface {class_name}Repository extends JpaRepository<{class_name}, {pk_type}> {{',
        '',
    ]

    # 添加常用查询方法
    fields = list(sample_row.keys())

    if 'username' in fields:
        lines.append(f'    Optional<{class_name}> findByUsername(String username);')
    if 'status' in fields:
        lines.append(f'    List<{class_name}> findByStatus(String status);')
    if 'farmId' in fields:
        lines.append(f'    List<{class_name}> findByFarmId(String farmId);')
    if 'fieldId' in fields:
        lines.append(f'    List<{class_name}> findByFieldId(String fieldId);')
    if 'cropId' in fields:
        lines.append(f'    List<{class_name}> findByCropId(String cropId);')
    if 'deviceId' in fields:
        lines.append(f'    List<{class_name}> findByDeviceId(String deviceId);')
    if 'userId' in fields:
        lines.append(f'    List<{class_name}> findByUserId(String userId);')
    if 'productId' in fields:
        lines.append(f'    List<{class_name}> findByProductId(String productId);')
    if 'date' in fields:
        lines.append(f'    List<{class_name}> findByDateContaining(String date);')
    if 'isResolved' in fields:
        lines.append(f'    List<{class_name}> findByIsResolved(Boolean isResolved);')
    if 'role' in fields and table_name != 'roles':
        lines.append(f'    List<{class_name}> findByRole(String role);')
        lines.append(f'    long countByRole(String role);')

    lines.append('}')

    return '\n'.join(lines)


if __name__ == '__main__':
    os.makedirs(ENTITY_DIR, exist_ok=True)
    os.makedirs(REPO_DIR, exist_ok=True)

    json_files = sorted([f for f in os.listdir(DATA_DIR) if f.endswith('.json')])

    for json_file in json_files:
        table_name = json_file.replace('.json', '')
        json_path = os.path.join(DATA_DIR, json_file)

        with open(json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)

        rows = data if isinstance(data, list) else [data]
        if not rows:
            print(f'  SKIP {table_name}: empty')
            continue

        sample = rows[0]

        # 生成 Entity
        entity = generate_entity(table_name, sample)
        entity_name = table_to_class(table_name)
        entity_path = os.path.join(ENTITY_DIR, f'{entity_name}.java')
        with open(entity_path, 'w', encoding='utf-8') as f:
            f.write(entity)
        print(f'  Entity: {entity_name}.java ({len(entity)} chars)')

        # 生成 Repository
        repo = generate_repository(table_name, sample)
        repo_name = f'{entity_name}Repository'
        repo_path = os.path.join(REPO_DIR, f'{repo_name}.java')
        with open(repo_path, 'w', encoding='utf-8') as f:
            f.write(repo)
        print(f'  Repo:   {repo_name}.java ({len(repo)} chars)')

    print(f'\nDone! Generated {len(json_files)} entities and repositories.')
