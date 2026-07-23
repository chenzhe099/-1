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

// ==================== 病虫害：知识库详情弹窗 ====================

function showDiseaseDetailModal(pestName) {
  if (!dataService.isReady()) return;
  const pest = dataService.table('pest_knowledge_base').where('name', 'contains', pestName).first();
  if (!pest) return;

  const body = `
    <div class="space-y-4">
      <div class="bg-gradient-to-r from-${pest.color}-50 to-white rounded-xl p-5 border border-${pest.color}-100">
        <div class="flex items-center mb-3">
          <div class="w-12 h-12 bg-${pest.color}-100 rounded-lg flex items-center justify-center mr-3">
            <i class="fa ${pest.icon} text-${pest.color}-600 text-xl"></i>
          </div>
          <div>
            <h4 class="text-lg font-bold text-gray-800">${pest.name}</h4>
            <p class="text-xs text-gray-500 italic">${pest.scientificName}</p>
          </div>
        </div>
        <div class="bg-white rounded-lg p-4"><span class="text-xs text-gray-500">症状描述</span><p class="text-sm text-gray-800 mt-1 leading-relaxed">${pest.symptoms}</p></div>
        <div class="bg-white rounded-lg p-4 mt-2"><span class="text-xs text-gray-500">发病原因</span><p class="text-sm text-gray-800 mt-1">${pest.causes}</p></div>
      </div>

      <div class="grid grid-cols-1 gap-4">
        <div class="bg-white rounded-xl p-4 border border-gray-100">
          <h5 class="font-semibold text-gray-800 mb-2 flex items-center"><i class="fa fa-shield text-blue-500 mr-2"></i>预防措施</h5>
          <ul class="space-y-1">${pest.prevention.map(p => `<li class="text-sm text-gray-600 flex items-start"><span class="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>${p}</li>`).join('')}</ul>
        </div>
        <div class="bg-white rounded-xl p-4 border border-gray-100">
          <h5 class="font-semibold text-gray-800 mb-2 flex items-center"><i class="fa fa-flask text-red-500 mr-2"></i>化学防治</h5>
          <ul class="space-y-1">${pest.chemicalControl.map(p => `<li class="text-sm text-gray-600 flex items-start"><span class="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>${p}</li>`).join('')}</ul>
        </div>
        <div class="bg-white rounded-xl p-4 border border-gray-100">
          <h5 class="font-semibold text-gray-800 mb-2 flex items-center"><i class="fa fa-leaf text-green-500 mr-2"></i>生物防治</h5>
          <ul class="space-y-1">${pest.biologicalControl.map(p => `<li class="text-sm text-gray-600 flex items-start"><span class="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>${p}</li>`).join('')}</ul>
        </div>
        <div class="bg-white rounded-xl p-4 border border-gray-100">
          <h5 class="font-semibold text-gray-800 mb-2 flex items-center"><i class="fa fa-wrench text-yellow-500 mr-2"></i>农业防治</h5>
          <ul class="space-y-1">${pest.agriculturalControl.map(p => `<li class="text-sm text-gray-600 flex items-start"><span class="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>${p}</li>`).join('')}</ul>
        </div>
      </div>
    </div>`;

  modal.detail({ title: `病虫害详情 — ${pest.name}`, body, width: 'max-w-2xl' });
}

// ==================== 确认弹窗封装 ====================

async function showConfirmDialog(title, message) {
  return await modal.confirm(title, message);
}

// ==================== 仪表盘：查看全部任务弹窗 ====================

function showAllTasksModal() {
  if (!dataService.isReady()) return;
  var tasks = dataService.getTodayTasks();

  modal.table({
    title: '今日农事任务（共 ' + tasks.length + ' 条）',
    columns: [
      { key: 'priority', label: '优先级' },
      { key: 'time', label: '计划时间' },
      { key: 'field', label: '地块' },
      { key: 'type', label: '任务类型' },
      { key: 'duration', label: '时长' },
      { key: 'status', label: '状态' },
      { key: 'action', label: '操作' }
    ],
    rows: tasks,
    rowRenderer: function (t) {
      return '<tr class="hover:bg-gray-50 transition-colors">'
        + '<td class="px-4 py-3">' + badge(t.priority) + '</td>'
        + '<td class="px-4 py-3 text-sm text-gray-600">' + formatDateTime(t.scheduledTime) + '</td>'
        + '<td class="px-4 py-3 text-sm text-gray-700">' + (t.fieldCode || '') + ' · ' + (t.cropName || '') + '</td>'
        + '<td class="px-4 py-3 text-sm">' + taskTypeLabel(t.type) + '</td>'
        + '<td class="px-4 py-3 text-sm text-gray-600">' + (t.estimatedDuration || '') + 'h</td>'
        + '<td class="px-4 py-3">' + badge(t.status) + '</td>'
        + '<td class="px-4 py-3"><button class="text-xs text-blue-500 hover:text-blue-600 font-medium mr-2" data-action="edit-task" data-task-id="' + t.id + '">编辑</button><button class="text-xs text-red-400 hover:text-red-600 font-medium" data-action="delete-task" data-id="' + t.id + '">删除</button></td>'
        + '</tr>';
    }
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
