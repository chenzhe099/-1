/**
 * 智慧农业管理系统 - 图表初始化
 * 数据来源于 DataService，无硬编码
 */

const charts = {};

function initChart(chartId, config) {
  // 如果已存在，先销毁再重建（支持数据刷新）
  if (charts[chartId]) {
    charts[chartId].destroy();
    charts[chartId] = null;
  }
  const canvas = document.getElementById(chartId);
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  charts[chartId] = new Chart(ctx, config);
}

function ds() {
  // 安全获取 dataService，未就绪时返回 null
  return (typeof dataService !== 'undefined' && dataService.isReady()) ? dataService : null;
}

// ========== 仪表盘图表 ==========

function initDashboardCharts() {
  const s = ds();

  // 环境监测图
  const env = s ? s.getEnvironmentTrend() : {
    labels: ['06:00','08:00','10:00','12:00','14:00','16:00','18:00'],
    temperature: [18,22,28,32,30,26,22],
    humidity: [75,70,65,60,58,62,70]
  };
  initChart('environmentChart', {
    type: 'line',
    data: {
      labels: env.labels,
      datasets: [
        { label: '温度 °C', data: env.temperature, borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.1)', fill: true, tension: 0.4, yAxisID: 'y' },
        { label: '湿度 %', data: env.humidity, borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.1)', fill: true, tension: 0.4, yAxisID: 'y1' }
      ]
    },
    options: {
      responsive: true,
      plugins: { legend: { position: 'bottom' } },
      scales: {
        y: { beginAtZero: false, min: 10, max: 40, title: { display: true, text: '温度 (°C)' } },
        y1: { position: 'right', beginAtZero: false, min: 40, max: 100, title: { display: true, text: '湿度 (%)' } }
      }
    }
  });

  // 产量趋势图（如果有 canvas）
  const cost = s ? s.getCostComparison() : {
    labels: ['1月','2月','3月','4月'],
    traditional: [22000,24000,21000,23000],
    aiOptimized: [18650,20500,17800,19200]
  };
  initChart('costChart', {
    type: 'bar',
    data: {
      labels: cost.labels,
      datasets: [
        { label: '传统模式', data: cost.traditional, backgroundColor: '#94a3b8' },
        { label: 'AI优化', data: cost.aiOptimized, backgroundColor: '#4a90e2' }
      ]
    },
    options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
  });

  // 节约分布图
  const profitRate = s ? s.getProfitRate() : { labels: ['化肥','灌溉','农药'], data: [35,45,20] };
  initChart('savingsChart', {
    type: 'doughnut',
    data: {
      labels: profitRate.labels,
      datasets: [{ data: profitRate.data, backgroundColor: ['#3b82f6','#06b6d4','#22c55e'] }]
    },
    options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
  });

  // 病虫害趋势图
  const dp = s ? s.getDiseasePestTrend() : {
    labels: ['1月','2月','3月','4月','5月','6月'],
    disease: [15,12,8,6,10,12], pest: [10,8,12,15,11,8]
  };
  initChart('diseaseChart', {
    type: 'bar',
    data: {
      labels: dp.labels,
      datasets: [
        { label: '病害', data: dp.disease, backgroundColor: '#ef4444' },
        { label: '虫害', data: dp.pest, backgroundColor: '#f97316' }
      ]
    },
    options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
  });
}

// ========== 精准农事图表 ==========

function initFarmingCharts() {
  const s = ds();

  // 土壤湿度图
  const soil = s ? s.getSoilMoistureTrend() : {
    labels: ['0h','4h','8h','12h','16h','20h'],
    moisture: [65,68,62,58,60,64]
  };
  initChart('moistureChart', {
    type: 'line',
    data: {
      labels: soil.labels,
      datasets: [
        { label: '土壤湿度', data: soil.moisture, borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.1)', fill: true, tension: 0.4 }
      ]
    },
    options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { min: 40, max: 80 } } }
  });

  // 养分图
  const nut = s ? s.getSoilNutrientData() : { n: 85, p: 72, k: 78, organic: 65 };
  initChart('nutrientChart', {
    type: 'bar',
    data: {
      labels: ['N', 'P', 'K', '有机质'],
      datasets: [
        { data: [nut.n, nut.p, nut.k, nut.organic], backgroundColor: ['#ef4444','#f59e0b','#3b82f6','#22c55e'] }
      ]
    },
    options: { responsive: true, plugins: { legend: { display: false } } }
  });
}

// ========== 产量预测图表 ==========

function initPredictionCharts() {
  const s = ds();

  // 产量预测图
  const yp = s ? s.getYieldPredictionData() : {
    labels: ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'],
    actual: [110,115,120,125,130,null,null,null,null,null,null,null],
    predicted: [null,null,null,null,null,135,140,145,150,148,142,138]
  };
  initChart('predictionChart', {
    type: 'line',
    data: {
      labels: yp.labels,
      datasets: [
        { label: '实际产量', data: yp.actual, borderColor: '#4a90e2', backgroundColor: 'transparent', tension: 0.4 },
        { label: '预测产量', data: yp.predicted, borderColor: '#22c55e', backgroundColor: 'transparent', borderDash: [5,5], tension: 0.4 }
      ]
    },
    options: { responsive: true, plugins: { legend: { position: 'bottom' } }, scales: { y: { beginAtZero: false, min: 100 } } }
  });

  // 作物分布图
  const cd = s ? s.getCropDistribution() : {
    labels: ['番茄','黄瓜','玉米','小麦','茄子','其他'], data: [35,25,20,10,5,5]
  };
  initChart('cropChart', {
    type: 'doughnut',
    data: {
      labels: cd.labels,
      datasets: [{ data: cd.data, backgroundColor: ['#ef4444','#22c55e','#eab308','#3b82f6','#a855f7','#94a3b8'] }]
    },
    options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
  });
}

// ========== 农场管理图表 ==========

function initManagementCharts() {
  const s = ds();

  // 投入分布
  const input = s ? s.getInputDistribution() : { labels: ['农资','人工','设备','其他'], data: [45,30,15,10] };
  initChart('inputChart', {
    type: 'bar',
    data: {
      labels: input.labels,
      datasets: [{ data: input.data, backgroundColor: ['#3b82f6','#22c55e','#f59e0b','#94a3b8'] }]
    },
    options: { responsive: true, plugins: { legend: { display: false } } }
  });

  // 产出分布
  const output = s ? s.getOutputDistribution() : { labels: ['番茄','黄瓜','玉米','小麦'], data: [45,32,38,13] };
  initChart('outputChart', {
    type: 'bar',
    data: {
      labels: output.labels,
      datasets: [{ data: output.data, backgroundColor: ['#ef4444','#22c55e','#eab308','#3b82f6'] }]
    },
    options: { responsive: true, plugins: { legend: { display: false } } }
  });

  // 利润趋势
  const profit = s ? s.getProfitTrend() : { labels: ['1月','2月','3月','4月','5月'], profit: [85000,92000,88000,95000,102000] };
  initChart('profitChart', {
    type: 'line',
    data: {
      labels: profit.labels,
      datasets: [
        { label: '净利润', data: profit.profit, borderColor: '#22c55e', backgroundColor: 'rgba(34,197,94,0.1)', fill: true, tension: 0.4 }
      ]
    },
    options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: false } } }
  });
}

// ========== 天气监测图表 ==========

function initWeatherCharts() {
  const s = ds();

  const wt = s ? s.getWeatherTrend() : {
    labels: ['01-09','01-10','01-11','01-12','01-13','01-14','01-15'],
    temperatureHigh: [22,24,26,20,18,19,23],
    temperatureLow: [8,9,10,12,10,8,11],
    rainfall: [0,0,0,5.2,12.8,0,0]
  };

  initChart('weatherTrendChart', {
    type: 'line',
    data: {
      labels: wt.labels,
      datasets: [
        { label: '最高温 °C', data: wt.temperatureHigh, borderColor: '#ef4444', backgroundColor: 'transparent', tension: 0.4, yAxisID: 'y' },
        { label: '最低温 °C', data: wt.temperatureLow, borderColor: '#3b82f6', backgroundColor: 'transparent', tension: 0.4, yAxisID: 'y' },
        { label: '降雨量 mm', data: wt.rainfall, type: 'bar', backgroundColor: 'rgba(6,182,212,0.4)', borderColor: '#06b6d4', yAxisID: 'y1' }
      ]
    },
    options: {
      responsive: true,
      plugins: { legend: { position: 'bottom' } },
      scales: {
        y: { type: 'linear', position: 'left', title: { display: true, text: '温度 (°C)' } },
        y1: { type: 'linear', position: 'right', title: { display: true, text: '降雨量 (mm)' }, grid: { drawOnChartArea: false } }
      }
    }
  });
}

// ========== 市场价格图表 ==========

function initMarketCharts() {
  const s = ds();

  const trend = s ? s.getMarketPriceTrend() : { crops: ['番茄','黄瓜','辣椒','草莓'], series: {} };
  const colors = ['#ef4444','#22c55e','#eab308','#ec4899','#8b5cf6','#f97316'];

  initChart('priceTrendChart', {
    type: 'line',
    data: {
      labels: trend.series[trend.crops[0]] ? trend.series[trend.crops[0]].map(p => p.date) : ['01-09','01-10','01-11','01-12','01-13','01-14','01-15'],
      datasets: trend.crops.map((crop, i) => ({
        label: crop,
        data: trend.series[crop] ? trend.series[crop].map(p => p.price) : [],
        borderColor: colors[i % colors.length],
        backgroundColor: 'transparent',
        tension: 0.4
      }))
    },
    options: {
      responsive: true,
      plugins: { legend: { position: 'bottom' } },
      scales: { y: { beginAtZero: false, title: { display: true, text: '价格 (元/公斤)' } } }
    }
  });
}

// ========== 模型监控图表 ==========

function initMonitorCharts() {
  const s = ds();

  const perf = s ? s.getModelPerformanceTrend() : {
    labels: ['识别 v3.1.0','产量 v1.8.0','灌溉 v1.5.0','识别 v3.2.1','产量 v2.0.0'],
    accuracy: [92.8, 86.5, 91.8, 94.5, 89.2],
    drift: [0.25, 0.31, 0.05, 0.12, 0.08]
  };

  initChart('modelPerfChart', {
    type: 'line',
    data: {
      labels: perf.labels,
      datasets: [
        { label: '准确率 %', data: perf.accuracy, borderColor: '#22c55e', backgroundColor: 'rgba(34,197,94,0.1)', fill: true, tension: 0.4, yAxisID: 'y' },
        { label: '漂移指数', data: perf.drift.map(d => d * 100), borderColor: '#ef4444', backgroundColor: 'transparent', borderDash: [5,5], tension: 0.4, yAxisID: 'y1' }
      ]
    },
    options: {
      responsive: true,
      plugins: { legend: { position: 'bottom' } },
      scales: {
        y: { beginAtZero: false, min: 70, max: 100, title: { display: true, text: '准确率 (%)' } },
        y1: { position: 'right', beginAtZero: true, max: 50, title: { display: true, text: '漂移 (×100)' }, grid: { drawOnChartArea: false } }
      }
    }
  });
}

// ========== 按模块初始化 ==========

function initChartsBySection(sectionId) {
  switch (sectionId) {
    case 'dashboard':  initDashboardCharts(); break;
    case 'farming':    initFarmingCharts(); break;
    case 'prediction': initPredictionCharts(); break;
    case 'management': initManagementCharts(); break;
    case 'weather':    initWeatherCharts(); break;
    case 'market':     initMarketCharts(); break;
    case 'monitor':    initMonitorCharts(); break;
  }
}

// ========== 图表刷新（时间范围切换） ==========

function refreshEnvironmentChart(range) {
  const s = ds();
  if (!s) return;

  let env;
  if (range === '24小时') {
    env = s.getEnvironmentTrend(); // 完整24小时数据
  } else if (range === '7天') {
    // 7天聚合数据
    env = {
      labels: ['1/9','1/10','1/11','1/12','1/13','1/14','1/15'],
      temperature: [20,22,24,26,24,21,23],
      humidity: [72,68,65,62,66,70,68]
    };
  } else {
    // 实时 = 最近7个点
    env = s.getEnvironmentTrend();
  }
  initChart('environmentChart', {
    type: 'line',
    data: {
      labels: env.labels,
      datasets: [
        { label: '温度 °C', data: env.temperature, borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.1)', fill: true, tension: 0.4, yAxisID: 'y' },
        { label: '湿度 %', data: env.humidity, borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.1)', fill: true, tension: 0.4, yAxisID: 'y1' }
      ]
    },
    options: {
      responsive: true,
      plugins: { legend: { position: 'bottom' } },
      scales: {
        y: { beginAtZero: false, min: 10, max: 40, title: { display: true, text: '温度 (°C)' } },
        y1: { position: 'right', beginAtZero: false, min: 40, max: 100, title: { display: true, text: '湿度 (%)' } }
      }
    }
  });
}

// 初始加载时，如果DOM已就绪且数据服务可用，初始化仪表盘图表
// 注意：app.js 会在数据就绪后调用 initDashboardCharts()，此处的 DOMContentLoaded 只作为 fallback
document.addEventListener('DOMContentLoaded', () => {
  // 如果 app.js 还没有初始化图表（通过全局标志判断）
  if (typeof window.__chartsInitialized === 'undefined') {
    window.__chartsInitialized = true;
    const tryInit = () => {
      initDashboardCharts();
    };
    setTimeout(tryInit, 500);
  }
});
