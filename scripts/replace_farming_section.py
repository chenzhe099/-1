import re

with open('../frontend/js/app.js', 'r', encoding='utf-8') as f:
    content = f.read()

start_marker = '// ==================== 精准农事 渲染 ===================='
end_marker = '// ==================== 产量预测 渲染 ===================='

new_farming = """// ==================== 精准农事 渲染 ====================

function renderFarming() {
  var irrigations = dataService.getIrrigationPlans();
  var irrContainer = document.getElementById('irrigation-plan-list');
  irrContainer.innerHTML = irrigations.map(function(p) {
    var sc = statusColor(p.status);
    var diff = p.currentMoisture - p.targetMoisture;
    var badgeHtml = p.status === 'executing' ? '执行中' : p.status === 'planned' ? '待规划' : '待执行';
    return '<div class="p-4 bg-blue-50 rounded-lg irrigation-plan-card" data-plan-id="' + p.id + '">' +
      '<div class="flex items-center justify-between mb-2">' +
        '<span class="font-medium text-gray-800">地块' + p.fieldCode + ' - ' + p.cropName + '</span>' +
        '<span class="px-2 py-1 text-xs bg-' + sc + '-100 text-' + sc + '-600 rounded irrigation-status">' + badgeHtml + '</span>' +
      '</div>' +
      '<div class="grid grid-cols-2 gap-4 text-sm">' +
        '<div><span class="text-gray-500">目标湿度：</span><span class="font-medium">' + p.targetMoisture + '%</span></div>' +
        '<div><span class="text-gray-500">传感器湿度：</span><span class="font-medium ' + (diff < -10 ? 'text-red-600' : 'text-green-600') + '">' + p.currentMoisture + '%</span></div>' +
        '<div><span class="text-gray-500">灌溉水量：</span>' + p.waterVolume + 'm³</div>' +
        '<div><span class="text-gray-500">预计时长：</span>' + p.estimatedDuration + '分钟</div>' +
      '</div>' +
      (p.status !== 'executing' ? '<div class="mt-3 flex space-x-2">' +
        '<button class="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 btn-irr-execute" data-plan-id="' + p.id + '">立即执行</button>' +
        '<button class="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 btn-irr-schedule" data-plan-id="' + p.id + '">定时执行</button>' +
      '</div>' : '<div class="mt-3"><button class="px-3 py-1 text-xs bg-orange-500 text-white rounded btn-irr-stop" data-plan-id="' + p.id + '">停止执行</button></div>') +
    '</div>';
  }).join('');

  var ferts = dataService.getFertilizationPlans();
  var fertContainer = document.getElementById('fertilization-plan-list');
  fertContainer.innerHTML = ferts.map(function(p) {
    var sc = statusColor(p.status);
    return '<div class="p-4 bg-green-50 rounded-lg fertilization-plan-card" data-plan-id="' + p.id + '">' +
      '<div class="flex items-center justify-between mb-2">' +
        '<span class="font-medium text-gray-800">地块' + p.fieldCode + ' - ' + p.cropName + '</span>' +
        '<span class="px-2 py-1 text-xs bg-' + sc + '-100 text-' + sc + '-600 rounded fert-status">' + (p.status === 'completed' ? '已完成' : '可配置') + '</span>' +
      '</div>' +
      '<div class="grid grid-cols-4 gap-2 text-sm text-center mb-2">' +
        '<div class="bg-white rounded p-2"><span class="text-red-500 font-bold">氮(N)</span><br><span class="font-medium">' + (p.nKg || '-') + 'kg</span><br><span class="text-xs text-gray-400">传感器 ' + (p.soilN || 85) + '</span></div>' +
        '<div class="bg-white rounded p-2"><span class="text-yellow-500 font-bold">磷(P)</span><br><span class="font-medium">' + (p.pKg || '-') + 'kg</span><br><span class="text-xs text-gray-400">传感器 ' + (p.soilP || 72) + '</span></div>' +
        '<div class="bg-white rounded p-2"><span class="text-blue-500 font-bold">钾(K)</span><br><span class="font-medium">' + (p.kKg || '-') + 'kg</span><br><span class="text-xs text-gray-400">传感器 ' + (p.soilK || 78) + '</span></div>' +
        '<div class="bg-white rounded p-2"><span class="text-green-500 font-bold">有机肥</span><br><span class="font-medium">' + (p.organicKg || '-') + 'kg</span></div>' +
      '</div>' +
      '<div class="flex space-x-2">' +
        '<button class="flex-1 py-1.5 bg-green-500 text-white text-xs rounded hover:bg-green-600 btn-fert-config" data-plan-id="' + p.id + '">' + (p.status === 'completed' ? '重新配置' : '配置NPK') + '</button>' +
        '<button class="flex-1 py-1.5 bg-gray-100 text-gray-700 text-xs rounded hover:bg-gray-200 btn-fert-execute" data-plan-id="' + p.id + '">执行施肥</button>' +
      '</div>' +
    '</div>';
  }).join('');

  var fields = dataService.getFieldManagementList();
  var fieldList = document.getElementById('field-management-list');
  if (fieldList) {
    fieldList.innerHTML = fields.map(function(f) {
      var sc = statusColor(f.status);
      return '<div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors field-mgmt-row" data-field-id="' + f.id + '" onclick="showFieldComprehensiveDetail(\'' + f.id + '\')">' +
        '<div class="flex items-center">' +
          '<div class="w-10 h-10 bg-' + sc + '-100 rounded-lg flex items-center justify-center mr-3">' +
            '<i class="fa fa-map-marker text-' + sc + '-600"></i>' +
          '</div>' +
          '<div>' +
            '<p class="text-sm font-medium text-gray-800">地块' + f.code + ' - ' + f.cropName + '</p>' +
            '<p class="text-xs text-gray-500">' + f.area + '亩 | 湿度' + (f.soilMoisture || '--') + '%' + (f.activeTaskCount > 0 ? ' | ' + f.activeTaskCount + '个任务' : '') + '</p>' +
          '</div>' +
        '</div>' +
        '<div class="flex items-center space-x-2">' +
          badge(f.status) +
          '<button class="w-6 h-6 bg-red-50 hover:bg-red-100 rounded-full flex items-center justify-center transition-colors field-delete-btn" data-field-id="' + f.id + '" onclick="event.stopPropagation();deleteField(\'' + f.id + '\')" title="删除地块">' +
            '<i class="fa fa-times text-red-400 text-xs"></i>' +
          '</button>' +
        '</div>' +
      '</div>';
    }).join('');
  }

  var tasks = dataService.getFarmingTasks();
  var taskContainer = document.getElementById('farming-task-list');
  if (taskContainer) {
    var parts2 = partitionTasks(tasks);
    var ftHTML = parts2.active.map(function(t) { return taskItemHTML(t); }).join('');
    if (parts2.done.length > 0) {
      ftHTML += '<div class="mt-2 pt-2 border-t border-gray-200">' +
        '<div class="flex items-center justify-between text-xs text-gray-400 cursor-pointer hover:text-gray-600 py-1" onclick="toggleCompletedTasks(this)">' +
        '<span><i class="fa fa-chevron-down mr-1 completed-toggle-icon"></i>已完成任务 (' + parts2.done.length + ')</span>' +
        '<span class="text-gray-300 completed-toggle-arrow">▼</span></div>' +
        '<div class="completed-tasks-wrap hidden">' +
        parts2.done.map(function(t) { return taskItemHTML(t); }).join('') +
        '</div></div>';
    }
    taskContainer.innerHTML = ftHTML || '<div class="text-center text-gray-400 py-4">暂无任务</div>';
  }

  var progress = getFarmingProgressFromTasks(tasks);
  var progContainer = document.getElementById('farming-progress-list');
  if (progContainer) {
    progContainer.innerHTML = progress.map(function(p) {
      return '<div><div class="flex items-center justify-between mb-1">' +
        '<span class="text-sm text-gray-600">' + p.name + '</span>' +
        '<span class="text-sm font-medium text-gray-800">' + p.progress + '%</span></div>' +
        '<div class="w-full bg-gray-200 rounded-full h-2 cursor-pointer" onclick="showFarmingProgressDetail(\'' + p.type + '\')">' +
        '<div class="bg-' + p.color + '-500 h-2 rounded-full" style="width:' + p.progress + '%"></div></div></div>';
    }).join('');
  }
}

function getFarmingProgressFromTasks(tasks) {
  var types = [
    { type: 'watering', name: '灌溉作业', color: 'blue' },
    { type: 'fertilizing', name: '施肥作业', color: 'green' },
    { type: 'spraying', name: '喷药作业', color: 'purple' },
    { type: 'pruning', name: '修剪作业', color: 'orange' }
  ];
  return types.map(function(t) {
    var related = tasks.filter(function(task) { return task.type === t.type; });
    var completed = related.filter(function(task) { return task.status === 'completed'; }).length;
    var pct = related.length > 0 ? Math.round((completed / related.length) * 100) : 0;
    return { name: t.name, type: t.type, color: t.color, progress: pct };
  });
}

"""

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)
new_content = content[:start_idx] + new_farming + '\n' + content[end_idx:]

with open('../frontend/js/app.js', 'w', encoding='utf-8') as f:
    f.write(new_content)

print('OK — farming section replaced, new length:', len(new_content))

# verify braces
o = new_content.count('{')
cl = new_content.count('}')
print('Braces: {' + str(o) + '} {' + str(cl) + '} ' + ('OK' if o == cl else 'ERR'))
