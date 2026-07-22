import re

with open('d:\\gjcx\\index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 替换所有外部图片链接为图标占位符
# 模式1: <img src="https://neeko-copilot.bytedance.net/api/text2image?... class="w-full h-16 object-cover rounded mb-2">
pattern1 = r'<img src="https://neeko-copilot\.bytedance\.net/api/text2image[^"]+" class="w-full h-16 object-cover rounded mb-2">'
replacement1 = '<div class="w-full h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded mb-2 flex items-center justify-center"><i class="fas fa-leaf text-2xl text-gray-400"></i></div>'

# 模式2: <img src="https://neeko-copilot.bytedance.net/api/text2image?... class="w-12 h-12 rounded-lg object-cover mr-3">
pattern2 = r'<img src="https://neeko-copilot\.bytedance\.net/api/text2image[^"]+" class="w-12 h-12 rounded-lg object-cover mr-3">'
replacement2 = '<div class="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center mr-3"><i class="fas fa-image text-gray-400"></i></div>'

# 执行替换
new_content = re.sub(pattern1, replacement1, content)
new_content = re.sub(pattern2, replacement2, new_content)

# 保存修改
with open('d:\\gjcx\\index.html', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("图片链接已替换完成！")
print(f"替换前长度: {len(content)}")
print(f"替换后长度: {len(new_content)}")
