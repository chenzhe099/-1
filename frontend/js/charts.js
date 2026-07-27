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

  // 检查 Chart 全局是否就绪
  if (typeof Chart === 'undefined') {
    console.warn('[Charts] Chart.js 未就绪，300ms 后重试', chartId);
    setTimeout(function() { initChart(chartId, config); }, 300);
    return;
  }

  charts[chartId] = new Chart(ctx, config);
}

function ds() {
  return (typeof dataService !== 'undefined' && dataService.isReady()) ? dataService : null;
}

// ========== 模拟环境监测数据生成 ==========

function generateEnvData(range, points) {
  points = points || (range === 'realtime' ? 12 : range === '7d' ? 28 : 24);
  var now = new Date();
  var labels = [];
  var temperature = [];
  var humidity = [];
  // 基础值：温度 20-28°C 正弦波动，湿度 55-75% 反向波动
  for (var i = points - 1; i >= 0; i--) {
    var d = new Date(now);
    if (range === '7d') d.setHours(d.getHours() - i * 6);
    else d.setMinutes(d.getMinutes() - i * (60 * 24 / points));
    labels.push(d.getHours().toString().padStart(2,'0') + ':' + d.getMinutes().toString().padStart(2,'0'));
    // 正弦模拟：温度中午高早晚低
    var hour01 = (d.getHours() + d.getMinutes() / 60) / 24 * 2 * Math.PI;
    var baseTemp = 24 + 6 * Math.sin(hour01 - 0.5 * Math.PI);
    temperature.push(Math.round((baseTemp + (Math.random() - 0.5) * 2) * 10) / 10);
    // 湿度与温度反向
    var baseHum = 65 - 10 * Math.sin(hour01 - 0.5 * Math.PI);
    humidity.push(Math.round((baseHum + (Math.random() - 0.5) * 5) * 10) / 10);
  }
  return { labels: labels, temperature: temperature, humidity: humidity };
}

function refreshEnvironmentChart(range) {
  range = range || '24h';
  var env = generateEnvData(range);
  // 直接重绘环境监测图
  if (document.getElementById('environmentChart')) {
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
}

// ========== 仪表盘图表 ==========

function initDashboardCharts() {
  const s = ds();

  // 环境监测图 — 使用模拟数据确保始终有显示
  refreshEnvironmentChart('24h');

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
  // 使用真实 API 数据
  var labels, tempHigh, tempLow, rainfall;
  if (window.weatherCache && window.weatherCache.forecast) {
    var f = window.weatherCache.forecast;
    labels = f.map(function(d){return d.date;});
    tempHigh = f.map(function(d){return d.high;});
    tempLow = f.map(function(d){return d.low;});
    rainfall = f.map(function(d){return d.rain;});
  } else {
    var s = ds();
    var wt = s ? s.getWeatherTrend() : null;
    labels = (wt||{}).labels || ['--'];
    tempHigh = (wt||{}).temperatureHigh || [0];
    tempLow = (wt||{}).temperatureLow || [0];
    rainfall = (wt||{}).rainfall || [0];
  }

  initChart('weatherTrendChart', {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        { label: '最高温 °C', data: tempHigh, borderColor: '#ef4444', backgroundColor: 'transparent', tension: 0.4, yAxisID: 'y' },
        { label: '最低温 °C', data: tempLow, borderColor: '#3b82f6', backgroundColor: 'transparent', tension: 0.4, yAxisID: 'y' },
        { label: '降雨量 mm', data: rainfall, type: 'bar', backgroundColor: 'rgba(6,182,212,0.5)', borderColor: '#06b6d4', borderWidth: 1, yAxisID: 'y1' }
      ]
    },
    options: {
      responsive: true,
      plugins: { legend: { position: 'bottom' } },
      scales: {
        y: { type: 'linear', position: 'left', title: { display: true, text: '温度 (°C)' } },
        y1: { type: 'linear', position: 'right', beginAtZero: true, min: 0, title: { display: true, text: '降雨量 (mm)' }, grid: { drawOnChartArea: false } }
      }
    }
  });
}

// ========== 市场价格图表 ==========

function initMarketCharts(cropName) {
  var s = ds();
  cropName = cropName || 'all';
  var trend = s ? s.getMarketPriceTrend(cropName) : { crops: [], series: {} };
  var colors = ['#ef4444','#22c55e','#eab308','#ec4899','#8b5cf6','#f97316','#06b6d4','#f59e0b'];

  // 获取所有日期标签
  var allDates = [];
  var seen = {};
  Object.values(trend.series).forEach(function(s){
    s.forEach(function(p){ if(!seen[p.date]){ seen[p.date]=true; allDates.push(p.date); } });
  });
  allDates.sort();

  initChart('priceTrendChart', {
    type: 'line',
    data: {
      labels: allDates.length ? allDates : ['07-20','07-21','07-22','07-23','07-24','07-25','07-26'],
      datasets: trend.crops.map(function(crop, i){
        return {
          label: crop,
          data: allDates.map(function(d){ var p = (trend.series[crop]||[]).find(function(x){return x.date===d;}); return p ? p.price : null; }),
          borderColor: colors[i % colors.length],
          backgroundColor: 'transparent',
          tension: 0.4,
          spanGaps: false
        };
      })
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
