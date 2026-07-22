/**
 * 智慧农业管理系统 - 数据加载器
 * 双模式加载：HTTP fetch（开发模式）| 内联 bundle（file:// 回退）
 */

const TABLE_NAMES = [
  'users', 'roles', 'crops', 'fields', 'farming_tasks',
  'devices', 'irrigation_plans', 'fertilization_plans', 'maintenance_records',
  'disease_records', 'pest_knowledge_base',
  'products', 'production_timeline', 'quality_certifications',
  'yield_predictions', 'environment_readings', 'soil_readings',
  'alerts', 'operation_logs', 'inventory', 'personnel',
  'farms', 'planting_cycles', 'weather_records', 'market_prices',
  'knowledge_documents', 'model_versions'
];

/**
 * 从 HTTP 服务器加载所有 JSON 数据文件
 */
async function loadFromFetch() {
  const bundle = {};
  const promises = TABLE_NAMES.map(async (name) => {
    try {
      const resp = await fetch(`data/${name}.json`);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      bundle[name] = await resp.json();
    } catch (err) {
      console.warn(`[DataLoader] 无法 fetch data/${name}.json: ${err.message}`);
      // 不抛异常，允许部分加载
    }
  });
  await Promise.all(promises);
  return bundle;
}

/**
 * 从内联 bundle 加载（file:// 协议回退）
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
 * 优先尝试 fetch，失败则回退到内联 bundle
 */
async function initDataService() {
  if (dataService.isReady()) {
    console.log('[DataLoader] 数据已加载，跳过');
    return dataService;
  }

  let bundle = null;

  // 策略1：尝试 fetch（HTTP 服务器模式）
  try {
    bundle = await loadFromFetch();
    const loadedCount = Object.keys(bundle).length;
    if (loadedCount === TABLE_NAMES.length) {
      console.log(`[DataLoader] HTTP 加载成功，${loadedCount} 张表`);
      dataService.loadAll(bundle);
      return dataService;
    }
    console.warn(`[DataLoader] HTTP 部分加载 (${loadedCount}/${TABLE_NAMES.length})，尝试回退...`);
  } catch (e) {
    console.log('[DataLoader] HTTP 加载失败，回退到内联数据包');
  }

  // 策略2：内联 bundle 回退（file:// 协议）
  bundle = loadFromBundle();
  if (bundle && Object.keys(bundle).length > 0) {
    dataService.loadAll(bundle);
    console.log(`[DataLoader] 内联数据包加载成功，${Object.keys(bundle).length} 张表`);
    return dataService;
  }

  // 两种方式都失败
  throw new Error('[DataLoader] 数据加载失败！请通过 HTTP 服务器运行或确保 data-bundle.js 已加载');
}
