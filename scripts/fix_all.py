import re

with open('d:\\gjcx\\index.html.backup', 'r', encoding='utf-8') as f:
    content = f.read()

# 移除所有内联脚本标签
content = re.sub(r'<script>\s*const menuButtons.*?</script>', '', content, flags=re.DOTALL)

# 移除所有style标签
content = re.sub(r'<style>.*?</style>', '', content, flags=re.DOTALL)

# 在</head>之前添加CSS引用
content = content.replace('</head>', '    <link rel="stylesheet" href="css/styles.css">\n</head>')

# 在</body>之前添加外部脚本引用
content = content.replace('</body>', '    <script src="js/app.js"></script>\n    <script src="js/charts.js"></script>\n</body>')

# 清理多余的空行
content = re.sub(r'\n\s*\n\s*\n', '\n\n', content)

with open('d:\\gjcx\\index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Done! File cleaned successfully.")
