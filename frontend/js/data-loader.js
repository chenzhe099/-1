/**
 * 智慧农业管理系统 - 数据加载器
 * 三模式加载：后端 API（优先）→ HTTP fetch JSON（开发回退）→ 内联 bundle（file:// 回退）
 */

const TABLE_NAMES = [
  'users', 'roles', 'crops', 'fields', 'farming_tasks',
  'devices', 'irrigation_plans', 'fertilization_plans', 'maintenance_records',
  'disease_records', 'pest_knowledge_base',
  'products', 'production_timeline', 'quality_certifications',
  'yield_predictions', 'environment_readings', 'soil_readings',
  'alerts', 'operation_logs', 'inventory', 'personnel',
  'farms', 'planting_cycles', 'weather_records', 'market_prices',
  'knowledge_documents', 'model_versions', 'observations', 'agent_runs'
];

/**
 * 策略1：通过后端 REST API 加载数据
 * 调用 /api/v1/{table} 端点获取所有表数据
 */
async function loadFromApi() {
  const bundle = {};
  let successCount = 0;

  const promises = TABLE_NAMES.map(async (name) => {
    try {
      const data = await apiClient.getAll(name);
      if (data && Array.isArray(data)) {
        bundle[name] = data;  // 空表也接受
        successCount++;
      }
    } catch (err) {
      // API 不可用，静默失败
    }
  });

  await Promise.all(promises);

  // 只要有 20 张以上表加载成功就用 API（允许个别表为空）
  if (successCount >= 20) {
    console.log('[DataLoader] MySQL 模式：' + successCount + '/' + TABLE_NAMES.length + ' 张表');
    return bundle;
  }
  if (successCount > 0) {
    console.warn('[DataLoader] API 部分加载 (' + successCount + '/' + TABLE_NAMES.length + ')，回退到 JSON...');
  }
  return null;
}

/**
 * 策略2：从 HTTP 服务器加载所有 JSON 数据文件
 */
async function loadFromFetch() {
  const bundle = {};
  const promises = TABLE_NAMES.map(async (name) => {
    try {
      const resp = await fetch('data/' + name + '.json');
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      bundle[name] = await resp.json();
    } catch (err) {
      console.warn('[DataLoader] 无法 fetch data/' + name + '.json: ' + err.message);
    }
  });
  await Promise.all(promises);
  return bundle;
}

/**
 * 策略3：从内联 bundle 加载（file:// 协议回退）
 */
function loadFromBundle() {
  if (typeof window.__MOCK_DATA__ !== 'undefined' && window.__MOCK_DATA__) {
    console.log('[DataLoader] 使用内联数据包 (window.__MOCK_DATA__)');
    return window.__MOCK_DATA__;
  }
  return null;
}

/**
 * 主入口：初始化数据服务
 * 优先级：后端 API > HTTP fetch JSON > 内联 bundle
 */
async function initDataService() {
  if (dataService.isReady()) {
    console.log('[DataLoader] 数据已加载，跳过');
    return dataService;
  }

  let bundle = null;

  // 策略1：后端 API（MySQL 数据）
  try {
    bundle = await loadFromApi();
    if (bundle && Object.keys(bundle).length === TABLE_NAMES.length) {
      dataService.loadAll(bundle);
      return dataService;
    }
  } catch (e) {
    console.log('[DataLoader] API 加载失败，回退到 JSON 文件');
  }

  // 策略2：HTTP fetch JSON 文件
  try {
    bundle = await loadFromFetch();
    const loadedCount = Object.keys(bundle).length;
    if (loadedCount === TABLE_NAMES.length) {
      console.log('[DataLoader] HTTP JSON 加载成功，' + loadedCount + ' 张表');
      dataService.loadAll(bundle);
      return dataService;
    }
    console.warn('[DataLoader] HTTP 部分加载 (' + loadedCount + '/' + TABLE_NAMES.length + ')，尝试回退...');
  } catch (e) {
    console.log('[DataLoader] HTTP 加载失败，回退到内联数据包');
  }

  // 策略3：内联 bundle 回退（file:// 协议）
  bundle = loadFromBundle();
  if (bundle && Object.keys(bundle).length > 0) {
    dataService.loadAll(bundle);
    console.log('[DataLoader] 内联数据包加载成功，' + Object.keys(bundle).length + ' 张表');
    return dataService;
  }

  throw new Error('[DataLoader] 数据加载失败！请启动后端服务或通过 HTTP 服务器运行前端');
}
