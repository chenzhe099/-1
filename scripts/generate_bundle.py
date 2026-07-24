"""
生成 data-bundle.js
读取 data/ 目录下所有 .json 文件，合并为 window.__MOCK_DATA__ 对象
"""
import json
import os
from pathlib import Path

DATA_DIR = Path(__file__).parent.parent / 'frontend' / 'data'
OUTPUT_FILE = DATA_DIR / 'data-bundle.js'

def main():
    bundle = {}
    json_files = sorted(DATA_DIR.glob('*.json'))

    for fpath in json_files:
        table_name = fpath.stem
        with open(fpath, 'r', encoding='utf-8') as f:
            try:
                bundle[table_name] = json.load(f)
                print(f'  OK {table_name}.json ({len(bundle[table_name])} rows)')
            except json.JSONDecodeError as e:
                print(f'  ERR {table_name}.json - JSON error: {e}')

    # 生成 JS 文件
    js_content = '// 自动生成 — 包含 data/ 目录下所有 JSON 数据\n'
    js_content += '// 用于 file:// 协议回退，数据由 scripts/generate_bundle.py 生成\n'
    js_content += f'// 共 {len(bundle)} 张表\n'
    js_content += 'window.__MOCK_DATA__ = '
    js_content += json.dumps(bundle, ensure_ascii=False, indent=2)
    js_content += ';\n'

    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        f.write(js_content)

    total_rows = sum(len(v) for v in bundle.values())
    print(f'\nOK data-bundle.js generated: {len(bundle)} tables, {total_rows} rows')
    print(f'  Output: {OUTPUT_FILE}')

if __name__ == '__main__':
    main()
