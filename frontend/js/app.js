/**
 * 智慧农业管理系统 - 主应用逻辑
 * 数据驱动渲染 + 页面导航 + 交互事件
 */

// ==================== 初始化 ====================

document.addEventListener('DOMContentLoaded', async () => {
  // 加载数据
  try {
    await initDataService();
    console.log('[App] 数据服务就绪，开始渲染');
  } catch (err) {
    console.error('[App] 数据加载失败:', err);
  }

  if (dataService.isReady()) {
    window.__chartsInitialized = true;
    initNavigation();
    renderDashboard();
    initDashboardCharts();
  }
});

// ==================== 导航 ====================

function initNavigation() {
  const menuButtons = document.querySelectorAll('.sidebar-item');
  const sections = document.querySelectorAll('section');

  menuButtons.forEach(button => {
    button.addEventListener('click', () => {
      const menuId = button.dataset.menu;
      menuButtons.forEach(btn => btn.classList.remove('active-sidebar'));
      button.classList.add('active-sidebar');
      sections.forEach(section => section.classList.add('hidden'));
      document.getElementById(menuId).classList.remove('hidden');

      updatePageTitle(menuId);
      renderSection(menuId);

      if (typeof initChartsBySection === 'function') {
        initChartsBySection(menuId);
      }
    });
  });

  // 快捷操作按钮（仪表盘）
  document.querySelectorAll('[data-menu]').forEach(btn => {
    if (btn.classList.contains('sidebar-item')) return; // 已处理
    btn.addEventListener('click', () => {
      const menuId = btn.dataset.menu;
      const sidebarBtn = document.querySelector(`.sidebar-item[data-menu="${menuId}"]`);
      if (sidebarBtn) sidebarBtn.click();
    });
  });
}

function updatePageTitle(menuId) {
  const titles = {
    dashboard:   { title: '数据总览', subtitle: '实时监控农场运营状况' },
    disease:     { title: 'AI病虫害智能识别', subtitle: '上传图片识别病虫害，获取防治建议' },
    farming:     { title: 'AI精准农事决策', subtitle: '水肥药智能管理，精准作业方案' },
    prediction:  { title: '产量预测与农事规划', subtitle: 'AI预测产量，智能排期规划' },
    management:  { title: '数字化农场管理', subtitle: '全周期农事记录与报表分析' },
    devices:     { title: '设备监控与远程控制', subtitle: 'IoT设备状态监控与远程操作' },
    traceability:{ title: '农产品溯源管理', subtitle: '生产全过程追溯，生成溯源码' },
    permission:  { title: '权限管理与多账号协同', subtitle: '用户分级权限与操作日志' },
    weather:     { title: '天气监测与预报', subtitle: '实时气象数据与农事天气预警' },
    market:      { title: '市场价格监测', subtitle: '农产品市场价格趋势与行情分析' },
    'ai-chat':   { title: 'AI 智慧农业助手', subtitle: '智能问答，解答种植、病虫害、灌溉施肥等问题' },
    monitor:     { title: 'AI模型监控', subtitle: '模型性能、数据漂移及未知样本监控' }
  };
  const t = titles[menuId];
  document.getElementById('page-title').textContent = t.title;
  document.getElementById('page-subtitle').textContent = t.subtitle;
}

function renderSection(menuId) {
  const renderers = {
    dashboard:    () => renderDashboard(),
    disease:      () => renderDisease(),
    farming:      () => renderFarming(),
    prediction:   () => renderPrediction(),
    management:   () => renderManagement(),
    devices:      () => renderDevices(),
    traceability: () => renderTraceability(),
    permission:   () => renderPermission(),
    weather:      () => renderWeather(),
    market:       () => renderMarket(),
    monitor:      () => renderMonitor(),
    'ai-chat':    () => { if (typeof setupAiChat === 'function') setupAiChat(); }
  };
  if (renderers[menuId]) renderers[menuId]();
  // handlers.js will rebind events via observeSectionChanges
}

// ==================== 仪表盘 渲染 ====================

function renderDashboard() {
  // 绑定新建任务按钮
  if (typeof setupFarming === 'function') setupFarming();
  const stats = dataService.getDashboardStats();

  // 统计卡片
  document.getElementById('stat-tasks-today').textContent = stats.tasksToday;
  document.getElementById('stat-tasks-change').innerHTML = `<i class="fa fa-arrow-up mr-1"></i>较昨日 ${stats.tasksChange}`;
  document.getElementById('stat-device-rate').textContent = stats.deviceOnlineRate + '%';
  document.getElementById('stat-device-change').innerHTML = `<i class="fa fa-arrow-up mr-1"></i>较昨日 ${stats.deviceChange}`;
  document.getElementById('stat-alert-count').textContent = stats.alertCount;
  document.getElementById('stat-monthly-yield').textContent = stats.monthlyYield + stats.yieldUnit;
  document.getElementById('stat-yield-change').innerHTML = `<i class="fa fa-arrow-up mr-1"></i>较上月 ${stats.yieldChange}`;

  // 地块状态
  const fields = dataService.getFieldStatusList();
  const fieldContainer = document.getElementById('field-status-list');
  fieldContainer.innerHTML = fields.map(f => {
    const sc = statusColor(f.status);
    return `
      <div class="flex items-center justify-between p-3 bg-${sc}-50 rounded-lg">
        <div class="flex items-center">
          <span class="w-2 h-2 bg-${sc}-500 rounded-full mr-2"></span>
          <span class="text-sm text-gray-700">地块${f.code} - ${f.cropName}</span>
        </div>
        <span class="text-xs text-${sc}-600">${statusLabel(f.status)}</span>
      </div>`;
  }).join('');

  // 今日任务（按优先级排序，显示前4条，其余折叠）
  var tasks = dataService.getTodayTasks();
  var taskList = document.getElementById('task-list');
  if (tasks.length > 0) {
    var visibleTasks = tasks.slice(0, 4);
    var hiddenTasks = tasks.slice(4);
    taskList.innerHTML = visibleTasks.map(function (t) { return taskItemHTML(t); }).join('')
      + (hiddenTasks.length > 0 ? '<div class="task-list-collapsed hidden space-y-3 mt-0">' + hiddenTasks.map(function (t) { return taskItemHTML(t); }).join('') + '</div>' : '')
      + (hiddenTasks.length > 0 ? '<button class="w-full mt-3 py-2 text-sm text-blue-500 hover:text-blue-600 bg-blue-50 rounded-lg transition-colors" data-action="toggle-task-expand">展开剩余 ' + hiddenTasks.length + ' 条任务 <i class="fa fa-chevron-down ml-1"></i></button>' : '');
  } else {
    taskList.innerHTML = '<div class="text-center text-gray-400 py-4">暂无任务</div>';
  }

  // 预警列表
  const alerts = dataService.getAlertList();
  document.getElementById('alert-list').innerHTML = alerts.length > 0
    ? alerts.map(a => alertItemHTML(a)).join('')
    : '<div class="text-center text-gray-400 py-4">暂无预警</div>';
}

// ==================== 病虫害 渲染 ====================

function renderDisease() {
  // 识别历史（增强版：显示置信度 + 严重程度 + 点击查看详情）
  const records = dataService.getDiseaseHistory();
  const historyContainer = document.getElementById('disease-history-list');
  historyContainer.innerHTML = records.length > 0 ? records.map(r => {
    var sevMap = { low: '低', medium: '中', high: '高', critical: '严重' };
    var sevColor = { low: 'green', medium: 'orange', high: 'red', critical: 'red' };
    var isUnknown = r.diseaseName === '未知病害' || r.diseaseName === '识别失败' || r.isUnknown;
    var nameColor = isUnknown ? 'text-orange-600' : 'text-gray-800';
    return `
      <div class="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-100">
        <div class="flex items-center justify-between mb-1">
          <span class="text-sm font-medium ${nameColor} cursor-pointer hover:text-blue-600" onclick="viewDiseaseRecord('${r.id}')">
            ${r.diseaseName||'未知病害'}
            ${isUnknown ? '<span class="ml-1 px-1 py-0.5 text-xs bg-orange-100 text-orange-600 rounded">未知</span>' : ''}
          </span>
          <div class="flex items-center space-x-2">
            <span class="px-1.5 py-0.5 text-xs bg-${sevColor[r.severity]||'gray'}-100 text-${sevColor[r.severity]||'gray'}-600 rounded">${sevMap[r.severity]||r.severity||'中'}</span>
            <button class="text-red-400 hover:text-red-600 text-xs" onclick="deleteDiseaseRecord('${r.id}')" title="删除"><i class="fa fa-trash"></i></button>
          </div>
        </div>
        <div class="flex items-center justify-between text-xs text-gray-400">
          <span><i class="fa fa-clock-o mr-1"></i>${formatDateTime(r.detectedAt)}</span>
          <span><i class="fa fa-tag mr-1"></i>${r.cropAffected||'未知作物'}</span>
        </div>
      </div>`;
  }).join('') : '<div class="text-center text-gray-400 py-6"><i class="fa fa-inbox text-2xl mb-2 block"></i>暂无识别记录</div>';

  // 知识库
  const kb = dataService.getKnowledgeBase();
  const kbContainer = document.getElementById('knowledge-base-grid');
  // Clear previous content
  kbContainer.innerHTML = kb.map(k => {
    const colorMap = { high: 'red', medium: 'orange', critical: 'red', low: 'green' };
    const c = colorMap[k.severity] || 'blue';
    return `
      <div class="p-4 bg-${c}-50 rounded-lg border border-${c}-100 cursor-pointer hover:shadow-md transition-shadow" data-action="select-disease" data-id="${k.id}">
        <div class="w-10 h-10 bg-${c}-100 rounded-lg flex items-center justify-center mb-3">
          <i class="fa ${k.icon} text-${c}-600"></i>
        </div>
        <h4 class="font-medium text-gray-800">${k.name}</h4>
        <p class="text-xs text-gray-600 mt-1">${k.symptoms.slice(0, 40)}...</p>
      </div>`;
  }).join('');
}

// ==================== 精准农事 渲染 ====================

function renderFarming() {
  var fields = dataService.getAll('fields') || [];
  var irrigs = dataService.getAll('irrigation_plans') || [];
  var ferts = dataService.getAll('fertilization_plans') || [];
  var tasks = dataService.getAll('farming_tasks') || [];
  var today = new Date().toISOString().slice(0, 10);

  // === 统计卡片 ===
  var todayIrrig = irrigs.filter(function(p){return p.status==='completed'&&(p.scheduledAt||'').startsWith(today);}).reduce(function(s,p){return s+(p.waterVolume||0);},0);
  var todayFert = ferts.filter(function(p){return p.status==='completed'&&(p.scheduledAt||'').startsWith(today);}).reduce(function(s,p){return s+(p.nKg||0)+(p.pKg||0)+(p.kKg||0)+(p.organicKg||0);},0);
  var todayCompleted = tasks.filter(function(t){return t.status==='completed';}).length;
  var pending = tasks.filter(function(t){return t.status==='pending'||t.status==='in_progress';}).length;
  var totalT = tasks.length;
  setText('stat-irrigation', todayIrrig+'m³');
  setText('stat-fertilizer', todayFert+'kg');
  setText('stat-pending-tasks', pending+'个');
  setText('stat-completion', totalT ? Math.round(todayCompleted/totalT*100)+'%' : '--');

  // === 灌溉方案 ===
  var irrC = document.getElementById('irrigation-plan-list');
  if (irrC) {
    var stLabelI = {pending:'待执行',completed:'已完成',executing:'执行中'};
    var stBgI = {pending:'bg-yellow-100 text-yellow-600',completed:'bg-green-100 text-green-600',executing:'bg-blue-100 text-blue-600'};
    var cardBgI = {pending:'bg-yellow-50',completed:'bg-blue-50',executing:'bg-blue-50'};
    irrC.innerHTML = irrigs.length ? irrigs.map(function(p){
      var diff = (p.targetMoisture||0) - (p.currentMoisture||0);
      var need = diff > 0;
      return '<div class="p-4 '+(cardBgI[p.status]||'bg-gray-50')+' rounded-lg"><div class="flex items-center justify-between mb-2"><span class="font-medium text-gray-800">地块'+p.fieldCode+' - '+p.cropName+'</span><span class="px-2 py-1 text-xs rounded '+(stBgI[p.status]||'')+'">'+(stLabelI[p.status]||p.status)+'</span></div><div class="grid grid-cols-2 gap-3 text-sm"><div><span class="text-gray-500">目标湿度</span><b class="ml-1">'+p.targetMoisture+'%</b></div><div><span class="text-gray-500">当前湿度</span><b class="ml-1 '+(need?'text-red-600':'text-green-600')+'">'+p.currentMoisture+'%</b></div><div><span class="text-gray-500">水量</span><b class="ml-1">'+p.waterVolume+'m³</b></div><div><span class="text-gray-500">时长</span><b class="ml-1">'+p.estimatedDuration+'分钟</b></div></div>'+ (p.status==='pending' ? '<div class="mt-3 flex gap-2"><button onclick="farmExecIrrigation(\''+p.id+'\')" class="flex-1 py-1.5 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"><i class="fa fa-play mr-1"></i>立即执行</button><button onclick="farmEditPlan(\'irrigation_plans\',\''+p.id+'\')" class="px-2 py-1.5 bg-gray-200 text-gray-600 text-xs rounded hover:bg-gray-300"><i class="fa fa-cog"></i></button></div>' : '') + '</div>';
    }).join('') : '<p class="text-sm text-gray-400 text-center py-6">暂无灌溉方案，点击右上角添加</p>';
  }

  // === 施肥方案 ===
  var fertC = document.getElementById('fertilization-plan-list');
  if (fertC) {
    var stLabelF = {planned:'计划中',pending:'待执行',completed:'已完成'};
    fertC.innerHTML = ferts.length ? ferts.map(function(p){
      return '<div class="p-4 bg-green-50 rounded-lg"><div class="flex items-center justify-between mb-2"><span class="font-medium text-gray-800">地块'+p.fieldCode+' - '+p.cropName+'</span><span class="px-2 py-1 text-xs rounded '+(p.status==='completed'?'bg-green-100 text-green-600':'bg-yellow-100 text-yellow-600')+'">'+(stLabelF[p.status]||p.status)+'</span></div><div class="grid grid-cols-4 gap-2 text-center text-sm"><div class="bg-white rounded p-2"><span class="text-red-500 font-bold">N</span><br><b>'+(p.nKg||0)+'</b>kg</div><div class="bg-white rounded p-2"><span class="text-yellow-600 font-bold">P</span><br><b>'+(p.pKg||0)+'</b>kg</div><div class="bg-white rounded p-2"><span class="text-blue-500 font-bold">K</span><br><b>'+(p.kKg||0)+'</b>kg</div><div class="bg-white rounded p-2"><span class="text-green-600 font-bold">有机</span><br><b>'+(p.organicKg||0)+'</b>kg</div></div>'+(p.scheduledAt?'<p class="text-xs text-gray-500 mt-2">计划: '+p.scheduledAt+'</p>':'')+'</div>';
    }).join('') : '<p class="text-sm text-gray-400 text-center py-6">暂无施肥方案</p>';
  }

  // === 地块列表 ===
  var flC = document.getElementById('field-management-list');
  if (flC) {
    var stColorF = {growing:'bg-green-100 text-green-600',fallow:'bg-gray-100 text-gray-600',harvesting:'bg-yellow-100 text-yellow-600'};
    var stLabelFL = {growing:'生长中',fallow:'休耕',harvesting:'采收期'};
    flC.innerHTML = fields.map(function(f){
      var need = (f.soilMoisture||0) < 50;
      var bg = need ? 'bg-orange-50' : 'bg-green-50';
      return '<div class="flex items-center justify-between p-3 '+bg+' rounded-lg hover:opacity-80 transition-opacity cursor-pointer" onclick="farmFieldDetail(\''+f.id+'\')"><div class="flex items-center"><div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3"><i class="fa fa-map-marker text-green-600"></i></div><div><p class="text-sm font-medium">地块'+f.code+'</p><p class="text-xs text-gray-500">'+f.cropName+' · '+f.area+'亩 · 湿度'+f.soilMoisture+'%</p></div></div><span class="px-2 py-1 text-xs rounded '+(stColorF[f.status]||'')+' '+(need?'text-red-600 font-bold':'')+'">'+(need?'需浇水':(stLabelFL[f.status]||f.status))+'</span></div>';
    }).join('');
  }

  // === 灌溉日历（动态月） ===
  var calDiv = document.getElementById('farming-calendar');
  if (calDiv) {
    var now = new Date();
    var y = now.getFullYear(), m = now.getMonth();
    var firstDay = new Date(y, m, 1).getDay();
    var daysInMonth = new Date(y, m+1, 0).getDate();
    var taskDays = {};
    irrigs.forEach(function(p){ if(p.scheduledAt){ var d = p.scheduledAt.slice(8,10); taskDays[parseInt(d)]=true; } });
    var html = '<div class="text-center text-xs text-gray-500 py-1">日</div><div class="text-center text-xs text-gray-500 py-1">一</div><div class="text-center text-xs text-gray-500 py-1">二</div><div class="text-center text-xs text-gray-500 py-1">三</div><div class="text-center text-xs text-gray-500 py-1">四</div><div class="text-center text-xs text-gray-500 py-1">五</div><div class="text-center text-xs text-gray-500 py-1">六</div>';
    for (var i = 0; i < firstDay; i++) html += '<div class="text-center text-xs text-gray-300 py-1"></div>';
    for (var d = 1; d <= daysInMonth; d++) {
      var isToday = d === now.getDate();
      var hasTask = taskDays[d];
      var cls = isToday ? 'bg-blue-500 text-white rounded-full' : (hasTask ? 'bg-blue-100 text-blue-600 rounded-full cursor-pointer' : '');
      html += '<div class="text-center text-xs py-1 '+cls+'" '+(hasTask?'onclick="showToast(\'灌溉日: '+(m+1)+'月'+d+'日\',\'info\')"':'')+'>'+d+'</div>';
    }
    calDiv.innerHTML = html;
  }

  // === 任务列表 ===
  var taskC = document.getElementById('farming-task-list');
  if (taskC) {
    var typeLabels = {watering:'浇水',fertilizing:'施肥',spraying:'喷药',pruning:'修剪',harvesting:'采收',thinning:'疏果'};
    var typeIcons = {watering:'fa-tint text-blue-500',fertilizing:'fa-flask text-green-500',spraying:'fa-medkit text-purple-500',pruning:'fa-scissors text-orange-500',harvesting:'fa-shopping-basket text-teal-500',thinning:'fa-leaf text-gray-500'};
    var stBgTask = {completed:'bg-green-50',in_progress:'bg-yellow-50',pending:'bg-gray-50'};
    var stIcon = {completed:'fa-check-circle text-green-500',in_progress:'fa-spinner fa-spin text-yellow-500',pending:'fa-clock-o text-gray-400'};
    taskC.innerHTML = tasks.length ? tasks.slice(0,8).map(function(t,i){
      return '<div class="flex items-start p-3 '+(stBgTask[t.status]||'bg-gray-50')+' rounded-lg hover:opacity-80 transition-opacity cursor-pointer" onclick="farmTaskDetail(\''+t.id+'\')"><div class="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center mr-3 flex-shrink-0"><span class="text-white text-xs">'+(i+1)+'</span></div><div class="flex-1"><p class="text-sm font-medium">地块'+t.fieldCode+' '+(typeLabels[t.type]||t.type)+'</p><p class="text-xs text-gray-500">'+(t.scheduledTime||'--')+' · '+(typeLabels[t.type]||t.type)+'</p></div><i class="fa '+(stIcon[t.status]||'fa-question')+'"></i></div>';
    }).join('') : '<p class="text-sm text-gray-400 text-center py-6">暂无任务</p>';
  }

  // === 作业进度 ===
  var progC = document.getElementById('farming-progress-list');
  if (progC) {
    var types = ['watering','fertilizing','spraying','pruning'];
    var names = {watering:'灌溉作业',fertilizing:'施肥作业',spraying:'喷药作业',pruning:'修剪作业'};
    var colors = {watering:'bg-blue-500',fertilizing:'bg-green-500',spraying:'bg-purple-500',pruning:'bg-orange-500'};
    progC.innerHTML = types.map(function(tp){
      var all = tasks.filter(function(t){return t.type===tp;});
      var done = all.filter(function(t){return t.status==='completed';}).length;
      var pct = all.length ? Math.round(done/all.length*100) : 0;
      return '<div><div class="flex items-center justify-between mb-1"><span class="text-sm text-gray-600">'+names[tp]+'</span><span class="text-sm font-medium">'+pct+'%</span></div><div class="h-3 bg-gray-100 rounded-full overflow-hidden"><div class="h-full '+colors[tp]+' rounded-full transition-all" style="width:'+pct+'%"></div></div></div>';
    }).join('');
  }

  // === 智能建议 ===
  var sug = document.getElementById('farm-suggestion');
  if (sug) {
    var lowFields = fields.filter(function(f){return (f.soilMoisture||0)<50;});
    var msgs = [];
    if (lowFields.length) msgs.push('地块'+lowFields.map(function(f){return f.code;}).join('、')+'土壤湿度偏低，建议尽快安排灌溉。');
    if (pending > 3) msgs.push('当前有'+pending+'个待执行任务，建议优化排班。');
    if (!msgs.length) msgs.push('所有地块状态良好，今日作业按计划执行即可。');
    sug.innerHTML = '<p class="text-sm text-gray-700"><i class="fa fa-lightbulb-o text-yellow-500 mr-1"></i>智能建议</p><p class="text-xs text-gray-600 mt-1">'+msgs.join(' ')+'</p>';
  }

  // 绑定按钮事件
  if (typeof setupFarming === 'function') setupFarming();
}

// ==================== 产量预测 渲染 ====================

function renderPrediction() {
  // 作物产量预测
  const crops = dataService.getCropYieldPredictions();
  const cropContainer = document.getElementById('crop-prediction-list');
  if (cropContainer) {
    cropContainer.innerHTML = crops.map(c => {
      const isUp = c.change.startsWith('+');
      return `
        <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <p class="text-sm font-medium text-gray-800">${c.cropName} - ${c.fieldCode}</p>
            <p class="text-xs text-gray-500">${c.stage}</p>
          </div>
          <div class="text-right">
            <p class="text-lg font-bold text-gray-800">${c.yieldTons}吨</p>
            <p class="text-xs ${isUp ? 'text-green-500' : 'text-red-500'}">${c.change}</p>
          </div>
        </div>`;
    }).join('');
  }

  // 农事规划日历
  const calendar = dataService.getFarmingCalendar();
  const calContainer = document.getElementById('farming-calendar-list');
  if (calContainer) {
    calContainer.innerHTML = calendar.slice(0, 5).map(c => {
      const d = new Date(c.scheduledTime);
      const day = d.getDate();
      return `
        <div class="flex items-center p-3 bg-gray-50 rounded-lg">
          <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
            <span class="text-sm font-bold text-blue-600">${day}</span>
          </div>
          <div class="flex-1">
            <p class="text-sm font-medium text-gray-800">${c.cropName}${taskTypeLabel(c.type)}</p>
            <p class="text-xs text-gray-500">${c.fieldCode} · ${c.notes || ''}</p>
          </div>
        </div>`;
    }).join('');
  }

  // 风险预警
  const risks = dataService.getRiskAlerts();
  const riskContainer = document.getElementById('risk-alert-list');
  if (riskContainer) {
    riskContainer.innerHTML = risks.map(r => alertItemHTML(r)).join('');
  }
}

// ==================== 农场管理 渲染 ====================

function renderManagement() {
  // 农事记录
  const records = dataService.getFarmRecords();
  const recContainer = document.getElementById('farm-record-list');
  if (recContainer) {
    recContainer.innerHTML = records.map(r => `
      <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer" data-action="record-detail" data-id="${r.id}">
        <div>
          <p class="text-sm font-medium text-gray-800">${taskTypeLabel(r.type)} - ${r.fieldCode}</p>
          <p class="text-xs text-gray-500">${formatDateTime(r.completedAt)}</p>
        </div>
        ${badge('completed')}
      </div>`).join('');
  }

  // 人员列表
  const personnel = dataService.getPersonnelList();
  const persContainer = document.getElementById('personnel-list');
  if (persContainer) {
    persContainer.innerHTML = personnel.map(p => `
      <div class="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer" data-action="person-detail" data-id="${p.id}">
        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=${p.avatar}" class="w-10 h-10 rounded-full mr-3" alt="${p.name}">
        <div class="flex-1">
          <p class="text-sm font-medium text-gray-800">${p.name}</p>
          <p class="text-xs text-gray-500">${p.role}</p>
        </div>
        ${badge(p.status)}
      </div>`).join('');
  }

  // 库存列表
  const inventory = dataService.getInventoryList();
  const invContainer = document.getElementById('inventory-list');
  if (invContainer) {
    invContainer.innerHTML = inventory.map(i => `
      <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer" data-action="inventory-detail" data-id="${i.id}">
        <div>
          <p class="text-sm font-medium text-gray-800">${i.name}</p>
          <p class="text-xs text-gray-500">${i.unit} × ${i.quantity}</p>
        </div>
        ${badge(i.status)}
      </div>`).join('');
  }
}

// ==================== 设备监控 渲染 ====================

function renderDevices() {
  var devices = (dataService.getAll('devices') || []).map(function(d) {
    d.metricsParsed = (typeof d.metrics === 'string') ? (function(){try{return JSON.parse(d.metrics);}catch(e){return {};}})() : (d.metrics || {});
    return d;
  });

  // === 统计 ===
  var online = devices.filter(function(d){return d.status==='online';}).length;
  var fault = devices.filter(function(d){return d.status==='fault';}).length;
  var offline = devices.filter(function(d){return d.status==='offline';}).length;
  var maintenance = devices.filter(function(d){return d.status==='maintenance';}).length;
  setText('stat-dev-total', devices.length+'台');
  setText('stat-dev-online', online+'台');
  setText('stat-dev-fault', (fault+offline)+'台');
  setText('stat-dev-maint', maintenance+'台');

  // === 设备网格 ===
  var grid = document.getElementById('device-grid');
  if (!grid) return;
  var stColor = {online:'green', offline:'red', fault:'yellow', maintenance:'yellow'};
  var stLabel = {online:'运行中', offline:'已离线', fault:'故障', maintenance:'待维护'};
  var iconMap = {pump:'fa-tint', fertilizer:'fa-flask', sensor:'fa-microchip', weather:'fa-cloud', greenhouse:'fa-home'};

  grid.innerHTML = devices.map(function(d) {
    var sc = stColor[d.status]||'gray';
    var pulse = d.status==='online' ? '<span class="w-2 h-2 bg-green-500 rounded-full animate-pulse ml-1"></span>' : '';
    var m = d.metricsParsed;
    var info = [];
    if (m.currentTask) info.push(m.currentTask);
    if (m.temperature) info.push(m.temperature);
    if (m.flow) info.push('流量:'+m.flow);
    if (m.fertilized) info.push('已施:'+m.fertilized);
    if (m.moisture) info.push('湿度:'+m.moisture);
    if (m.error) info.push('<span class="text-red-500">'+m.error+'</span>');
    if (!info.length) info.push(d.location||'--');
    var actionBtn = '';
    if (d.status==='online') actionBtn = '<button onclick="devControl(\''+d.id+'\')" class="px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100">远程控制</button>';
    else if (d.status==='fault') actionBtn = '<button onclick="devReport(\''+d.id+'\')" class="px-2 py-1 text-xs bg-yellow-100 text-yellow-600 rounded hover:bg-yellow-200">报修</button>';
    else if (d.status==='offline') actionBtn = '<button onclick="devRestart(\''+d.id+'\')" class="px-2 py-1 text-xs bg-red-100 text-red-600 rounded hover:bg-red-200">重启</button>';
    else actionBtn = '<button onclick="devStart(\''+d.id+'\')" class="px-2 py-1 text-xs bg-yellow-100 text-yellow-600 rounded hover:bg-yellow-200">启动</button>';
    return '<div class="p-3 bg-'+sc+'-50 rounded-lg border border-'+sc+'-100 hover:shadow-md transition-shadow"><div class="flex items-center justify-between mb-1"><span class="text-sm font-medium text-gray-800 truncate">'+d.name+'</span>'+pulse+'</div><p class="text-xs text-gray-500 mb-2">'+info.join(' · ')+'</p><div class="flex gap-1">'+actionBtn+'<button onclick="devDetail(\''+d.id+'\')" class="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200">详情</button></div></div>';
  }).join('');

  // === 远程控制面板 ===
  var rc = document.getElementById('remote-control-list');
  if (rc) {
    var controls = [
      {sys:'灌溉系统', icon:'fa-tint', color:'blue', toggle:online>0, info:'在线设备 '+online+' 台', btns:[{label:'启动全部',cls:'bg-blue-100 text-blue-600'},{label:'停止全部',cls:'bg-gray-100 text-gray-600'}]},
      {sys:'施肥系统', icon:'fa-flask', color:'green', toggle:false, info:'待执行任务: 2', btns:[{label:'开始施肥',cls:'bg-green-100 text-green-600'},{label:'取消任务',cls:'bg-gray-100 text-gray-600'}]},
      {sys:'温室调节', icon:'fa-home', color:'purple', toggle:true, info:'当前温度: 25°C', btns:[{label:'+1°C',cls:'bg-purple-100 text-purple-600'},{label:'25°C',cls:'bg-gray-100 text-gray-600'},{label:'-1°C',cls:'bg-purple-100 text-purple-600'}]},
      {sys:'通风系统', icon:'fa-wind', color:'orange', toggle:true, info:'通风口 30%', btns:[{label:'打开',cls:'bg-orange-100 text-orange-600'},{label:'关闭',cls:'bg-gray-100 text-gray-600'}]}
    ];
    rc.innerHTML = controls.map(function(ctl, i) {
      var tgCls = ctl.toggle ? 'bg-green-500' : 'bg-gray-300';
      var tgBall = ctl.toggle ? 'right-1' : 'left-1';
      var btns = ctl.btns.map(function(b){return '<button onclick="devQuickCtrl(\''+ctl.sys+'\',\''+b.label+'\')" class="py-1.5 '+b.cls+' text-xs rounded hover:opacity-80 transition-opacity">'+b.label+'</button>';}).join('');
      return '<div class="p-3 bg-'+ctl.color+'-50 rounded-lg border border-'+ctl.color+'-100"><div class="flex items-center justify-between mb-2"><span class="text-sm font-medium text-gray-800"><i class="fa '+ctl.icon+' mr-1 text-'+ctl.color+'-500"></i>'+ctl.sys+'</span><button class="w-11 h-6 '+tgCls+' rounded-full relative" onclick="var b=this;var on=b.classList.contains(\'bg-green-500\');if(on){b.classList.replace(\'bg-green-500\',\'bg-gray-300\');b.querySelector(\'span\').classList.replace(\'right-1\',\'left-1\');}else{b.classList.replace(\'bg-gray-300\',\'bg-green-500\');b.querySelector(\'span\').classList.replace(\'left-1\',\'right-1\');}"><span class="absolute top-0.5 '+tgBall+' w-5 h-5 bg-white rounded-full shadow transition-all"></span></button></div><div class="grid gap-2" style="grid-template-columns:repeat('+ctl.btns.length+',1fr)">'+btns+'</div><p class="mt-2 text-xs text-gray-500">'+ctl.info+'</p></div>';
    }).join('');
  }

  // === 维护计划 ===
  var maintPending = document.getElementById('maint-pending');
  var maintHistory = document.getElementById('maint-history');
  var needMaint = devices.filter(function(d){return d.status==='fault' || d.status==='maintenance';});
  if (maintPending) {
    if (needMaint.length) {
      maintPending.innerHTML = needMaint.map(function(d){return '<div class="flex items-center justify-between p-3 bg-yellow-50 rounded-lg"><div class="flex items-center"><div class="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mr-3"><i class="fa fa-wrench text-yellow-600"></i></div><div><p class="text-sm font-medium">'+d.name+'</p><p class="text-xs text-gray-500">运行 '+d.runHours+' 小时 · '+d.location+'</p></div></div><button onclick="devScheduleMaint(\''+d.id+'\')" class="px-3 py-1.5 bg-yellow-500 text-white text-xs rounded hover:bg-yellow-600">安排维护</button></div>';}).join('');
    } else {
      maintPending.innerHTML = '<p class="text-sm text-gray-400 text-center py-4">所有设备运行正常</p>';
    }
  }
  if (maintHistory) {
    var history = devices.slice(0, 3).map(function(d){return '<div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"><div class="flex items-center"><div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3"><i class="fa fa-check-circle text-green-600"></i></div><div><p class="text-sm font-medium">'+d.name+'</p><p class="text-xs text-gray-500">'+d.lastMaintenance+' · 定期维护</p></div></div><span class="px-2 py-1 text-xs bg-green-100 text-green-600 rounded">已完成</span></div>';}).join('');
    maintHistory.innerHTML = history;
  }
}

// ==================== 溯源管理 渲染 ====================

function renderTraceability() {
  // 产品列表
  const products = dataService.getProductList();
  const prodContainer = document.getElementById('product-list');
  if (prodContainer) {
    prodContainer.innerHTML = products.map(p => {
      const sc = p.traceStatus === 'traced' ? 'green' : 'yellow';
      return `
        <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg" data-product-id="${p.id}">
          <div>
            <p class="text-sm font-medium text-gray-800">${p.name}</p>
            <p class="text-xs text-gray-500">批次: ${p.batchNumber} · ${p.harvestDate}</p>
          </div>
          <div class="flex items-center space-x-2">
            <span class="px-2 py-1 text-xs bg-${sc}-100 text-${sc}-600 rounded">${statusLabel(p.traceStatus)}</span>
            <button class="text-xs text-blue-500 hover:text-blue-600 btn-view-trace" data-product-id="${p.id}">查看溯源</button>
          </div>
        </div>`;
    }).join('');
  }

  // 溯源统计
  const stats = dataService.getTraceabilityStats();
  updateStatTexts('#traceability .text-2xl.font-bold', [
    stats.productCount + '个', stats.recordCount + '条', stats.scanCount + '次', stats.certCount + '项'
  ]);
}

function viewTrace(productId) {
  // 找到第一个产品的时间线并显示
  const timeline = dataService.getProductionTimeline(productId);
  const certs = dataService.getQualityCertifications(productId);
  const product = dataService.getById('products', productId);

  const tlContainer = document.getElementById('timeline-list');
  if (tlContainer && product) {
    tlContainer.innerHTML = `
      <p class="text-sm text-gray-500 mb-3">批次: ${product.batchNumber} | ${product.name}</p>
      <div class="space-y-3">
        ${timeline.map(t => `
          <div class="flex items-start">
            <div class="w-8 text-center flex-shrink-0">
              <div class="w-3 h-3 bg-green-500 rounded-full mx-auto"></div>
              ${timeline.indexOf(t) < timeline.length - 1 ? '<div class="w-0.5 h-10 bg-gray-300 mx-auto"></div>' : ''}
            </div>
            <div class="flex-1 ml-3">
              <p class="text-sm font-medium text-gray-800">${t.stage}</p>
              <p class="text-xs text-gray-500">${formatDateTime(t.date)} · ${t.location}</p>
              <p class="text-xs text-gray-600">${t.description}</p>
            </div>
          </div>`).join('')}
      </div>
      ${certs.length > 0 ? `
      <div class="mt-4 pt-4 border-t border-gray-200">
        <h4 class="text-sm font-medium text-gray-800 mb-2">质量认证</h4>
        ${certs.map(c => `
          <div class="flex items-center justify-between py-1">
            <span class="text-xs text-gray-600">${c.name}</span>
            <span class="text-xs ${c.result === 'pass' ? 'text-green-600' : 'text-yellow-600'}">${c.result === 'pass' ? '合格' : '检测中'}${c.certNumber ? ' · '+c.certNumber : ''}</span>
          </div>`).join('')}
      </div>` : ''}
    `;
  }
}

// ==================== 权限管理 渲染 ====================

function renderPermission() {
  if (!dataService.isReady()) return;
  var users = dataService.getAll('users') || [];
  var roles = dataService.getAll('roles') || [];
  var rc = {};
  users.forEach(function(u) { rc[u.role] = (rc[u.role]||0) + 1; });

  // 统计卡片
  var se = document.getElementById('perm-stats');
  if (se) {
    var stats = [
      {l:'用户总数',v:users.length,i:'fa-users',c:'indigo'},
      {l:'管理员',v:rc.admin||0,i:'fa-user-circle',c:'blue'},
      {l:'技术员',v:rc.technician||0,i:'fa-user-md',c:'green'},
      {l:'农户',v:rc.farmer||0,i:'fa-user',c:'orange'},
      {l:'合作社',v:rc.manager||0,i:'fa-building',c:'teal'},
    ];
    se.innerHTML = stats.map(function(s) {
      return '<div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100"><div class="flex items-start justify-between"><div><p class="text-sm text-gray-500">'+s.l+'</p><p class="text-2xl font-bold text-'+s.c+'-600 mt-1">'+s.v+'人</p></div><div class="w-12 h-12 bg-'+s.c+'-100 rounded-lg flex items-center justify-center"><i class="fa '+s.i+' text-'+s.c+'-600 text-xl"></i></div></div></div>';
    }).join('');
  }

  // 用户表
  var tbody = document.getElementById('user-table-body');
  if (tbody) {
    var rcb = {admin:'bg-blue-100 text-blue-600',technician:'bg-green-100 text-green-600',farmer:'bg-orange-100 text-orange-600',manager:'bg-teal-100 text-teal-600'};
    var rnm = {admin:'管理员',technician:'技术员',farmer:'农户',manager:'合作社管理'};
    var scb = {active:'bg-green-100 text-green-600',disabled:'bg-red-100 text-red-600'};
    var snm = {active:'启用',disabled:'禁用'};
    tbody.innerHTML = users.map(function(u) {
      return '<tr class="border-b border-gray-50 hover:bg-gray-50"><td class="py-3 px-4 text-sm">'+u.username+'</td><td class="py-3 px-4 text-sm">'+u.displayName+'</td><td class="py-3 px-4"><span class="px-2 py-1 text-xs rounded '+ (rcb[u.role]||'') +'">'+ (rnm[u.role]||u.role) +'</span></td><td class="py-3 px-4"><span class="px-2 py-1 text-xs rounded '+ (scb[u.status]||'') +'">'+ (snm[u.status]||u.status) +'</span></td><td class="py-3 px-4"><button class="text-sm text-blue-500 hover:text-blue-600 mr-2" onclick="permEditUser(\''+u.id+'\')">编辑</button><button class="text-sm text-gray-500 hover:text-gray-600 mr-2" onclick="permResetPwd(\''+u.id+'\')">重置密码</button><button class="text-sm text-red-400 hover:text-red-600" onclick="permDeleteUser(\''+u.id+'\')">删除</button></td></tr>';
    }).join('');
  }

  // 角色列表
  var roleContainer = document.getElementById('role-list');
  if (roleContainer) {
    var clr = {admin:'blue',farmer:'orange',technician:'green',manager:'teal'};
    var icn = {admin:'fa-user-circle',farmer:'fa-user',technician:'fa-user-md',manager:'fa-building'};
    roleContainer.innerHTML = roles.map(function(r) {
      var c = clr[r.id]||'gray', cnt = rc[r.id]||0;
      return '<div class="p-3 bg-'+c+'-50 rounded-lg border border-'+c+'-100"><div class="flex items-center justify-between"><div class="flex items-center"><div class="w-8 h-8 bg-'+c+'-100 rounded-lg flex items-center justify-center mr-2"><i class="fa '+(icn[r.id]||'fa-shield')+' text-'+c+'-600"></i></div><span class="text-sm font-medium">'+r.name+'</span></div><span class="text-xs text-gray-500">'+cnt+'人</span></div><p class="text-xs text-gray-500 mt-1">'+r.description+'</p><button class="mt-1 px-2 py-0.5 text-xs bg-white border border-gray-200 rounded hover:bg-'+c+'-50" onclick="permEditRole(\''+r.id+'\')">编辑权限</button></div>';
    }).join('');
  }

  // 权限配置（简洁版：只显示按钮，点击弹窗编辑）
  var permContainer = document.getElementById('permission-config-list');
  if (permContainer) {
    permContainer.innerHTML = '<p class="text-sm text-gray-500 text-center py-4">点击角色卡片中的 <b>"编辑权限"</b> 按钮查看和修改具体权限</p>';
  }

  // 操作日志
  var logs = dataService.getAll('operation_logs') || [];
  var logContainer = document.getElementById('operation-log-list');
  if (logContainer) {
    logContainer.innerHTML = logs.slice(0, 10).map(function(l) {
      return '<div class="flex items-center p-3 bg-gray-50 rounded-lg"><div class="flex-1"><p class="text-sm font-medium text-gray-800">'+l.action+'</p><p class="text-xs text-gray-500">'+(l.username||'')+' · '+(l.module||'')+'</p></div><span class="text-xs text-gray-400">'+formatDateTime(l.timestamp||l.createdAt)+'</span></div>';
    }).join('') || '<p class="text-gray-400 text-sm text-center py-4">暂无操作日志</p>';
  }
}

// 权限管理按钮 - 全局函数（避免事件委托冲突）
window.permEditUser = function(id) {
  var u = dataService.getById('users', id); if (!u) return;
  var roles = dataService.getAll('roles')||[];
  var h = '<div class="space-y-3"><div><label class="text-xs text-gray-500">用户名</label><input id="eu-un" class="w-full px-3 py-2 border rounded text-sm" value="'+u.username+'"></div><div><label class="text-xs text-gray-500">姓名</label><input id="eu-nm" class="w-full px-3 py-2 border rounded text-sm" value="'+u.displayName+'"></div><div><label class="text-xs text-gray-500">角色</label><select id="eu-rl" class="w-full px-3 py-2 border rounded text-sm">'+roles.map(function(r){return '<option value="'+r.id+'" '+(r.id===u.role?'selected':'')+'>'+r.name+'</option>';}).join('')+'</select></div><div><label class="text-xs text-gray-500">状态</label><select id="eu-st" class="w-full px-3 py-2 border rounded text-sm"><option value="active" '+(u.status=='active'?'selected':'')+'>启用</option><option value="disabled" '+(u.status=='disabled'?'selected':'')+'>禁用</option></select></div><div><label class="text-xs text-gray-500">新密码 (留空不修改)</label><input id="eu-pw" type="text" class="w-full px-3 py-2 border rounded text-sm" placeholder="输入新密码，留空则不修改"></div></div>';
  showConfirm('编辑用户', h, function(ok) {
    if (!ok) return;
    var changes = {username:document.getElementById('eu-un').value,displayName:document.getElementById('eu-nm').value,role:document.getElementById('eu-rl').value,status:document.getElementById('eu-st').value};
    var np = document.getElementById('eu-pw').value.trim();
    if (np) { changes.password = np; changes.passwordHash = ''; }
    dataService.update('users', u.id, changes);
    renderPermission(); showToast('用户已更新','success');
  });
};
window.permResetPwd = function(id) {
  showConfirm('重置密码', '<p>确定将密码重置为 <b>123456</b> 吗？</p>', function(ok) {
    if (!ok) return;
    dataService.update('users', id, {password:'123456',passwordHash:''});
    showToast('密码已重置','success');
  });
};
window.permDeleteUser = function(id) {
  var ud = dataService.getById('users', id);
  showConfirm('删除用户', '<p>确定删除 <b>'+ud.displayName+'</b> 吗？</p>', function(ok) {
    if (!ok) return;
    dataService.delete('users', id); renderPermission(); showToast('已删除','success');
  });
};
window.permEditRole = function(id) {
  var rl = dataService.getById('roles', id); if (!rl) return;
  var mods = ['dashboard','disease','farming','prediction','management','devices','traceability','permission'];
  var names = {dashboard:'数据总览',disease:'病虫害识别',farming:'农事管理',prediction:'产量预测',management:'农场管理',devices:'设备监控',traceability:'溯源管理',permission:'权限管理'};
  var perm = typeof rl.permissions==='string' ? JSON.parse(rl.permissions) : (rl.permissions||{});
  var h = '<div class="space-y-3"><div><label class="text-xs text-gray-500">角色名</label><input id="er-nm" class="w-full px-3 py-2 border rounded text-sm" value="'+rl.name+'"></div><p class="text-sm font-medium mt-2">模块权限</p>';
  mods.forEach(function(m){var p=perm[m]||{view:false,edit:false};h+='<div class="flex items-center justify-between p-2 bg-gray-50 rounded"><span class="text-sm">'+names[m]+'</span><div class="flex gap-3"><label class="text-xs"><input type="checkbox" id="per-'+m+'-v" '+(p.view?'checked':'')+'> 查看</label><label class="text-xs"><input type="checkbox" id="per-'+m+'-e" '+(p.edit?'checked':'')+'> 编辑</label></div></div>';});
  h += '</div>';
  showConfirm('编辑角色权限', h, function(ok) {
    if (!ok) return;
    var np = {}; mods.forEach(function(m){np[m]={view:document.getElementById('per-'+m+'-v').checked,edit:document.getElementById('per-'+m+'-e').checked};});
    dataService.update('roles', id, {name:document.getElementById('er-nm').value,permissions:JSON.stringify(np)});
    renderPermission(); showToast('权限已更新','success');
  });
};
window.permAddUser = function() {
  try {
    var rls = (dataService.getAll('roles')||[]).map(function(r){return '<option value="'+r.id+'">'+r.name+'</option>';}).join('');
    showConfirm('添加用户', '<div class="space-y-3"><div><label class="text-xs text-gray-500">用户名</label><input id="au-un" class="w-full px-3 py-2 border rounded text-sm" placeholder="英文用户名"></div><div><label class="text-xs text-gray-500">姓名</label><input id="au-nm" class="w-full px-3 py-2 border rounded text-sm" placeholder="中文姓名"></div><div><label class="text-xs text-gray-500">角色</label><select id="au-rl" class="w-full px-3 py-2 border rounded text-sm">'+rls+'</select></div></div>', function(ok) {
      if (!ok) return;
      var un=document.getElementById('au-un').value.trim(),nm=document.getElementById('au-nm').value.trim();
      if(!un||!nm){showToast('请填写完整','error');return;}
      dataService.insert('users',{id:'u'+Math.floor(Math.random()*9000+1000),username:un,displayName:nm,role:document.getElementById('au-rl').value,status:'active',password:'123456',createdAt:new Date().toISOString()});
      renderPermission(); showToast('用户添加成功','success');
    });
  } catch(e) { console.error('permAddUser err:', e); showToast('操作失败：' + e.message, 'error'); }
};
window.permAddRole = function() {
  try {
    showConfirm('添加角色', '<div class="space-y-3"><div><label class="text-xs text-gray-500">角色ID</label><input id="ar-id" class="w-full px-3 py-2 border rounded text-sm" placeholder="custom_role"></div><div><label class="text-xs text-gray-500">角色名称</label><input id="ar-nm" class="w-full px-3 py-2 border rounded text-sm" placeholder="新角色"></div><div><label class="text-xs text-gray-500">描述</label><input id="ar-ds" class="w-full px-3 py-2 border rounded text-sm" placeholder="角色描述"></div></div>', function(ok) {
      if (!ok) return;
      var rid=document.getElementById('ar-id').value.trim();
      if(!rid){showToast('请输入角色ID','error');return;}
      dataService.insert('roles',{id:rid,name:document.getElementById('ar-nm').value,nameEn:rid,description:document.getElementById('ar-ds').value,permissions:'{}'});
      renderPermission(); showToast('角色添加成功','success');
    });
  } catch(e) { console.error('permAddRole err:', e); showToast('操作失败：' + e.message, 'error'); }
};

// ==================== 设备监管交互 ====================
window.devDetail = function(id) {
  var d = dataService.getById('devices', id);
  if (!d) { showToast('设备不存在', 'error'); return; }
  var m = (typeof d.metrics==='string') ? (function(){try{return JSON.parse(d.metrics);}catch(e){return {};}})() : (d.metrics||{});
  var st = {online:'<span class="px-2 py-1 text-xs bg-green-100 text-green-600 rounded">运行中</span>',offline:'<span class="px-2 py-1 text-xs bg-red-100 text-red-600 rounded">已离线</span>',fault:'<span class="px-2 py-1 text-xs bg-yellow-100 text-yellow-600 rounded">故障</span>',maintenance:'<span class="px-2 py-1 text-xs bg-yellow-100 text-yellow-600 rounded">待维护</span>'};
  var tp = {pump:'水泵',fertilizer:'施肥机',sensor:'传感器',weather:'气象站',greenhouse:'温控'};
  var h = '<div class="space-y-3"><div class="flex items-center justify-between"><h4 class="font-semibold">'+d.name+'</h4>'+(st[d.status]||'')+'</div>';
  h += '<div class="grid grid-cols-2 gap-3 text-sm"><div><span class="text-gray-500">类型：</span>'+(tp[d.type]||d.type)+'</div><div><span class="text-gray-500">位置：</span>'+d.location+'</div><div><span class="text-gray-500">IP：</span>'+d.ipAddress+'</div><div><span class="text-gray-500">固件：</span>'+d.firmwareVersion+'</div><div><span class="text-gray-500">运行：</span>'+d.runHours+'小时</div><div><span class="text-gray-500">上次维护：</span>'+d.lastMaintenance+'</div></div>';
  h += '<div class="bg-gray-50 p-3 rounded text-sm"><p class="font-medium mb-1">实时指标</p>' + Object.entries(m).filter(function(e){return e[0]!=='currentTask';}).map(function(e){return '<div class="flex justify-between"><span class="text-gray-500">'+e[0]+'</span><span>'+e[1]+'</span></div>';}).join('') + '</div>';
  if (d.nextMaintenance) h += '<p class="text-xs text-gray-400">下次维护：'+d.nextMaintenance+'</p>';
  h += '</div>';
  showConfirm('设备详情', h, function(){});
};

window.devControl = function(id) {
  var d = dataService.getById('devices', id);
  showToast('已向 '+d.name+' 发送控制指令', 'info');
};

window.devReport = function(id) {
  dataService.update('devices', id, {status:'maintenance'});
  renderDevices();
  showToast('已提交报修申请', 'success');
};

window.devRestart = function(id) {
  var d = dataService.getById('devices', id);
  dataService.update('devices', id, {status:'online'});
  renderDevices();
  showToast(d.name+' 已重新上线', 'success');
};

window.devStart = function(id) {
  var d = dataService.getById('devices', id);
  dataService.update('devices', id, {status:'online'});
  renderDevices();
  showToast(d.name+' 已启动', 'success');
};

window.devRefreshAll = function() {
  var devices = dataService.getAll('devices') || [];
  devices.forEach(function(d) {
    var r = Math.random();
    if (d.status==='fault' && r<0.3) dataService.update('devices', d.id, {status:'online'});
    if (d.status==='online' && r<0.1) dataService.update('devices', d.id, {status:'fault'});
  });
  renderDevices();
  showToast('设备状态已刷新', 'success');
};

window.devEmergencyStop = function() {
  showConfirm('紧急停止', '<p class="text-sm text-red-600"><b>⚠️ 确定停止所有运行中的设备吗？</b></p><p class="text-xs text-gray-500 mt-2">这将中断所有灌溉、施肥和温室控制任务。</p>', function(ok) {
    if (!ok) return;
    var devices = dataService.getAll('devices')||[];
    devices.forEach(function(d){ if (d.status==='online') dataService.update('devices', d.id, {status:'maintenance'}); });
    renderDevices();
    showToast('所有设备已紧急停止', 'warning');
  });
};

window.devQuickCtrl = function(sys, label) {
  showToast(sys+' → '+label+' | 指令已下发', 'info');
};

window.devScheduleMaint = function(id) {
  var d = dataService.getById('devices', id);
  var today = new Date().toISOString().slice(0,10);
  dataService.update('devices', id, {lastMaintenance: today, status:'online'});
  renderDevices();
  showToast(d.name+' 维护完成，已恢复上线', 'success');
};

window.devAddDevice = function() {
  var h = '<div class="space-y-3"><div><label class="text-xs text-gray-500">设备名称</label><input id="dea-name" class="w-full px-3 py-2 border rounded text-sm" placeholder="灌溉泵 #2"></div><div><label class="text-xs text-gray-500">类型</label><select id="dea-type" class="w-full px-3 py-2 border rounded text-sm"><option value="pump">水泵</option><option value="fertilizer">施肥机</option><option value="sensor">传感器</option><option value="weather">气象站</option><option value="greenhouse">温控</option></select></div><div><label class="text-xs text-gray-500">位置</label><input id="dea-loc" class="w-full px-3 py-2 border rounded text-sm" placeholder="A区"></div><div><label class="text-xs text-gray-500">IP地址</label><input id="dea-ip" class="w-full px-3 py-2 border rounded text-sm" placeholder="192.168.1.200"></div></div>';
  showConfirm('添加新设备', h, function(ok) {
    if (!ok) return;
    var nm = document.getElementById('dea-name').value.trim();
    if (!nm) { showToast('请输入设备名称','error'); return; }
    var id = 'dev_' + Math.floor(Math.random()*9000+1000);
    dataService.insert('devices', {
      id: id, name: nm, type: document.getElementById('dea-type').value,
      location: document.getElementById('dea-loc').value, status:'online',
      metrics: '{}', runHours: 0,
      lastMaintenance: new Date().toISOString().slice(0,10),
      nextMaintenance: '', ipAddress: document.getElementById('dea-ip').value,
      firmwareVersion: 'v1.0.0'
    });
    renderDevices();
    showToast('设备添加成功', 'success');
  });
};



// ==================== 农事决策交互 ====================
window.farmExecIrrigation = function(id) {
  dataService.update('irrigation_plans', id, {status:'completed'});
  renderFarming(); showToast('灌溉方案已执行', 'success');
};
window.farmEditPlan = function(table, id) {
  var row = dataService.getById(table, id);
  if (!row) return;
  var h = '<div class="space-y-2"><div><label class="text-xs text-gray-500">目标湿度(%)</label><input id="fp-tm" class="w-full px-3 py-2 border rounded text-sm" value="'+row.targetMoisture+'"></div><div><label class="text-xs text-gray-500">水量(m³)</label><input id="fp-wv" class="w-full px-3 py-2 border rounded text-sm" value="'+row.waterVolume+'"></div><div><label class="text-xs text-gray-500">时长(分钟)</label><input id="fp-ed" class="w-full px-3 py-2 border rounded text-sm" value="'+row.estimatedDuration+'"></div></div>';
  showConfirm('调整方案参数', h, function(ok) {
    if (!ok) return;
    dataService.update(table, id, {
      targetMoisture: parseInt(document.getElementById('fp-tm').value)||65,
      waterVolume: parseInt(document.getElementById('fp-wv').value)||10,
      estimatedDuration: parseInt(document.getElementById('fp-ed').value)||30
    });
    renderFarming(); showToast('参数已更新', 'success');
  });
};
window.farmFieldDetail = function(id) {
  var f = dataService.getById('fields', id);
  if (!f) return;
  var h = '<div class="space-y-2 text-sm"><div class="grid grid-cols-2 gap-2"><div><span class="text-gray-500">地块：</span>'+f.code+'</div><div><span class="text-gray-500">面积：</span>'+f.area+'亩</div><div><span class="text-gray-500">作物：</span>'+f.cropName+'</div><div><span class="text-gray-500">状态：</span>'+(f.status==='growing'?'生长中':f.status)+'</div><div><span class="text-gray-500">湿度：</span>'+f.soilMoisture+'%</div><div><span class="text-gray-500">pH：</span>'+f.soilPh+'</div><div><span class="text-gray-500">种植：</span>'+f.plantedDate+'</div><div><span class="text-gray-500">预计采收：</span>'+f.expectedHarvest+'</div></div><p class="text-xs text-gray-400">位置：'+f.location+'</p></div>';
  showConfirm('地块详情 - '+f.code, h, function(){});
};
window.farmTaskDetail = function(id) {
  var t = dataService.getById('farming_tasks', id);
  if (!t) return;
  var tl = {watering:'浇水',fertilizing:'施肥',spraying:'喷药',pruning:'修剪',harvesting:'采收',thinning:'疏果'};
  var st = {completed:'已完成',in_progress:'进行中',pending:'待执行',cancelled:'已取消'};
  var h = '<div class="space-y-2 text-sm"><div class="grid grid-cols-2 gap-2"><div><span class="text-gray-500">类型：</span>'+(tl[t.type]||t.type)+'</div><div><span class="text-gray-500">状态：</span>'+(st[t.status]||t.status)+'</div><div><span class="text-gray-500">地块：</span>'+t.fieldCode+'</div><div><span class="text-gray-500">作物：</span>'+t.cropName+'</div><div><span class="text-gray-500">时间：</span>'+t.scheduledTime+'</div><div><span class="text-gray-500">时长：</span>'+t.estimatedDuration+'分钟</div></div>'+(t.notes?'<p class="text-xs text-gray-500">备注：'+t.notes+'</p>':'')+'</div><div class="flex gap-2 mt-3 pt-2 border-t">'+(t.status!=='completed'?'<button onclick="var m=document.querySelector(\'.perm-modal\');if(m)m.remove();farmCompleteTask(\''+t.id+'\')" class="px-3 py-1.5 bg-green-500 text-white text-xs rounded hover:bg-green-600">标记完成</button>':'')+'</div>';
  showConfirm('任务详情', h, function(){});
};
window.farmCompleteTask = function(id) {
  dataService.update('farming_tasks', id, {status:'completed'});
  renderFarming(); showToast('任务已完成', 'success');
};
window.farmAddTask = function() {
  var fields = dataService.getAll('fields')||[];
  var fOpts = fields.map(function(f){return '<option value="'+f.code+'">'+f.code+' - '+f.cropName+'</option>';}).join('');
  var h = '<div class="space-y-3"><div><label class="text-xs text-gray-500">任务类型</label><select id="fat-type" class="w-full px-3 py-2 border rounded text-sm"><option value="watering">浇水</option><option value="fertilizing">施肥</option><option value="spraying">喷药</option><option value="pruning">修剪</option><option value="harvesting">采收</option><option value="thinning">疏果</option></select></div><div><label class="text-xs text-gray-500">目标地块</label><select id="fat-field" class="w-full px-3 py-2 border rounded text-sm">'+fOpts+'</select></div><div><label class="text-xs text-gray-500">执行时间</label><input id="fat-time" class="w-full px-3 py-2 border rounded text-sm" value="'+new Date().toISOString().slice(0,16)+'"></div><div><label class="text-xs text-gray-500">时长(分钟)</label><input id="fat-dur" class="w-full px-3 py-2 border rounded text-sm" value="30"></div><div><label class="text-xs text-gray-500">备注</label><input id="fat-note" class="w-full px-3 py-2 border rounded text-sm" placeholder="任务说明"></div></div>';
  showConfirm('添加农事任务', h, function(ok) {
    if (!ok) return;
    var fc = document.getElementById('fat-field').value;
    var fld = fields.find(function(f){return f.code===fc;})||{};
    dataService.insert('farming_tasks', {
      id: 'task_'+Date.now().toString(36),
      type: document.getElementById('fat-type').value,
      fieldCode: fc, cropName: fld.cropName||'',
      scheduledTime: document.getElementById('fat-time').value,
      estimatedDuration: parseInt(document.getElementById('fat-dur').value)||30,
      status: 'pending', assignedTo: '--',
      priority: 'medium', notes: document.getElementById('fat-note').value
    });
    renderFarming(); showToast('任务添加成功', 'success');
  });
};
window.farmAddField = function() {
  var h = '<div class="space-y-3"><div><label class="text-xs text-gray-500">地块编号</label><input id="faf-code" class="w-full px-3 py-2 border rounded text-sm" placeholder="A3"></div><div><label class="text-xs text-gray-500">地块名称</label><input id="faf-name" class="w-full px-3 py-2 border rounded text-sm" placeholder="茄子田"></div><div><label class="text-xs text-gray-500">作物</label><input id="faf-crop" class="w-full px-3 py-2 border rounded text-sm" placeholder="茄子"></div><div><label class="text-xs text-gray-500">面积(亩)</label><input id="faf-area" class="w-full px-3 py-2 border rounded text-sm" value="2.0"></div><div><label class="text-xs text-gray-500">位置</label><input id="faf-loc" class="w-full px-3 py-2 border rounded text-sm" placeholder="A区"></div></div>';
  showConfirm('添加地块', h, function(ok) {
    if (!ok) return;
    dataService.insert('fields', {
      code: document.getElementById('faf-code').value,
      name: document.getElementById('faf-name').value,
      cropName: document.getElementById('faf-crop').value,
      area: parseFloat(document.getElementById('faf-area').value)||2,
      status:'growing', soilMoisture:50, soilPh:7,
      location: document.getElementById('faf-loc').value,
      plantedDate: new Date().toISOString().slice(0,10)
    });
    renderFarming(); showToast('地块添加成功', 'success');
  });
};
window.farmAddIrrigation = function() {
  var fields = dataService.getAll('fields')||[];
  var fOpts = fields.map(function(f){return '<option value="'+f.code+'">'+f.code+' - '+f.cropName+'</option>';}).join('');
  var h = '<div class="space-y-3"><div><label class="text-xs text-gray-500">目标地块</label><select id="fai-field" class="w-full px-3 py-2 border rounded text-sm">'+fOpts+'</select></div><div><label class="text-xs text-gray-500">目标湿度(%)</label><input id="fai-tm" class="w-full px-3 py-2 border rounded text-sm" value="65"></div><div><label class="text-xs text-gray-500">水量(m³)</label><input id="fai-wv" class="w-full px-3 py-2 border rounded text-sm" value="15"></div><div><label class="text-xs text-gray-500">时长(分钟)</label><input id="fai-ed" class="w-full px-3 py-2 border rounded text-sm" value="30"></div></div>';
  showConfirm('添加灌溉方案', h, function(ok) {
    if (!ok) return;
    var fc = document.getElementById('fai-field').value;
    var fld = fields.find(function(f){return f.code===fc;})||{};
    dataService.insert('irrigation_plans', {
      id: 'irr_'+Date.now().toString(36),
      fieldCode: fc, cropName: fld.cropName||'',
      targetMoisture: parseInt(document.getElementById('fai-tm').value)||65,
      currentMoisture: fld.soilMoisture||50,
      waterVolume: parseInt(document.getElementById('fai-wv').value)||15,
      estimatedDuration: parseInt(document.getElementById('fai-ed').value)||30,
      status: 'pending', scheduledAt: new Date().toISOString().slice(0,10)
    });
    renderFarming(); showToast('灌溉方案已添加', 'success');
  });
};
window.farmAddFertilization = function() {
  var fields = dataService.getAll('fields')||[];
  var fOpts = fields.map(function(f){return '<option value="'+f.code+'">'+f.code+' - '+f.cropName+'</option>';}).join('');
  var h = '<div class="space-y-3"><div><label class="text-xs text-gray-500">目标地块</label><select id="faf-field" class="w-full px-3 py-2 border rounded text-sm">'+fOpts+'</select></div><div class="grid grid-cols-2 gap-2"><div><label class="text-xs text-gray-500">氮肥(kg)</label><input id="faf-n" class="w-full px-3 py-2 border rounded text-sm" value="10"></div><div><label class="text-xs text-gray-500">磷肥(kg)</label><input id="faf-p" class="w-full px-3 py-2 border rounded text-sm" value="5"></div><div><label class="text-xs text-gray-500">钾肥(kg)</label><input id="faf-k" class="w-full px-3 py-2 border rounded text-sm" value="8"></div><div><label class="text-xs text-gray-500">有机肥(kg)</label><input id="faf-o" class="w-full px-3 py-2 border rounded text-sm" value="3"></div></div></div>';
  showConfirm('添加施肥方案', h, function(ok) {
    if (!ok) return;
    var fc = document.getElementById('faf-field').value;
    var fld = fields.find(function(f){return f.code===fc;})||{};
    dataService.insert('fertilization_plans', {
      id: 'fert_'+Date.now().toString(36),
      fieldCode: fc, cropName: fld.cropName||'',
      nKg: parseInt(document.getElementById('faf-n').value)||10,
      pKg: parseInt(document.getElementById('faf-p').value)||5,
      kKg: parseInt(document.getElementById('faf-k').value)||8,
      organicKg: parseInt(document.getElementById('faf-o').value)||3,
      status: 'planned', scheduledAt: new Date().toISOString().slice(0,10)
    });
    renderFarming(); showToast('施肥方案已添加', 'success');
  });
};

function showConfirm(title, body, cb) {
  // 移除已有弹窗
  document.querySelectorAll('.perm-modal').forEach(function(m){m.remove();});
  var overlay = document.createElement('div');
  overlay.className = 'fixed inset-0 bg-black/50 z-50 flex items-center justify-center perm-modal';
  overlay.innerHTML = '<div class="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl"><h3 class="text-lg font-semibold mb-4">'+title+'</h3><div class="mb-4" id="perm-form-body">'+body+'</div><div class="flex justify-end gap-3"><button id="cf-cancel" class="px-4 py-2 border rounded-lg text-sm">取消</button><button id="cf-ok" class="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm">确定</button></div></div>';
  document.body.appendChild(overlay);
  document.getElementById('cf-ok').onclick = function(e) { e.stopPropagation(); cb(true); overlay.remove(); };
  document.getElementById('cf-cancel').onclick = function(e) { e.stopPropagation(); cb(false); overlay.remove(); };
  overlay.onclick = function(e) { if (e.target === overlay) { cb(false); overlay.remove(); } };
}

// ==================== 全局辅助函数 ====================

/** 处理预警 */
function resolveAlert(alertId) {
  if (dataService.isReady()) {
    dataService.update('alerts', alertId, { isResolved: true, isRead: true });
    renderDashboard();
  }
}

/** 查看溯源 */
function viewTrace(productId) {
  const product = dataService.isReady() ? dataService.getById('products', productId) : null;
  if (!product) return;
  const timeline = dataService.getProductionTimeline(productId);
  const certs = dataService.getQualityCertifications(productId);

  const tlContainer = document.getElementById('timeline-list');
  if (tlContainer) {
    tlContainer.innerHTML = `
      <p class="text-sm text-gray-500 mb-3">批次: ${product.batchNumber} | ${product.name}</p>
      <div class="space-y-3">
        ${timeline.map(t => `
          <div class="flex items-start">
            <div class="w-8 text-center flex-shrink-0">
              <div class="w-3 h-3 bg-green-500 rounded-full mx-auto"></div>
              ${timeline.indexOf(t) < timeline.length - 1 ? '<div class="w-0.5 h-10 bg-gray-300 mx-auto"></div>' : ''}
            </div>
            <div class="flex-1 ml-3">
              <p class="text-sm font-medium text-gray-800">${t.stage}</p>
              <p class="text-xs text-gray-500">${formatDateTime(t.date)} · ${t.location}</p>
              <p class="text-xs text-gray-600">${t.description}</p>
            </div>
          </div>`).join('')}
      </div>
      ${certs.length > 0 ? `
      <div class="mt-4 pt-4 border-t border-gray-200">
        <h4 class="text-sm font-medium text-gray-800 mb-2">质量认证</h4>
        ${certs.map(c => `
          <div class="flex items-center justify-between py-1">
            <span class="text-xs text-gray-600">${c.name}</span>
            <span class="text-xs ${c.result === 'pass' ? 'text-green-600' : 'text-yellow-600'}">${c.result === 'pass' ? '合格' : '检测中'}${c.certNumber ? ' · '+c.certNumber : ''}</span>
          </div>`).join('')}
      </div>` : ''}
    `;
  }

  // 滚动到时间线
  tlContainer?.scrollIntoView({ behavior: 'smooth' });
}

function updateStatTexts(selector, values) {
  const els = document.querySelectorAll(selector);
  els.forEach((el, i) => {
    if (values[i] !== undefined) el.textContent = values[i];
  });
}

// ==================== 天气监测 渲染 ====================

function renderWeather() {
  const stats = dataService.getWeatherStats();
  // 初始化天气图表
  if (typeof initWeatherCharts === 'function') setTimeout(initWeatherCharts, 100);

  document.getElementById('stat-temp').textContent = stats.todayTemp;
  document.getElementById('stat-temp-change').innerHTML = '<i class="fa fa-arrow-' + (stats.tempChange.startsWith('+') ? 'up' : 'down') + ' mr-1"></i>较昨日 ' + stats.tempChange;
  document.getElementById('stat-rainfall').textContent = stats.todayRainfall;
  document.getElementById('stat-rainfall-desc').textContent = stats.rainfallDesc;
  document.getElementById('stat-humidity').textContent = stats.todayHumidity;
  document.getElementById('stat-wind').textContent = stats.todayWind;
  document.getElementById('stat-condition').innerHTML = '<i class="fa fa-sun-o mr-1"></i>' + stats.conditionLabel;

  // 7日预报
  const forecast = dataService.getWeatherForecast();
  const fcContainer = document.getElementById('weather-forecast-list');
  const condIcons = { sunny: 'fa-sun-o text-orange-400', cloudy: 'fa-cloud text-gray-400', rain: 'fa-tint text-blue-400', snow: 'fa-snowflake-o text-blue-300' };
  fcContainer.innerHTML = forecast.slice(0, 7).map(f => `
    <div class="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer" data-action="forecast-detail" data-date="${f.date}">
      <span class="text-sm text-gray-700 w-14">${f.date}</span>
      <i class="fa ${condIcons[f.condition] || 'fa-question'} text-lg"></i>
      <span class="text-sm font-medium">${f.high}° / ${f.low}°</span>
      <span class="text-xs text-gray-500">${f.conditionLabel}</span>
    </div>`).join('');

  // 天气预警
  const alerts = dataService.getWeatherAlerts();
  document.getElementById('weather-alert-list').innerHTML = alerts.length > 0
    ? alerts.map(a => '<div class="relative">' + alertItemHTML(a) + '<button class="absolute top-2 right-2 text-xs text-gray-400 hover:text-blue-500" data-action="mark-alert-read" data-alert-id="' + a.id + '">已读</button></div>').join('')
    : '<div class="col-span-3 text-center text-gray-400 py-6">暂无天气预警</div>';
}

// ==================== 市场价格 渲染 ====================

function renderMarket() {
  const stats = dataService.getMarketStats();

  document.getElementById('stat-crop-count').textContent = stats.cropCount + '个';
  document.getElementById('stat-avg-price').textContent = stats.avgPrice + '元/kg';
  document.getElementById('stat-max-up').textContent = stats.maxUpCrop;
  document.getElementById('stat-max-down').textContent = stats.maxDownCrop;

  // 今日价格表
  const todayPrices = dataService.table('market_prices')
    .where('date', 'eq', '2024-01-15').get();
  const tbody = document.getElementById('market-price-table-body');
  tbody.innerHTML = todayPrices.map(p => `
    <tr class="hover:bg-gray-50 cursor-pointer" data-action="price-detail" data-crop="${p.cropName}">
      <td class="px-4 py-2 text-sm font-medium text-gray-800">${p.cropName}</td>
      <td class="px-4 py-2 text-xs text-gray-500">${p.market}</td>
      <td class="px-4 py-2 text-sm text-right font-medium">${p.pricePerKg.toFixed(2)}</td>
      <td class="px-4 py-2 text-sm text-right ${p.changePercent >= 0 ? 'text-red-500' : 'text-green-500'}">${p.changePercent >= 0 ? '+' : ''}${p.changePercent}%</td>
      <td class="px-4 py-2 text-center"><span class="px-2 py-0.5 text-xs bg-${statusColor(p.trend)}-100 text-${statusColor(p.trend)}-600 rounded">${statusLabel(p.trend)}</span></td>
    </tr>`).join('');

  // 市场预警
  const alerts = dataService.getMarketAlerts();
  const alertContainer = document.getElementById('market-alert-list');
  alertContainer.innerHTML = alerts.length > 0
    ? alerts.map(a => alertItemHTML(a)).join('')
    : '<div class="text-center text-gray-400 py-6">暂无市场行情预警</div>';
}

// ==================== 模型监控 渲染 ====================

function renderMonitor() {
  const stats = dataService.getModelStats();

  document.getElementById('stat-active-models').textContent = stats.activeCount + '个';
  document.getElementById('stat-avg-accuracy').textContent = stats.avgAccuracy;
  document.getElementById('stat-drift-warning').textContent = stats.driftWarnings + '个';
  document.getElementById('stat-unknown-rate').textContent = stats.avgUnknownRate;

  // 模型版本列表
  const models = dataService.getModelVersionList();
  const mvContainer = document.getElementById('model-version-list');
  mvContainer.innerHTML = models.map(m => {
    const sc = statusColor(m.status);
    return `
      <div class="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer" data-action="model-detail" data-id="${m.id}">
        <div class="flex items-center justify-between mb-1">
          <span class="text-sm font-medium text-gray-800">${m.modelName}</span>
          <span class="px-2 py-0.5 text-xs bg-${sc}-100 text-${sc}-600 rounded">${statusLabel(m.status)}</span>
        </div>
        <div class="flex items-center justify-between text-xs text-gray-500">
          <span>${m.version}</span>
          <span>${m.accuracy != null ? '准确率: ' + m.accuracy + '%' : '向量检索模型'}</span>
        </div>
        ${m.driftScore != null ? `<div class="mt-1 w-full bg-gray-200 rounded-full h-1.5"><div class="bg-${m.driftScore > 0.2 ? 'yellow' : 'green'}-500 h-1.5 rounded-full" style="width:${Math.min(m.driftScore * 100, 100)}%"></div></div>` : ''}
      </div>`;
  }).join('');

  // 预测日志表（从 disease_records 模拟）
  const recentRecords = dataService.getDiseaseHistory().slice(0, 5);
  const logTable = document.getElementById('prediction-log-table');
  logTable.innerHTML = recentRecords.map(r => `
    <tr class="hover:bg-gray-50 cursor-pointer" data-action="log-detail" data-id="${r.id}">
      <td class="px-3 py-2 text-xs text-gray-500">${formatDateTime(r.detectedAt)}</td>
      <td class="px-3 py-2 text-xs">${r.modelName || 'DeepSeek 病虫害识别模型'}</td>
      <td class="px-3 py-2 text-xs text-gray-600">${r.fieldCode} ${r.cropAffected}图片</td>
      <td class="px-3 py-2 text-center"><span class="px-2 py-0.5 text-xs bg-${statusColor(r.status)}-100 text-${statusColor(r.status)}-600 rounded">${r.diseaseName}</span></td>
    </tr>`).join('');

  // 未知样本审核队列
  const unknowns = dataService.getDiseaseHistory().filter(r => r.status === 'processing' || r.severity === 'medium');
  const unknownContainer = document.getElementById('unknown-sample-list');
  unknownContainer.innerHTML = unknowns.length > 0
    ? unknowns.slice(0, 4).map(r => `
      <div class="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-100">
        <div>
          <p class="text-sm font-medium text-gray-800">${r.diseaseName}</p>
          <p class="text-xs text-gray-500">地块${r.fieldCode} · ${r.cropAffected} · ${formatDateTime(r.detectedAt)}</p>
        </div>
        <div class="flex space-x-2">
          <button class="px-3 py-1 text-xs bg-green-100 text-green-600 rounded hover:bg-green-200" onclick="reviewSample('${r.id}', 'approve')">确认</button>
          <button class="px-3 py-1 text-xs bg-red-100 text-red-600 rounded hover:bg-red-200" onclick="reviewSample('${r.id}', 'reject')">驳回</button>
        </div>
      </div>`).join('')
    : '<div class="text-center text-gray-400 py-6">暂无待审核样本</div>';
}
