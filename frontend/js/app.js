/**
 * 智慧农业管理系统 - 主应用逻辑
 * 数据驱动渲染 + 页面导航 + 交互事件
 */

// ==================== 初始化 ====================

document.addEventListener('DOMContentLoaded', async () => {
  // 显示登录弹窗
  showLoginModal();

  // 加载数据（后台进行，登录后继续）
  try {
    await initDataService();
    console.log('[App] 数据服务就绪');
  } catch (err) {
    console.error('[App] 数据加载失败:', err);
  }
});

/**
 * 登录成功后初始化系统
 */
function initAppAfterLogin() {
  if (!dataService.isReady()) {
    setTimeout(initAppAfterLogin, 500);
    return;
  }
  window.__chartsInitialized = true;
  initNavigation();
  renderDashboard();
  initDashboardCharts();
  setupDashboardEvents();

  // 默认打开仪表盘
  const firstModule = getFirstAllowedModule();
  if (firstModule) {
    const btn = document.querySelector(`.sidebar-item[data-menu="${firstModule}"]`);
    if (btn && btn.style.display !== 'none') btn.click();
  }
}

function getFirstAllowedModule() {
  const modules = ['dashboard','disease','farming','prediction','management',
                   'devices','traceability','permission','weather','market','monitor'];
  for (const m of modules) {
    if (Auth.canView(m)) return m;
  }
  return 'dashboard';
}

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
    monitor:      () => renderMonitor()
  };
  if (renderers[menuId]) renderers[menuId]();
  // handlers.js will rebind events via observeSectionChanges
}

// ==================== 仪表盘 渲染 ====================

function renderDashboard() {
  const stats = dataService.getDashboardStats();

  // 统计卡片 — 标注从数据中来
  document.getElementById('stat-tasks-today').textContent = stats.tasksToday;
  document.getElementById('stat-tasks-change').innerHTML = `<i class="fa fa-check-circle mr-1"></i>${stats.tasksSummary}`;
  document.getElementById('stat-device-rate').textContent = stats.deviceOnlineRate + '%';
  document.getElementById('stat-device-change').innerHTML = `<i class="fa fa-plug mr-1"></i>${stats.deviceSummary}`;
  document.getElementById('stat-alert-count').textContent = stats.alertCount;
  document.getElementById('stat-alert-desc').innerHTML = `<i class="fa fa-flag mr-1"></i>${stats.alertSummary}`;
  document.getElementById('stat-monthly-yield').textContent = stats.monthlyYield + stats.yieldUnit;
  document.getElementById('stat-yield-change').innerHTML = `<i class="fa fa-chart-line mr-1"></i>${stats.yieldSummary}`;

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

  // 今日任务
  const tasks = dataService.getTodayTasks();
  document.getElementById('task-list').innerHTML = tasks.length > 0
    ? tasks.map(t => taskItemHTML(t)).join('')
    : '<div class="text-center text-gray-400 py-4">暂无任务</div>';

  // 预警列表
  const alerts = dataService.getAlertList();
  document.getElementById('alert-list').innerHTML = alerts.length > 0
    ? alerts.map(a => alertItemHTML(a)).join('')
    : '<div class="text-center text-gray-400 py-4">暂无预警</div>';
}

// ==================== 病虫害 渲染 ====================

function renderDisease() {
  // 识别历史
  const records = dataService.getDiseaseHistory();
  const historyContainer = document.getElementById('disease-history-list');
  historyContainer.innerHTML = records.map(r => {
    const sc = statusColor(r.status);
    return `
      <div class="flex items-center p-3 bg-gray-50 rounded-lg">
        <div class="w-12 h-12 bg-${sc}-100 rounded-lg flex items-center justify-center mr-3">
          <i class="fa fa-bug text-${sc}-500"></i>
        </div>
        <div class="flex-1">
          <p class="text-sm font-medium text-gray-800">${r.diseaseName}</p>
          <p class="text-xs text-gray-500">${formatDateTime(r.detectedAt)}</p>
        </div>
        <span class="px-2 py-1 text-xs bg-${sc}-100 text-${sc}-600 rounded">${statusLabel(r.status)}</span>
      </div>`;
  }).join('');

  // 知识库
  const kb = dataService.getKnowledgeBase();
  const kbContainer = document.getElementById('knowledge-base-grid');
  // Clear previous content
  kbContainer.innerHTML = kb.map(k => {
    const colorMap = { high: 'red', medium: 'orange', critical: 'red', low: 'green' };
    const c = colorMap[k.severity] || 'blue';
    return `
      <div class="p-4 bg-${c}-50 rounded-lg border border-${c}-100 cursor-pointer hover:shadow-md transition-shadow" onclick="showDiseaseDetail('${k.id}')">
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
  // 智能灌溉方案
  const irrigations = dataService.getIrrigationPlans();
  const irrContainer = document.getElementById('irrigation-plan-list');
  irrContainer.innerHTML = irrigations.map(p => {
    const sc = statusColor(p.status);
    return `
      <div class="p-4 bg-blue-50 rounded-lg">
        <div class="flex items-center justify-between mb-2">
          <span class="font-medium text-gray-800">地块${p.fieldCode} - ${p.cropName}</span>
          <span class="px-2 py-1 text-xs bg-${sc}-100 text-${sc}-600 rounded">${statusLabel(p.status)}</span>
        </div>
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div><span class="text-gray-500">目标湿度：</span>${p.targetMoisture}%</div>
          <div><span class="text-gray-500">当前湿度：</span>${p.currentMoisture}%</div>
          <div><span class="text-gray-500">灌溉水量：</span>${p.waterVolume}m³</div>
          <div><span class="text-gray-500">预计时长：</span>${p.estimatedDuration}分钟</div>
        </div>
        ${p.status === 'pending' ? `
        <div class="mt-3 flex space-x-2">
          <button class="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600" onclick="executeIrrigation('${p.id}')">立即执行</button>
          <button class="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300">定时执行</button>
        </div>` : ''}
      </div>`;
  }).join('');

  // 精准施肥方案
  const ferts = dataService.getFertilizationPlans();
  const fertContainer = document.getElementById('fertilization-plan-list');
  fertContainer.innerHTML = ferts.map(p => `
    <div class="p-4 bg-green-50 rounded-lg">
      <div class="flex items-center justify-between mb-2">
        <span class="font-medium text-gray-800">地块${p.fieldCode} - ${p.cropName}</span>
        ${badge(p.status)}
      </div>
      <div class="grid grid-cols-4 gap-2 text-sm text-center">
        <div class="bg-white rounded p-2"><span class="text-red-500 font-bold">N</span><br>${p.nKg}kg</div>
        <div class="bg-white rounded p-2"><span class="text-yellow-500 font-bold">P</span><br>${p.pKg}kg</div>
        <div class="bg-white rounded p-2"><span class="text-blue-500 font-bold">K</span><br>${p.kKg}kg</div>
        <div class="bg-white rounded p-2"><span class="text-green-500 font-bold">有机</span><br>${p.organicKg}kg</div>
      </div>
    </div>
  `).join('');

  // 地块管理列表
  const fields = dataService.getFieldManagementList();
  const fieldList = document.getElementById('field-management-list');
  if (fieldList) {
    fieldList.innerHTML = fields.map(f => `
      <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div>
          <p class="text-sm font-medium text-gray-800">地块${f.code} - ${f.cropName}</p>
          <p class="text-xs text-gray-500">${f.area}亩 · 湿度${f.soilMoisture}%</p>
        </div>
        ${badge(f.status)}
      </div>`).join('');
  }

  // 农事任务列表
  const tasks = dataService.getFarmingTasks();
  const taskContainer = document.getElementById('farming-task-list');
  if (taskContainer) {
    taskContainer.innerHTML = tasks.slice(0, 4).map(t => taskItemHTML(t)).join('');
  }

  // 作业进度
  const progress = dataService.getFarmingProgress();
  const progContainer = document.getElementById('farming-progress-list');
  if (progContainer) {
    progContainer.innerHTML = progress.map(p => `
      <div>
        <div class="flex items-center justify-between mb-1">
          <span class="text-sm text-gray-700">${p.name}</span>
          <span class="text-sm font-medium">${p.progress}%</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div class="bg-green-500 h-2 rounded-full" style="width:${p.progress}%"></div>
        </div>
      </div>`).join('');
  }
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
      <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
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
      <div class="flex items-center p-3 bg-gray-50 rounded-lg">
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
      <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
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
  // 设备统计
  const summary = dataService.getDeviceStatusSummary();
  const statEls = document.querySelectorAll('#devices .bg-white.rounded-xl.p-5 .text-2xl');
  if (statEls.length >= 4) {
    statEls[0].textContent = summary.total + '台';
    statEls[1].textContent = summary.online + '台';
    statEls[2].textContent = summary.fault + '台';
    statEls[3].textContent = summary.maintenance + '台';
  }

  // 设备列表 - find by looking for section with device cards
  const section = document.getElementById('devices');
  // Use existing structure, update statuses
  renderDeviceList(section);
}

function renderDeviceList(section) {
  // This updates the existing device cards with data-driven content
  const devices = dataService.getDeviceList();
  const container = document.getElementById('device-grid');
  if (!container) return;

  container.innerHTML = devices.map(d => {
    const sc = statusColor(d.status);
    const pulseHTML = d.status === 'online' ? '<span class="absolute top-0 right-0 w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>' : '';
    const metricsHTML = d.metrics ? Object.entries(d.metrics).filter(([k]) => k !== 'unit').map(([k, v]) => {
      if (k === 'currentTask' || k === 'nextTask' || k === 'error') return '';
      return `<span class="text-xs text-gray-500">${k}: ${v || '--'}</span>`;
    }).join('') : '';

    return `
      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100 relative device-card" data-device-id="${d.id}">
        ${pulseHTML}
        <button class="absolute top-2 right-2 w-6 h-6 bg-red-50 hover:bg-red-100 rounded-full flex items-center justify-center transition-colors btn-device-delete" data-device-id="${d.id}" title="删除设备">
          <i class="fa fa-times text-red-400 text-xs"></i>
        </button>
        <div class="flex items-center justify-between mb-2 pr-6">
          <span class="font-medium text-sm text-gray-800">${d.name}</span>
          <span class="px-2 py-1 text-xs bg-${sc}-100 text-${sc}-600 rounded">${statusLabel(d.status)}</span>
        </div>
        <div class="text-xs text-gray-500 space-y-1">
          ${d.metrics?.currentTask ? `<p>当前: ${d.metrics.currentTask}</p>` : ''}
          ${d.metrics?.error ? `<p class="text-red-500">${d.metrics.error}</p>` : ''}
          <p>运行: ${d.runHours}小时 · 固件 ${d.firmwareVersion}</p>
        </div>
        <div class="mt-3 flex space-x-2">
          <button class="px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100 btn-device-control">远程控制</button>
          <button class="px-2 py-1 text-xs bg-gray-50 text-gray-600 rounded hover:bg-gray-100 btn-device-detail">查看详情</button>
        </div>
      </div>`;
  }).join('');
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
  // 用户表
  const users = dataService.getUserList();
  const tbody = document.getElementById('user-table-body');
  if (tbody) {
    tbody.innerHTML = users.map(u => `
      <tr class="border-b border-gray-100 hover:bg-gray-50">
        <td class="py-3 px-4 text-sm font-medium text-gray-800">${u.username}</td>
        <td class="py-3 px-4 text-sm text-gray-600">${u.displayName}</td>
        <td class="py-3 px-4 text-sm text-gray-600">${u.role === 'admin' ? '管理员' : u.role === 'technician' ? '技术员' : '农户'}</td>
        <td class="py-3 px-4">${badge(u.status)}</td>
        <td class="py-3 px-4 text-sm">
          <button class="text-blue-500 hover:text-blue-600 mr-2" onclick="editUser('${u.id}')">编辑</button>
          <button class="text-gray-500 hover:text-gray-600" onclick="resetPassword('${u.id}')">重置密码</button>
        </td>
      </tr>`).join('');
  }

  // 角色列表
  const roles = dataService.getRoleList();
  const roleContainer = document.getElementById('role-list');
  if (roleContainer) {
    roleContainer.innerHTML = roles.map(r => `
      <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div>
          <p class="text-sm font-medium text-gray-800">${r.name}</p>
          <p class="text-xs text-gray-500">${r.description}</p>
        </div>
        <span class="text-sm text-gray-600">${r.userCount}人</span>
      </div>`).join('');
  }

  // 权限配置
  const permContainer = document.getElementById('permission-config-list');
  if (permContainer && roles.length > 0) {
    const adminRole = roles[0];
    permContainer.innerHTML = Object.entries(adminRole.permissions).map(([mod, perms]) => {
      const modNames = { dashboard:'数据总览', disease:'病虫害识别', farming:'精准农事', prediction:'产量预测', management:'农场管理', devices:'设备监控', traceability:'溯源管理', permission:'权限管理' };
      return `
        <div class="flex items-center justify-between py-2 border-b border-gray-100">
          <span class="text-sm text-gray-700">${modNames[mod] || mod}</span>
          <div class="flex items-center space-x-4">
            <label class="flex items-center text-xs text-gray-500">
              <input type="checkbox" ${perms.view ? 'checked' : ''} class="mr-1" disabled> 查看
            </label>
            <label class="flex items-center text-xs text-gray-500">
              <input type="checkbox" ${perms.edit ? 'checked' : ''} class="mr-1" disabled> 编辑
            </label>
          </div>
        </div>`;
    }).join('');
  }

  // 操作日志
  const logs = dataService.getOperationLogs();
  const logContainer = document.getElementById('operation-log-list');
  if (logContainer) {
    logContainer.innerHTML = logs.map(l => `
      <div class="flex items-center p-3 bg-gray-50 rounded-lg">
        <div class="flex-1">
          <p class="text-sm font-medium text-gray-800">${l.action}</p>
          <p class="text-xs text-gray-500">${l.username} · ${l.module}</p>
        </div>
        <span class="text-xs text-gray-400">${formatDateTime(l.timestamp)}</span>
      </div>`).join('');
  }
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

  const diffArrow = parseFloat(stats.tempChange.replace(/[^0-9.-]/g,'')) >= 0 ? 'up' : 'down';
  document.getElementById('stat-temp').textContent = stats.todayTemp;
  document.getElementById('stat-temp-change').innerHTML = `<i class="fa fa-arrow-${diffArrow} mr-1"></i>${stats.tempChange}`;
  document.getElementById('stat-rainfall').textContent = stats.todayRainfall;
  document.getElementById('stat-rainfall-desc').innerHTML = `<i class="fa fa-umbrella mr-1"></i>${stats.rainfallDesc}`;
  document.getElementById('stat-humidity').textContent = stats.todayHumidity;
  document.getElementById('stat-humidity-desc').textContent = stats.humidityDesc;
  document.getElementById('stat-wind').textContent = stats.todayWind;
  document.getElementById('stat-wind-desc').innerHTML = `<i class="fa fa-sun mr-1"></i>${stats.conditionLabel} · ${stats.windDesc}`;

  // 7日预报
  const forecast = dataService.getWeatherForecast();
  const fcContainer = document.getElementById('weather-forecast-list');
  const condIcons = { sunny: 'fa-sun text-orange-400', cloudy: 'fa-cloud text-gray-400', rain: 'fa-tint text-blue-400', snow: 'fa-snowflake text-blue-300' };
  fcContainer.innerHTML = forecast.slice(0, 7).map(f => `
    <div class="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
      <span class="text-sm text-gray-700 w-14">${f.date}</span>
      <i class="fa ${condIcons[f.condition] || 'fa-question'} text-lg"></i>
      <span class="text-sm font-medium">${f.high}° / ${f.low}°</span>
      <span class="text-xs text-gray-500">${f.conditionLabel}</span>
    </div>`).join('');

  // 天气预警
  const alerts = dataService.getWeatherAlerts();
  document.getElementById('weather-alert-list').innerHTML = alerts.length > 0
    ? alerts.map(a => alertItemHTML(a)).join('')
    : '<div class="col-span-3 text-center text-gray-400 py-6">暂无天气预警</div>';
}

// ==================== 市场价格 渲染 ====================

function renderMarket() {
  const stats = dataService.getMarketStats();

  document.getElementById('stat-crop-count').textContent = stats.cropCount + '个';
  document.getElementById('stat-crop-desc').textContent = stats.marketSummary;
  document.getElementById('stat-avg-price').textContent = stats.avgPrice + '元/kg';
  document.getElementById('stat-avg-desc').innerHTML = `<i class="fa fa-arrow-${stats.avgDiffDir} mr-1"></i>较昨日 ${stats.avgDiff}`;
  document.getElementById('stat-max-up').textContent = stats.maxUpCrop;
  document.getElementById('stat-max-up-desc').textContent = '成交价 ' + stats.maxUpPrice;
  document.getElementById('stat-max-down').textContent = stats.maxDownCrop;
  document.getElementById('stat-max-down-desc').textContent = '成交价 ' + stats.maxDownPrice;

  // 今日价格表
  const todayPrices = dataService.table('market_prices')
    .where('date', 'eq', '2024-01-15').get();
  const tbody = document.getElementById('market-price-table-body');
  tbody.innerHTML = todayPrices.map(p => `
    <tr class="hover:bg-gray-50">
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
  document.getElementById('stat-active-desc').textContent = stats.activeSummary;
  document.getElementById('stat-avg-accuracy').textContent = stats.avgAccuracy;
  document.getElementById('stat-avg-acc-desc').textContent = stats.accRange;
  document.getElementById('stat-drift-warning').textContent = stats.driftWarnings + '个';
  document.getElementById('stat-drift-desc').textContent = stats.driftSummary;
  document.getElementById('stat-unknown-rate').textContent = stats.avgUnknownRate;
  document.getElementById('stat-unknown-desc').textContent = stats.unknownSummary;

  // 模型版本列表
  const models = dataService.getModelVersionList();
  const mvContainer = document.getElementById('model-version-list');
  mvContainer.innerHTML = models.map(m => {
    const sc = statusColor(m.status);
    return `
      <div class="p-3 bg-gray-50 rounded-lg">
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
    <tr class="hover:bg-gray-50">
      <td class="px-3 py-2 text-xs text-gray-500">${formatDateTime(r.detectedAt)}</td>
      <td class="px-3 py-2 text-xs">病虫害识别模型 v3.2.1</td>
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
