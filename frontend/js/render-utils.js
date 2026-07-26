/**
 * 智慧农业管理系统 - 共享渲染工具函数
 */

// ========== 格式化工具 ==========

function formatTime(isoStr) {
  if (!isoStr) return '--';
  const t = isoStr.slice(11, 16);
  return t;
}

function formatDate(isoStr) {
  if (!isoStr) return '--';
  return isoStr.slice(0, 10);
}

function formatDateTime(isoStr) {
  if (!isoStr) return '--';
  return isoStr.slice(0, 16).replace('T', ' ');
}

// ========== 任务类型映射 ==========

const TASK_TYPE_MAP = {
  watering:    { label: '浇水',    icon: 'fa-tint',       color: 'green' },
  pruning:     { label: '修剪',    icon: 'fa-scissors',   color: 'blue' },
  spraying:    { label: '喷药',    icon: 'fa-medkit',     color: 'orange' },
  fertilizing: { label: '施肥',    icon: 'fa-leaf',       color: 'purple' },
  thinning:    { label: '疏果',    icon: 'fa-cut',        color: 'pink' },
  harvesting:  { label: '采收',    icon: 'fa-shopping-basket', color: 'red' }
};

function taskTypeLabel(type) { return TASK_TYPE_MAP[type]?.label || type; }
function taskTypeIcon(type)  { return TASK_TYPE_MAP[type]?.icon || 'fa-circle'; }
function taskTypeColor(type) { return TASK_TYPE_MAP[type]?.color || 'gray'; }

// ========== 状态映射 ==========

function statusLabel(status) {
  const m = {
    in_progress:'进行中', pending:'待开始', completed:'已完成', cancelled:'已取消',
    online:'在线', offline:'离线', fault:'故障', standby:'待机',
    traced:'已溯源', pending_trace:'待溯源',
    growing:'生长中', watering:'需浇水', disease:'病虫害预警', fallow:'休耕',
    sufficient:'库存充足', low:'库存偏低', depleted:'已耗尽',
    on_duty:'在岗', off_duty:'离岗', leave:'休假',
    active:'启用', disabled:'禁用',
    high:'高', medium:'中', low:'低',
    executing:'执行中', planned:'待规划',
    resolved:'已处理', processing:'处理中',
    sunny:'晴', cloudy:'多云', rain:'雨', snow:'雪',
    up:'上涨', down:'下跌', stable:'持平',
    active_growing:'生长中', harvested:'已采收',
    running:'运行中', succeeded:'成功', failed_agent:'失败',
    pending_review:'待审核', reviewed:'已审核'
  };
  return m[status] || status;
}

function statusColor(status) {
  const m = {
    in_progress:'green', pending:'blue', completed:'gray', cancelled:'red',
    online:'green', offline:'red', fault:'yellow', standby:'gray',
    growing:'green', watering:'yellow', disease:'red', fallow:'gray',
    sufficient:'green', low:'yellow', depleted:'red',
    on_duty:'green', off_duty:'gray', leave:'yellow',
    active:'green', disabled:'red',
    critical:'red', warning:'yellow', info:'blue',
    executing:'blue', planned:'gray',
    resolved:'green', processing:'yellow',
    high:'red', medium:'yellow', low:'green',
    sunny:'orange', cloudy:'gray', rain:'blue', snow:'blue',
    up:'red', down:'green', stable:'blue',
    active_growing:'green', harvested:'blue',
    running:'green', succeeded:'green', failed_agent:'red',
    pending_review:'yellow', reviewed:'green'
  };
  return m[status] || 'gray';
}

function severityColor(severity) {
  const m = { critical:'red', warning:'yellow', info:'blue' };
  return m[severity] || 'gray';
}

// ========== HTML 构建辅助 ==========

/** 数据驱动状态徽章 */
function badge(status, extraClass = '') {
  const c = statusColor(status);
  return `<span class="px-2 py-1 text-xs bg-${c}-100 text-${c}-600 rounded ${extraClass}">${statusLabel(status)}</span>`;
}

/** 严重级别徽章 */
function severityBadge(severity) {
  const c = severityColor(severity);
  const labels = { critical:'紧急', warning:'警告', info:'提示' };
  return `<span class="px-2 py-1 text-xs bg-${c}-100 text-${c}-600 rounded">${labels[severity] || severity}</span>`;
}

/** 任务条目 HTML */
function taskItemHTML(task) {
  const ti = TASK_TYPE_MAP[task.type] || { label: task.type, icon: 'fa-leaf', color: 'blue' };
  const statusCls = statusColor(task.status);
  // 统一格式：YYYY-MM-DD HH:mm（与精准农事/农场管理一致）
  const dateStr = task.scheduledTime ? task.scheduledTime.replace('T', ' ').slice(0, 16) : '待定';
  const stLabels = {pending:'待执行',in_progress:'进行中',completed:'已完成',cancelled:'已取消'};
  const stBadge = {pending:'bg-blue-100 text-blue-600',in_progress:'bg-yellow-100 text-yellow-600',completed:'bg-green-100 text-green-600',cancelled:'bg-red-100 text-red-600'};
  return `
    <div class="flex items-center justify-between p-3 bg-${statusCls}-50 rounded-lg hover:opacity-80 transition-opacity">
      <div class="flex items-center flex-1 min-w-0">
        <div class="w-8 h-8 bg-${ti.color}-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
          <i class="fa ${ti.icon} text-${ti.color}-600 text-sm"></i>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium truncate">地块${task.fieldCode} ${ti.label}</p>
          <p class="text-xs text-gray-500">${dateStr} · 预计${task.estimatedDuration}分钟</p>
        </div>
      </div>
      <div class="flex items-center gap-2 ml-2">
        <span class="px-2 py-1 text-xs rounded ${stBadge[task.status]||''}">${stLabels[task.status]||task.status}</span>
        <button class="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded hover:bg-blue-200" onclick="farmTaskDetail('${task.id}')">详情</button>
      </div>
    </div>`;
}

function addHours(timeStr, hours) {
  if (!timeStr || !hours) return '--:--';
  const [h, m] = timeStr.split(':').map(Number);
  const totalMin = h * 60 + m + hours * 60;
  const h2 = Math.floor(totalMin / 60) % 24;
  const m2 = totalMin % 60;
  return String(h2).padStart(2, '0') + ':' + String(m2).padStart(2, '0');
}

/** 预警条目 HTML */
function alertItemHTML(alert) {
  const sevColors = { critical: 'red', warning: 'yellow', info: 'blue' };
  const sevIcons = { critical: 'fa-exclamation-triangle', warning: 'fa-bell', info: 'fa-info-circle' };
  const c = sevColors[alert.severity] || 'blue';
  const icon = sevIcons[alert.severity] || 'fa-info-circle';
  return `
    <div class="flex items-start p-3 bg-${c}-50 rounded-lg border border-${c}-100 hover:border-${c}-200 transition-colors cursor-pointer" data-action="edit-alert" data-alert-id="${alert.id}">
      <i class="fa ${icon} text-${c}-500 mr-3 mt-0.5"></i>
      <div class="flex-1">
        <p class="text-sm font-medium text-${c}-700">${alert.title}</p>
        <p class="text-xs text-gray-600">${alert.message}</p>
      </div>
      <button class="text-xs text-${c}-500 hover:text-${c}-600" data-action="resolve-alert" data-alert-id="${alert.id}">处理</button>
    </div>`;
}
