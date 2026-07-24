"""Batch add IDs and data attributes to all interactive elements in index.html"""
import re

HTML_PATH = r'd:\zhuomian\gjcx\index.html'

with open(HTML_PATH, 'r', encoding='utf-8') as f:
    content = f.read()

# Each: (unique_old_text, replacement_with_id, description)
# Careful: order matters for nested replacements

REPLACEMENTS = [
    # === HEADER ===
    ('<input type="text" placeholder="搜索..." class="w-64',
     '<input type="text" placeholder="搜索..." id="header-search" class="w-64'),

    ('<i class="fa fa-bell text-gray-500"></i>\n                                <span class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>',
     '<i class="fa fa-bell text-gray-500"></i>\n                                <span class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" id="notification-dot"></span>'),

    ('<i class="fa fa-calendar text-gray-500"></i>\n                            </button>\n                        </div>\n                    </div>\n                </div>\n            </header>',
     '<i class="fa fa-calendar text-gray-500"></i>\n                            </button>\n                        </div>\n                    </div>\n                </div>\n            </header>'),

    # === SIDEBAR LOGOUT ===
    ('<p class="text-xs text-gray-500">Admin</p>\n                    </div>\n                    <button class="p-2 hover:bg-gray-100 rounded-lg transition-colors">\n                        <i class="fa fa-sign-out text-gray-500"></i>',
     '<p class="text-xs text-gray-500">Admin</p>\n                    </div>\n                    <button id="btn-logout" class="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="退出登录">\n                        <i class="fa fa-sign-out text-gray-500"></i>'),

    # === DASHBOARD: time range buttons ===
    ('<button class="px-3 py-1 text-xs bg-blue-100 text-blue-600 rounded">实时</button>',
     '<button class="px-3 py-1 text-xs bg-blue-100 text-blue-600 rounded time-range-btn" data-range="realtime">实时</button>'),
    ('<button class="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded">24小时</button>',
     '<button class="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded time-range-btn" data-range="24h">24小时</button>'),
    ('<button class="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded">7天</button>',
     '<button class="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded time-range-btn" data-range="7d">7天</button>'),

    # === DASHBOARD: action header buttons ===
    ('<button class="text-sm text-blue-500 hover:text-blue-600">查看全部</button>',
     '<button class="text-sm text-blue-500 hover:text-blue-600" id="btn-view-all-tasks">查看全部</button>'),
    ('<button class="text-sm text-red-500 hover:text-red-600">全部处理</button>',
     '<button class="text-sm text-red-500 hover:text-red-600" id="btn-handle-all-alerts">全部处理</button>'),

    # === DASHBOARD: new task button ===
    ('<button class="flex flex-col items-center p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">\n                                <div class="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mb-2">\n                                    <i class="fa fa-plus-circle text-red-600"></i>\n                                </div>\n                                <span class="text-xs text-gray-700">新建任务</span>',
     '<button class="flex flex-col items-center p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors" id="btn-new-task">\n                                <div class="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mb-2">\n                                    <i class="fa fa-plus-circle text-red-600"></i>\n                                </div>\n                                <span class="text-xs text-gray-700">新建任务</span>'),

    # === DISEASE: upload/camera buttons ===
    ('<button class="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">\n                                    <i class="fa fa-upload mr-2"></i>上传图片\n                                </button>',
     '<button class="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors" id="btn-upload-disease">\n                                    <i class="fa fa-upload mr-2"></i>上传图片\n                                </button>'),
    ('<button class="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">\n                                    <i class="fa fa-camera mr-2"></i>拍照识别\n                                </button>',
     '<button class="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors" id="btn-camera-disease">\n                                    <i class="fa fa-camera mr-2"></i>拍照识别\n                                </button>'),

    # === FARMING: "添加地块" button ===
    ('<button class="w-full mt-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">\n                            <i class="fa fa-plus mr-1"></i>添加地块\n                        </button>',
     '<button class="w-full mt-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors" id="btn-add-field">\n                            <i class="fa fa-plus mr-1"></i>添加地块\n                        </button>'),

    # === FARMING: "添加任务" button (农事任务列表) ===
    ('<button class="w-full mt-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">\n                                <i class="fa fa-plus mr-1"></i>添加任务\n                            </button>\n                        </div>\n                    </div>\n\n                    <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100">',
     '<button class="w-full mt-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors" id="btn-add-farming-task">\n                                <i class="fa fa-plus mr-1"></i>添加任务\n                            </button>\n                        </div>\n                    </div>\n\n                    <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100">'),

    # === MANAGEMENT: header buttons ===
    ('<h3 class="font-semibold text-gray-800">近期农事记录</h3>\n                            <button class="text-sm text-blue-500 hover:text-blue-600">查看全部</button>',
     '<h3 class="font-semibold text-gray-800">近期农事记录</h3>\n                            <button class="text-sm text-blue-500 hover:text-blue-600" id="btn-view-all-records">查看全部</button>'),

    ('<h3 class="font-semibold text-gray-800">人员管理</h3>\n                                <button class="text-sm text-blue-500 hover:text-blue-600">添加人员</button>',
     '<h3 class="font-semibold text-gray-800">人员管理</h3>\n                                <button class="text-sm text-blue-500 hover:text-blue-600" id="btn-add-personnel">添加人员</button>'),

    ('<h3 class="font-semibold text-gray-800">农资库存</h3>\n                                <button class="text-sm text-blue-500 hover:text-blue-600">入库管理</button>',
     '<h3 class="font-semibold text-gray-800">农资库存</h3>\n                                <button class="text-sm text-blue-500 hover:text-blue-600" id="btn-stock-management">入库管理</button>'),

    # === TRACEABILITY: buttons ===
    ('<button class="px-4 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors"><i class="fa fa-plus mr-1"></i>添加产品</button>',
     '<button class="px-4 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors" id="btn-add-product"><i class="fa fa-plus mr-1"></i>添加产品</button>'),

    ('<button class="w-full py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"><i class="fa fa-qrcode mr-2"></i>生成溯源码</button>',
     '<button class="w-full py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors" id="btn-generate-qr"><i class="fa fa-qrcode mr-2"></i>生成溯源码</button>'),

    # === PERMISSION: buttons ===
    ('<button class="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"><i class="fa fa-plus mr-1"></i>添加用户</button>',
     '<button class="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors" id="btn-add-user"><i class="fa fa-plus mr-1"></i>添加用户</button>'),

    ('<button class="w-full mt-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">\n                                <i class="fa fa-plus mr-1"></i>添加角色\n                            </button>\n                        </div>\n                    </div>\n\n                    <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">\n                        <h3 class="font-semibold text-gray-800 mb-4">权限配置</h3>',
     '<button class="w-full mt-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors" id="btn-add-role">\n                                <i class="fa fa-plus mr-1"></i>添加角色\n                            </button>\n                        </div>\n                    </div>\n\n                    <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">\n                        <h3 class="font-semibold text-gray-800 mb-4">权限配置</h3>'),

    ('<button class="w-full mt-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">\n                            <i class="fa fa-history mr-1"></i>查看全部日志\n                        </button>',
     '<button class="w-full mt-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors" id="btn-view-all-logs">\n                            <i class="fa fa-history mr-1"></i>查看全部日志\n                        </button>'),
]

count = 0
for old_str, new_str in REPLACEMENTS:
    if old_str in content:
        content = content.replace(old_str, new_str, 1)
        count += 1
    else:
        # Print shorter fragment for debugging
        snippet = old_str[:100].replace('\n', '\\n')
        print(f'  NOT FOUND: {snippet}...')

# === Add IDs to device card action buttons (search by text pattern) ===
# Device "远程控制" in green buttons
content = content.replace(
    'class="w-full py-1.5 bg-green-100 text-green-600 text-xs rounded hover:bg-green-200">远程控制</button>',
    'class="w-full py-1.5 bg-green-100 text-green-600 text-xs rounded hover:bg-green-200 btn-device-control">远程控制</button>')
count += 1

content = content.replace(
    'class="w-full py-1.5 bg-gray-100 text-gray-600 text-xs rounded hover:bg-gray-200">查看详情</button>',
    'class="w-full py-1.5 bg-gray-100 text-gray-600 text-xs rounded hover:bg-gray-200 btn-device-detail">查看详情</button>')
count += 1

# Device "报修" button
content = content.replace(
    'class="w-full py-1.5 bg-yellow-100 text-yellow-600 text-xs rounded hover:bg-yellow-200">报修</button>',
    'class="w-full py-1.5 bg-yellow-100 text-yellow-600 text-xs rounded hover:bg-yellow-200 btn-device-repair">报修</button>')
count += 1

# Device "查看数据" button
content = content.replace(
    'class="w-full py-1.5 bg-green-100 text-green-600 text-xs rounded hover:bg-green-200">查看数据</button>',
    'class="w-full py-1.5 bg-green-100 text-green-600 text-xs rounded hover:bg-green-200 btn-device-data">查看数据</button>')
count += 1

# Device "重启设备" button
content = content.replace(
    'class="w-full py-1.5 bg-red-100 text-red-600 text-xs rounded hover:bg-red-200">重启设备</button>',
    'class="w-full py-1.5 bg-red-100 text-red-600 text-xs rounded hover:bg-red-200 btn-device-restart">重启设备</button>')
count += 1

# Device "启动任务" button
content = content.replace(
    'class="w-full py-1.5 bg-yellow-100 text-yellow-600 text-xs rounded hover:bg-yellow-200">启动任务</button>',
    'class="w-full py-1.5 bg-yellow-100 text-yellow-600 text-xs rounded hover:bg-yellow-200 btn-device-start-task">启动任务</button>')
count += 1

# === Add IDs to "查看溯源" buttons ===
content = content.replace(
    'class="px-3 py-1 bg-green-100 text-green-600 text-xs rounded hover:bg-green-200 transition-colors">查看溯源</button>',
    'class="px-3 py-1 bg-green-100 text-green-600 text-xs rounded hover:bg-green-200 transition-colors btn-view-trace">查看溯源</button>')
content = content.replace(
    'class="px-3 py-1 bg-blue-100 text-blue-600 text-xs rounded hover:bg-blue-200 transition-colors">查看溯源</button>',
    'class="px-3 py-1 bg-blue-100 text-blue-600 text-xs rounded hover:bg-blue-200 transition-colors btn-view-trace">查看溯源</button>')
content = content.replace(
    'class="px-3 py-1 bg-orange-100 text-orange-600 text-xs rounded hover:bg-orange-200 transition-colors">查看溯源</button>',
    'class="px-3 py-1 bg-orange-100 text-orange-600 text-xs rounded hover:bg-orange-200 transition-colors btn-view-trace">查看溯源</button>')
content = content.replace(
    'class="px-3 py-1 bg-purple-100 text-purple-600 text-xs rounded hover:bg-purple-200 transition-colors">查看溯源</button>',
    'class="px-3 py-1 bg-purple-100 text-purple-600 text-xs rounded hover:bg-purple-200 transition-colors btn-view-trace">查看溯源</button>')
count += 4

# === Add IDs to "安排维护" buttons ===
content = content.replace(
    '">安排维护</button>',
    '" class="btn-maintenance-schedule">安排维护</button>')
count += content.count('btn-maintenance-schedule')

# === Add IDs to "查看详情" risk buttons ===
content = content.replace(
    'mt-2 text-xs text-red-500 hover:text-red-600">查看详情</button>',
    'mt-2 text-xs text-red-500 hover:text-red-600 btn-risk-detail">查看详情</button>')
content = content.replace(
    'mt-2 text-xs text-yellow-500 hover:text-yellow-600">查看详情</button>',
    'mt-2 text-xs text-yellow-500 hover:text-yellow-600 btn-risk-detail">查看详情</button>')
content = content.replace(
    'mt-2 text-xs text-blue-500 hover:text-blue-600">查看详情</button>',
    'mt-2 text-xs text-blue-500 hover:text-blue-600 btn-risk-detail">查看详情</button>')
count += 3

# === Add classes to toggle buttons ===
# Find toggle buttons (w-12 h-6 with bg-green-500 or bg-gray-300)
content = re.sub(
    r'(<button class=")(w-12 h-6 (?:bg-green-500|bg-gray-300) rounded-full relative)(">)',
    r'\1\2 toggle-switch\3',
    content)
count += len(re.findall(r'toggle-switch', content)) - (len(re.findall(r'toggle-switch', content)) if 'toggle-switch' in content else 0)

with open(HTML_PATH, 'w', encoding='utf-8') as f:
    f.write(content)

print(f'\nDone: {count} IDs/classes added')
print(f'Toggle switches found: {len(re.findall(r"toggle-switch", content))}')
print(f'Device buttons: {len(re.findall(r"btn-device-", content))}')
