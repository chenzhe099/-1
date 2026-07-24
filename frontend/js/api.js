/**
 * 智慧农业管理系统 — 后端 API 对接层
 * 替换模拟数据为真实 REST API 调用
 *
 * 使用方法：
 *   1. 确保后端运行在 http://localhost:8080
 *   2. 先调用 Api.login() 获取 token
 *   3. 其他 API 自动携带 token
 */

const Api = (() => {
  const BASE_URL = typeof API_URL !== 'undefined' ? API_URL : 'http://' + window.location.hostname + ':9090/api/v1';
  let token = localStorage.getItem('smartfarm_token') || '';

  // ==================== HTTP 封装 ====================

  async function request(method, path, body = null, isFormData = false) {
    const headers = {};
    if (!isFormData) headers['Content-Type'] = 'application/json';
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const config = { method, headers };
    if (body) config.body = isFormData ? body : JSON.stringify(body);

    const resp = await fetch(`${BASE_URL}${path}`, config);
    const data = await resp.json();

    if (!resp.ok) {
      throw new Error(data.message || `请求失败 (${resp.status})`);
    }
    return data; // { code: 200, message: "success", data: ... }
  }

  function get(path) { return request('GET', path); }
  function post(path, body) { return request('POST', path, body); }
  function put(path, body) { return request('PUT', path, body); }
  function del(path) { return request('DELETE', path); }

  // ==================== 认证 ====================

  async function login(username, password) {
    const res = await post('/auth/login', { username, password });
    if (res.data && res.data.token) {
      token = res.data.token;
      localStorage.setItem('smartfarm_token', token);
      localStorage.setItem('smartfarm_user', JSON.stringify(res.data));
    }
    return res;
  }

  function logout() {
    token = '';
    localStorage.removeItem('smartfarm_token');
    localStorage.removeItem('smartfarm_user');
  }

  function getCurrentUser() {
    const u = localStorage.getItem('smartfarm_user');
    return u ? JSON.parse(u) : null;
  }

  // ==================== 仪表盘 ====================
  const dashboard = {
    stats:     () => get('/dashboard/stats'),
    fields:    () => get('/dashboard/fields'),
    tasksToday:() => get('/dashboard/tasks/today'),
    alerts:    () => get('/dashboard/alerts'),
  };

  // ==================== 用户管理 ====================
  const users = {
    list:      () => get('/users'),
    get:       (id) => get(`/users/${id}`),
    create:    (u) => post('/users', u),
    update:    (id, u) => put(`/users/${id}`, u),
    delete:    (id) => del(`/users/${id}`),
    resetPwd:  (id, pwd) => put(`/users/${id}/reset-password`, { newPassword: pwd }),
  };

  // ==================== 农场与地块 ====================
  const farms = {
    list:      () => get('/farms'),
    get:       (id) => get(`/farms/${id}`),
    create:    (f) => post('/farms', f),
    update:    (id, f) => put(`/farms/${id}`, f),
    delete:    (id) => del(`/farms/${id}`),
    fields:    (farmId) => get(`/farms/${farmId}/fields`),
    createField:(f) => post('/farms/fields', f),
    updateField:(id, f) => put(`/farms/fields/${id}`, f),
    deleteField:(id) => del(`/farms/fields/${id}`),
    cycles:    (farmId) => get(`/farms/${farmId}/cycles`),
    activeCycles:() => get('/farms/cycles/active'),
    createCycle:(c) => post('/farms/cycles', c),
  };

  // ==================== 农事任务 ====================
  const tasks = {
    list:      (status) => get(`/tasks${status ? '?status=' + status : ''}`),
    get:       (id) => get(`/tasks/${id}`),
    create:    (t) => post('/tasks', t),
    update:    (id, t) => put(`/tasks/${id}`, t),
    delete:    (id) => del(`/tasks/${id}`),
  };

  // ==================== 设备管理 ====================
  const devices = {
    stats:     () => get('/devices/stats'),
    list:      () => get('/devices'),
    get:       (id) => get(`/devices/${id}`),
    create:    (d) => post('/devices', d),
    update:    (id, d) => put(`/devices/${id}`, d),
    delete:    (id) => del(`/devices/${id}`),
    maintenance:(id) => get(`/devices/${id}/maintenance`),
    createMaint:(m) => post('/devices/maintenance', m),
  };

  // ==================== 病虫害 ====================
  const disease = {
    records:   () => get('/disease/records'),
    getRecord: (id) => get(`/disease/records/${id}`),
    createRecord:(r) => post('/disease/records', r),
    updateRecord:(id, r) => put(`/disease/records/${id}`, r),
    knowledge: () => get('/disease/knowledge'),
    searchKB:  (kw) => get(`/disease/knowledge/search?keyword=${kw}`),
    regulations:() => get('/disease/regulations'),
    getReg:    (id) => get(`/disease/regulations/${id}`),
  };

  // ==================== 溯源管理 ====================
  const traceability = {
    stats:     () => get('/traceability/stats'),
    products:  () => get('/traceability/products'),
    getProduct:(id) => get(`/traceability/products/${id}`),
    createProduct:(p) => post('/traceability/products', p),
    timeline:  (id) => get(`/traceability/products/${id}/timeline`),
    certifications:(id) => get(`/traceability/products/${id}/certifications`),
    genCode:   (id) => post(`/traceability/products/${id}/trace-code`),
  };

  // ==================== 天气监测 ====================
  const weather = {
    stats:     () => get('/weather/stats'),
    trend:     () => get('/weather/trend'),
    forecast:  () => get('/weather/forecast'),
  };

  // ==================== 市场价格 ====================
  const market = {
    stats:     () => get('/market/stats'),
    trend:     (crop) => get(`/market/trend${crop ? '?crop=' + crop : ''}`),
    today:     () => get('/market/today'),
  };

  // ==================== 模型监控 ====================
  const monitor = {
    stats:     () => get('/monitor/stats'),
    models:    () => get('/monitor/models'),
    activeModels:() => get('/monitor/models/active'),
    getModel:  (id) => get(`/monitor/models/${id}`),
  };

  // ==================== 预警 ====================
  const alerts = {
    active:    () => get('/alerts'),
    all:       () => get('/alerts/all'),
    count:     () => get('/alerts/count'),
    resolve:   (id) => put(`/alerts/${id}/resolve`),
    logs:      () => get('/alerts/logs'),
  };

  // ==================== AI 智能服务 ====================
  const ai = {
    // 病虫害诊断（上传图片）
    diagnose:  (file, model = 'deepseek') => {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('model', model);
      return request('POST', '/disease/diagnose', fd, true);
    },
    // RAG 知识库检索
    ragSearch: (query, topK = 5) => post('/disease/rag/search', { query, topK }),
    // Agent 农事决策
    agentDecide: (params) => post('/farming/agent/decision', params),
    // 智能灌溉方案
    irrigationPlan: (params) => post('/farming/irrigation/ai-plan', params),
    // 智能施肥方案
    fertilizationPlan: (params) => post('/farming/fertilization/ai-plan', params),
    // 产量预测
    predictYield: (params) => post('/prediction/yield/ai-predict', params),
    // 市场行情分析
    marketAnalysis: (params) => post('/market/ai-analysis', params),
    // 溯源报告生成
    traceReport: (id, params) => post(`/traceability/products/${id}/ai-report`, params),
    // IoT 异常检测
    detectAnomaly: (data) => post('/monitor/anomaly/detect', data),
  };

  return {
    login, logout, getCurrentUser,
    dashboard, users, farms, tasks, devices,
    disease, traceability, weather, market, monitor, alerts, ai
  };
})();
