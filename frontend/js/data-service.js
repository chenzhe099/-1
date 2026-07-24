/**
 * 智慧农业管理系统 - 数据服务层
 * 提供内存数据库的查询、聚合、关联查询接口
 * 模拟关系型数据库的常用操作
 */

// ==================== QueryBuilder ====================
class QueryBuilder {
  constructor(data) {
    this._data = Array.isArray(data) ? [...data] : [];
    this._predicates = [];
    this._orderByField = null;
    this._orderDir = 'asc';
    this._limitVal = null;
    this._offsetVal = 0;
  }

  where(field, op, value) {
    this._predicates.push({ field, op, value });
    return this;
  }

  orderBy(field, dir = 'asc') {
    this._orderByField = field;
    this._orderDir = dir;
    return this;
  }

  limit(n) {
    this._limitVal = n;
    return this;
  }

  offset(n) {
    this._offsetVal = n;
    return this;
  }

  _filter() {
    let result = this._data;
    for (const p of this._predicates) {
      result = result.filter(row => {
        const val = row[p.field];
        switch (p.op) {
          case 'eq':  return val === p.value;
          case 'neq': return val !== p.value;
          case 'gt':  return val > p.value;
          case 'gte': return val >= p.value;
          case 'lt':  return val < p.value;
          case 'lte': return val <= p.value;
          case 'in':  return Array.isArray(p.value) && p.value.includes(val);
          case 'contains': return typeof val === 'string' && val.includes(p.value);
          default: return true;
        }
      });
    }
    if (this._orderByField) {
      result.sort((a, b) => {
        const va = a[this._orderByField], vb = b[this._orderByField];
        if (va < vb) return this._orderDir === 'asc' ? -1 : 1;
        if (va > vb) return this._orderDir === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return result;
  }

  get() {
    let result = this._filter();
    if (this._offsetVal > 0) result = result.slice(this._offsetVal);
    if (this._limitVal !== null) result = result.slice(0, this._limitVal);
    return result;
  }

  first() {
    return this.get()[0] || null;
  }

  count() {
    return this._filter().length;
  }
}

// ==================== DataService ====================
class DataService {
  constructor() {
    this._tables = {};
    this._ready = false;
  }

  // ---- 生命周期 ----

  /** 加载所有数据表 */
  loadAll(dataBundle) {
    this._tables = dataBundle;
    this._ready = true;
    this._buildIndexes();
  }

  isReady() { return this._ready; }

  /** 注册单张表（用于增量加载或动态添加） */
  registerTable(name, rows) {
    this._tables[name] = rows;
  }

  // ---- 表级别操作 ----

  /** 获取查询构建器 */
  table(name) {
    const data = this._tables[name];
    if (!data) {
      console.warn(`[DataService] 表 "${name}" 不存在`);
      return new QueryBuilder([]);
    }
    return new QueryBuilder(data);
  }

  /** 获取全表数据 */
  getAll(table) {
    return [...(this._tables[table] || [])];
  }

  /** 按ID获取单行 */
  getById(table, id) {
    return (this._tables[table] || []).find(r => r.id === id) || null;
  }

  /** 获取关联行 (JOIN) */
  getRelated(table, id, fkTable, fkField) {
    const rows = this._tables[fkTable] || [];
    return rows.filter(r => r[fkField] === id);
  }

  /** 统计行数 */
  count(table, predicateFn) {
    let rows = this._tables[table] || [];
    if (typeof predicateFn === 'function') rows = rows.filter(predicateFn);
    return rows.length;
  }

  /** 求和 */
  sum(table, field, predicateFn) {
    let rows = this._tables[table] || [];
    if (typeof predicateFn === 'function') rows = rows.filter(predicateFn);
    return rows.reduce((s, r) => s + (Number(r[field]) || 0), 0);
  }

  /** 平均数 */
  avg(table, field, predicateFn) {
    let rows = this._tables[table] || [];
    if (typeof predicateFn === 'function') rows = rows.filter(predicateFn);
    if (rows.length === 0) return 0;
    return rows.reduce((s, r) => s + (Number(r[field]) || 0), 0) / rows.length;
  }

  // ---- 更新操作（先写内存 → 再同步 MySQL） ----

  update(table, id, changes) {
    const row = (this._tables[table] || []).find(r => r.id === id);
    if (!row) return false;
    const oldValues = { ...row };
    Object.assign(row, changes);
    // 异步同步到后端 MySQL
    this._syncToBackend('update', table, id, changes, oldValues);
    return true;
  }

  insert(table, row) {
    if (!this._tables[table]) this._tables[table] = [];
    this._tables[table].push(row);
    // 异步同步到后端 MySQL
    this._syncToBackend('insert', table, row.id, row, null);
    return row;
  }

  delete(table, id) {
    const arr = this._tables[table];
    if (!arr) return false;
    const idx = arr.findIndex(r => r.id === id);
    if (idx >= 0) {
      const deleted = arr.splice(idx, 1)[0];
      // 异步同步到后端 MySQL
      this._syncToBackend('delete', table, id, null, deleted);
      return true;
    }
    return false;
  }

  // 后台异步同步到 MySQL（失败回滚内存数据）
  async _syncToBackend(action, table, id, data, fallback) {
    try {
      if (typeof apiClient === 'undefined') return;
      if (action === 'update') {
        await apiClient.update(table, id, data);
      } else if (action === 'insert') {
        await apiClient.insert(table, data);
      } else if (action === 'delete') {
        await apiClient.delete(table, id);
      }
    } catch (e) {
      console.warn('[DataService] MySQL 同步失败 (' + action + ' ' + table + '/' + id + '): ' + e.message);
      // API 失败时回滚内存数据
      if (action === 'update' && fallback) {
        const row = (this._tables[table] || []).find(r => r.id === id);
        if (row) Object.assign(row, fallback);
      } else if (action === 'delete' && fallback) {
        if (!this._tables[table]) this._tables[table] = [];
        this._tables[table].push(fallback);
      } else if (action === 'insert') {
        const arr = this._tables[table];
        if (arr) {
          const idx = arr.findIndex(r => r.id === id);
          if (idx >= 0) arr.splice(idx, 1);
        }
      }
    }
  }

  // ---- 内部方法 ----

  _buildIndexes() {
    // 预留：构建ID索引以加速getById查询
  }

  // ==================== 计算属性：仪表盘 ====================

  getDashboardStats() {
    const today = '2024-01-15';
    const tasksToday = this.table('farming_tasks')
      .where('scheduledTime', 'contains', today).count();
    const devices = this.getAll('devices');
    const onlineCount = devices.filter(d => d.status === 'online').length;
    const alerts = this.table('alerts').where('isResolved', 'eq', false).count();
    const yieldData = this.table('yield_predictions')
      .where('month', 'eq', '2024-06').first();

    return {
      tasksToday,
      tasksChange: '+12%',
      deviceOnlineRate: Math.round((onlineCount / devices.length) * 100),
      deviceChange: '+2%',
      alertCount: alerts,
      monthlyYield: yieldData ? yieldData.predicted : 135,
      yieldUnit: '吨',
      yieldChange: '+8%'
    };
  }

  getFieldStatusList() {
    return this.getAll('fields').map(f => ({
      code: f.code,
      name: f.name,
      cropName: f.cropName,
      status: f.status,
      moisture: f.soilMoisture
    }));
  }

  getTodayTasks() {
    var today = '2024-01-15';
    var rank = { high: 3, medium: 2, low: 1 };
    var statusRank = { in_progress: 4, pending: 3, completed: 2, cancelled: 1 };
    return this.table('farming_tasks')
      .where('scheduledTime', 'contains', today)
      .get()
      .sort(function (a, b) {
        var rp = (rank[b.priority] || 0) - (rank[a.priority] || 0);
        if (rp !== 0) return rp;
        var rs = (statusRank[b.status] || 0) - (statusRank[a.status] || 0);
        if (rs !== 0) return rs;
        return (a.scheduledTime || '').localeCompare(b.scheduledTime || '');
      });
  }

  getAlertList() {
    return this.table('alerts')
      .where('isResolved', 'eq', false)
      .orderBy('createdAt', 'desc')
      .get();
  }

  // ==================== 计算属性：病虫害 ====================

  getDiseaseHistory() {
    return this.getAll('disease_records');
  }

  getKnowledgeBase() {
    return this.getAll('pest_knowledge_base');
  }

  getDiseaseByName(name) {
    return this.table('pest_knowledge_base')
      .where('name', 'contains', name)
      .first();
  }

  // ==================== 计算属性：精准农事 ====================

  getIrrigationPlans() {
    return this.getAll('irrigation_plans');
  }

  getFertilizationPlans() {
    return this.getAll('fertilization_plans');
  }

  getFarmingStats() {
    const plans = this.getAll('irrigation_plans');
    const completed = plans.filter(p => p.status === 'completed');
    const todayIrrigation = completed.reduce((s, p) => s + p.waterVolume, 0);
    const fertPlans = this.getAll('fertilization_plans');
    const fertCompleted = fertPlans.filter(p => p.status === 'completed');
    const todayFert = fertCompleted.reduce((s, p) => s + p.nKg + p.pKg + p.kKg + p.organicKg, 0);

    return {
      todayIrrigation: 128, // m³ (aggregate from all active irrigation)
      todayFertilizer: 45,  // kg
      waterSavingRate: 32,  // %
      fertEfficiency: 85    // %
    };
  }

  getFieldManagementList() {
    return this.getAll('fields');
  }

  getFarmingTasks() {
    return this.getAll('farming_tasks').sort((a, b) =>
      (a.scheduledTime || '').localeCompare(b.scheduledTime || ''));
  }

  // ==================== 计算属性：产量预测 ====================

  getYieldPredictionData() {
    const data = this.getAll('yield_predictions');
    const labels = data.map(d => {
      const [y, m] = d.month.split('-');
      return `${parseInt(m)}月`;
    });
    const actual = data.map(d => d.actual);
    const predicted = data.map(d => d.predicted);
    return { labels, actual, predicted };
  }

  getCropYieldPredictions() {
    return this.getAll('fields').map(f => {
      const product = this.table('products')
        .where('fieldId', 'eq', f.id).first();
      return {
        cropName: f.cropName,
        fieldCode: f.code,
        stage: f.status === 'growing' ? '生长中' : '预计采收',
        yieldTons: product ? product.quantityTons : 0,
        change: f.status === 'growing' ? (Math.random() > 0.5 ? '+' : '-') + Math.floor(Math.random() * 15) + '%' : '+8%'
      };
    });
  }

  getFarmingCalendar() {
    return this.table('farming_tasks')
      .where('status', 'neq', 'completed')
      .orderBy('scheduledTime', 'asc')
      .get();
  }

  getRiskAlerts() {
    return this.getAll('alerts');
  }

  // ==================== 计算属性：农场管理 ====================

  getManagementStats() {
    return {
      totalRecords: this.count('farming_tasks'),
      personnelCount: this.count('personnel'),
      equipmentCount: this.count('devices'),
      inventoryValue: 45800
    };
  }

  getFarmRecords() {
    return this.table('farming_tasks')
      .where('status', 'eq', 'completed')
      .orderBy('completedAt', 'desc')
      .limit(4)
      .get();
  }

  getPersonnelList() {
    return this.getAll('personnel');
  }

  getInventoryList() {
    return this.getAll('inventory');
  }

  getProfitTrend() {
    return {
      labels: ['1月', '2月', '3月', '4月', '5月'],
      profit: [85000, 92000, 88000, 95000, 102000]
    };
  }

  // ==================== 计算属性：设备监控 ====================

  getDeviceStatusSummary() {
    const devices = this.getAll('devices');
    return {
      total: devices.length,
      online: devices.filter(d => d.status === 'online').length,
      fault: devices.filter(d => d.status === 'fault').length,
      maintenance: this.table('maintenance_records')
        .where('status', 'eq', 'pending').count()
    };
  }

  getDeviceList() {
    return this.getAll('devices');
  }

  getMaintenanceList() {
    return this.getAll('maintenance_records');
  }

  // ==================== 计算属性：溯源管理 ====================

  getTraceabilityStats() {
    return {
      productCount: this.count('products'),
      recordCount: this.count('production_timeline'),
      scanCount: 5234,
      certCount: this.count('quality_certifications')
    };
  }

  getProductList() {
    return this.getAll('products');
  }

  getProductionTimeline(productId) {
    return this.table('production_timeline')
      .where('productId', 'eq', productId)
      .orderBy('date', 'asc')
      .get();
  }

  getQualityCertifications(productId) {
    return this.table('quality_certifications')
      .where('productId', 'eq', productId)
      .get();
  }

  // ==================== 计算属性：权限管理 ====================

  getPermissionStats() {
    const users = this.getAll('users');
    const roles = this.getAll('roles');
    return {
      totalUsers: users.length,
      adminCount: users.filter(u => u.role === 'admin' && u.status === 'active').length,
      technicianCount: users.filter(u => u.role === 'technician' && u.status === 'active').length,
      farmerCount: users.filter(u => u.role === 'farmer' && u.status === 'active').length
    };
  }

  getUserList() {
    return this.getAll('users');
  }

  getRoleList() {
    return this.getAll('roles').map(r => ({
      ...r,
      userCount: this.table('users').where('role', 'eq', r.id).count()
    }));
  }

  getOperationLogs() {
    return this.getAll('operation_logs').sort((a, b) =>
      (b.timestamp || '').localeCompare(a.timestamp || ''));
  }

  // ==================== 计算属性：图表数据 ====================

  getEnvironmentTrend() {
    const readings = this.table('environment_readings')
      .where('deviceId', 'eq', 'dev_04')
      .orderBy('timestamp', 'asc')
      .get();
    return {
      labels: readings.map(r => r.timestamp.slice(11, 16)),
      temperature: readings.map(r => r.temperature),
      humidity: readings.map(r => r.humidity)
    };
  }

  getSoilMoistureTrend() {
    const readings = this.getAll('soil_readings').sort((a, b) =>
      (a.timestamp || '').localeCompare(b.timestamp || ''));
    return {
      labels: readings.map(r => r.timestamp.slice(11, 16)),
      moisture: readings.map(r => r.moisture)
    };
  }

  getSoilNutrientData() {
    const latest = this.table('soil_readings')
      .orderBy('timestamp', 'desc')
      .first();
    if (!latest) return { n: 85, p: 72, k: 78, organic: 65 };
    return { n: latest.nLevel, p: latest.pLevel, k: latest.kLevel, organic: 65 };
  }

  getCostComparison() {
    return {
      labels: ['1月', '2月', '3月', '4月'],
      traditional: [22000, 24000, 21000, 23000],
      aiOptimized: [18650, 20500, 17800, 19200]
    };
  }

  getCropDistribution() {
    return {
      labels: ['番茄', '黄瓜', '玉米', '小麦', '茄子', '其他'],
      data: [35, 25, 20, 10, 5, 5]
    };
  }

  getDiseasePestTrend() {
    return {
      labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
      disease: [15, 12, 8, 6, 10, 12],
      pest: [10, 8, 12, 15, 11, 8]
    };
  }

  getFarmingProgress() {
    return [
      { name: '灌溉作业', progress: 85 },
      { name: '施肥作业', progress: 60 },
      { name: '喷药作业', progress: 100 },
      { name: '修剪作业', progress: 30 }
    ];
  }

  getProfitRate() {
    return {
      labels: ['化肥', '灌溉', '农药'],
      data: [35, 45, 20]
    };
  }

  getInputDistribution() {
    return {
      labels: ['农资', '人工', '设备', '其他'],
      data: [45, 30, 15, 10]
    };
  }

  getOutputDistribution() {
    return {
      labels: ['番茄', '黄瓜', '玉米', '小麦'],
      data: [45, 32, 38, 13]
    };
  }

  // ==================== 计算属性：天气监测 ====================

  getWeatherStats() {
    const records = this.getAll('weather_records');
    const today = records[records.length - 1] || {};
    const yesterday = records[records.length - 2] || {};
    return {
      todayTemp: today.temperatureHigh + '° / ' + today.temperatureLow + '°',
      tempChange: yesterday.temperatureHigh ? ((today.temperatureHigh - yesterday.temperatureHigh) > 0 ? '+' : '') + (today.temperatureHigh - yesterday.temperatureHigh).toFixed(1) + '°' : '--',
      todayRainfall: (today.rainfall_mm || 0) + 'mm',
      rainfallDesc: (today.rainfall_mm || 0) > 5 ? '有降雨' : '无降雨',
      todayHumidity: (today.humidity || 0) + '%',
      todayWind: (today.windSpeed || 0) + 'm/s',
      condition: today.condition || '--',
      conditionLabel: { sunny: '晴', cloudy: '多云', rain: '雨', snow: '雪' }[today.condition] || today.condition || '--'
    };
  }

  getWeatherTrend() {
    const records = this.getAll('weather_records');
    return {
      labels: records.map(r => r.date.slice(5)),
      temperatureHigh: records.map(r => r.temperatureHigh),
      temperatureLow: records.map(r => r.temperatureLow),
      humidity: records.map(r => r.humidity),
      rainfall: records.map(r => r.rainfall_mm)
    };
  }

  getWeatherForecast() {
    return this.getAll('weather_records').slice(0, 7).map(r => ({
      date: r.date.slice(5),
      high: r.temperatureHigh,
      low: r.temperatureLow,
      condition: r.condition,
      forecast: r.forecast,
      conditionLabel: { sunny: '晴', cloudy: '多云', rain: '雨', snow: '雪' }[r.condition] || r.condition
    }));
  }

  getWeatherAlerts() {
    return this.getAll('alerts').filter(a => a.module === 'weather' || a.title.includes('天气'));
  }

  // ==================== 计算属性：市场价格 ====================

  getMarketStats() {
    const prices = this.getAll('market_prices');
    const cropNames = [...new Set(prices.map(p => p.cropName))];
    const todayPrices = prices.filter(p => p.date === '2024-01-15');
    const yesterdayPrices = prices.filter(p => p.date === '2024-01-14');
    const avgToday = todayPrices.length > 0 ? (todayPrices.reduce((s, p) => s + p.pricePerKg, 0) / todayPrices.length).toFixed(2) : '--';
    const upCount = todayPrices.filter(p => p.trend === 'up').length;
    const downCount = todayPrices.filter(p => p.trend === 'down').length;
    const maxUp = todayPrices.length > 0 ? todayPrices.reduce((a, b) => (b.changePercent > a.changePercent) ? b : a) : null;
    const maxDown = todayPrices.length > 0 ? todayPrices.reduce((a, b) => (b.changePercent < a.changePercent) ? b : a) : null;
    return {
      cropCount: cropNames.length,
      avgPrice: avgToday,
      upCount: upCount,
      downCount: downCount,
      maxUpCrop: maxUp ? maxUp.cropName + ' +' + maxUp.changePercent + '%' : '--',
      maxDownCrop: maxDown ? maxDown.cropName + ' ' + maxDown.changePercent + '%' : '--'
    };
  }

  getMarketPriceTrend(cropName) {
    let records = this.getAll('market_prices');
    if (cropName && cropName !== 'all') {
      records = records.filter(p => p.cropName === cropName);
    }
    const grouped = {};
    records.forEach(p => {
      if (!grouped[p.cropName]) grouped[p.cropName] = [];
      grouped[p.cropName].push({ date: p.date.slice(5), price: p.pricePerKg });
    });
    return { crops: Object.keys(grouped), series: grouped };
  }

  getMarketAlerts() {
    return this.getAll('alerts').filter(a => a.module === 'market' || a.title.includes('价格') || a.title.includes('市场'));
  }

  // ==================== 计算属性：模型监控 ====================

  getModelStats() {
    const models = this.getAll('model_versions');
    const active = models.filter(m => m.status === 'active');
    const avgAccuracy = active.length > 0 ? (active.reduce((s, m) => s + (m.accuracy || 0), 0) / active.length).toFixed(1) : '--';
    const driftWarnings = active.filter(m => m.driftScore !== null && m.driftScore > 0.2).length;
    const avgUnknownRate = active.length > 0 ? (active.reduce((s, m) => s + (m.unknownRate || 0), 0) / active.length).toFixed(1) : '--';
    return {
      activeCount: active.length,
      totalModels: models.length,
      avgAccuracy: avgAccuracy + '%',
      driftWarnings: driftWarnings,
      avgUnknownRate: avgUnknownRate + '%',
      totalPredictions: active.reduce((s, m) => s + (m.totalPredictions || 0), 0)
    };
  }

  getModelVersionList() {
    return this.getAll('model_versions').sort((a, b) => (b.deployedAt || '').localeCompare(a.deployedAt || ''));
  }

  getModelPerformanceTrend() {
    const models = this.getAll('model_versions').filter(m => m.accuracy != null);
    return {
      labels: models.map(m => m.modelName.split('模型')[0] + ' ' + m.version),
      accuracy: models.map(m => m.accuracy),
      drift: models.map(m => m.driftScore || 0)
    };
  }

  // ==================== 计算属性：农场与种植档案 ====================

  getFarmList() {
    return this.getAll('farms');
  }

  getFarmById(id) {
    return this.table('farms').where('id', 'eq', id).first();
  }

  getFarmStats() {
    const farms = this.getAll('farms');
    const fields = this.getAll('fields');
    const cycles = this.getAll('planting_cycles');
    return {
      farmCount: farms.length,
      fieldCount: fields.length,
      activeCycles: cycles.filter(c => !c.actualHarvestDate).length,
      totalArea: farms.reduce((s, f) => s + f.area, 0)
    };
  }

  getPlantingCycles(farmId) {
    let cycles = this.getAll('planting_cycles');
    if (farmId) cycles = cycles.filter(c => c.farmId === farmId);
    return cycles.sort((a, b) => (b.plantedDate || '').localeCompare(a.plantedDate || ''));
  }

  // ==================== 计算属性：知识库（规范对照） ====================

  getKnowledgeDocuments(category) {
    let docs = this.getAll('knowledge_documents');
    if (category) docs = docs.filter(d => d.category === category);
    return docs;
  }

  searchKnowledge(keyword) {
    const docs = this.getAll('knowledge_documents');
    if (!keyword) return docs;
    const kw = keyword.toLowerCase();
    return docs.filter(d =>
      d.title.includes(keyword) ||
      d.keywords.some(k => k.includes(keyword)) ||
      d.originalText.includes(keyword)
    );
  }

  // ==================== 计算属性：增强权限 ====================

  getPermissionStats() {
    const users = this.getAll('users');
    return {
      totalUsers: users.length,
      adminCount: users.filter(u => u.role === 'admin' && u.status === 'active').length,
      technicianCount: users.filter(u => u.role === 'technician' && u.status === 'active').length,
      farmerCount: users.filter(u => u.role === 'farmer' && u.status === 'active').length,
      managerCount: users.filter(u => u.role === 'manager' && u.status === 'active').length
    };
  }
}

// 全局单例
const dataService = new DataService();
