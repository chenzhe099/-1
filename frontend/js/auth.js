/**
 * 智慧农业管理系统 — 前端认证与权限控制模块
 * 提供登录/登出/角色权限检查功能
 */

const Auth = (() => {
  // ==================== 演示账号 ====================
  const DEMO_ACCOUNTS = [
    { username: 'admin', password: '123456', displayName: '系统管理员', role: 'admin', avatar: 'admin' },
    { username: 'farmer', password: '123456', displayName: '李农户', role: 'farmer', avatar: 'Li' }
  ];

  const STORAGE_KEY = 'smartfarm_auth';

  // ==================== 权限定义 ====================

  /**
   * 各角色可见的模块列表
   * admin: 全部11个模块
   * technician: 设备+农事+病虫害
   * farmer: 基础功能（仪表盘/病虫害/农事/天气/市场）
   * manager: 查看生产+市场
   */
  const ROLE_PERMISSIONS = {
    admin: {
      name: '管理员',
      modules: ['dashboard', 'disease', 'farming', 'prediction', 'management',
                'devices', 'traceability', 'permission', 'weather', 'market', 'monitor'],
      canEdit: true,
      canDelete: true,
      canAdd: true
    },
    technician: {
      name: '技术员',
      modules: ['dashboard', 'disease', 'farming', 'prediction', 'management',
                'devices', 'weather', 'market', 'monitor'],
      canEdit: true,
      canDelete: false,
      canAdd: true
    },
    farmer: {
      name: '农户',
      modules: ['dashboard', 'disease', 'farming', 'weather', 'market'],
      canEdit: false,
      canDelete: false,
      canAdd: false
    },
    manager: {
      name: '合作社管理人员',
      modules: ['dashboard', 'disease', 'farming', 'prediction', 'management',
                'traceability', 'weather', 'market'],
      canEdit: true,
      canDelete: false,
      canAdd: true
    }
  };

  // ==================== 状态管理 ====================

  let currentUser = null;

  function getUser() {
    if (currentUser) return currentUser;
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        currentUser = JSON.parse(stored);
        return currentUser;
      }
    } catch (e) { /* ignore */ }
    return null;
  }

  function setUser(user) {
    currentUser = user;
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  }

  function clearUser() {
    currentUser = null;
    sessionStorage.removeItem(STORAGE_KEY);
  }

  // ==================== 核心方法 ====================

  /**
   * 登录验证（前端演示版）
   */
  function login(username, password) {
    const account = DEMO_ACCOUNTS.find(
      a => a.username === username && a.password === password
    );
    if (!account) {
      return { success: false, message: '用户名或密码错误' };
    }
    const user = {
      id: account.username,
      username: account.username,
      displayName: account.displayName,
      role: account.role,
      avatar: account.avatar,
      loginTime: new Date().toISOString()
    };
    setUser(user);
    return { success: true, user: user };
  }

  function logout() {
    clearUser();
  }

  function isLoggedIn() {
    return getUser() !== null;
  }

  function getRole() {
    const user = getUser();
    return user ? user.role : null;
  }

  function getRoleName() {
    const role = getRole();
    return role ? (ROLE_PERMISSIONS[role]?.name || role) : '未登录';
  }

  /**
   * 检查当前用户是否可以查看某模块
   */
  function canView(moduleId) {
    const user = getUser();
    if (!user) return false;
    const perms = ROLE_PERMISSIONS[user.role];
    if (!perms) return false;
    return perms.modules.includes(moduleId);
  }

  function canEdit() {
    const user = getUser();
    if (!user) return false;
    return ROLE_PERMISSIONS[user.role]?.canEdit || false;
  }

  function canDelete() {
    const user = getUser();
    if (!user) return false;
    return ROLE_PERMISSIONS[user.role]?.canDelete || false;
  }

  function canAdd() {
    const user = getUser();
    if (!user) return false;
    return ROLE_PERMISSIONS[user.role]?.canAdd || false;
  }

  /**
   * 应用权限到UI：根据角色显示/隐藏元素
   */
  function applyPermissionUI() {
    const role = getRole();
    if (!role) return;

    const perms = ROLE_PERMISSIONS[role];
    if (!perms) return;

    // 侧边栏菜单项
    document.querySelectorAll('.sidebar-item[data-menu]').forEach(btn => {
      const menuId = btn.dataset.menu;
      if (!perms.modules.includes(menuId)) {
        btn.style.display = 'none';
      } else {
        btn.style.display = '';
      }
    });

    // 快捷操作按钮
    document.querySelectorAll('[data-menu]').forEach(btn => {
      if (btn.classList.contains('sidebar-item')) return;
      const menuId = btn.dataset.menu;
      if (menuId && !perms.modules.includes(menuId)) {
        btn.style.display = 'none';
      }
    });

    // 编辑/删除/新增类按钮（通过 data-action 属性控制）
    document.querySelectorAll('[data-action]').forEach(el => {
      const action = el.dataset.action;
      if (action === 'add' && !perms.canAdd) el.style.display = 'none';
      if (action === 'edit' && !perms.canEdit) el.style.display = 'none';
      if (action === 'delete' && !perms.canDelete) el.style.display = 'none';
      if (action === 'admin' && role !== 'admin') el.style.display = 'none';
    });

    // 更新侧边栏用户信息
    const userNameEl = document.querySelector('#btn-logout')?.closest('.flex')?.querySelector('.text-sm');
    const userRoleEl = document.querySelector('#btn-logout')?.closest('.flex')?.querySelector('.text-xs');
    if (userNameEl) userNameEl.textContent = getUser()?.displayName || '';
    if (userRoleEl) userRoleEl.textContent = getRoleName();
  }

  // ==================== 导出 ====================
  return {
    DEMO_ACCOUNTS,
    login, logout, isLoggedIn, getUser, getRole, getRoleName,
    canView, canEdit, canDelete, canAdd,
    applyPermissionUI
  };
})();
