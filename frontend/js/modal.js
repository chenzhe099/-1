/**
 * 智慧农业管理系统 - 通用弹窗组件
 * 替代浏览器原生 prompt/alert/confirm，提供统一的弹窗体验
 */

class Modal {
  constructor() {
    this._overlay = null;
    this._panel = null;
    this._resolve = null;
    this._closed = false;
  }

  /** 打开弹窗 */
  _open(content, options = {}) {
    this._closed = false;
    const width = options.width || 'max-w-lg';
    const closable = options.closable !== false;

    // 创建遮罩
    this._overlay = document.createElement('div');
    this._overlay.className = 'fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 modal-overlay';
    this._overlay.innerHTML = `
      <div class="bg-white rounded-2xl shadow-2xl ${width} w-full max-h-[85vh] flex flex-col modal-panel animate-modal-in">
        ${options.title ? `
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 class="text-lg font-semibold text-gray-800">${options.title}</h3>
          ${closable ? '<button class="p-1 hover:bg-gray-100 rounded-lg transition-colors modal-close-btn"><i class="fa fa-times text-gray-400"></i></button>' : ''}
        </div>` : ''}
        <div class="flex-1 overflow-y-auto p-6 modal-body">${content}</div>
        ${options.footer ? `<div class="px-6 py-4 border-t border-gray-100 flex justify-end space-x-3 modal-footer">${options.footer}</div>` : ''}
      </div>`;

    document.body.appendChild(this._overlay);

    // 点击遮罩关闭
    if (closable) {
      this._overlay.addEventListener('click', (e) => {
        if (e.target === this._overlay) this.close();
      });
    }

    // 关闭按钮
    const closeBtn = this._overlay.querySelector('.modal-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close());
    }

    // ESC 关闭
    this._escHandler = (e) => { if (e.key === 'Escape') this.close(); };
    document.addEventListener('keydown', this._escHandler);

    return this._overlay;
  }

  close(result) {
    if (this._closed) return;
    this._closed = true;

    if (this._resolve) {
      this._resolve(result);
      this._resolve = null;
    }

    if (this._overlay) {
      this._overlay.classList.add('modal-fade-out');
      setTimeout(() => {
        if (this._overlay && this._overlay.parentNode) {
          this._overlay.parentNode.removeChild(this._overlay);
        }
      }, 200);
    }

    document.removeEventListener('keydown', this._escHandler);
  }

  // ==================== 表单弹窗 ====================

  /**
   * 显示表单弹窗
   * @param {Object} options
   * @param {string} options.title - 弹窗标题
   * @param {Array} options.fields - 字段定义 [{name, label, type, placeholder, required, options:[{value,label}], value}]
   * @param {Function} options.onSubmit - 提交回调 (formData) => void
   * @param {string} options.submitLabel - 提交按钮文字
   * @param {string} options.width - 宽度
   */
  form(options) {
    const fields = options.fields || [];
    const formHtml = fields.map(f => this._renderField(f)).join('');

    const footer = `
      <button class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors modal-cancel-btn text-sm">取消</button>
      <button class="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors modal-submit-btn text-sm">${options.submitLabel || '确定'}</button>
    `;

    const el = this._open(formHtml, {
      title: options.title,
      width: options.width || 'max-w-md',
      footer
    });

    // 取消
    el.querySelector('.modal-cancel-btn').addEventListener('click', () => this.close());

    // 提交
    el.querySelector('.modal-submit-btn').addEventListener('click', () => {
      const data = {};
      let valid = true;
      fields.forEach(f => {
        const input = el.querySelector(`[name="${f.name}"]`);
        if (input) {
          if (f.type === 'checkbox') {
            data[f.name] = input.checked;
          } else {
            data[f.name] = input.value.trim();
          }
          if (f.required && !data[f.name]) {
            valid = false;
            input.style.borderColor = '#ef4444';
            setTimeout(() => { input.style.borderColor = ''; }, 2000);
          }
        }
      });
      if (!valid) {
        showToast('请填写必填字段', 'warning');
        return;
      }
      if (options.onSubmit) {
        options.onSubmit(data);
      }
      this.close();
    });

    return el;
  }

  _renderField(f) {
    const label = f.label || f.name;
    const req = f.required ? ' <span class="text-red-400">*</span>' : '';

    switch (f.type) {
      case 'select':
        const opts = (f.options || []).map(o =>
          `<option value="${o.value}" ${o.value === f.value ? 'selected' : ''}>${o.label}</option>`
        ).join('');
        return `
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">${label}${req}</label>
            <select name="${f.name}" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white">${opts}</select>
            ${f.hint ? `<p class="text-xs text-gray-400 mt-1">${f.hint}</p>` : ''}
          </div>`;

      case 'textarea':
        return `
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">${label}${req}</label>
            <textarea name="${f.name}" rows="${f.rows || 3}" placeholder="${f.placeholder || ''}" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none">${f.value || ''}</textarea>
          </div>`;

      case 'checkbox':
        return `
          <div class="mb-4 flex items-center">
            <input type="checkbox" name="${f.name}" ${f.value ? 'checked' : ''} class="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500">
            <label class="ml-2 text-sm text-gray-700">${f.label}</label>
          </div>`;

      default:
        return `
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">${label}${req}</label>
            <input type="${f.type || 'text'}" name="${f.name}" value="${f.value || ''}" placeholder="${f.placeholder || ''}" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" ${f.readonly ? 'readonly' : ''}>
            ${f.hint ? `<p class="text-xs text-gray-400 mt-1">${f.hint}</p>` : ''}
          </div>`;
    }
  }

  // ==================== 确认弹窗 ====================

  confirm(title, message) {
    return new Promise((resolve) => {
      const body = `<div class="text-center py-4">
        <div class="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <i class="fa fa-question text-orange-500 text-2xl"></i>
        </div>
        <p class="text-gray-700 text-sm leading-relaxed">${message}</p>
      </div>`;
      const footer = `
        <button class="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors modal-cancel-btn text-sm">取消</button>
        <button class="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors modal-confirm-btn text-sm">确认</button>
      `;

      this._resolve = resolve;
      const el = this._open(body, { title, width: 'max-w-sm', footer });
      el.querySelector('.modal-cancel-btn').addEventListener('click', () => this.close(false));
      el.querySelector('.modal-confirm-btn').addEventListener('click', () => this.close(true));
    });
  }

  // ==================== 详情/信息弹窗 ====================

  /**
   * 显示信息详情弹窗
   * @param {Object} options
   * @param {string} options.title
   * @param {string} options.body - HTML content
   * @param {string} options.width
   */
  detail(options) {
    const footer = `<button class="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors modal-close-btn text-sm">关闭</button>`;
    return this._open(options.body, {
      title: options.title,
      width: options.width || 'max-w-2xl',
      footer
    });
  }

  // ==================== 表格列表弹窗 ====================

  /**
   * 显示列表/表格弹窗
   * @param {Object} options
   * @param {string} options.title
   * @param {Array} options.columns - [{key, label, width}]
   * @param {Array} options.rows - 数据行
   * @param {Function} options.rowRenderer - 可选，自定义行渲染 (row, columns) => html
   */
  table(options) {
    const cols = options.columns || [];
    const rows = options.rows || [];

    const thead = cols.length > 0 ? `
      <thead>
        <tr class="bg-gray-50">
          ${cols.map(c => `<th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">${c.label}</th>`).join('')}
        </tr>
      </thead>` : '';

    const tbody = rows.length > 0 ? `
      <tbody class="divide-y divide-gray-100">
        ${options.rowRenderer
          ? rows.map(r => options.rowRenderer(r, cols)).join('')
          : rows.map(r => `
            <tr class="hover:bg-gray-50">
              ${cols.map(c => `<td class="px-4 py-3 text-sm text-gray-700">${r[c.key] !== undefined ? r[c.key] : '--'}</td>`).join('')}
            </tr>`).join('')}
      </tbody>` : `
      <tbody><tr><td colspan="${cols.length}" class="px-4 py-8 text-center text-gray-400">暂无数据</td></tr></tbody>`;

    const body = `<div class="overflow-x-auto"><table class="w-full">${thead}${tbody}</table></div>`;

    const footer = `<button class="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors modal-close-btn text-sm">关闭</button>`;
    return this._open(body, { title: options.title, width: 'max-w-3xl', footer });
  }
}

// 全局单例
const modal = new Modal();
