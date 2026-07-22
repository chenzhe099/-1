"""Fix escaped single quotes in app.js onclick handlers"""
path = '../frontend/js/app.js'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

fixes = [
    # (old, new)
    (r""""showFieldComprehensiveDetail('\" + f.id + \"')"""",
     r""""showFieldComprehensiveDetail(\'\" + f.id + \"\\')""""),

    (r""""event.stopPropagation();deleteField('\" + f.id + \"')"""",
     r""""event.stopPropagation();deleteField(\\'\" + f.id + \"\\')""""),

    (r""""showFarmingProgressDetail('\" + p.type + \"')"""",
     r""""showFarmingProgressDetail(\\'\" + p.type + \"\\')""""),
]

for old, new in fixes:
    if old in content:
        content = content.replace(old, new)
        print('Fixed:', old[:50], '...')
    else:
        print('NOT FOUND:', old[:50], '...')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

# Verify
with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

for idx in [341, 353, 385]:
    line = lines[idx].strip()[:130]
    print(f'Line {idx+1}: {line}')

o = content.count('{')
c = content.count('}')
print(f'Braces: {{{o}}} {{{c}}} {"OK" if o == c else "ERR"}')
