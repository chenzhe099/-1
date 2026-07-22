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
  spraying:    { label: '喷药',    icon: 'fa-suitcase-medical', color: 'orange' },
  fertilizing: { label: '施肥',    icon: 'fa-leaf',       color: 'purple' },
  thinning:    { label: '疏果',    icon: 'fa-scissors',   color: 'pink' },
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
  // 统一用中文映射
  var m = { '严重':'red', '高':'red', 'critical':'red',
            '警告':'yellow', '中':'yellow', 'warning':'yellow', 'medium':'yellow',
            '提示':'blue', '低':'green', 'info':'blue', 'low':'green' };
  return m[severity] || 'blue';
}

function severityLabel(severity) {
  var m = { '严重':'严重', '高':'高', 'critical':'严重',
            '警告':'警告', '中':'中', 'warning':'警告', 'medium':'中',
            '提示':'提示', '低':'低', 'info':'提示', 'low':'低' };
  return m[severity] || '中';
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

/** 任务条目 HTML — 含编辑和删除按钮 */
function taskItemHTML(task) {
  const ti = TASK_TYPE_MAP[task.type] || { label: task.type, icon: 'fa-circle', color: 'gray' };
  const statusCls = statusColor(task.status);
  const timeStr = task.scheduledTime ? task.scheduledTime.slice(11, 16) + ' - ' + addHours(task.scheduledTime.slice(11, 16), task.estimatedDuration) : '待定';
  return `
    <div class="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer task-item-row" data-task-id="${task.id}" onclick="editTaskItem('${task.id}')">
      <div class="w-8 h-8 bg-${ti.color}-100 rounded-full flex items-center justify-center mr-3">
        <i class="fa ${ti.icon} text-${ti.color}-600"></i>
      </div>
      <div class="flex-1">
        <p class="text-sm font-medium text-gray-800">${task.fieldCode}${ti.label}</p>
        <p class="text-xs text-gray-500">${timeStr} · 预计${task.estimatedDuration}小时</p>
      </div>
      <span class="px-2 py-1 text-xs bg-${statusCls}-100 text-${statusCls}-600 rounded mr-2">${statusLabel(task.status)}</span>
      <button class="w-6 h-6 bg-red-50 hover:bg-red-100 rounded-full flex items-center justify-center transition-colors task-delete-btn"
        data-task-id="${task.id}" onclick="deleteTaskItem(event, '${task.id}')" title="删除任务">
        <i class="fa fa-times text-red-400 text-xs"></i>
      </button>
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

// ========== 任务排序 ==========

/** 任务排序：进行中/待开始 → 按优先级(高→中→低) → 已完成/已取消 沉底 */
function sortTasksByPriority(a, b) {
  var statusOrder = { in_progress: 0, pending: 1, completed: 2, cancelled: 2 };
  var priorityOrder = { high: 0, medium: 1, low: 2 };
  var sa = statusOrder[a.status] !== undefined ? statusOrder[a.status] : 2;
  var sb = statusOrder[b.status] !== undefined ? statusOrder[b.status] : 2;
  if (sa !== sb) return sa - sb;
  if (sa <= 1) { // 活跃任务按优先级排
    var pa = priorityOrder[a.priority] !== undefined ? priorityOrder[a.priority] : 1;
    var pb = priorityOrder[b.priority] !== undefined ? priorityOrder[b.priority] : 1;
    return pa - pb;
  }
  return 0;
}

/** 将任务按已分区组：头部(活跃)、尾部(已完成/取消) */
function partitionTasks(tasks) {
  var active = [];
  var done = [];
  tasks.forEach(function(t) {
    if (t.status === 'completed' || t.status === 'cancelled') {
      done.push(t);
    } else {
      active.push(t);
    }
  });
  return { active: active, done: done };
}

/** 预警条目 HTML */
function alertItemHTML(alert) {
  const sevColors = { critical: 'red', warning: 'yellow', info: 'blue' };
  const sevIcons = { critical: 'fa-exclamation-triangle', warning: 'fa-bell', info: 'fa-info-circle' };
  const c = sevColors[alert.severity] || 'blue';
  const icon = sevIcons[alert.severity] || 'fa-info-circle';
  return `
    <div class="flex items-start p-3 bg-${c}-50 rounded-lg border border-${c}-100 hover:border-${c}-200 transition-colors cursor-pointer" data-alert-id="${alert.id}">
      <i class="fa ${icon} text-${c}-500 mr-3 mt-0.5"></i>
      <div class="flex-1">
        <p class="text-sm font-medium text-${c}-700">${alert.title}</p>
        <p class="text-xs text-gray-600">${alert.message}</p>
      </div>
      <button class="text-xs text-${c}-500 hover:text-${c}-600" onclick="resolveAlert('${alert.id}')">处理</button>
    </div>`;
}
