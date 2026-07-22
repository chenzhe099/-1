with open('d:\\gjcx\\index.html.backup', 'r', encoding='utf-8') as f:
    content = f.read()

# 找到第一个style标签的位置并替换
style_start = content.find('<style>')
style_end = content.find('</style>') + 8
content = content[:style_start] + '<link rel="stylesheet" href="css/styles.css">' + content[style_end:]

# 找到最后一个script标签的开始位置
last_script_start = content.rfind('<script>')
# 找到最后一个script标签结束后的位置（包括</body></html>）
body_end = content.rfind('</body>')

# 替换为外部脚本引用
content = content[:last_script_start] + '<script src="js/app.js"></script>\n<script src="js/charts.js"></script>' + content[body_end:]

with open('d:\\gjcx\\index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Done!")
