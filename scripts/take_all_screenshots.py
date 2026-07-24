"""批量截取所有模块界面截图"""
import subprocess, os, sys

BASE = r'd:\zhuomian\gjcx'
SCREENSHOT_DIR = os.path.join(BASE, 'assets', 'screenshots')
os.makedirs(SCREENSHOT_DIR, exist_ok=True)
EDGE = r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'

sections = [
    ('dashboard', '01_dashboard'),
    ('disease', '02_disease'),
    ('farming', '03_farming'),
    ('prediction', '04_prediction'),
    ('management', '05_management'),
    ('devices', '06_devices'),
    ('traceability', '07_traceability'),
    ('permission', '08_permission'),
]

ok = 0
for sec_id, filename in sections:
    url = f'http://localhost:8000/index.html#{sec_id}'
    out = os.path.join(SCREENSHOT_DIR, f'{filename}.png')
    try:
        r = subprocess.run([
            EDGE, '--headless=new', f'--screenshot={out}',
            '--window-size=1440,900', '--hide-scrollbars', url
        ], capture_output=True, text=True, timeout=30000)
        if os.path.exists(out) and os.path.getsize(out) > 30000:
            print(f'  OK  {filename}.png  ({os.path.getsize(out)//1024} KB)')
            ok += 1
        else:
            sz = os.path.getsize(out) if os.path.exists(out) else 0
            print(f'  ERR {filename}.png  ({sz} bytes - too small)')
    except Exception as e:
        print(f'  ERR {filename}.png: {e}')

print(f'\nDone: {ok}/{len(sections)} screenshots')
print(f'Location: {SCREENSHOT_DIR}')
