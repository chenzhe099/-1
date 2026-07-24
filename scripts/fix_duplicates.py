import re

with open('d:\\gjcx\\index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 找到所有section标签的位置
section_pattern = r'<section id="([^"]+)"'
sections = list(re.finditer(section_pattern, content))

# 反向遍历，从后往前删除重复的section
seen_sections = set()
sections_to_remove = []

for match in reversed(sections):
    sec_id = match.group(1)
    if sec_id in seen_sections:
        # 找到这个section的结束标签
        start_pos = match.start()
        # 找到对应的 </section>
        end_tag = '</section>'
        end_pos = content.find(end_tag, start_pos)
        if end_pos != -1:
            sections_to_remove.append((start_pos, end_pos + len(end_tag)))
    else:
        seen_sections.add(sec_id)

print(f"需要移除 {len(sections_to_remove)} 个重复的 section 块")

# 按位置降序排序（从后往前删除）
sections_to_remove.sort(key=lambda x: x[0], reverse=True)

# 删除重复的section
new_content = content
for start, end in sections_to_remove:
    print(f"  删除位置 {start} - {end}")
    new_content = new_content[:start] + new_content[end:]

# 保存清理后的文件
with open('d:\\gjcx\\index.html', 'w', encoding='utf-8') as f:
    f.write(new_content)

print(f"\n清理完成！文件已更新。")
print(f"清理前长度: {len(content)} 字符")
print(f"清理后长度: {len(new_content)} 字符")
