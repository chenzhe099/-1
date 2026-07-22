"""
使用 Edge 浏览器 headless 模式截取系统界面截图
"""
import subprocess, os, time, json

BASE = r'd:\zhuomian\gjcx'
SCREENSHOT_DIR = os.path.join(BASE, 'assets', 'screenshots')
os.makedirs(SCREENSHOT_DIR, exist_ok=True)

EDGE = r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
APP_URL = 'http://localhost:8000'

# 模块列表
sections = [
    ('dashboard', '数据总览驾驶舱'),
    ('disease', 'AI病虫害识别'),
    ('farming', 'AI精准农事决策'),
    ('prediction', '产量预测与规划'),
    ('management', '数字化农场管理'),
    ('devices', '设备监控与控制'),
    ('traceability', '农产品溯源管理'),
    ('permission', '权限管理'),
]

print('Taking screenshots using Edge headless mode...')
success_count = 0

for section_id, section_name in sections:
    out_path = os.path.join(SCREENSHOT_DIR, f'{section_id}.png')

    # Use Edge headless with a custom screenshot command
    # We need to inject JS to show the right section
    # Approach: load page with a hash parameter, use JS to trigger navigation

    # Create a temp HTML that loads our app and auto-clicks the right section
    temp_html = os.path.join(SCREENSHOT_DIR, f'_temp_{section_id}.html')
    with open(temp_html, 'w', encoding='utf-8') as f:
        f.write(f'''<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0">
<iframe src="{APP_URL}/index.html" width="1440" height="900" style="border:none" id="app"></iframe>
<script>
// Wait for iframe to load, then click the right sidebar button
var iframe = document.getElementById('app');
iframe.onload = function() {{
    setTimeout(function() {{
        try {{
            var doc = iframe.contentDocument || iframe.contentWindow.document;
            var btn = doc.querySelector('.sidebar-item[data-menu="{section_id}"]');
            if (btn) btn.click();
        }} catch(e) {{ console.log(e); }}
    }}, 2000);
}};
</script>
</body>
</html>''')

    try:
        result = subprocess.run([
            EDGE,
            f'--headless=new',
            f'--screenshot={out_path}',
            '--window-size=1440,900',
            '--hide-scrollbars',
            '--force-device-scale-factor=1',
            f'file:///{temp_html.replace(chr(92), "/")}'
        ], capture_output=True, text=True, timeout=30000, cwd=SCREENSHOT_DIR)

        # Clean up temp file
        os.remove(temp_html)

        if os.path.exists(out_path) and os.path.getsize(out_path) > 10000:
            print(f'  OK {section_name} -> {section_id}.png ({os.path.getsize(out_path)/1024:.0f} KB)')
            success_count += 1
        else:
            print(f'  ERR {section_name}: screenshot file too small or missing')
            # Try direct homepage screenshot
            direct_path = os.path.join(SCREENSHOT_DIR, f'{section_id}_direct.png')
            subprocess.run([
                EDGE,
                '--headless=new',
                f'--screenshot={direct_path}',
                '--window-size=1440,900',
                APP_URL + '/index.html'
            ], capture_output=True, text=True, timeout=30000, cwd=SCREENSHOT_DIR)
            if os.path.exists(direct_path) and os.path.getsize(direct_path) > 10000:
                print(f'    -> Fallback screenshot saved ({os.path.getsize(direct_path)/1024:.0f} KB)')

    except subprocess.TimeoutExpired:
        print(f'  ERR {section_name}: timeout')
    except Exception as e:
        print(f'  ERR {section_name}: {e}')

print(f'\nDone: {success_count}/{len(sections)} screenshots captured')
print(f'Location: {SCREENSHOT_DIR}')
