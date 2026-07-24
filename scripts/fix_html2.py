with open('d:\\gjcx\\index.html.backup', 'r', encoding='utf-8') as f:
    content = f.read()

# 找到style标签的位置并替换
style_start = content.find('<style>')
style_end = content.find('</style>') + 8
content = content[:style_start] + '<link rel="stylesheet" href="css/styles.css">' + content[style_end:]

# 找到最后的script标签并替换
script_start = content.rfind('<script>')
content = content[:script_start] + '<script src="js/app.js"></script>\n<script src="js/charts.js"></script>' + '</body>\n</html>'

with open('d:\\gjcx\\index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Done!")
