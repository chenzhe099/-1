"""Remove duplicate task lists and alert lists from app.js and index.html"""
import re

# ===== 1. Fix app.js — replace dashboard task list with compact summary =====
with open('../frontend/js/app.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Markers for dashboard task list section
marker_before_tasks = "}).join('');\n\n  // "
marker_after_alerts = "// ==================== 病虫害 渲染"

# Replace the task list + alert section in dashboard
old_dashboard_tasks = content[content.find("  // 全部农事任务") : content.find(marker_after_alerts)]

new_dashboard_tasks = """  // 任务快捷入口 — 统计数字 + 跳转链接（任务详情见农事决策模块）
  var tasks = dataService.getFarmingTasks();
  var tp = partitionTasks(tasks);
  document.getElementById('task-list').innerHTML =
    '<div class="text-center py-4 cursor-pointer hover:bg-gray-100 rounded-lg transition-colors" onclick="navigateTo(\\'farming\\')">' +
      '<p class="text-3xl font-bold text-green-600">' + tp.active.length + '</p>' +
      '<p class="text-sm text-gray-500">个活跃任务待处理</p>' +
      '<p class="text-xs text-blue-500 mt-2"><i class="fa fa-arrow-right mr-1"></i>进入农事决策查看全部任务</p>' +
    '</div>';

  // 预警列表
  var alerts = dataService.getAlertList();
  document.getElementById('alert-list').innerHTML = alerts.length > 0
    ? alerts.map(function(a) { return alertItemHTML(a); }).join('')
    : '<div class="text-center text-gray-400 py-4">暂无预警</div>';
}

"""

# Verify markers exist
if old_dashboard_tasks:
    content = content.replace(old_dashboard_tasks, new_dashboard_tasks)
    print('1. Dashboard task list → compact summary   OK')
else:
    print('1. Dashboard task list →   NOT FOUND')

# ===== 2. Remove risk-alert-list from prediction section =====
# Find the risk-alert-list span in renderPrediction
old_prediction_alerts = "  // 风险预警\n  var risks = dataService.getRiskAlerts();\n  var riskContainer = document.getElementById('risk-alert-list');\n  if (riskContainer) {\n    riskContainer.innerHTML = risks.map(function(r) { return alertItemHTML(r); }).join('');\n  }"
new_prediction_alerts = "  // 风险预警已合并到仪表盘预警列表，此处不再重复显示"

if old_prediction_alerts in content:
    content = content.replace(old_prediction_alerts, new_prediction_alerts)
    print('2. Prediction risk-alert-list removed       OK')
else:
    print('2. Prediction risk-alert-list   NOT FOUND')

# ===== 3. Remove weather-alert-list from weather section =====
old_weather_alerts = "  // 天气预警\n  var alerts = dataService.getWeatherAlerts();\n  document.getElementById('weather-alert-list').innerHTML = alerts.length > 0\n    ? alerts.map(function(a) { return alertItemHTML(a); }).join('')\n    : '<div class=\"col-span-3 text-center text-gray-400 py-6\">暂无天气预警</div>';"
new_weather_alerts = "  // 天气预警已合并到仪表盘"

if old_weather_alerts in content:
    content = content.replace(old_weather_alerts, new_weather_alerts)
    print('3. Weather alert-list removed               OK')
else:
    # Try alt format
    old2 = content[content.find("  // 天气预警\n"):content.find("  // 天气预警\n") + 200]
    if 'weather-alert-list' in old2:
        marker_end = '  // ==================== 市场价格 渲染'
        before_alerts = content[:content.find("  // 天气预警\n")]
        after_alerts = content[content.find(marker_end):]
        content = before_alerts + after_alerts
        print('3. Weather alert-list removed (alt method)  OK')

# ===== 4. Remove market-alert-list from market section =====
old_market_alerts = "  // 市场预警\n  var alerts = dataService.getMarketAlerts();\n  var alertContainer = document.getElementById('market-alert-list');\n  alertContainer.innerHTML = alerts.length > 0\n    ? alerts.map(function(a) { return alertItemHTML(a); }).join('')\n    : '<div class=\"text-center text-gray-400 py-6\">暂无市场行情预警</div>';"
new_market_alerts = "  // 市场预警已合并到仪表盘"

if old_market_alerts in content:
    content = content.replace(old_market_alerts, new_market_alerts)
    print('4. Market alert-list removed                OK')
else:
    # Try alt method
    if 'market-alert-list' in content:
        before = content[:content.find("  // 市场预警\n")]
        after = content[content.find("}\n\n// ==================== 模型监控", content.find("market-alert-list")):]
        content = before + after
        print('4. Market alert-list removed (alt method)   OK')

# ===== 5. Remove weather-alert-list HTML from index.html =====
with open('../frontend/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Remove the weather alert section (the whole bg-white card with weather-alert-list)
marker1 = '<div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100">\n                        <h3 class="font-semibold text-gray-800 mb-4">农事天气建议</h3>\n                        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4" id="weather-alert-list">'
if marker1 in html:
    # Find the closing tags for this section
    start = html.find(marker1)
    # Find the ending </div></div></div> pattern
    end_search = start + len(marker1)
    depth = 3  # 3 nested divs to close
    idx = end_search
    while depth > 0 and idx < len(html):
        if html[idx:idx+6] == '</div>':
            depth -= 1
        elif html[idx:idx+5] == '<div ' or html[idx:idx+5] == '<div>':
            depth += 1
        idx += 1
    end = idx
    html = html[:start] + html[end:]
    print('5. index.html weather-alert-list removed    OK')

# Remove market-alert-list HTML from index.html
marker2 = '<div class="space-y-3" id="market-alert-list">'
if marker2 in html:
    start = html.find(marker2)
    # Find closing </div> for this container
    # Look for the closing </div> of the parent card
    end = html.find('</div>\n                    </div>\n                </section>\n\n                <!-- ==================== 模型监控', start)
    if end < 0:
        end = html.find('</section>\n\n                <!-- ==================== 模型监控', start)
    if end > 0:
        html = html[:start] + html[end:]
        print('6. index.html market-alert-list removed     OK')
    else:
        # Find market-alert-list container and its parent
        start_card = html.rfind('<div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100">', 0, start)
        depth = 3
        idx = start_card
        while depth > 0 and idx < len(html):
            if html[idx:idx+6] == '</div>':
                depth -= 1
            elif html[idx:idx+5] == '<div ' or html[idx:idx+5] == '<div>':
                depth += 1
            idx += 1
        html = html[:start_card] + html[idx:]
        print('6. index.html market-alert-list removed (alt) OK')

# Save both files
with open('../frontend/js/app.js', 'w', encoding='utf-8') as f:
    f.write(content)

with open('../frontend/index.html', 'w', encoding='utf-8') as f:
    f.write(html)

# Verify
o = content.count('{')
c = content.count('}')
print(f'Braces app.js: {{{o}}} {{{c}}} {"OK" if o==c else "ERR"}')
print('Done')
