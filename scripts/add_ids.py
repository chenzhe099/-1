"""
批量向 index.html 添加容器 ID
在不改变视觉结构的前提下，为关键数据容器注入 id 属性
"""
import re

HTML_PATH = r'd:\zhuomian\gjcx\index.html'

REPLACEMENTS = [
    # === 精准农事决策 farming ===
    ('<div class="space-y-4">\n                                <div class="p-4 bg-blue-50 rounded-lg">',
     '<div class="space-y-4" id="irrigation-plan-list">\n                                <div class="p-4 bg-blue-50 rounded-lg">'),

    # farming - field management
    ('<h3 class="font-semibold text-gray-800 mb-4">地块管理</h3>',
     '<h3 class="font-semibold text-gray-800 mb-4">地块管理</h3>\n                            <div class="space-y-3" id="field-management-list">'),

    # farming - task list
    ('<h3 class="font-semibold text-gray-800 mb-4">农事任务</h3>',
     '<h3 class="font-semibold text-gray-800 mb-4">农事任务</h3>\n                            <div class="space-y-3" id="farming-task-list">'),

    # farming - progress bars
    ('<h3 class="font-semibold text-gray-800 mb-4">作业进度</h3>',
     '<h3 class="font-semibold text-gray-800 mb-4">作业进度</h3>\n                            <div class="space-y-4" id="farming-progress-list">'),

    # === 产量预测 prediction ===
    ('<h3 class="font-semibold text-gray-800 mb-4">作物产量预测</h3>',
     '<h3 class="font-semibold text-gray-800 mb-4">作物产量预测</h3>\n                            <div class="space-y-4" id="crop-prediction-list">'),

    ('<h3 class="font-semibold text-gray-800 mb-4">风险预警</h3>',
     '<h3 class="font-semibold text-gray-800 mb-4">风险预警</h3>\n                            <div class="space-y-3" id="risk-alert-list">'),

    ('<h3 class="font-semibold text-gray-800 mb-4">农事规划日历</h3>',
     '<h3 class="font-semibold text-gray-800 mb-4">农事规划日历</h3>\n                            <div class="space-y-3" id="farming-calendar-list">'),

    # === 农场管理 management ===
    ('<h3 class="font-semibold text-gray-800 mb-4">近期农事记录</h3>',
     '<h3 class="font-semibold text-gray-800 mb-4">近期农事记录</h3>\n                            <div class="space-y-3" id="farm-record-list">'),

    ('<h3 class="font-semibold text-gray-800 mb-4">人员管理</h3>',
     '<h3 class="font-semibold text-gray-800 mb-4">人员管理</h3>\n                            <div class="space-y-3" id="personnel-list">'),

    ('<h3 class="font-semibold text-gray-800 mb-4">农资库存</h3>',
     '<h3 class="font-semibold text-gray-800 mb-4">农资库存</h3>\n                            <div class="space-y-3" id="inventory-list">'),

    # === 设备监控 devices ===
    ('<h3 class="font-semibold text-gray-800 mb-4">设备列表</h3>',
     '<h3 class="font-semibold text-gray-800 mb-4">设备列表</h3>\n                            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" id="device-grid">'),

    ('<h3 class="font-semibold text-gray-800 mb-4">维护记录</h3>',
     '<h3 class="font-semibold text-gray-800 mb-4">维护记录</h3>\n                            <div class="space-y-3" id="maintenance-list">'),

    # === 溯源管理 traceability ===
    ('<h3 class="font-semibold text-gray-800 mb-4">产品列表</h3>',
     '<h3 class="font-semibold text-gray-800 mb-4">产品列表</h3>\n                            <div class="space-y-3" id="product-list">'),
    ('<h3 class="font-semibold">生产全过程追溯</h3>',
     '<h3 class="font-semibold">生产全过程追溯</h3>\n                            <div class="space-y-4" id="timeline-list">'),

    # === 权限管理 permission ===
    ('<div class="overflow-x-auto">\n                                    <table',
     '<div class="overflow-x-auto">\n                                    <table'),
    ('<h3 class="font-semibold text-gray-800 mb-4">角色管理</h3>',
     '<h3 class="font-semibold text-gray-800 mb-4">角色管理</h3>\n                            <div class="space-y-3" id="role-list">'),

    ('<h3 class="font-semibold text-gray-800 mb-4">操作日志</h3>',
     '<h3 class="font-semibold text-gray-800 mb-4">操作日志</h3>\n                            <div class="space-y-3" id="operation-log-list">'),

    ('<h3 class="font-semibold text-gray-800 mb-4">权限配置</h3>',
     '<h3 class="font-semibold text-gray-800 mb-4">权限配置</h3>\n                            <div id="permission-config-list">'),
]

def main():
    with open(HTML_PATH, 'r', encoding='utf-8') as f:
        content = f.read()

    count = 0
    for old_str, new_str in REPLACEMENTS:
        if old_str in content:
            content = content.replace(old_str, new_str, 1)
            count += 1
            print(f'  OK: {new_str.split(chr(10))[0][:60]}...')
        else:
            # Try to find similar text
            for line in old_str.split('\n'):
                line = line.strip()
                if line and line not in content:
                    print(f'  WARN: not found: {line[:80]}')
                    break
            else:
                print(f'  WARN: block not found (may already have ID)')

    # Special: Add tbody ID to user table
    if '<tbody>' in content and 'id="user-table-body"' not in content:
        content = content.replace('<tbody>', '<tbody id="user-table-body">', 1)
        count += 1
        print('  OK: user-table-body')

    # Special: Add IDs to fertilization plan containers
    # Find fertilization plan sections by structural context
    if 'id="fertilization-plan-list"' not in content:
        content = content.replace(
            '<h3 class="font-semibold text-gray-800 mb-4">精准施肥方案</h3>\n                            <div class="space-y-4">',
            '<h3 class="font-semibold text-gray-800 mb-4">精准施肥方案</h3>\n                            <div class="space-y-4" id="fertilization-plan-list">',
            1
        )
        count += 1
        print('  OK: fertilization-plan-list')

    with open(HTML_PATH, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f'\nDone: {count} IDs added/modified')

if __name__ == '__main__':
    main()
