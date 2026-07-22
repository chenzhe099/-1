/**
 * 智慧农业管理系统 - 增强交互事件处理器
 * 使用 Modal 弹窗组件替代 prompt/alert，提供完善的功能体验
 *
 * 此文件覆盖 handlers.js 中需要弹窗的功能，其余事件仍由 handlers.js 处理
 */

// ==================== 仪表盘：新建任务弹窗 ====================

function showCreateTaskModal() {
  const fields = dataService.isReady() ? dataService.getAll('fields') : [];
  const users = dataService.isReady() ? dataService.getAll('users') : [];

  modal.form({
    title: '新建农事任务',
    fields: [
      { name: 'type', label: '任务类型', type: 'select', required: true,
        options: [
          { value: 'watering', label: '浇水' },
          { value: 'fertilizing', label: '施肥' },
          { value: 'spraying', label: '喷药' },
          { value: 'pruning', label: '修剪' },
          { value: 'harvesting', label: '采收' },
          { value: 'thinning', label: '疏果' }
        ]
      },
      { name: 'fieldCode', label: '目标地块', type: 'select', required: true,
        options: fields.map(f => ({ value: f.code, label: `${f.code} - ${f.cropName} (${f.area}亩)` }))
      },
      { name: 'date', label: '执行日期', type: 'date', required: true, value: new Date().toISOString().slice(0, 10) },
      { name: 'time', label: '执行时间', type: 'time', required: true, value: '08:30' },
      { name: 'duration', label: '预计时长（小时）', type: 'number', required: true, value: '1.5', hint: '输入数字，如 1.5' },
      { name: 'assignedTo', label: '指派人', type: 'select',
        options: [{ value: '', label: '-- 不指定 --' }, ...users.map(u => ({ value: u.id, label: `${u.displayName} (${u.role === 'admin' ? '管理员' : u.role === 'technician' ? '技术员' : '农户'})` }))]
      },
      { name: 'priority', label: '优先级', type: 'select',
        options: [{ value: 'medium', label: '中' }, { value: 'high', label: '高' }, { value: 'low', label: '低' }]
      },
      { name: 'notes', label: '备注', type: 'textarea', rows: 2, placeholder: '可选备注信息' }
    ],
    submitLabel: '创建任务',
    onSubmit: (data) => {
      if (!dataService.isReady()) return;
      const field = dataService.table('fields').where('code', 'eq', data.fieldCode).first();
      const typeLabels = { watering: '浇水作业', fertilizing: '施肥作业', spraying: '喷药作业', pruning: '修剪作业', harvesting: '采收作业', thinning: '疏果作业' };
      dataService.insert('farming_tasks', {
        id: 'task_' + uid(),
        type: data.type,
        fieldId: field?.id || 'field_a1',
        fieldCode: data.fieldCode,
        cropName: field?.cropName || '未知',
        scheduledTime: `${data.date} ${data.time}`,
        estimatedDuration: parseFloat(data.duration) || 1.5,
        status: 'pending',
        assignedTo: data.assignedTo || 'u003',
        priority: data.priority || 'medium',
        notes: data.notes || '',
        completedAt: null
      });
      dataService.insert('operation_logs', {
        id: 'log_' + uid(),
        action: typeLabels[data.type] || '新建任务',
        userId: 'u001', username: 'admin',
        module: '精准农事',
        timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
        details: `${data.fieldCode}${typeLabels[data.type]} — ${data.date} ${data.time}`
      });
      renderFarming();
      renderDashboard();
      showToast(`任务已创建: ${data.fieldCode}${typeLabels[data.type] || data.type}`, 'success');
    }
  });
}

// ==================== 权限管理：添加用户弹窗 ====================

function showAddUserModal() {
  modal.form({
    title: '添加新用户',
    width: 'max-w-lg',
    fields: [
      { name: 'username', label: '用户名', type: 'text', required: true, placeholder: '登录用，如 zhao_farmer' },
      { name: 'displayName', label: '姓名', type: 'text', required: true, placeholder: '如 赵农户' },
      { name: 'role', label: '角色', type: 'select', required: true,
        options: [
          { value: 'farmer', label: '农户 — 查看基本信息，执行农事任务' },
          { value: 'technician', label: '技术员 — 管理农事数据，操作设备' },
          { value: 'admin', label: '管理员 — 系统全部权限' }
        ]
      },
      { name: 'phone', label: '手机号', type: 'text', placeholder: '如 13800001007' },
      { name: 'email', label: '邮箱', type: 'text', placeholder: '如 user@smartfarm.cn' },
      { name: 'status', label: '立即启用账号', type: 'checkbox', value: true }
    ],
    submitLabel: '创建用户',
    onSubmit: (data) => {
      if (!dataService.isReady()) return;
      const existing = dataService.table('users').where('username', 'eq', data.username).first();
      if (existing) { showToast(`用户名 ${data.username} 已存在`, 'error'); return; }

      dataService.insert('users', {
        id: 'u_' + uid(),
        username: data.username,
        displayName: data.displayName,
        role: data.role,
        avatar: data.displayName.slice(0, 3),
        status: data.status ? 'active' : 'disabled',
        phone: data.phone || '',
        email: data.email || '',
        createdAt: new Date().toISOString().slice(0, 10),
        lastLogin: '--'
      });
      dataService.insert('operation_logs', {
        id: 'log_' + uid(),
        action: '添加新用户',
        userId: 'u001', username: 'admin',
        module: '权限管理',
        timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
        details: `添加了用户 ${data.displayName}（${data.role}）`
      });
      renderPermission();
      showToast(`用户 ${data.displayName} 已创建`, 'success');
    }
  });
}

// ==================== 权限管理：编辑用户弹窗 ====================

function showEditUserModal(userId) {
  const user = dataService.isReady() ? dataService.getById('users', userId) : null;
  if (!user) return;

  modal.form({
    title: `编辑用户 — ${user.displayName}`,
    fields: [
      { name: 'displayName', label: '姓名', type: 'text', required: true, value: user.displayName },
      { name: 'role', label: '角色', type: 'select', required: true, value: user.role,
        options: [
          { value: 'farmer', label: '农户' },
          { value: 'technician', label: '技术员' },
          { value: 'admin', label: '管理员' }
        ]
      },
      { name: 'phone', label: '手机号', type: 'text', value: user.phone || '' },
      { name: 'email', label: '邮箱', type: 'text', value: user.email || '' },
      { name: 'status', label: '启用账号', type: 'checkbox', value: user.status === 'active' }
    ],
    submitLabel: '保存修改',
    onSubmit: (data) => {
      if (!dataService.isReady()) return;
      dataService.update('users', userId, {
        displayName: data.displayName,
        role: data.role,
        phone: data.phone || '',
        email: data.email || '',
        status: data.status ? 'active' : 'disabled'
      });
      dataService.insert('operation_logs', {
        id: 'log_' + uid(),
        action: '修改用户信息',
        userId: 'u001', username: 'admin',
        module: '权限管理',
        timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
        details: `修改了用户 ${data.displayName} 的信息`
      });
      renderPermission();
      showToast(`用户 ${data.displayName} 已更新`, 'success');
    }
  });
}

// ==================== 溯源管理：添加产品弹窗 ====================

function showAddProductModal() {
  const fields = dataService.isReady() ? dataService.getAll('fields') : [];

  modal.form({
    title: '添加溯源产品',
    fields: [
      { name: 'name', label: '产品名称', type: 'text', required: true, placeholder: '如 有机番茄' },
      { name: 'batchNumber', label: '批次号', type: 'text', required: true, placeholder: '如 TP20240201' },
      { name: 'fieldId', label: '来源地块', type: 'select', required: true,
        options: fields.map(f => ({ value: f.id, label: `${f.code} - ${f.cropName}` }))
      },
      { name: 'harvestDate', label: '采收日期', type: 'date', required: true, value: new Date().toISOString().slice(0, 10) },
      { name: 'quantity', label: '产量（吨）', type: 'number', required: true, placeholder: '如 45', value: '0' }
    ],
    submitLabel: '添加产品',
    onSubmit: (data) => {
      if (!dataService.isReady()) return;
      const field = dataService.getById('fields', data.fieldId);
      dataService.insert('products', {
        id: 'prod_' + uid(),
        name: data.name,
        cropId: field?.cropId || 'crop_tomato',
        batchNumber: data.batchNumber,
        fieldId: data.fieldId,
        harvestDate: data.harvestDate,
        quantityTons: parseFloat(data.quantity) || 0,
        traceStatus: 'pending',
        qrCode: '',
        certifications: []
      });
      renderTraceability();
      showToast(`产品 ${data.name} (${data.batchNumber}) 已添加`, 'success');
    }
  });
}

// ==================== 溯源管理：查看溯源详情弹窗 ====================

function showTraceDetailModal(productId) {
  if (!dataService.isReady()) return;
  const product = dataService.getById('products', productId);
  if (!product) return;

  const timeline = dataService.getProductionTimeline(productId);
  const certs = dataService.getQualityCertifications(productId);
  const field = dataService.getById('fields', product.fieldId);
  const sc = product.traceStatus === 'traced' ? 'green' : 'yellow';

  const body = `
    <div class="space-y-4">
      <!-- 产品概要 -->
      <div class="bg-gradient-to-r from-${sc}-50 to-white rounded-xl p-4 border border-${sc}-100">
        <div class="flex items-center justify-between">
          <div>
            <h4 class="text-lg font-bold text-gray-800">${product.name}</h4>
            <p class="text-sm text-gray-500">批次: ${product.batchNumber} | 产地: ${field ? field.code + ' - ' + field.cropName : '--'}</p>
          </div>
          <span class="px-3 py-1 text-sm bg-${sc}-100 text-${sc}-600 rounded-full font-medium">${product.traceStatus === 'traced' ? '已溯源' : '待溯源'}</span>
        </div>
        <div class="grid grid-cols-3 gap-4 mt-3 pt-3 border-t border-gray-100">
          <div><span class="text-xs text-gray-500">采收日期</span><p class="text-sm font-semibold">${product.harvestDate}</p></div>
          <div><span class="text-xs text-gray-500">产量</span><p class="text-sm font-semibold">${product.quantityTons} 吨</p></div>
          <div><span class="text-xs text-gray-500">溯源码</span><p class="text-sm font-semibold font-mono">${product.qrCode || '未生成'}</p></div>
        </div>
      </div>

      <!-- 生产全过程时间线 -->
      <div class="bg-white rounded-xl p-4 border border-gray-100">
        <h5 class="font-semibold text-gray-800 mb-4 flex items-center">
          <i class="fa fa-history text-blue-500 mr-2"></i>生产全过程追溯
        </h5>
        <div class="space-y-0">
          ${timeline.length > 0 ? timeline.map((t, i) => `
            <div class="flex items-start pb-4">
              <div class="flex flex-col items-center mr-3">
                <div class="w-3 h-3 ${i === 0 ? 'bg-green-500 ring-4 ring-green-100' : 'bg-green-300'} rounded-full flex-shrink-0"></div>
                ${i < timeline.length - 1 ? '<div class="w-0.5 flex-1 bg-green-200 mt-1"></div>' : ''}
              </div>
              <div class="flex-1 pb-2">
                <p class="text-sm font-medium text-gray-800">${t.stage}</p>
                <p class="text-xs text-gray-500">${formatDateTime(t.date)} · ${t.location} · 操作人: ${t.operator}</p>
                <p class="text-xs text-gray-600 mt-1">${t.description}</p>
              </div>
            </div>
          `).join('') : '<p class="text-center text-gray-400 py-4">暂无生产记录</p>'}
        </div>
      </div>

      <!-- 质量认证 -->
      ${certs.length > 0 ? `
      <div class="bg-white rounded-xl p-4 border border-gray-100">
        <h5 class="font-semibold text-gray-800 mb-3 flex items-center">
          <i class="fa fa-certificate text-purple-500 mr-2"></i>质量认证与检测
        </h5>
        <div class="space-y-2">
          ${certs.map(c => `
            <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p class="text-sm font-medium text-gray-800">${c.name}</p>
                ${c.testedAt ? `<p class="text-xs text-gray-500">检测日期: ${c.testedAt}</p>` : ''}
              </div>
              <div class="text-right">
                <span class="px-2 py-1 text-xs ${c.result === 'pass' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'} rounded font-medium">${c.result === 'pass' ? '✓ 合格' : '⏳ 检测中'}</span>
                ${c.certNumber ? `<p class="text-xs text-gray-400 mt-1">${c.certNumber}</p>` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
      ` : ''}
    </div>`;

  modal.detail({ title: `溯源详情 — ${product.batchNumber}`, body, width: 'max-w-2xl' });
}

// ==================== 设备监控：设备详情弹窗 ====================

function showDeviceDetailModal(deviceName) {
  if (!dataService.isReady()) return;
  const device = dataService.table('devices').where('name', 'contains', deviceName).first();
  if (!device) return;

  const field = device.location ? dataService.getById('fields', device.location) : null;
  const maintenance = dataService.table('maintenance_records').where('deviceId', 'eq', device.id).get();
  const sc = statusColor(device.status);

  const body = `
    <div class="space-y-4">
      <!-- 设备状态卡片 -->
      <div class="bg-gradient-to-r from-${sc}-50 to-white rounded-xl p-5 border border-${sc}-100">
        <div class="flex items-center justify-between mb-3">
          <h4 class="text-lg font-bold text-gray-800">${device.name}</h4>
          <span class="flex items-center">
            <span class="w-2.5 h-2.5 bg-${sc}-500 rounded-full mr-2 ${device.status === 'online' ? 'animate-pulse' : ''}"></span>
            <span class="px-3 py-1 text-sm bg-${sc}-100 text-${sc}-600 rounded-full font-medium">${statusLabel(device.status)}</span>
          </span>
        </div>
        <div class="grid grid-cols-2 gap-3 text-sm">
          <div class="bg-white rounded-lg p-3"><span class="text-gray-500 text-xs">设备类型</span><p class="font-semibold mt-0.5">${device.type === 'pump' ? '灌溉泵' : device.type === 'fertilizer' ? '施肥机' : device.type === 'sensor' ? '传感器' : device.type === 'controller' ? '控制器' : device.type === 'weather_station' ? '气象站' : device.type}</p></div>
          <div class="bg-white rounded-lg p-3"><span class="text-gray-500 text-xs">安装位置</span><p class="font-semibold mt-0.5">${field ? field.code + ' - ' + field.cropName : '公共区域'}</p></div>
          <div class="bg-white rounded-lg p-3"><span class="text-gray-500 text-xs">IP 地址</span><p class="font-semibold mt-0.5 font-mono">${device.ipAddress}</p></div>
          <div class="bg-white rounded-lg p-3"><span class="text-gray-500 text-xs">固件版本</span><p class="font-semibold mt-0.5">${device.firmwareVersion}</p></div>
          <div class="bg-white rounded-lg p-3"><span class="text-gray-500 text-xs">累计运行</span><p class="font-semibold mt-0.5">${device.runHours.toLocaleString()} 小时</p></div>
          <div class="bg-white rounded-lg p-3"><span class="text-gray-500 text-xs">上次保养</span><p class="font-semibold mt-0.5">${device.lastMaintenance || '--'}</p></div>
        </div>
        ${device.metrics ? `
        <div class="mt-3 bg-white rounded-lg p-3">
          <span class="text-gray-500 text-xs">实时指标</span>
          <div class="grid grid-cols-2 gap-2 mt-1">
            ${Object.entries(device.metrics).filter(([k]) => k !== 'unit').map(([k, v]) => `
              <p class="text-sm"><span class="text-gray-600">${k}:</span> <span class="font-semibold">${v || '--'}</span></p>
            `).join('')}
          </div>
        </div>` : ''}
      </div>

      <!-- 维护记录 -->
      <div class="bg-white rounded-xl p-4 border border-gray-100">
        <h5 class="font-semibold text-gray-800 mb-3 flex items-center">
          <i class="fa fa-wrench text-yellow-500 mr-2"></i>维护记录
        </h5>
        ${maintenance.length > 0 ? maintenance.map(m => `
          <div class="flex items-center justify-between p-3 border-b border-gray-50 last:border-0">
            <div>
              <p class="text-sm font-medium text-gray-800">${m.type === 'repair' ? '维修' : m.type === 'calibration' ? '校准' : m.type === 'inspection' ? '检查' : m.type}</p>
              <p class="text-xs text-gray-500">${m.technicianNote || ''}</p>
            </div>
            <div class="text-right">
              <span class="px-2 py-1 text-xs ${m.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'} rounded">${m.status === 'completed' ? '已完成' : '待处理'}</span>
              ${m.completedDate ? `<p class="text-xs text-gray-400 mt-1">${m.completedDate}</p>` : `<p class="text-xs text-gray-400 mt-1">计划: ${m.scheduledDate}</p>`}
            </div>
          </div>
        `).join('') : '<p class="text-center text-gray-400 py-4">暂无维护记录</p>'}
      </div>
    </div>`;

  modal.detail({ title: `设备详情 — ${device.name}`, body, width: 'max-w-2xl' });
}

// ==================== 设备监控：安排维护弹窗 ====================

function showMaintenanceModal(deviceName) {
  if (!dataService.isReady()) return;
  const device = dataService.table('devices').where('name', 'contains', deviceName).first();

  modal.form({
    title: `安排维护 — ${device?.name || deviceName}`,
    fields: [
      { name: 'type', label: '维护类型', type: 'select', required: true,
        options: [
          { value: 'inspection', label: '常规检查' },
          { value: 'repair', label: '故障维修' },
          { value: 'calibration', label: '校准' },
          { value: 'replacement', label: '部件更换' }
        ]
      },
      { name: 'date', label: '计划日期', type: 'date', required: true, value: new Date(Date.now() + 7*86400000).toISOString().slice(0, 10) },
      { name: 'note', label: '维护说明', type: 'textarea', rows: 2, placeholder: '描述维护内容和原因...' },
      { name: 'cost', label: '预估费用（元）', type: 'number', placeholder: '如 500', value: '0' }
    ],
    submitLabel: '创建维护工单',
    onSubmit: (data) => {
      if (!dataService.isReady()) return;
      dataService.insert('maintenance_records', {
        id: 'maint_' + uid(),
        deviceId: device?.id || 'dev_01',
        deviceName: device?.name || deviceName,
        type: data.type,
        status: 'pending',
        scheduledDate: data.date,
        completedDate: null,
        technicianNote: data.note || '',
        cost: parseInt(data.cost) || 0
      });
      showToast(`${device?.name || deviceName} 维护已安排 (${data.date})`, 'success');
    }
  });
}

// ==================== 农场管理：查看全部记录弹窗 ====================

function showAllRecordsModal() {
  if (!dataService.isReady()) return;
  const tasks = dataService.getAll('farming_tasks');
  const typeLabels = { watering: '浇水', pruning: '修剪', spraying: '喷药', fertilizing: '施肥', harvesting: '采收', thinning: '疏果' };

  modal.table({
    title: '全部农事记录',
    columns: [
      { key: 'type', label: '类型' },
      { key: 'field', label: '地块' },
      { key: 'time', label: '执行时间' },
      { key: 'duration', label: '时长' },
      { key: 'status', label: '状态' }
    ],
    rows: tasks.sort((a, b) => b.scheduledTime.localeCompare(a.scheduledTime)),
    rowRenderer: (t) => `
      <tr class="hover:bg-gray-50 transition-colors">
        <td class="px-4 py-3 text-sm"><span class="inline-flex items-center"><i class="fa ${taskTypeIcon(t.type)} text-${taskTypeColor(t.type)}-500 mr-1.5"></i>${typeLabels[t.type] || t.type}</span></td>
        <td class="px-4 py-3 text-sm text-gray-700">${t.fieldCode} · ${t.cropName || ''}</td>
        <td class="px-4 py-3 text-sm text-gray-600">${formatDateTime(t.scheduledTime)}</td>
        <td class="px-4 py-3 text-sm text-gray-600">${t.estimatedDuration}h</td>
        <td class="px-4 py-3">${badge(t.status)}</td>
      </tr>`
  });
}

// ==================== 农场管理：添加人员弹窗 ====================

function showAddPersonnelModal() {
  modal.form({
    title: '添加人员',
    fields: [
      { name: 'name', label: '姓名', type: 'text', required: true, placeholder: '如 王农户' },
      { name: 'role', label: '职位', type: 'text', required: true, placeholder: '如 种植员' },
      { name: 'phone', label: '手机号', type: 'text', placeholder: '如 13800001008' },
      { name: 'email', label: '邮箱', type: 'text', placeholder: '如 user@smartfarm.cn' },
      { name: 'status', label: '立即上岗', type: 'checkbox', value: true }
    ],
    submitLabel: '添加人员',
    onSubmit: (data) => {
      if (!dataService.isReady()) return;
      dataService.insert('personnel', {
        id: 'pers_' + uid(),
        name: data.name,
        role: data.role,
        status: data.status ? 'on_duty' : 'off_duty',
        avatar: data.name.slice(0, 3),
        phone: data.phone || '',
        email: data.email || '',
        joinedAt: new Date().toISOString().slice(0, 10),
        assignedFields: []
      });
      renderManagement();
      showToast(`人员 ${data.name} 已添加`, 'success');
    }
  });
}

// ==================== 农场管理：查看库存详情弹窗 ====================

function showInventoryDetailModal() {
  if (!dataService.isReady()) return;
  const items = dataService.getAll('inventory');

  modal.table({
    title: '农资库存管理',
    columns: [
      { key: 'name', label: '物资名称' },
      { key: 'category', label: '类别' },
      { key: 'qty', label: '库存量' },
      { key: 'threshold', label: '警戒线' },
      { key: 'status', label: '状态' },
      { key: 'supplier', label: '供应商' }
    ],
    rows: items,
    rowRenderer: (i) => {
      const sc = i.quantity <= i.thresholdLow ? 'red' : 'green';
      const catLabels = { fertilizer: '肥料', pesticide: '农药', seed: '种子', tool: '工具' };
      return `
        <tr class="hover:bg-gray-50 transition-colors ${i.quantity <= i.thresholdLow ? 'bg-red-50/30' : ''}">
          <td class="px-4 py-3 text-sm font-medium text-gray-800">${i.name}</td>
          <td class="px-4 py-3 text-sm text-gray-600">${catLabels[i.category] || i.category}</td>
          <td class="px-4 py-3 text-sm"><span class="font-semibold ${sc === 'red' ? 'text-red-600' : 'text-gray-800'}">${i.quantity} ${i.unit.split('/')[0]}</span></td>
          <td class="px-4 py-3 text-sm text-gray-500">≤ ${i.thresholdLow} ${i.unit.split('/')[0]}</td>
          <td class="px-4 py-3">${badge(i.status)}</td>
          <td class="px-4 py-3 text-sm text-gray-600">${i.supplier}</td>
        </tr>`;
    }
  });
}

// ==================== 精准农事：添加地块弹窗 ====================

function showAddFieldModal() {
  modal.form({
    title: '添加新地块',
    fields: [
      { name: 'code', label: '地块编号', type: 'text', required: true, placeholder: '如 D1' },
      { name: 'cropName', label: '种植作物', type: 'text', required: true, placeholder: '如 西瓜' },
      { name: 'area', label: '面积（亩）', type: 'number', required: true, placeholder: '如 2.0', value: '2.0' },
      { name: 'soilMoisture', label: '当前土壤湿度（%）', type: 'number', placeholder: '如 60', value: '60' },
      { name: 'soilPh', label: '土壤 pH 值', type: 'number', placeholder: '如 6.5', value: '6.5' },
      { name: 'status', label: '当前状态', type: 'select',
        options: [
          { value: 'growing', label: '生长中' },
          { value: 'fallow', label: '休耕' }
        ]
      }
    ],
    submitLabel: '添加地块',
    onSubmit: (data) => {
      if (!dataService.isReady()) return;
      dataService.insert('fields', {
        id: 'field_' + uid(),
        code: data.code.toUpperCase(),
        name: `${data.cropName}种植区`,
        cropId: 'crop_tomato',
        cropName: data.cropName,
        area: parseFloat(data.area) || 2.0,
        status: data.status || 'growing',
        soilMoisture: parseInt(data.soilMoisture) || 60,
        soilPh: parseFloat(data.soilPh) || 6.5,
        plantedDate: new Date().toISOString().slice(0, 10),
        expectedHarvest: '',
        location: { lat: 30.25, lng: 120.18 }
      });
      renderFarming();
      showToast(`地块 ${data.code.toUpperCase()} - ${data.cropName} 已添加`, 'success');
    }
  });
}

// ==================== 确认弹窗封装 ====================

async function showConfirmDialog(title, message) {
  return await modal.confirm(title, message);
}

// ==================== 仪表盘：查看全部任务弹窗 ====================

function showAllTasksModal() {
  if (!dataService.isReady()) return;
  const tasks = dataService.getAll('farming_tasks');

  modal.table({
    title: '全部农事任务',
    columns: [
      { key: 'field', label: '地块' },
      { key: 'type', label: '任务类型' },
      { key: 'time', label: '计划时间' },
      { key: 'duration', label: '时长' },
      { key: 'status', label: '状态' },
      { key: 'priority', label: '优先级' }
    ],
    rows: tasks.sort((a, b) => b.scheduledTime.localeCompare(a.scheduledTime)),
    rowRenderer: (t) => `
      <tr class="hover:bg-gray-50 transition-colors">
        <td class="px-4 py-3 text-sm text-gray-700">${t.fieldCode} · ${t.cropName || ''}</td>
        <td class="px-4 py-3 text-sm">${taskTypeLabel(t.type)}</td>
        <td class="px-4 py-3 text-sm text-gray-600">${formatDateTime(t.scheduledTime)}</td>
        <td class="px-4 py-3 text-sm text-gray-600">${t.estimatedDuration}h</td>
        <td class="px-4 py-3">${badge(t.status)}</td>
        <td class="px-4 py-3">${badge(t.priority)}</td>
      </tr>`
  });
}

// ==================== 权限管理：查看全部日志弹窗 ====================

function showAllLogsModal() {
  if (!dataService.isReady()) return;
  const logs = dataService.getOperationLogs();

  modal.table({
    title: '操作日志记录',
    columns: [
      { key: 'action', label: '操作' },
      { key: 'username', label: '操作人' },
      { key: 'module', label: '模块' },
      { key: 'timestamp', label: '时间' }
    ],
    rows: logs,
    rowRenderer: (l) => `
      <tr class="hover:bg-gray-50 transition-colors">
        <td class="px-4 py-3 text-sm font-medium text-gray-800">${l.action}</td>
        <td class="px-4 py-3 text-sm text-gray-600">${l.username}</td>
        <td class="px-4 py-3 text-sm text-gray-600">${l.module}</td>
        <td class="px-4 py-3 text-sm text-gray-500">${formatDateTime(l.timestamp)}</td>
      </tr>`
  });
}

// ==================== 规范原文查看 ====================

function showRegulationDetail(docId) {
  if (!dsReady()) return;
  var doc = ds().getById('knowledge_documents', docId);
  if (!doc) {
    doc = ds().getAll('knowledge_documents')[0]; // fallback to first doc
  }
  if (!doc) return;

  var body = '<div class="space-y-4">' +
    '<div class="bg-blue-50 p-4 rounded-lg">' +
    '<h4 class="font-semibold text-gray-800">' + doc.title + '</h4>' +
    '<p class="text-xs text-gray-500 mt-1">来源：' + doc.sourceRegulation + '</p>' +
    '<p class="text-xs text-gray-500">发布：' + doc.publishDate + ' | 分类：' + doc.category + ' | 适用作物：' + doc.cropTarget + '</p>' +
    '</div>' +
    '<div class="bg-white border border-gray-200 rounded-lg p-4">' +
    '<h5 class="text-sm font-semibold text-gray-700 mb-2">规范原文</h5>' +
    '<p class="text-sm text-gray-700 leading-relaxed">' + doc.originalText + '</p>' +
    '</div>' +
    '<div class="flex flex-wrap gap-1">' +
    doc.keywords.map(function(k) { return '<span class="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">#' + k + '</span>'; }).join('') +
    '</div>' +
    '</div>';

  modal.detail({ title: '规范原文 — ' + doc.title, body: body, width: 'max-w-2xl' });
}

// ==================== 病虫害知识库详情弹窗 ====================

function showDiseaseDetailModal(pestName) {
  if (!dsReady()) return;
  var pest = ds().table('pest_knowledge_base').where('name', 'contains', pestName.replace('查看详情','').trim()).first();
  if (!pest) pest = ds().getAll('pest_knowledge_base')[0];
  if (!pest) return;

  var body = '<div class="space-y-4">' +
    '<div class="flex items-center"><div class="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center mr-4"><i class="fa ' + (pest.icon||'fa-bug') + ' text-red-600 text-2xl"></i></div><div><h4 class="text-lg font-bold text-gray-800">' + pest.name + '</h4><p class="text-xs text-gray-500">严重级别：' + statusLabel(pest.severity) + '</p></div></div>' +
    '<div class="bg-red-50 p-4 rounded-lg"><h5 class="text-sm font-semibold text-red-700 mb-1">症状</h5><p class="text-sm text-gray-700">' + pest.symptoms + '</p></div>' +
    '<div class="bg-yellow-50 p-4 rounded-lg"><h5 class="text-sm font-semibold text-yellow-700 mb-1">原因</h5><p class="text-sm text-gray-700">' + pest.causes + '</p></div>' +
    '<div class="bg-green-50 p-4 rounded-lg"><h5 class="text-sm font-semibold text-green-700 mb-1">防治方案</h5><p class="text-sm text-gray-700">' + pest.treatment + '</p></div>' +
    '<div class="bg-blue-50 p-4 rounded-lg"><h5 class="text-sm font-semibold text-blue-700 mb-1">规范依据</h5><p class="text-sm text-gray-700">' + (pest.regulation || '请查看相关农业技术规范') + '</p>' +
    '<button class="mt-2 text-xs text-blue-600 hover:text-blue-700" onclick="showRegulationDetail(\'kd_001\')">查看完整规范 <i class="fa fa-arrow-right ml-1"></i></button></div>' +
    '</div>';

  modal.detail({ title: '病虫害详情 — ' + pest.name, body: body, width: 'max-w-2xl' });
}

// ==================== 权限管理：用户操作弹窗 ====================

function editUser(userId) {
  if (!dsReady()) return;
  var u = ds().getById('users', userId);
  if (!u) { showToast('用户不存在', 'error'); return; }

  modal.form({
    title: '编辑用户 — ' + u.displayName,
    fields: [
      { name: 'displayName', label: '姓名', type: 'text', required: true, value: u.displayName },
      { name: 'role', label: '角色', type: 'select', required: true,
        options: [
          { value: 'admin', label: '管理员' }, { value: 'technician', label: '技术员' },
          { value: 'farmer', label: '农户' }, { value: 'manager', label: '合作社管理人员' }
        ], value: u.role
      },
      { name: 'status', label: '状态', type: 'select',
        options: [{ value: 'active', label: '启用' }, { value: 'disabled', label: '禁用' }], value: u.status
      },
      { name: 'phone', label: '手机号', type: 'text', value: u.phone || '' },
      { name: 'email', label: '邮箱', type: 'text', value: u.email || '' }
    ],
    submitLabel: '保存修改',
    onSubmit: function(data) {
      ds().update('users', userId, { displayName: data.displayName, role: data.role, status: data.status, phone: data.phone, email: data.email });
      ds().insert('operation_logs', { id: 'log_' + uid(), userId: 'u001', username: 'admin', module: 'permission', action: '编辑用户: ' + u.username, detail: JSON.stringify(data), timestamp: new Date().toISOString().slice(0,19).replace('T',' ') });
      renderPermission();
      showToast('用户「' + u.username + '」信息已更新', 'success');
    }
  });
}

function resetPassword(userId) {
  if (!dsReady()) return;
  var u = ds().getById('users', userId);
  if (!u) return;
  modal.confirm('重置密码', '确定要重置用户「' + u.username + '」的密码为 123456 吗？').then(function(ok) {
    if (ok) {
      ds().update('users', userId, { passwordHash: 'reset_by_admin' });
      showToast('用户「' + u.username + '」密码已重置为 123456', 'success');
    }
  });
}

// ==================== 农事决策：执行灌溉弹窗 ====================

function executeIrrigation(planId) {
  if (!dsReady()) return;
  var plan = ds().getById('irrigation_plans', planId);
  if (!plan) return;

  modal.confirm('执行灌溉方案', '确定立即执行地块 ' + plan.fieldCode + ' 的灌溉方案吗？\n\n目标湿度：' + plan.targetMoisture + '%\n灌溉水量：' + plan.waterVolume + 'm³\n预计时长：' + plan.estimatedDuration + '分钟').then(function(ok) {
    if (ok) {
      ds().update('irrigation_plans', planId, { status: 'executing' });
      ds().insert('operation_logs', { id: 'log_' + uid(), userId: 'u001', username: 'admin', module: 'farming', action: '执行灌溉: ' + plan.fieldCode, detail: plan.waterVolume + 'm³', timestamp: new Date().toISOString().slice(0,19).replace('T',' ') });
      renderFarming();
      showToast('地块 ' + plan.fieldCode + ' 灌溉已启动', 'success');
    }
  });
}

// ==================== 病虫害：知识库卡片点击 ====================

function showDiseaseDetail(pestId) {
  if (!dsReady()) return;
  var pest = ds().getById('pest_knowledge_base', pestId);
  if (!pest) { showToast('未找到该病虫害信息', 'warning'); return; }

  var body = '<div class="space-y-4">' +
    '<div class="flex items-center"><div class="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center mr-4"><i class="fa ' + (pest.icon||'fa-bug') + ' text-red-600 text-2xl"></i></div><div><h4 class="text-lg font-bold text-gray-800">' + pest.name + '</h4><p class="text-xs text-gray-500">严重级别：' + statusLabel(pest.severity) + '</p></div></div>' +
    '<div class="bg-red-50 p-4 rounded-lg"><h5 class="text-sm font-semibold text-red-700 mb-1">症状</h5><p class="text-sm text-gray-700">' + pest.symptoms + '</p></div>' +
    '<div class="bg-yellow-50 p-4 rounded-lg"><h5 class="text-sm font-semibold text-yellow-700 mb-1">原因</h5><p class="text-sm text-gray-700">' + pest.causes + '</p></div>' +
    '<div class="bg-green-50 p-4 rounded-lg"><h5 class="text-sm font-semibold text-green-700 mb-1">防治方案</h5><p class="text-sm text-gray-700">' + pest.treatment + '</p></div>' +
    '<div class="bg-blue-50 p-4 rounded-lg"><h5 class="text-sm font-semibold text-blue-700 mb-1">规范依据</h5><p class="text-sm text-gray-700">' + (pest.regulation || '请查看相关农业技术规范') + '</p>' +
    '<button class="mt-2 text-xs text-blue-600 hover:text-blue-700" onclick="showRegulationDetail(\'' + (ds().getAll('knowledge_documents')[0]?.id || 'kd_001') + '\')">查看完整规范 <i class="fa fa-arrow-right ml-1"></i></button></div>' +
    '</div>';
  modal.detail({ title: '病虫害详情 — ' + pest.name, body: body, width: 'max-w-2xl' });
}

// ==================== 地块详情弹窗（共用） ====================

function showFieldDetailModal(fieldId) {
  if (!dsReady()) return;
  var f = ds().getById('fields', fieldId);
  if (!f) { showToast('地块不存在', 'warning'); return; }
  var tasks = ds().table('farming_tasks').where('fieldId', 'eq', fieldId).orderBy('scheduledTime', 'desc').limit(6).get();
  var cycles = ds().table('planting_cycles').where('fieldId', 'eq', fieldId).get();

  var body = '<div class="space-y-4">' +
    '<div class="bg-gradient-to-r from-green-50 to-white rounded-xl p-4 border border-green-100">' +
    '<h4 class="text-lg font-bold">' + f.code + ' — ' + f.cropName + '</h4><p class="text-sm text-gray-500">' + f.name + '</p>' +
    '<div class="grid grid-cols-3 gap-3 mt-3">' +
    '<div class="bg-white p-3 rounded"><span class="text-xs text-gray-500">面积</span><p class="font-bold">' + f.area + '亩</p></div>' +
    '<div class="bg-white p-3 rounded"><span class="text-xs text-gray-500">土壤湿度</span><p class="font-bold">' + (f.soilMoisture || '--') + '%</p></div>' +
    '<div class="bg-white p-3 rounded"><span class="text-xs text-gray-500">pH值</span><p class="font-bold">' + (f.soilPh || '--') + '</p></div>' +
    '<div class="bg-white p-3 rounded"><span class="text-xs text-gray-500">种植日期</span><p class="font-bold">' + (f.plantedDate || '--') + '</p></div>' +
    '<div class="bg-white p-3 rounded"><span class="text-xs text-gray-500">预计采收</span><p class="font-bold">' + (f.expectedHarvest || '--') + '</p></div>' +
    '<div class="bg-white p-3 rounded"><span class="text-xs text-gray-500">状态</span><p class="font-bold">' + statusLabel(f.status) + '</p></div>' +
    '</div></div>';

  if (cycles.length > 0) {
    body += '<div class="bg-white rounded-xl p-4 border"><h5 class="font-semibold mb-2">种植周期</h5>' +
      cycles.map(function(c) {
        return '<div class="p-2 bg-gray-50 rounded mb-1 flex justify-between"><span class="text-sm">' + c.cropName + '</span><span class="text-xs text-gray-500">' + c.plantedDate + ' ~ ' + (c.expectedHarvestDate || '--') + '</span><span class="text-xs">' + (c.growthStage || '') + '</span></div>';
      }).join('') + '</div>';
  }

  if (tasks.length > 0) {
    body += '<div class="bg-white rounded-xl p-4 border"><h5 class="font-semibold mb-3">近期农事记录</h5><div class="space-y-2">' +
      tasks.map(function(t) { return '<div class="flex justify-between p-2 bg-gray-50 rounded"><span class="text-sm">' + taskTypeLabel(t.type) + '</span><span class="text-xs text-gray-500">' + (t.scheduledTime || '') + '</span>' + badge(t.status) + '</div>'; }).join('') +
      '</div></div>';
  }

  body += '</div>';
  modal.detail({ title: '地块详情 — ' + f.code, body: body, width: 'max-w-lg' });
}

// ==================== 人员详情弹窗 ====================

function showPersonnelDetailModal(personId) {
  if (!dsReady()) return;
  var p = ds().getById('personnel', personId);
  if (!p) { showToast('人员不存在', 'warning'); return; }
  var body = '<div class="space-y-4">' +
    '<div class="flex items-center"><img src="https://api.dicebear.com/7.x/avataaars/svg?seed=' + (p.avatar || p.name) + '" class="w-16 h-16 rounded-full mr-4"><div><h4 class="text-lg font-bold">' + p.name + '</h4><p class="text-sm text-gray-500">' + p.role + '</p></div><span class="ml-auto">' + badge(p.status) + '</span></div>' +
    '<div class="grid grid-cols-2 gap-3">' +
    '<div class="bg-gray-50 p-3 rounded"><span class="text-xs text-gray-500">手机</span><p class="font-semibold">' + (p.phone || '--') + '</p></div>' +
    '<div class="bg-gray-50 p-3 rounded"><span class="text-xs text-gray-500">邮箱</span><p class="font-semibold">' + (p.email || '--') + '</p></div>' +
    '<div class="bg-gray-50 p-3 rounded"><span class="text-xs text-gray-500">入职日期</span><p class="font-semibold">' + (p.joinedAt || '--') + '</p></div>' +
    '<div class="bg-gray-50 p-3 rounded"><span class="text-xs text-gray-500">状态</span><p class="font-semibold">' + statusLabel(p.status) + '</p></div>' +
    '</div></div>';
  modal.detail({ title: '人员详情 — ' + p.name, body: body, width: 'max-w-md' });
}

// ==================== 权限管理：添加用户+角色弹窗 ====================

function showAddUserModal() {
  modal.form({
    title: '添加新用户',
    fields: [
      { name: 'username', label: '用户名', type: 'text', required: true, placeholder: '登录账号' },
      { name: 'password', label: '密码', type: 'text', required: true, value: '123456' },
      { name: 'displayName', label: '姓名', type: 'text', required: true, placeholder: '如：王五' },
      { name: 'role', label: '角色', type: 'select', required: true,
        options: [{ value: 'farmer', label: '农户' }, { value: 'technician', label: '技术员' }, { value: 'manager', label: '合作社管理人员' }]
      },
      { name: 'phone', label: '手机号', type: 'text', placeholder: '选填' },
      { name: 'email', label: '邮箱', type: 'text', placeholder: '选填' }
    ],
    submitLabel: '添加用户',
    onSubmit: function(data) {
      var users = ds().getAll('users');
      var newId = 'u' + String(users.length + 1).padStart(3, '0');
      ds().insert('users', { id: newId, username: data.username, passwordHash: data.password, displayName: data.displayName, role: data.role, avatar: data.displayName, status: 'active', phone: data.phone || '', email: data.email || '', createdAt: new Date().toISOString().slice(0,10), lastLogin: '' });
      ds().insert('operation_logs', { id: 'log_' + uid(), userId: 'u001', username: 'admin', module: 'permission', action: '添加用户: ' + data.username, detail: data.displayName + ' / ' + data.role, timestamp: new Date().toISOString().slice(0,19).replace('T',' ') });
      renderPermission();
      showToast('用户「' + data.username + '」添加成功', 'success');
    }
  });
}

// ==================== 溯源管理：生成溯源码 ====================

function generateTraceCodeFromUI() {
  if (!dsReady()) { showToast('数据未加载', 'warning'); return; }
  var products = ds().getAll('products');
  if (products.length === 0) { showToast('暂无产品可生成溯源码', 'warning'); return; }
  // 默认使用第一个产品
  var p = products[0];
  var code = 'TR-' + p.batchNumber + '-' + Date.now().toString(36).toUpperCase().slice(-4);
  var body = '<div class="text-center py-4">' +
    '<div class="w-40 h-40 bg-gray-100 rounded-xl mx-auto flex items-center justify-center mb-4"><i class="fa fa-qrcode text-6xl text-gray-600"></i></div>' +
    '<p class="text-lg font-bold text-gray-800">溯源码</p>' +
    '<p class="text-2xl font-mono font-bold text-green-600 mt-2">' + code + '</p>' +
    '<div class="mt-3 text-sm text-gray-600"><p>产品：' + p.name + '</p><p>批次：' + p.batchNumber + '</p><p>采收日期：' + (p.harvestDate || '--') + '</p></div>' +
    '</div>';
  modal.detail({ title: '生成溯源码 — ' + p.name, body: body, width: 'max-w-sm' });
  showToast('溯源码已生成: ' + code, 'success');
}

function generateTraceCode(productId) {
  if (!dsReady()) return;
  var p = ds().getById('products', productId);
  if (!p) return;
  var code = 'TR-' + p.batchNumber + '-' + new Date().getTime().toString(36).toUpperCase();
  showToast('溯源码已生成: ' + code + '\n批次: ' + p.batchNumber, 'success');
}

// ==================== 全局：系统搜索 ====================

function performSearch(query) {
  var q = query.toLowerCase();
  var map = {
    '数据':'dashboard','总览':'dashboard','病虫害':'disease','识别':'disease',
    '农事':'farming','灌溉':'farming','施肥':'farming',
    '产量':'prediction','预测':'prediction','农场':'management','记录':'management',
    '设备':'devices','监控':'devices','传感器':'devices',
    '溯源':'traceability','二维码':'traceability','批次':'traceability',
    '权限':'permission','用户':'permission','角色':'permission',
    '天气':'weather','温度':'weather','降雨':'weather','气象':'weather',
    '价格':'market','市场':'market','行情':'market',
    '模型':'monitor','AI':'monitor','漂移':'monitor','Agent':'monitor','样本':'monitor'
  };
  var found = false;
  Object.keys(map).forEach(function(k) {
    if (!found && q.indexOf(k) >= 0) {
      var btn = document.querySelector('.sidebar-item[data-menu="' + map[k] + '"]');
      if (btn) { btn.click(); found = true; }
    }
  });
  if (!found) showToast('未找到与「' + query + '」相关的模块', 'info');
}

// ==================== 农事任务：编辑与删除 ====================

/**
 * 点击任务条目 → 弹出编辑表单
 */
function editTaskItem(taskId) {
  if (!dsReady()) return;
  var t = ds().getById('farming_tasks', taskId);
  if (!t) { showToast('任务不存在', 'warning'); return; }

  var typeOptions = [
    { value: 'watering', label: '浇水' }, { value: 'fertilizing', label: '施肥' },
    { value: 'spraying', label: '喷药' }, { value: 'pruning', label: '修剪' },
    { value: 'harvesting', label: '采收' }, { value: 'thinning', label: '疏果' }
  ];
  var statusOptions = [
    { value: 'pending', label: '待开始' }, { value: 'in_progress', label: '进行中' },
    { value: 'completed', label: '已完成' }, { value: 'cancelled', label: '已取消' }
  ];
  var priorityOptions = [
    { value: 'high', label: '高' }, { value: 'medium', label: '中' }, { value: 'low', label: '低' }
  ];

  modal.form({
    title: '编辑任务 — ' + t.fieldCode + taskTypeLabel(t.type),
    fields: [
      { name: 'type', label: '任务类型', type: 'select', required: true, options: typeOptions, value: t.type },
      { name: 'status', label: '状态', type: 'select', required: true, options: statusOptions, value: t.status },
      { name: 'priority', label: '优先级', type: 'select', options: priorityOptions, value: t.priority },
      { name: 'notes', label: '备注', type: 'textarea', rows: 2, value: t.notes || '', placeholder: '可选备注' }
    ],
    submitLabel: '保存修改',
    onSubmit: function(data) {
      var update = { type: data.type, status: data.status, priority: data.priority, notes: data.notes };
      if (data.status === 'completed' && t.status !== 'completed') {
        update.completedAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
      }
      ds().update('farming_tasks', taskId, update);
      ds().insert('operation_logs', {
        id: 'log_' + uid(), userId: 'u001', username: 'admin',
        module: 'farming', action: '编辑任务: ' + t.fieldCode + taskTypeLabel(t.type),
        detail: '状态: ' + data.status + ', 优先级: ' + data.priority,
        timestamp: new Date().toISOString().slice(0, 19).replace('T', ' ')
      });
      renderDashboard();
      if (typeof renderFarming === 'function') renderFarming();
      showToast('任务已更新', 'success');
    }
  });
}

/**
 * 删除任务（event 传入阻止冒泡）
 */
function deleteTaskItem(event, taskId) {
  event.stopPropagation();
  if (!dsReady()) return;
  var t = ds().getById('farming_tasks', taskId);
  if (!t) { showToast('任务不存在', 'warning'); return; }

  modal.confirm('删除任务', '确定要删除「' + t.fieldCode + taskTypeLabel(t.type) + '」吗？此操作不可恢复。').then(function(ok) {
    if (ok) {
      ds().delete('farming_tasks', taskId);
      ds().insert('operation_logs', {
        id: 'log_' + uid(), userId: 'u001', username: 'admin',
        module: 'farming', action: '删除任务: ' + t.fieldCode + taskTypeLabel(t.type),
        detail: '原状态: ' + t.status, timestamp: new Date().toISOString().slice(0, 19).replace('T', ' ')
      });
      renderDashboard();
      if (typeof renderFarming === 'function') renderFarming();
      showToast('任务已删除', 'success');
    }
  });
}

// ==================== 任务折叠/展开 ====================

/**
 * 点击"已完成任务"区域 → 折叠/展开
 */
function toggleCompletedTasks(el) {
  var wrap = el.nextElementSibling;
  if (!wrap || !wrap.classList.contains('completed-tasks-wrap')) {
    wrap = el.parentElement.querySelector('.completed-tasks-wrap');
  }
  if (!wrap) return;
  var isHidden = wrap.classList.contains('hidden');
  var icon = el.querySelector('.completed-toggle-icon');
  var arrow = el.querySelector('.completed-toggle-arrow');
  if (isHidden) {
    wrap.classList.remove('hidden');
    if (icon) { icon.classList.remove('fa-chevron-down'); icon.classList.add('fa-chevron-up'); }
    if (arrow) arrow.textContent = '▲';
  } else {
    wrap.classList.add('hidden');
    if (icon) { icon.classList.remove('fa-chevron-up'); icon.classList.add('fa-chevron-down'); }
    if (arrow) arrow.textContent = '▼';
  }
}
