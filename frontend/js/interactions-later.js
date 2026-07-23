/**
 * 智慧农业管理系统 - 后8个模块交互增强
 * 通过事件委托，把"死按钮"接上真实交互：详情弹窗 / 增删改表单 / 确认框 / 状态切换。
 * 数据源走 dataService（无后端时回退本地 JSON/mock），同事接 API 后无需改动此处。
 */

// ==================== 兼容前三个模块遗留的 onclick ====================
// 前三个模块（数据总览/病虫害/精准农事）中 showDiseaseDetail 与 executeIrrigation
// 以全局 onclick 形式存在但未定义，这里提供全局别名避免点击抛出 ReferenceError。
// 同事接入后端后可将 executeIrrigation 内部替换为真实 API 调用。

window.showDiseaseDetail = function (id) {
  var pest = dataService.isReady() ? dataService.getById('pest_knowledge_base', id) : null;
  showDiseaseDetailModal(pest ? pest.name : String(id));
};

window.executeIrrigation = function (id) {
  if (typeof apiClient !== 'undefined' && typeof apiClient.executeIrrigation === 'function') {
    apiClient.executeIrrigation(id)
      .then(function () { UI.toast('灌溉指令已下发', 'success'); })
      .catch(function () { UI.toast('已记录灌溉指令（离线）', 'success'); });
    return;
  }
  UI.toast('已下发灌溉指令（演示）', 'success');
};

(function () {
  const genId = (prefix) => `${prefix}_${Date.now()}`;

  // ==================== 设备监控 ====================
  function getDevice(id) { return dataService.getById('devices', id); }

  function deviceDetail(id) {
    const d = getDevice(id);
    if (!d) return UI.toast('设备不存在', 'error');
    const metrics = d.metrics ? Object.entries(d.metrics)
      .filter(([k]) => !['currentTask', 'nextTask', 'error', 'unit'].includes(k))
      .map(([k, v]) => `<div class="flex justify-between py-1 border-b border-gray-50"><span class="text-gray-500">${k}</span><span class="font-medium">${v ?? '--'}</span></div>`).join('') : '';
    UI.detail({
      title: `设备详情 · ${d.name}`,
      body: `
        <div class="space-y-3">
          <div class="flex items-center space-x-2">${UI.badge(d.status)}<span class="text-xs text-gray-400">固件 ${d.firmwareVersion} · 运行 ${d.runHours}h</span></div>
          ${metrics}
          ${d.metrics?.error ? `<p class="text-red-500 text-sm">异常：${d.metrics.error}</p>` : ''}
        </div>`});
  }

  function deviceControl(id) {
    const d = getDevice(id);
    if (!d) return UI.toast('设备不存在', 'error');
    const offline = d.status === 'offline' || d.status === 'fault';
    const body = `
      <div class="space-y-4">
        <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <span class="text-sm text-gray-700">运行状态</span>
          <span class="text-sm font-medium">${UI.statusLabel(d.status)}</span>
        </div>
        <div class="grid grid-cols-2 gap-2">
          <button class="py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600" data-ctl="online">设为在线</button>
          <button class="py-2 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300" data-ctl="offline">设为离线</button>
        </div>
        <button class="w-full py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600" data-ctl="restart">重启设备</button>
      </div>`;
    const el = UI.detail({ title: `远程控制 · ${d.name}`, body });
    el.querySelectorAll('[data-ctl]').forEach(btn => {
      btn.addEventListener('click', () => {
        const ctl = btn.dataset.ctl;
        if (ctl === 'restart') { dataService.update('devices', id, { status: 'online' }); UI.toast(`${d.name} 已重启`, 'success'); }
        else { dataService.update('devices', id, { status: ctl }); UI.toast(`${d.name} 状态已更新`, 'success'); }
        if (typeof renderDevices === 'function') renderDevices();
        el.querySelectorAll('[data-ctl]').forEach(b => b.classList.remove('ring-2', 'ring-blue-400'));
        btn.classList.add('ring-2', 'ring-blue-400');
      });
    });
  }

  function deviceReport(id) {
    const d = getDevice(id);
    UI.confirm('报修设备', `确认将「${d ? d.name : '该设备'}」提交报修工单？`).then(ok => {
      if (!ok) return;
      dataService.insert('maintenance_records', {
        id: genId('mr'), deviceId: id, deviceName: d ? d.name : '设备',
        status: 'pending', createdAt: new Date().toISOString().slice(0, 10), note: '前端提交报修'
      });
      if (typeof renderDevices === 'function') renderDevices();
      UI.toast('报修工单已提交', 'success');
    });
  }

  function deviceRestart(id) {
    dataService.update('devices', id, { status: 'online' });
    if (typeof renderDevices === 'function') renderDevices();
    UI.toast('设备已重启', 'success');
  }

  function deviceStart(id) {
    const d = getDevice(id);
    UI.toast(`已向「${d ? d.name : '设备'}」下发启动任务`, 'success');
  }

  function maintenanceSchedule(name) {
    UI.confirm('安排维护', `确认安排「${name || '该设备'}」的维护计划？`).then(ok => {
      if (!ok) return;
      dataService.insert('maintenance_records', {
        id: genId('mr'), deviceName: name || '设备', status: 'pending',
        createdAt: new Date().toISOString().slice(0, 10), note: '前端安排维护'
      });
      if (typeof renderDevices === 'function') renderDevices();
      UI.toast('维护计划已安排', 'success');
    });
  }

  // ==================== 溯源管理 ====================
  function traceView(id) {
    const product = dataService.getById('products', id);
    if (!product) return UI.toast('产品不存在', 'error');
    const timeline = dataService.getProductionTimeline(id);
    const certs = dataService.getQualityCertifications(id);
    const tl = timeline.length
      ? `<div class="space-y-3">${timeline.map(t => `
          <div class="flex items-start">
            <div class="w-3 h-3 bg-green-500 rounded-full mt-1.5 mr-3 flex-shrink-0"></div>
            <div><p class="text-sm font-medium text-gray-800">${t.stage}</p>
            <p class="text-xs text-gray-500">${t.date} · ${t.location || ''}</p>
            <p class="text-xs text-gray-600">${t.description || ''}</p></div>
          </div>`).join('')}</div>`
      : '<p class="text-sm text-gray-400">暂无生产记录</p>';
    UI.detail({
      title: `溯源详情 · ${product.name}`,
      width: 'max-w-2xl',
      body: `
        <p class="text-sm text-gray-500 mb-3">批次：${product.batchNumber} · 采收 ${product.harvestDate}</p>
        <h4 class="text-sm font-medium text-gray-800 mb-2">生产全过程</h4>${tl}
        ${certs.length ? `<h4 class="text-sm font-medium text-gray-800 mt-4 mb-2">质量认证</h4>
          <div class="space-y-1">${certs.map(c => `<div class="flex justify-between text-sm"><span>${c.name}</span>
          <span class="${c.result === 'pass' ? 'text-green-600' : 'text-yellow-600'}">${c.result === 'pass' ? '合格' : '检测中'}${c.certNumber ? ' · ' + c.certNumber : ''}</span></div>`).join('')}</div>` : ''}`
    });
  }

  function addProduct() {
    UI.form({
      title: '添加溯源产品',
      fields: [
        { name: 'name', label: '产品名称', required: true },
        { name: 'batchNumber', label: '批次号', required: true },
        { name: 'harvestDate', label: '采收日期', type: 'date', required: true },
        { name: 'traceStatus', label: '溯源状态', type: 'select', options: [{ value: 'traced', label: '已溯源' }, { value: 'pending', label: '待溯源' }], value: 'pending' }
      ],
      onSubmit: (d) => {
        dataService.insert('products', { id: genId('prod'), name: d.name, batchNumber: d.batchNumber, harvestDate: d.harvestDate, traceStatus: d.traceStatus, quantityTons: 0 });
        if (typeof renderTraceability === 'function') renderTraceability();
        UI.toast('产品已添加', 'success');
      }
    });
  }

  function generateTrace() {
    UI.detail({
      title: '生成溯源码',
      body: `<div class="text-center py-4">
        <div class="w-40 h-40 mx-auto bg-gray-100 rounded-xl flex items-center justify-center mb-4 text-gray-400">
          <i class="fa fa-qrcode text-6xl"></i></div>
        <p class="text-sm text-gray-600">溯源二维码已基于当前批次生成，扫码可查看全链路信息。</p>
        <button class="mt-4 px-4 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600" onclick="UI.toast('溯源码已下载','success')">下载溯源码</button>
      </div>`
    });
  }

  function scanTrace() {
    UI.form({
      title: '扫码查询',
      fields: [{ name: 'code', label: '输入溯源码 / 批次号', placeholder: '如 TP20240115', required: true }],
      onSubmit: (d) => {
        const p = dataService.getAll('products').find(x => x.batchNumber === d.code || x.id === d.code);
        if (p) traceView(p.id);
        else UI.toast('未找到对应产品', 'warning');
      }
    });
  }

  // ==================== 农场管理 ====================
  function addPersonnel() {
    UI.form({
      title: '添加人员',
      fields: [
        { name: 'name', label: '姓名', required: true },
        { name: 'role', label: '岗位', required: true },
        { name: 'status', label: '状态', type: 'select', options: [{ value: 'active', label: '在岗' }, { value: 'leave', label: '请假' }], value: 'active' }
      ],
      onSubmit: (d) => {
        dataService.insert('personnel', { id: genId('per'), name: d.name, role: d.role, status: d.status, avatar: d.name });
        if (typeof renderManagement === 'function') renderManagement();
        UI.toast('人员已添加', 'success');
      }
    });
  }

  function stockManagement() {
    const inv = dataService.getInventoryList();
    UI.table({
      title: '农资库存',
      columns: [{ key: 'name', label: '名称' }, { key: 'unit', label: '单位' }, { key: 'quantity', label: '数量' }, { key: 'status', label: '状态' }],
      rows: inv,
      rowRenderer: (r) => `<tr class="hover:bg-gray-50"><td class="px-4 py-2 text-sm">${r.name}</td><td class="px-4 py-2 text-sm text-gray-500">${r.unit}</td><td class="px-4 py-2 text-sm">${r.quantity}</td><td class="px-4 py-2">${UI.badge(r.status)}</td></tr>`
    });
  }

  function addCycle() {
    UI.form({
      title: '添加种植周期',
      fields: [
        { name: 'cropName', label: '作物', required: true },
        { name: 'fieldCode', label: '地块', required: true },
        { name: 'variety', label: '品种' },
        { name: 'plantedDate', label: '种植日期', type: 'date' },
        { name: 'expectedHarvest', label: '预计采收', type: 'date' },
        { name: 'stage', label: '生育期', type: 'select', options: [{ value: 'seedling', label: '苗期' }, { value: 'growth', label: '生长期' }, { value: 'flowering', label: '开花期' }, { value: 'fruit', label: '结果期' }, { value: 'harvest', label: '采收期' }], value: 'growth' }
      ],
      onSubmit: (d) => {
        dataService.insert('planting_cycles', {
          id: genId('cyc'), cropName: d.cropName, fieldCode: d.fieldCode, variety: d.variety,
          plantedDate: d.plantedDate, expectedHarvest: d.expectedHarvest, stage: d.stage, progress: 0
        });
        if (typeof renderManagement === 'function') renderManagement();
        UI.toast('种植周期已添加', 'success');
      }
    });
  }

  function viewAllRecords() {
    const recs = dataService.getFarmRecords();
    UI.table({
      title: '全部农事记录',
      columns: [{ key: 'type', label: '类型' }, { key: 'fieldCode', label: '地块' }, { key: 'completedAt', label: '完成时间' }],
      rows: recs.map(r => ({ type: (typeof taskTypeLabel === 'function' ? taskTypeLabel(r.type) : r.type), fieldCode: r.fieldCode, completedAt: r.completedAt })),
    });
  }

  // ==================== 权限管理 ====================
  function addUser() {
    UI.form({
      title: '添加用户',
      fields: [
        { name: 'username', label: '用户名', required: true },
        { name: 'displayName', label: '姓名', required: true },
        { name: 'role', label: '角色', type: 'select', options: [{ value: 'admin', label: '管理员' }, { value: 'technician', label: '技术员' }, { value: 'farmer', label: '农户' }, { value: 'manager', label: '合作社管理' }], value: 'farmer' },
        { name: 'status', label: '状态', type: 'select', options: [{ value: 'active', label: '启用' }, { value: 'disabled', label: '禁用' }], value: 'active' }
      ],
      onSubmit: (d) => {
        dataService.insert('users', { id: genId('u'), username: d.username, displayName: d.displayName, role: d.role, status: d.status });
        if (typeof renderPermission === 'function') renderPermission();
        UI.toast('用户已添加', 'success');
      }
    });
  }

  function editUser(id) {
    const u = dataService.getById('users', id);
    if (!u) return UI.toast('用户不存在', 'error');
    UI.form({
      title: '编辑用户',
      fields: [
        { name: 'displayName', label: '姓名', value: u.displayName, required: true },
        { name: 'role', label: '角色', type: 'select', options: [{ value: 'admin', label: '管理员' }, { value: 'technician', label: '技术员' }, { value: 'farmer', label: '农户' }, { value: 'manager', label: '合作社管理' }], value: u.role },
        { name: 'status', label: '状态', type: 'select', options: [{ value: 'active', label: '启用' }, { value: 'disabled', label: '禁用' }], value: u.status }
      ],
      onSubmit: (d) => {
        dataService.update('users', id, { displayName: d.displayName, role: d.role, status: d.status });
        if (typeof renderPermission === 'function') renderPermission();
        UI.toast('用户信息已更新', 'success');
      }
    });
  }

  function resetPwd(id) {
    const u = dataService.getById('users', id);
    UI.confirm('重置密码', `确认重置用户「${u ? u.displayName : ''}」的密码？`).then(ok => {
      if (!ok) return;
      UI.toast('密码已重置为初始密码', 'success');
    });
  }

  function addRole() {
    UI.form({
      title: '添加角色',
      fields: [
        { name: 'name', label: '角色名称', required: true },
        { name: 'description', label: '权限说明' }
      ],
      onSubmit: (d) => {
        dataService.insert('roles', { id: genId('role'), name: d.name, description: d.description, permissions: {} });
        if (typeof renderPermission === 'function') renderPermission();
        UI.toast('角色已添加', 'success');
      }
    });
  }

  function viewLogs() {
    const logs = dataService.getOperationLogs();
    UI.table({
      title: '操作日志',
      columns: [{ key: 'action', label: '操作' }, { key: 'username', label: '用户' }, { key: 'module', label: '模块' }, { key: 'timestamp', label: '时间' }],
      rows: logs,
    });
  }

  // ==================== 产量预测（旧） ====================
  function riskDetail(id) {
    const a = dataService.getById('alerts', id) || dataService.getRiskAlerts().find(x => x.id === id);
    UI.detail({
      title: '风险预警详情',
      body: a ? `<div class="space-y-2">
        <div class="flex items-center space-x-2">${UI.badge(a.status || 'warning')}<span class="text-xs text-gray-400">${a.module || ''}</span></div>
        <p class="text-sm text-gray-700">${a.title || a.description || '暂无描述'}</p>
        <p class="text-xs text-gray-500">${a.description || ''}</p></div>`
        : '<p class="text-sm text-gray-400">暂无详情</p>'
    });
  }

  // ==================== 病虫害联动 ====================
  function selectDisease(pestId) {
    if (!dataService.isReady()) return;
    var pest = dataService.getById('pest_knowledge_base', pestId);
    if (!pest) return;
    // 1. 打开详情弹窗
    if (typeof showDiseaseDetailModal === 'function') showDiseaseDetailModal(pest.name);
    // 2. 更新防治建议区
    updatePrevention(pest);
    // 3. 更新规范原文链接
    updateRegulationRef(pest);
  }

  function diseaseDetail(name) {
    if (!dataService.isReady()) return;
    var pest = dataService.table('pest_knowledge_base').where('name', 'contains', name).first();
    if (!pest) { UI.toast('未找到病害信息', 'warning'); return; }
    if (typeof showDiseaseDetailModal === 'function') showDiseaseDetailModal(pest.name);
    updatePrevention(pest);
    updateRegulationRef(pest);
  }

  function updatePrevention(pest) {
    var sec = document.getElementById('prevention-content');
    if (!sec) return;
    sec.innerHTML =
      '<div><h4 class="font-medium text-gray-700 mb-3 flex items-center"><i class="fa fa-flask text-red-500 mr-2"></i>化学防治—' + pest.name + '</h4><ul class="space-y-2 text-sm text-gray-600">'
      + (pest.chemicalControl || []).map(function(p) { return '<li class="flex items-start"><span class="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5 mr-2"></span>' + p + '</li>'; }).join('')
      + '</ul></div>'
      + '<div><h4 class="font-medium text-gray-700 mb-3 flex items-center"><i class="fa fa-leaf text-green-500 mr-2"></i>生物防治</h4><ul class="space-y-2 text-sm text-gray-600">'
      + (pest.biologicalControl || []).map(function(p) { return '<li class="flex items-start"><span class="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 mr-2"></span>' + p + '</li>'; }).join('')
      + '</ul></div>'
      + '<div><h4 class="font-medium text-gray-700 mb-3 flex items-center"><i class="fa fa-wrench text-blue-500 mr-2"></i>农业防治</h4><ul class="space-y-2 text-sm text-gray-600">'
      + (pest.agriculturalControl || []).map(function(p) { return '<li class="flex items-start"><span class="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 mr-2"></span>' + p + '</li>'; }).join('')
      + '</ul></div>';
  }

  function updateRegulationRef(pest) {
    var btn = document.getElementById('btn-regulation-detail');
    if (!btn) return;
    var docId = (pest.color === 'red') ? 'kd_001' : (pest.color === 'orange') ? 'kd_002' : (pest.color === 'purple') ? 'kd_003' : 'kd_001';
    btn.setAttribute('onclick', "showRegulationDetail('" + docId + "')");
    btn.innerHTML = '<i class="fa fa-book mr-1"></i>查看规范原文 — ' + pest.name;
  }

  // ==================== 精准农事 ====================
  function executeIrrigationAction(id) {
    if (typeof apiClient !== 'undefined' && typeof apiClient.executeIrrigation === 'function') {
      apiClient.executeIrrigation(id).then(function () { UI.toast('灌溉指令已下发', 'success'); }).catch(function () { UI.toast('已记录灌溉指令（离线）', 'success'); });
      return;
    }
    dataService.update('irrigation_plans', id, { status: 'executing' });
    if (typeof renderFarming === 'function') renderFarming();
    UI.toast('灌溉指令已下发', 'success');
  }

  function scheduleIrrigation(id) {
    UI.form({
      title: '设置定时灌溉',
      fields: [
        { name: 'date', label: '执行日期', type: 'date', required: true, value: new Date().toISOString().slice(0, 10) },
        { name: 'time', label: '执行时间', type: 'time', required: true, value: '08:30' }
      ],
      onSubmit: function (d) {
        dataService.update('irrigation_plans', id, { scheduledTime: d.date + ' ' + d.time, status: 'pending' });
        if (typeof renderFarming === 'function') renderFarming();
        UI.toast('定时灌溉已设置：' + d.date + ' ' + d.time, 'success');
      }
    });
  }

  function irrigationEdit(id) {
    var plan = dataService.getById('irrigation_plans', id);
    if (!plan) { UI.toast('灌溉方案不存在', 'error'); return; }
    UI.form({
      title: '调整灌溉参数 — ' + (plan.fieldCode || '') + ' ' + (plan.cropName || ''),
      fields: [
        { name: 'targetMoisture', label: '目标湿度(%)', type: 'number', value: plan.targetMoisture || 70 },
        { name: 'waterVolume', label: '灌溉水量(m³)', type: 'number', value: plan.waterVolume || 15 },
        { name: 'estimatedDuration', label: '预计时长(分钟)', type: 'number', value: plan.estimatedDuration || 30 },
        { name: 'status', label: '状态', type: 'select', value: plan.status || 'pending', options: [
          { value: 'pending', label: '待执行' }, { value: 'executing', label: '执行中' }, { value: 'completed', label: '已完成' }
        ]}
      ],
      onSubmit: function (d) {
        dataService.update('irrigation_plans', id, { targetMoisture: Number(d.targetMoisture), waterVolume: Number(d.waterVolume), estimatedDuration: Number(d.estimatedDuration), status: d.status });
        if (typeof renderFarming === 'function') renderFarming();
        UI.toast('灌溉参数已更新', 'success');
      }
    });
  }

  function calendarDate(date) {
    var tasks = dataService.table('farming_tasks').where('scheduledTime', 'contains', '2024-01-' + date.padStart(2, '0')).get();
    var list = tasks.length ? tasks.map(function (t) {
      return '<div class="flex items-center justify-between py-1"><span class="text-sm">' + (typeof taskTypeLabel === 'function' ? taskTypeLabel(t.type) : t.type) + ' — ' + (t.fieldCode || '') + '</span>' + (typeof badge === 'function' ? badge(t.status) : '') + '</div>';
    }).join('') : '<p class="text-sm text-gray-400">当天无任务</p>';
    UI.detail({ title: '1月' + date + '日 农事安排', body: '<div class="space-y-2">' + list + '</div>' });
  }

  function generateFertilization() {
    UI.form({
      title: '生成施肥方案',
      fields: [
        { name: 'fieldCode', label: '地块', required: true, placeholder: '如 A1' },
        { name: 'nKg', label: '氮肥(kg)', type: 'number', value: '20' },
        { name: 'pKg', label: '磷肥(kg)', type: 'number', value: '15' },
        { name: 'kKg', label: '钾肥(kg)', type: 'number', value: '10' },
        { name: 'organicKg', label: '有机肥(kg)', type: 'number', value: '50' }
      ],
      onSubmit: function (d) {
        dataService.insert('fertilization_plans', { id: genId('fp'), fieldCode: d.fieldCode, nKg: Number(d.nKg), pKg: Number(d.pKg), kKg: Number(d.kKg), organicKg: Number(d.organicKg), status: 'pending', createdAt: new Date().toISOString().slice(0, 10) });
        if (typeof renderFarming === 'function') renderFarming();
        UI.toast('施肥方案已生成', 'success');
      }
    });
  }

  function cycleDetail(cropName) {
    var cycle = dataService.getAll('planting_cycles').find(function (c) { return c.cropName === cropName; });
    if (!cycle) { UI.toast('种植周期数据不存在', 'warning'); return; }
    UI.detail({
      title: '种植周期 · ' + (cycle.cropName || cropName),
      body: '<div class="space-y-2">'
        + '<div class="flex justify-between text-sm"><span class="text-gray-500">品种</span><span>' + (cycle.variety || '--') + '</span></div>'
        + '<div class="flex justify-between text-sm"><span class="text-gray-500">地块</span><span>' + (cycle.fieldCode || '--') + '</span></div>'
        + '<div class="flex justify-between text-sm"><span class="text-gray-500">种植日期</span><span>' + (cycle.plantedDate || '--') + '</span></div>'
        + '<div class="flex justify-between text-sm"><span class="text-gray-500">预计采收</span><span>' + (cycle.expectedHarvest || '--') + '</span></div>'
        + '<div class="flex justify-between text-sm"><span class="text-gray-500">生育期</span>' + (typeof badge === 'function' ? badge(cycle.stage || 'growth') : (cycle.stage || '')) + '</div>'
        + '<div class="flex justify-between text-sm"><span class="text-gray-500">生长进度</span><span>' + (cycle.progress || 0) + '%</span></div>'
        + '</div>'
    });
  }

  function fieldDetail(fieldCode) {
    if (!dataService.isReady()) { UI.toast('数据未就绪', 'warning'); return; }
    var fields = dataService.getAll('fields');
    var f = fields.find(function (x) { return x.code === fieldCode; });
    if (!f) { UI.toast('地块不存在', 'error'); return; }
    var irrigation = dataService.getIrrigationPlans().filter(function (x) { return x.fieldCode === fieldCode; });
    var fert = dataService.getFertilizationPlans().filter(function (x) { return x.fieldCode === fieldCode; });
    UI.detail({
      title: '地块详情 · ' + fieldCode + ' - ' + (f.cropName || ''),
      body: '<div class="space-y-3">'
        + '<div class="flex items-center space-x-2">' + UI.badge(f.status) + '<span class="text-xs text-gray-400">' + (f.area || '') + '亩 · 湿度' + (f.soilMoisture || '--') + '%</span></div>'
        + (irrigation.length ? '<h4 class="text-sm font-medium text-gray-800 mt-2">灌溉计划</h4>' + irrigation.map(function (p) { return '<div class="text-xs text-gray-600 flex justify-between"><span>' + p.targetMoisture + '% 目标 · ' + p.waterVolume + 'm³</span>' + UI.badge(p.status) + '</div>'; }).join('') : '')
        + (fert.length ? '<h4 class="text-sm font-medium text-gray-800 mt-2">施肥计划</h4>' + fert.map(function (p) { return '<div class="text-xs text-gray-600">N:' + p.nKg + ' P:' + p.pKg + ' K:' + p.kKg + ' 有机:' + p.organicKg + 'kg</div>'; }).join('') : '')
        + '</div>'
    });
  }

  function addField() {
    UI.form({
      title: '添加地块',
      fields: [
        { name: 'code', label: '地块编号', placeholder: '如 D1', required: true },
        { name: 'cropName', label: '作物名称', required: true },
        { name: 'area', label: '面积(亩)', type: 'number', value: '1' },
        { name: 'soilMoisture', label: '土壤湿度(%)', type: 'number', value: '60' },
        { name: 'status', label: '状态', type: 'select', options: [{ value: 'growing', label: '生长中' }, { value: 'fallow', label: '休耕' }, { value: 'watering', label: '需浇水' }], value: 'growing' }
      ],
      onSubmit: function (d) {
        dataService.insert('fields', { id: genId('field'), code: d.code, cropName: d.cropName, area: Number(d.area), soilMoisture: Number(d.soilMoisture), status: d.status });
        if (typeof renderFarming === 'function') renderFarming();
        UI.toast('地块 ' + d.code + ' 已添加', 'success');
      }
    });
  }

  // ==================== 模型监控 ====================
  function logDetail(id) {
    var r = dataService.getById('disease_records', id);
    if (!r) { UI.toast('记录不存在', 'error'); return; }
    UI.detail({
      title: '预测日志详情',
      body: '<div class="space-y-2">'
        + '<div class="flex justify-between text-sm"><span class="text-gray-500">时间</span><span>' + (typeof formatDateTime === 'function' ? formatDateTime(r.detectedAt) : r.detectedAt) + '</span></div>'
        + '<div class="flex justify-between text-sm"><span class="text-gray-500">模型</span><span>病虫害识别模型 v3.2.1</span></div>'
        + '<div class="flex justify-between text-sm"><span class="text-gray-500">地块</span><span>' + (r.fieldCode || '') + ' · ' + (r.cropAffected || '') + '</span></div>'
        + '<div class="flex justify-between text-sm"><span class="text-gray-500">识别结果</span>' + (typeof badge === 'function' ? badge(r.status) : r.diseaseName) + '</div>'
        + '</div>'
    });
  }

  // ==================== 农场管理 ====================
  function recordDetail(id) {
    var r = dataService.getById('farm_records', id);
    if (!r) { UI.toast('记录不存在', 'error'); return; }
    UI.detail({
      title: '农事记录详情',
      body: '<div class="space-y-2">'
        + '<div class="flex justify-between text-sm"><span class="text-gray-500">类型</span><span>' + (typeof taskTypeLabel === 'function' ? taskTypeLabel(r.type) : r.type) + '</span></div>'
        + '<div class="flex justify-between text-sm"><span class="text-gray-500">地块</span><span>' + (r.fieldCode || '') + '</span></div>'
        + '<div class="flex justify-between text-sm"><span class="text-gray-500">完成时间</span><span>' + (typeof formatDateTime === 'function' ? formatDateTime(r.completedAt) : r.completedAt) + '</span></div>'
        + '</div>'
    });
  }

  function personDetail(id) {
    var p = dataService.getById('personnel', id);
    if (!p) { UI.toast('人员不存在', 'error'); return; }
    UI.detail({
      title: '人员详情 · ' + (p.name || ''),
      body: '<div class="space-y-3 text-center">'
        + '<img src="https://api.dicebear.com/7.x/avataaars/svg?seed=' + (p.avatar || p.name || '') + '" class="w-16 h-16 rounded-full mx-auto" alt="' + (p.name || '') + '">'
        + '<div><p class="font-medium text-gray-800">' + (p.name || '') + '</p><p class="text-sm text-gray-500">' + (p.role || '') + '</p></div>'
        + '<div class="flex justify-center">' + UI.badge(p.status) + '</div>'
        + '</div>'
    });
  }

  function inventoryDetail(id) {
    var inv = dataService.getById('inventory', id);
    if (!inv) { UI.toast('物资不存在', 'error'); return; }
    UI.detail({
      title: '库存详情 · ' + (inv.name || ''),
      body: '<div class="space-y-2">'
        + '<div class="flex justify-between text-sm"><span class="text-gray-500">名称</span><span class="font-medium">' + (inv.name || '') + '</span></div>'
        + '<div class="flex justify-between text-sm"><span class="text-gray-500">数量</span><span>' + (inv.quantity || '') + ' ' + (inv.unit || '') + '</span></div>'
        + '<div class="flex justify-between text-sm"><span class="text-gray-500">状态</span>' + UI.badge(inv.status) + '</div>'
        + '</div>'
    });
  }

  // ==================== 仪表盘交互 ====================
  function navigateTo(target) {
    if (target && target.startsWith('#')) {
      var dest = document.querySelector(target);
      if (dest) dest.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    var sidebar = document.querySelector('.sidebar-item[data-menu="' + target + '"]');
    if (sidebar) sidebar.click();
  }

  // ==================== 天气/市场 ====================
  function forecastDetail(date) {
    if (!dataService.isReady()) { UI.toast('数据未就绪', 'warning'); return; }
    var forecasts = dataService.getWeatherForecast();
    var f = forecasts.find(function (x) { return x.date === date; });
    if (!f) { UI.toast('暂无该日预报', 'warning'); return; }
    UI.detail({
      title: date + ' 天气预报',
      body: '<div class="space-y-2">'
        + '<div class="flex justify-between text-sm"><span class="text-gray-500">天气</span><span class="font-medium">' + (f.conditionLabel || '') + '</span></div>'
        + '<div class="flex justify-between text-sm"><span class="text-gray-500">温度</span><span>' + f.high + '° / ' + f.low + '°</span></div>'
        + '<div class="flex justify-between text-sm"><span class="text-gray-500">湿度</span><span>' + (f.humidity || '--') + '%</span></div>'
        + '<div class="flex justify-between text-sm"><span class="text-gray-500">风速</span><span>' + (f.wind || '--') + '</span></div>'
        + '</div>'
    });
  }

  function priceDetail(cropName) {
    if (!dataService.isReady()) { UI.toast('数据未就绪', 'warning'); return; }
    var prices = dataService.table('market_prices').where('cropName', 'eq', cropName).orderBy('date', 'desc').get();
    if (prices.length === 0) { UI.toast('暂无价格数据', 'warning'); return; }
    var latest = prices[0];
    UI.detail({
      title: cropName + ' 价格详情',
      body: '<div class="space-y-2">'
        + '<div class="flex justify-between text-sm"><span class="text-gray-500">最新价</span><span class="font-medium">¥' + (latest.pricePerKg ? latest.pricePerKg.toFixed(2) : '--') + '/kg</span></div>'
        + '<div class="flex justify-between text-sm"><span class="text-gray-500">市场</span><span>' + (latest.market || '--') + '</span></div>'
        + '<div class="flex justify-between text-sm"><span class="text-gray-500">涨跌幅</span><span class="' + (latest.changePercent >= 0 ? 'text-red-500' : 'text-green-500') + '">' + (latest.changePercent >= 0 ? '+' : '') + (latest.changePercent || 0) + '%</span></div>'
        + '<div class="flex justify-between text-sm"><span class="text-gray-500">趋势</span>' + UI.badge(latest.trend || 'stable') + '</div>'
        + (prices.length > 1 ? '<hr class="my-2"><p class="text-xs text-gray-500">近7日最低: ¥' + prices.reduce(function (m, x) { return Math.min(m, x.pricePerKg); }, Infinity).toFixed(2) + ' · 最高: ¥' + prices.reduce(function (m, x) { return Math.max(m, x.pricePerKg); }, 0).toFixed(2) + '</p>' : '')
        + '</div>'
    });
  }

  // 展开/折叠仪表盘多余任务
  function toggleTaskExpand(btn) {
    var collapsed = btn.previousElementSibling;
    if (!collapsed || !collapsed.classList.contains('task-list-collapsed')) return;
    collapsed.classList.toggle('hidden');
    var isHidden = collapsed.classList.contains('hidden');
    var total = collapsed.children.length;
    btn.innerHTML = isHidden ? '展开剩余 ' + total + ' 条任务 <i class="fa fa-chevron-down ml-1"></i>' : '收起任务 <i class="fa fa-chevron-up ml-1"></i>';
  }

  function editTask(taskId) {
    if (!dataService.isReady()) { UI.toast('数据未就绪', 'warning'); return; }
    var task = dataService.getById('farming_tasks', taskId);
    if (!task) { UI.toast('任务不存在', 'error'); return; }
    UI.form({
      title: '编辑农事任务',
      fields: [
        { name: 'type', label: '任务类型', type: 'select', value: task.type, options: [
          { value: 'watering', label: '浇水' }, { value: 'fertilizing', label: '施肥' },
          { value: 'spraying', label: '喷药' }, { value: 'pruning', label: '修剪' },
          { value: 'thinning', label: '疏果' }, { value: 'harvesting', label: '采收' }
        ]},
        { name: 'priority', label: '优先级', type: 'select', value: task.priority || 'medium', options: [
          { value: 'high', label: '高' }, { value: 'medium', label: '中' }, { value: 'low', label: '低' }
        ]},
        { name: 'status', label: '状态', type: 'select', value: task.status, options: [
          { value: 'pending', label: '待开始' }, { value: 'in_progress', label: '进行中' },
          { value: 'completed', label: '已完成' }, { value: 'cancelled', label: '已取消' }
        ]},
        { name: 'estimatedDuration', label: '预计时长(小时)', type: 'number', value: task.estimatedDuration || 1 }
      ],
      onSubmit: function(d) {
        dataService.update('farming_tasks', taskId, { type: d.type, priority: d.priority, status: d.status, estimatedDuration: Number(d.estimatedDuration) });
        if (typeof renderDashboard === 'function') renderDashboard();
        if (typeof renderFarming === 'function') renderFarming();
        UI.toast('任务已更新', 'success');
      }
    });
  }

  function deleteTask(taskId) {
    if (!dataService.isReady()) { UI.toast('数据未就绪', 'warning'); return; }
    var task = dataService.getById('farming_tasks', taskId);
    if (!task) { UI.toast('任务不存在', 'error'); return; }
    var body = '确认删除「' + (task.fieldCode || '') + (typeof taskTypeLabel === 'function' ? taskTypeLabel(task.type) : task.type) + '」任务？此操作不可恢复。';
    UI.confirm('删除任务', body).then(function (ok) {
      if (!ok) return;
      dataService.delete('farming_tasks', taskId);
      if (typeof renderDashboard === 'function') renderDashboard();
      if (typeof renderFarming === 'function') renderFarming();
      UI.toast('任务已删除', 'success');
    });
  }

  function editAlert(alertId) {
    if (!dataService.isReady()) { UI.toast('数据未就绪', 'warning'); return; }
    var alert = dataService.getById('alerts', alertId);
    if (!alert) { UI.toast('预警不存在', 'error'); return; }
    UI.form({
      title: '编辑预警',
      fields: [
        { name: 'title', label: '标题', value: alert.title, required: true },
        { name: 'message', label: '详情', value: alert.message },
        { name: 'severity', label: '严重程度', type: 'select', value: alert.severity, options: [
          { value: 'critical', label: '紧急' }, { value: 'warning', label: '警告' }, { value: 'info', label: '提示' }
        ]},
        { name: 'isResolved', label: '已处理', type: 'select', value: alert.isResolved ? 'true' : 'false', options: [
          { value: 'false', label: '未处理' }, { value: 'true', label: '已处理' }
        ]}
      ],
      onSubmit: function(d) {
        dataService.update('alerts', alertId, { title: d.title, message: d.message, severity: d.severity, isResolved: d.isResolved === 'true', isRead: d.isResolved === 'true' });
        if (typeof renderDashboard === 'function') renderDashboard();
        UI.toast('预警已更新', 'success');
      }
    });
  }

  // ==================== 产量预测 ====================
  function addPrediction() {
    UI.form({ title: '新增产量预测', fields: [
      { name: 'cropName', label: '作物', required: true }, { name: 'yield', label: '预计产量(吨)', type: 'number', value: '10' },
      { name: 'fieldCode', label: '地块' }, { name: 'confidence', label: '置信度(%)', type: 'number', value: '90' }
    ], onSubmit: function (d) {
      dataService.insert('crop_predictions', { id: genId('cp'), cropName: d.cropName, predictedYield: Number(d.yield), fieldCode: d.fieldCode, confidence: Number(d.confidence), date: new Date().toISOString().slice(0, 10) });
      UI.toast('预测记录已添加', 'success'); }});
  }
  function predictionDetail(cropName) { UI.toast(cropName + ' 详情（待后端 API）', 'info'); }
  function exportReport() { UI.detail({ title: '导出产量报告', body: '<div class="text-center py-4"><i class="fa fa-file-text-o text-green-600 text-5xl mb-4"></i><p class="text-sm text-gray-600">报告已生成。同事接后端后可替换为 Excel/PDF。</p><button class="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600" onclick="UI.toast(\'已下载\',\'success\')">下载报告</button></div>' }); }

  // ==================== 设备监控 ====================
  function deviceTrend() { UI.toast('设备趋势数据加载中（待后端 API）', 'info'); }
  function emergencyStop() { UI.confirm('紧急停止', '确认停止所有正在运行的设备？').then(function (ok) { if (!ok) return; var devs = dataService.getDeviceList(); devs.forEach(function (d) { if (d.status === 'running' || d.status === 'online') dataService.update('devices', d.id, { status: 'offline' }); }); if (typeof renderDevices === 'function') renderDevices(); UI.toast('所有设备已紧急停止', 'warning'); }); }

  // ==================== 溯源管理 ====================
  function printTrace() { UI.detail({ title: '溯源报告', body: '<div class="text-center py-4"><i class="fa fa-print text-blue-500 text-5xl mb-4"></i><p class="text-sm text-gray-600">溯源报告已生成。</p><button class="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600" onclick="UI.toast(\'已打印\',\'success\')">打印报告</button></div>' }); }

  // ==================== 权限管理 ====================
  function deleteUser(id) { var u = dataService.getById('users', id); if (!u) return UI.toast('用户不存在', 'error'); UI.confirm('删除用户', '确认删除「' + (u.displayName || u.username) + '」？').then(function (ok) { if (!ok) return; dataService.delete('users', id); if (typeof renderPermission === 'function') renderPermission(); UI.toast('用户已删除', 'success'); }); }
  function editRole(id) { var r = dataService.getById('roles', id); if (!r) return UI.toast('角色不存在', 'error'); UI.form({ title: '编辑角色', fields: [{ name: 'name', label: '角色名称', value: r.name, required: true }, { name: 'description', label: '权限说明', value: r.description || '' }], onSubmit: function (d) { dataService.update('roles', id, { name: d.name, description: d.description }); if (typeof renderPermission === 'function') renderPermission(); UI.toast('角色已更新', 'success'); } }); }

  // ==================== 天气监测/市场/模型 ====================
  function refreshWeather() { if (typeof renderWeather === 'function') renderWeather(); UI.toast('天气已刷新', 'success'); }
  function changeCity() { UI.toast('已切换城市（待后端 API）', 'info'); }
  function markAlertRead(alertId) { dataService.update('weather_alerts', alertId, { isRead: true }); if (typeof renderWeather === 'function') renderWeather(); UI.toast('已标注已读', 'success'); }
  function addWatchCrop() { UI.form({ title: '添加关注品种', fields: [{ name: 'cropName', label: '品种', required: true }, { name: 'minPrice', label: '最低预警价', type: 'number', value: '5' }, { name: 'maxPrice', label: '最高预警价', type: 'number', value: '20' }], onSubmit: function (d) { dataService.insert('watch_list', { id: genId('wl'), cropName: d.cropName, minPrice: Number(d.minPrice), maxPrice: Number(d.maxPrice), createdAt: new Date().toISOString().slice(0, 10) }); UI.toast(d.cropName + ' 已关注', 'success'); } }); }
  function priceAlert() { UI.form({ title: '价格预警设置', fields: [{ name: 'cropName', label: '品种', required: true }, { name: 'threshold', label: '阈值(元/kg)', type: 'number', required: true, value: '10' }, { name: 'type', label: '类型', type: 'select', options: [{ value: 'below', label: '低于' }, { value: 'above', label: '高于' }], value: 'below' }], onSubmit: function (d) { dataService.insert('price_alerts', { id: genId('pa'), cropName: d.cropName, threshold: Number(d.threshold), type: d.type, createdAt: new Date().toISOString().slice(0, 10), active: true }); UI.toast(d.cropName + ' 预警已设置', 'success'); } }); }
  function switchModel() { UI.toast('模型已切换（待后端 API）', 'success'); }
  function retrainModel() { UI.confirm('重新训练', '确认触发重训练？预计 2-4 小时。').then(function (ok) { if (ok) UI.toast('重训练已提交（待后端 API）', 'success'); }); }
  function modelDetail(id) {
    var m = dataService.getById('model_versions', id);
    if (!m) { UI.toast('模型不存在', 'error'); return; }
    UI.detail({
      title: '模型详情 · ' + (m.modelName || ''),
      body: '<div class="space-y-2">'
        + '<div class="flex justify-between text-sm"><span class="text-gray-500">版本</span><span>' + (m.version || '') + '</span></div>'
        + '<div class="flex justify-between text-sm"><span class="text-gray-500">状态</span>' + (typeof badge === 'function' ? badge(m.status) : m.status) + '</div>'
        + '<div class="flex justify-between text-sm"><span class="text-gray-500">准确率</span><span>' + (m.accuracy != null ? m.accuracy + '%' : '向量检索') + '</span></div>'
        + '<div class="flex justify-between text-sm"><span class="text-gray-500">训练数据量</span><span>' + (m.trainingSamples || '--') + '</span></div>'
        + (m.driftScore != null ? '<div class="flex justify-between text-sm"><span class="text-gray-500">漂移分数</span><span>' + (m.driftScore * 100).toFixed(1) + '%</span></div>' : '')
        + '</div>'
    });
  }

  // ==================== 事件委托分发 ====================
  function handleAction(action, el) {
    switch (action) {
      case 'device-control': return deviceControl(el.dataset.id);
      case 'device-detail': return deviceDetail(el.dataset.id);
      case 'device-report': return deviceReport(el.dataset.id);
      case 'device-restart': return deviceRestart(el.dataset.id);
      case 'device-start': return deviceStart(el.dataset.id);
      case 'maintenance-schedule': return maintenanceSchedule(el.dataset.name || (getDevice(el.dataset.id) || {}).name);
      case 'add-product': return addProduct();
      case 'generate-trace': return generateTrace();
      case 'scan-trace': return scanTrace();
      case 'trace-view': return traceView(el.dataset.id || el.closest('[data-product-id]')?.dataset.productId);
      case 'add-personnel': return addPersonnel();
      case 'stock-management': return stockManagement();
      case 'add-cycle': return addCycle();
      case 'view-all-records': return viewAllRecords();
      case 'cycle-detail': return cycleDetail(el.dataset.crop);
      case 'add-user': return addUser();
      case 'edit-user': return editUser(el.dataset.id);
      case 'reset-pwd': return resetPwd(el.dataset.id);
      case 'add-role': return addRole();
      case 'view-logs': return viewLogs();
      case 'risk-detail': return riskDetail(el.dataset.id);
      case 'quick-control': return UI.toast(`已执行：${el.dataset.label || '操作'}`, 'success');
      case 'nav-to': return navigateTo(el.dataset.target);
      case 'edit-task': return editTask(el.dataset.taskId);
      case 'delete-task': return deleteTask(el.dataset.id);
      case 'edit-alert': return editAlert(el.dataset.alertId);
      case 'resolve-alert': return typeof resolveAlert === 'function' ? resolveAlert(el.dataset.alertId) : UI.toast('预警已处理', 'success');
      case 'toggle-task-expand': return toggleTaskExpand(el);
      case 'select-disease': return selectDisease(el.dataset.id);
      case 'disease-detail': return diseaseDetail(el.dataset.name);
      case 'field-detail': return fieldDetail(el.dataset.fieldCode);
      case 'add-field': return addField();
      case 'execute-irrigation': return executeIrrigationAction(el.dataset.id);
      case 'schedule-irrigation': return scheduleIrrigation(el.dataset.id);
      case 'irrigation-edit': return irrigationEdit(el.dataset.id);
      case 'calendar-date': return calendarDate(el.dataset.date);
      case 'generate-fertilization': return generateFertilization();
      case 'log-detail': return logDetail(el.dataset.id);
      case 'record-detail': return recordDetail(el.dataset.id);
      case 'person-detail': return personDetail(el.dataset.id);
      case 'inventory-detail': return inventoryDetail(el.dataset.id);
      case 'forecast-detail': return forecastDetail(el.dataset.date);
      case 'price-detail': return priceDetail(el.dataset.crop);
      case 'add-prediction': return addPrediction();
      case 'prediction-detail': return predictionDetail(el.dataset.crop);
      case 'export-report': return exportReport();
      case 'device-trend': return deviceTrend();
      case 'emergency-stop': return emergencyStop();
      case 'print-trace': return printTrace();
      case 'delete-user': return deleteUser(el.dataset.id);
      case 'edit-role': return editRole(el.dataset.id);
      case 'refresh-weather': return refreshWeather();
      case 'change-city': return changeCity();
      case 'mark-alert-read': return markAlertRead(el.dataset.alertId);
      case 'add-watch-crop': return addWatchCrop();
      case 'price-alert': return priceAlert();
      case 'switch-model': return switchModel();
      case 'retrain-model': return retrainModel();
      case 'model-detail': return modelDetail(el.dataset.id);
      default: console.warn('[interactions] 未处理的 action:', action);
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('click', (e) => {
      const actionEl = e.target.closest('[data-action]');
      if (actionEl) { handleAction(actionEl.dataset.action, actionEl); return; }
      // 溯源"查看溯源"按钮（带 data-product-id）
      const traceBtn = e.target.closest('.btn-view-trace');
      if (traceBtn) { traceView(traceBtn.dataset.productId); return; }
      // 设备卡片上的详情/控制按钮（渲染后由 renderDeviceList 生成，带 data-action）
      // 切换开关
      const toggle = e.target.closest('.toggle-btn');
      if (toggle) {
        const on = toggle.querySelector('span').classList.contains('right-1');
        toggle.querySelector('span').classList.toggle('right-1');
        toggle.querySelector('span').classList.toggle('left-1');
        toggle.classList.toggle('bg-green-500'); toggle.classList.toggle('bg-gray-300');
        UI.toast(on ? '已关闭' : '已开启', 'success');
      }
    });

    // 市场价格：作物下拉切换 → 重绘图表
    document.addEventListener('change', (e) => {
      if (e.target && e.target.id === 'market-crop-selector') {
        if (typeof initChartsBySection === 'function') initChartsBySection('market');
      }
    });
  });
})();
