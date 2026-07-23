import re

with open('d:\\gjcx\\index.html.backup', 'r', encoding='utf-8') as f:
    content = f.read()

# 替换style标签为CSS引用
content = re.sub(r'<style>.*?</style>', '<link rel="stylesheet" href="css/styles.css">', content, flags=re.DOTALL)

# 替换最后的script标签（包含所有Chart.js代码的那个）
content = re.sub(r'\s*<script>\s*const menuButtons.*?</script>\s*$', '<script src="js/app.js"></script>\n<script src="js/charts.js"></script>', content, flags=re.DOTALL)

with open('d:\\gjcx\\index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Done!")
