/**
 * 智慧农业管理系统 - API 客户端
 * 通过 HTTP 调用后端 REST API，连接 MySQL 数据库
 * 保持与 DataService 相同的方法签名，最小化前端改动
 */
const API_BASE = 'http://' + window.location.hostname + ':9090/api/v1';

class ApiClient {
  constructor() {
    this._token = localStorage.getItem('smartfarm_token');
    this._cache = {};
  }

  // ==================== Auth ====================

  setToken(token) {
    this._token = token;
    localStorage.setItem('smartfarm_token', token);
  }

  async login(username, password) {
    const resp = await this._post('/auth/login', { username, password });
    if (resp.token) {
      this.setToken(resp.token);
    }
    return resp;
  }

  async getCurrentUser() {
    return this._get('/auth/me');
  }

  // ==================== HTTP 底层 ====================

  async _fetch(path, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...(this._token ? { 'Authorization': 'Bearer ' + this._token } : {}),
      ...options.headers
    };
    try {
      const resp = await fetch(API_BASE + path, { ...options, headers, signal: AbortSignal.timeout(3000) });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(err.message || 'HTTP ' + resp.status);
      }
      const json = await resp.json();
      // 兼容 ApiResponse 包装格式 {code, message, data}
      return json.data !== undefined ? json.data : json;
    } catch (e) {
      if (e.message.includes('Failed to fetch') || e.message.includes('NetworkError')) {
        console.warn('[ApiClient] 后端不可用，回退到本地数据');
        return null;
      }
      throw e;
    }
  }

  async _get(path) { return this._fetch(path); }
  async _post(path, body) { return this._fetch(path, { method: 'POST', body: JSON.stringify(body) }); }
  async _put(path, body) { return this._fetch(path, { method: 'PUT', body: JSON.stringify(body) }); }
  async _delete(path) { return this._fetch(path, { method: 'DELETE' }); }

  // ==================== 通用表操作（映射到 GenericCrudController） ====================

  async getAll(table) {
    const mapped = this._mapTableName(table);
    return this._get('/' + mapped);
  }

  async getById(table, id) {
    const mapped = this._mapTableName(table);
    return this._get('/' + mapped + '/' + id);
  }

  table(tableName) {
    return new ApiQueryBuilder(this, this._mapTableName(tableName));
  }

  async insert(table, row) {
    const mapped = this._mapTableName(table);
    return this._post('/' + mapped, row);
  }

  async update(table, id, changes) {
    const mapped = this._mapTableName(table);
    return this._put('/' + mapped + '/' + id, changes);
  }

  async delete(table, id) {
    const mapped = this._mapTableName(table);
    return this._delete('/' + mapped + '/' + id);
  }

  // 表名映射（JSON文件名 -> 后端API路径）
  _mapTableName(name) {
    const map = {
      'users': 'users',
      'roles': 'roles',
      'crops': 'crops',
      'fields': 'fields',
      'farms': 'farms',
      'farming_tasks': 'farming_tasks',
      'devices': 'devices',
      'irrigation_plans': 'irrigation_plans',
      'fertilization_plans': 'fertilization_plans',
      'maintenance_records': 'maintenance_records',
      'disease_records': 'disease_records',
      'pest_knowledge_base': 'pest_knowledge_base',
      'products': 'products',
      'production_timeline': 'production_timeline',
      'quality_certifications': 'quality_certifications',
      'yield_predictions': 'yield_predictions',
      'environment_readings': 'environment_readings',
      'soil_readings': 'soil_readings',
      'alerts': 'alerts',
      'operation_logs': 'operation_logs',
      'inventory': 'inventory',
      'personnel': 'personnel',
      'planting_cycles': 'planting_cycles',
      'weather_records': 'weather_records',
      'market_prices': 'market_prices',
      'knowledge_documents': 'knowledge_documents',
      'model_versions': 'model_versions',
      'observations': 'observations',
      'agent_runs': 'agent_runs',
    };
    return map[name] || name;
  }

  // ==================== Dashboard（仪表盘） ====================

  async getDashboardStats() { return this._get('/dashboard/stats'); }
  async getFieldStatusList() { return this._get('/dashboard/fields'); }
  async getTodayTasks() { return this._get('/dashboard/tasks/today'); }
  async getAlertList() { return this._get('/dashboard/alerts'); }
  async getEnvironmentTrend() { return this._get('/dashboard/environment'); }

  // ==================== Disease（病虫害） ====================

  async getDiseaseHistory() { return this._get('/disease/records'); }
  async getKnowledgeBase() { return this._get('/disease/knowledge'); }
  async getDiseasePestTrend() { return this._get('/disease/trend'); }
  async searchKnowledge(keyword) { return this._get('/disease/knowledge/search?name=' + encodeURIComponent(keyword)); }

  /**
   * 上传图片进行病虫害诊断
   * @param {File} file - 图片文件
   * @param {string} [cropName] - 作物名称（可选）
   * @returns {Promise<Object>} 诊断结果 { diseaseName, confidence, severity, symptoms, treatment, description, isUnknown }
   */
  async diagnoseDisease(file, cropName) {
    const formData = new FormData();
    formData.append('file', file);
    if (cropName) {
      formData.append('cropName', cropName);
    }
    const headers = this._token ? { 'Authorization': 'Bearer ' + this._token } : {};
    // 不设置 Content-Type，让浏览器自动带 boundary
    try {
      const resp = await fetch(API_BASE + '/disease/diagnose', {
        method: 'POST',
        body: formData,
        headers,
        signal: AbortSignal.timeout(30000), // 图片识别可能较慢，30s超时
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ message: '诊断请求失败' }));
        throw new Error(err.message || 'HTTP ' + resp.status);
      }
      const json = await resp.json();
      return json.data !== undefined ? json.data : json;
    } catch (e) {
      if (e.message.includes('Failed to fetch') || e.message.includes('NetworkError')) {
        console.warn('[ApiClient] 后端不可用，诊断失败');
        return null;
      }
      throw e;
    }
  }

  // ==================== Farming（精准农事） ====================

  async getIrrigationPlans() { return this._get('/farming/irrigation'); }
  async getFertilizationPlans() { return this._get('/farming/fertilization'); }
  async getFarmingTasks() { return this._get('/farming/tasks'); }
  async getFieldManagementList() { return this._get('/farming/fields'); }
  async getFarmingProgress() { return this._get('/farming/stats'); }
  async createFarmingTask(task) { return this._post('/farming/tasks', task); }
  async updateFarmingTask(id, task) { return this._put('/farming/tasks/' + id, task); }
  async deleteFarmingTask(id) { return this._delete('/farming/tasks/' + id); }
  async executeIrrigation(id) { return this._post('/farming/irrigation/' + id + '/execute'); }

  // ==================== Prediction（产量预测） ====================

  async getYieldPredictionData() { return this._get('/prediction/yield'); }
  async getCropYieldPredictions() { return this._get('/prediction/crops'); }
  async getFarmingCalendar() { return this._get('/prediction/calendar'); }
  async getRiskAlerts() { return this._get('/prediction/risks'); }

  // ==================== Management（农场管理） ====================

  async getManagementStats() { return this._get('/management/stats'); }
  async getFarmRecords() { return this._get('/management/records'); }
  async getPersonnelList() { return this._get('/management/personnel'); }
  async getInventoryList() { return this._get('/management/inventory'); }
  async getFarmList() { return this._get('/management/farms'); }
  async getFarmById(id) { return this._get('/management/farms/' + id); }
  async getPlantingCycles() { return this._get('/management/cycles'); }

  // ==================== Devices（设备监控） ====================

  async getDeviceStatusSummary() { return this._get('/devices/summary'); }
  async getDeviceList() { return this._get('/devices'); }
  async getDeviceById(id) { return this._get('/devices/' + id); }
  async getMaintenanceList() { return this._get('/devices/maintenance'); }
  async createMaintenance(record) { return this._post('/devices/maintenance', record); }

  // ==================== Traceability（溯源管理） ====================

  async getTraceabilityStats() { return this._get('/traceability/stats'); }
  async getProductList() { return this._get('/traceability/products'); }
  async getProductById(id) { return this._get('/traceability/products/' + id); }
  async getProductionTimeline(productId) { return this._get('/traceability/products/' + productId + '/timeline'); }
  async getQualityCertifications(productId) { return this._get('/traceability/products/' + productId + '/certifications'); }

  // ==================== Permission（权限管理） ====================

  async getPermissionStats() { return this._get('/permission/stats'); }
  async getUserList() { return this._get('/permission/users'); }
  async addUser(user) { return this._post('/permission/users', user); }
  async editUser(id, user) { return this._put('/permission/users/' + id, user); }
  async resetPassword(id) { return this._put('/permission/users/' + id + '/reset-password'); }
  async disableUser(id) { return this._delete('/permission/users/' + id); }
  async getRoleList() { return this._get('/permission/roles'); }
  async getOperationLogs() { return this._get('/permission/logs'); }

  // ==================== Weather（天气监测） ====================

  async getWeatherStats() { return this._get('/weather/stats'); }
  async getWeatherTrend() { return this._get('/weather/trend'); }
  async getWeatherForecast() { return this._get('/weather/forecast'); }
  async getWeatherAlerts() { return this._get('/weather/alerts'); }

  // ==================== Market（市场价格） ====================

  async getMarketStats() { return this._get('/market/stats'); }
  async getMarketPriceTrend(crop) { return this._get('/market/trend' + (crop && crop !== 'all' ? '?crop=' + encodeURIComponent(crop) : '')); }
  async getMarketAlerts() { return this._get('/market/alerts'); }

  // ==================== Model Monitor（模型监控） ====================

  async getModelStats() { return this._get('/monitor/stats'); }
  async getModelVersionList() { return this._get('/monitor/versions'); }
  async getModelPerformanceTrend() { return this._get('/monitor/performance'); }

  // ==================== File Upload（文件上传） ====================

  async uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);
    const headers = this._token ? { 'Authorization': 'Bearer ' + this._token } : {};
    try {
      const resp = await fetch(API_BASE + '/files/upload', { method: 'POST', body: formData, headers });
      const json = await resp.json();
      return json.data !== undefined ? json.data : json;
    } catch (e) {
      console.warn('[ApiClient] 文件上传失败:', e);
      return null;
    }
  }
}

// ==================== API Query Builder ====================

class ApiQueryBuilder {
  constructor(client, table) {
    this._client = client;
    this._table = table;
    this._filters = [];
  }

  where(field, op, value) {
    this._filters.push({ field, op, value });
    return this;
  }

  async get() {
    let path = '/' + this._table;
    if (this._filters.length > 0) {
      const params = this._filters.map(f => f.field + '=' + f.op + ':' + f.value).join('&');
      path += '?' + params;
    }
    return this._client._get(path);
  }

  async first() {
    const results = await this.get();
    return Array.isArray(results) ? results[0] || null : results;
  }

  async count() {
    const results = await this.get();
    return Array.isArray(results) ? results.length : 0;
  }
}

// 全局单例
const apiClient = new ApiClient();
