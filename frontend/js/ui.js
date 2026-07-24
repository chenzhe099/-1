/**
 * 智慧农业管理系统 - 统一交互组件规范 (UI Toolkit)
 * 在现有 showToast / Modal 之上整合 loading / empty / error 标准态与通用渲染辅助。
 * 所有模块的交互都通过本文件提供的 API 保持一致的视觉与行为。
 */

const UI = (() => {
  // 状态色映射（与 Tailwind 色板一致）
  const STATUS_COLORS = {
    online: 'green', active: 'green', completed: 'green', traced: 'green',
    growing: 'green', healthy: 'green', pass: 'green', resolved: 'green',
    pending: 'yellow', offline: 'gray', standby: 'yellow', warning: 'yellow',
    fault: 'red', error: 'red', processing: 'orange', unknown: 'orange',
    up: 'red', down: 'green', idle: 'gray'
  };

  function statusColor(key) {
    return STATUS_COLORS[key] || 'blue';
  }

  function statusLabel(key) {
    const map = {
      online: '在线', active: '启用', completed: '已完成', traced: '已溯源',
      growing: '生长中', healthy: '健康', pass: '合格', resolved: '已处理',
      pending: '待处理', offline: '离线', standby: '待机', warning: '预警',
      fault: '故障', error: '异常', processing: '处理中', unknown: '未知',
      up: '上涨', down: '下跌', idle: '空闲'
    };
    return map[key] || key;
  }

  // 统一的徽章
  function badge(key) {
    const sc = statusColor(key);
    return `<span class="px-2 py-0.5 text-xs bg-${sc}-100 text-${sc}-600 rounded">${statusLabel(key)}</span>`;
  }

  // 轻量 toast（封装现有 showToast）
  function toast(msg, type = 'info') {
    if (typeof showToast === 'function') showToast(msg, type);
    else console.log('[toast]', type, msg);
  }

  // 加载骨架屏
  function loading(el, text = '加载中...') {
    if (!el) return;
    el.innerHTML = `
      <div class="flex flex-col items-center justify-center py-10 text-gray-400">
        <i class="fa fa-spinner fa-spin text-2xl mb-2"></i>
        <span class="text-sm">${text}</span>
      </div>`;
  }

  // 空状态
  function empty(el, text = '暂无数据', icon = 'fa-inbox') {
    if (!el) return;
    el.innerHTML = `
      <div class="flex flex-col items-center justify-center py-10 text-gray-400">
        <i class="fa ${icon} text-3xl mb-2"></i>
        <span class="text-sm">${text}</span>
      </div>`;
  }

  // 错误状态（可重试）
  function error(el, text = '加载失败', onRetry = null) {
    if (!el) return;
    el.innerHTML = `
      <div class="flex flex-col items-center justify-center py-10 text-gray-400">
        <i class="fa fa-exclamation-circle text-3xl mb-2 text-red-300"></i>
        <span class="text-sm">${text}</span>
        ${onRetry ? '<button class="mt-3 px-3 py-1.5 bg-gray-100 text-gray-600 text-xs rounded-lg hover:bg-gray-200 ui-retry-btn">重试</button>' : ''}
      </div>`;
    if (onRetry) {
      el.querySelector('.ui-retry-btn').addEventListener('click', onRetry);
    }
  }

  // 统一的确认弹窗
  function confirm(title, message) {
    if (typeof modal !== 'undefined') return modal.confirm(title, message);
    return Promise.resolve(window.confirm(message));
  }

  // 统一的表单弹窗
  function form(options) {
    if (typeof modal !== 'undefined') return modal.form(options);
    throw new Error('modal 未初始化');
  }

  // 统一的详情弹窗
  function detail(options) {
    if (typeof modal !== 'undefined') return modal.detail(options);
    throw new Error('modal 未初始化');
  }

  // 统一的表格弹窗
  function table(options) {
    if (typeof modal !== 'undefined') return modal.table(options);
    throw new Error('modal 未初始化');
  }

  // 生成带 data-action 的列表项容器，便于事件委托
  function rowAction(action, id, label, cls = 'text-blue-500 hover:text-blue-600') {
    return `<button class="${cls} text-sm" data-action="${action}" data-id="${id}">${label}</button>`;
  }

  return {
    statusColor, statusLabel, badge,
    toast, loading, empty, error,
    confirm, form, detail, table, rowAction
  };
})();
