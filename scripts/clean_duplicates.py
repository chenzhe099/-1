import re

with open('d:\\gjcx\\index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 找到所有section的位置
section_pattern = r'<section id="([^"]+)"'
sections = [(m.start(), m.group(1)) for m in re.finditer(section_pattern, content)]

print(f"找到 {len(sections)} 个 section 定义")
for i, (pos, sec_id) in enumerate(sections):
    print(f"{i+1}. 位置 {pos}: {sec_id}")

# 检查是否有重复
seen = {}
duplicates = []
for pos, sec_id in sections:
    if sec_id in seen:
        duplicates.append((pos, sec_id))
    else:
        seen[sec_id] = pos

if duplicates:
    print(f"\n发现 {len(duplicates)} 个重复的 section:")
    for pos, sec_id in duplicates:
        print(f"  - {sec_id} 在位置 {pos}")
else:
    print("\n没有重复的 section")

# 统计每个section出现的次数
from collections import Counter
section_counts = Counter(sec_id for _, sec_id in sections)
print(f"\nSection 统计:")
for sec_id, count in section_counts.items():
    print(f"  {sec_id}: {count} 次")
