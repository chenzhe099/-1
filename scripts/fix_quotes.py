with open('../frontend/js/app.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix: onclick="showFieldComprehensiveDetail('" + f.id + "')" → use \' escaped single quotes
old1 = """onclick="showFieldComprehensiveDetail('\\" + f.id + "')""""
new1 = """onclick="showFieldComprehensiveDetail(\\'\" + f.id + \"\\')""""
content = content.replace(old1, new1)

old2 = """onclick="event.stopPropagation();deleteField('\\" + f.id + "')""""
new2 = """onclick="event.stopPropagation();deleteField(\\'\" + f.id + \"\\')""""
content = content.replace(old2, new2)

old3 = """onclick="showFarmingProgressDetail('\\" + p.type + "')""""
new3 = """onclick="showFarmingProgressDetail(\\'\" + p.type + \"\\')""""
content = content.replace(old3, new3)

with open('../frontend/js/app.js', 'w', encoding='utf-8') as f:
    f.write(content)

# Verify the result
for i, line in enumerate(content.split('\n'), 1):
    if i in [342, 354, 386]:
        print(f'Line {i}: {line.strip()[:100]}')

# Verify braces
o = content.count('{')
c = content.count('}')
print(f'Braces: {{{o}}} {{{c}}} {"OK" if o==c else "ERR"}')
