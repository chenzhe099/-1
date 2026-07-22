/**
 * 智慧农业管理系统 - API 客户端
 * 替代内存 DataService，通过 HTTP 调用后端 REST API
 * 保持与 DataService 相同的方法签名，最小化前端改动
 */
const API_BASE = '/api/v1';

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

  // ==================== HTTP 底层 ====================

  async _fetch(path, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...(this._token ? { 'Authorization': 'Bearer ' + this._token } : {}),
      ...options.headers
    };
    try {
      const resp = await fetch(API_BASE + path, { ...options, headers });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(err.message || 'HTTP ' + resp.status);
      }
      const json = await resp.json();
      return json.data !== undefined ? json.data : json;
    } catch (e) {
      if (e.message.includes('Failed to fetch') || e.message.includes('NetworkError')) {
        console.warn('[ApiClient] Backend unavailable, falling back to local data');
        return null;
      }
      throw e;
    }
  }

  async _get(path) { return this._fetch(path); }
  async _post(path, body) { return this._fetch(path, { method: 'POST', body: JSON.stringify(body) }); }
  async _put(path, body) { return this._fetch(path, { method: 'PUT', body: JSON.stringify(body) }); }
  async _delete(path) { return this._fetch(path, { method: 'DELETE' }); }

  // ==================== 通用表操作 ====================

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

  _mapTableName(name) {
    const map = {
      'farming_tasks': 'farming_tasks',
      'irrigation_plans': 'irrigation_plans',
      'fertilization_plans': 'fertilization_plans',
      'maintenance_records': 'maintenance_records',
      'disease_records': 'disease_records',
      'pest_knowledge_base': 'pest_knowledge_base',
      'production_timeline': 'production_timeline',
      'quality_certifications': 'quality_certifications',
      'yield_predictions': 'yield_predictions',
      'environment_readings': 'environment_readings',
      'soil_readings': 'soil_readings',
      'operation_logs': 'operation_logs',
      'planting_cycles': 'planting_cycles',
      'weather_records': 'weather_records',
      'market_prices': 'market_prices',
      'knowledge_documents': 'knowledge_documents',
      'model_versions': 'model_versions',
    };
    return map[name] || name;
  }

  // ==================== Dashboard ====================

  async getDashboardStats() { return this._get('/dashboard/stats'); }
  async getFieldStatusList() { return this._get('/dashboard/fields'); }
  async getTodayTasks() { return this._get('/dashboard/tasks/today'); }
  async getAlertList() { return this._get('/dashboard/alerts'); }
  async getEnvironmentTrend() { return this._get('/dashboard/environment'); }

  // ==================== Disease ====================

  async getDiseaseHistory() { return this._get('/disease/records'); }
  async getKnowledgeBase() { return this._get('/disease/knowledge'); }
  async getDiseasePestTrend() { return this._get('/disease/trend'); }

  // ==================== Farming ====================

  async getIrrigationPlans() { return this._get('/farming/irrigation'); }
  async getFertilizationPlans() { return this._get('/farming/fertilization'); }
  async getFarmingTasks() { return this._get('/farming/tasks'); }
  async getFieldManagementList() { return this._get('/farming/fields'); }
  async getFarmingProgress() { return this._get('/farming/stats'); }

  // ==================== Prediction ====================

  async getYieldPredictionData() { return this._get('/prediction/yield'); }
  async getCropYieldPredictions() { return this._get('/prediction/crops'); }
  async getFarmingCalendar() { return this._get('/prediction/calendar'); }
  async getRiskAlerts() { return this._get('/prediction/risks'); }

  // ==================== Management ====================

  async getManagementStats() { return this._get('/management/stats'); }
  async getFarmRecords() { return this._get('/management/records'); }
  async getPersonnelList() { return this._get('/management/personnel'); }
  async getInventoryList() { return this._get('/management/inventory'); }
  async getFarmList() { return this._get('/management/farms'); }
  async getPlantingCycles() { return this._get('/management/cycles'); }
  async getProfitTrend() { return this._get('/management/stats'); }

  // ==================== Devices ====================

  async getDeviceStatusSummary() { return this._get('/devices/summary'); }
  async getDeviceList() { return this._get('/devices'); }
  async getMaintenanceList() { return this._get('/devices/maintenance'); }

  // ==================== Traceability ====================

  async getTraceabilityStats() { return this._get('/traceability/stats'); }
  async getProductList() { return this._get('/traceability/products'); }
  async getProductionTimeline(productId) { return this._get('/traceability/products/' + productId + '/timeline'); }
  async getQualityCertifications(productId) { return this._get('/traceability/products/' + productId + '/certifications'); }

  // ==================== Permission ====================

  async getPermissionStats() { return this._get('/permission/stats'); }
  async getUserList() { return this._get('/permission/users'); }
  async getRoleList() { return this._get('/permission/roles'); }
  async getOperationLogs() { return this._get('/permission/logs'); }

  // ==================== Weather ====================

  async getWeatherStats() { return this._get('/weather/stats'); }
  async getWeatherTrend() { return this._get('/weather/trend'); }
  async getWeatherForecast() { return this._get('/weather/forecast'); }
  async getWeatherAlerts() { return this._get('/weather/alerts'); }

  // ==================== Market ====================

  async getMarketStats() { return this._get('/market/stats'); }
  async getMarketPriceTrend() { return this._get('/market/trend'); }
  async getMarketAlerts() { return this._get('/market/alerts'); }

  // ==================== Model Monitor ====================

  async getModelStats() { return this._get('/monitor/stats'); }
  async getModelVersionList() { return this._get('/monitor/versions'); }
  async getModelPerformanceTrend() { return this._get('/monitor/performance'); }
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

// ==================== Global ====================

const apiClient = new ApiClient();
