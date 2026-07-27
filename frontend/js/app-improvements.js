// ==================== SmartFarm 改进补丁 - 一次性合并 ====================
// 本文件包含今日所有新增的前端交互函数，加载于 app.js 之后

// === 库存管理 ===
window.invQuickIn = function(id) {
  try {
    var item = dataService.getById('inventory', id);
    if (!item) { showToast('物品不存在，请刷新页面重试', 'error'); return; }
    var h = '<div class="space-y-3"><p class="text-sm">当前库存: <b>'+item.name+'</b> · '+item.quantity+' '+item.unit+'</p><div><label class="text-xs text-gray-500">入库数量</label><input id="inv-in-qty" class="w-full px-3 py-2 border rounded text-sm" value="10"></div></div>';
    showConfirm('入库 - '+item.name, h, function(ok){
      if (!ok) return;
      try {
        var el = document.getElementById('inv-in-qty');
        if (!el) { showToast('表单已失效，请重试', 'error'); return; }
        var n = parseInt(el.value)||0;
        if (n<=0) { showToast('请输入有效数量', 'error'); return; }
        var result = dataService.update('inventory', id, {quantity: (item.quantity||0)+n});
        if (!result) { showToast('更新失败-未找到物品', 'error'); return; }
        safeRefreshInventory();
        logOperation('入库','库存',item.name+' +'+n+item.unit); showToast(item.name+' 入库 +'+n+item.unit, 'success');
      } catch(e) { console.error('invQuickIn cb err:', e); showToast('操作失败:'+e.message, 'error'); }
    });
  } catch(e) { showToast('出错了', 'error'); }
};

// 安全刷新库存列表（不依赖 renderManagement）
window.safeRefreshInventory = function() {
  var invData = (dataService && dataService.getAll) ? dataService.getAll('inventory') : [];
  var invContainer = document.getElementById('inventory-list');
  var invSummary = document.getElementById('inv-summary');
  if (!invContainer) return;
  var icons = {fertilizer:'fa-flask',pesticide:'fa-medkit',seed:'fa-leaf',tool:'fa-wrench',other:'fa-cube'};
  var colors = {fertilizer:'blue',pesticide:'red',seed:'green',tool:'gray',other:'purple'};
  invContainer.innerHTML = invData.length ? invData.map(function(i){
    var qty = i.quantity||0;
    var st = qty>20?'充足':qty>5?'偏低':'不足';
    return '<div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">'+
      '<div class="flex items-center"><div class="w-9 h-9 bg-'+(colors[i.type]||'gray')+'-100 rounded-lg flex items-center justify-center mr-3"><i class="fa '+(icons[i.type]||'fa-cube')+' text-'+(colors[i.type]||'gray')+'-600"></i></div>'+
      '<div><p class="text-sm font-medium">'+i.name+'</p><p class="text-xs text-gray-500">'+(i.unit||'')+' · 库存: '+qty+'</p></div></div>'+
      '<div class="flex items-center gap-2"><span class="text-xs '+(qty>20?'text-green-600':qty>5?'text-orange-600':'text-red-600')+'">'+(qty>20?'充足':qty>5?'偏低':'不足')+'</span>'+
      '<button class="text-green-500 text-xs" onclick="invQuickIn(\''+i.id+'\')">+</button>'+
      '<button class="text-orange-500 text-xs" onclick="invQuickOut(\''+i.id+'\')">-</button>'+
      '<button class="text-red-400 text-xs" onclick="invDeleteItem(\''+i.id+'\')"><i class="fa fa-trash"></i></button></div></div>';
  }).join('') : '<p class="text-sm text-gray-400 text-center py-6">暂无库存</p>';
  if (invSummary) {
    var total = invData.reduce(function(s,i){return s+(i.quantity||0);},0);
    invSummary.innerHTML = '<span>共 '+invData.length+' 种 · '+total+' 件</span>';
  }
};

window.invQuickOut = function(id) {
  try {
    var item = dataService.getById('inventory', id);
    if (!item) { showToast('物品不存在，请刷新页面重试', 'error'); return; }
    var h = '<div class="space-y-3"><p class="text-sm">当前库存: <b>'+item.name+'</b> · '+item.quantity+' '+item.unit+'</p><div><label class="text-xs text-gray-500">出库数量</label><input id="inv-out-qty" class="w-full px-3 py-2 border rounded text-sm" value="5"></div></div>';
    showConfirm('出库 - '+item.name, h, function(ok){
      if (!ok) return;
      try {
        var el = document.getElementById('inv-out-qty');
        if (!el) { showToast('表单已失效，请重试', 'error'); return; }
        var n = parseInt(el.value)||0;
        if (n<=0) { showToast('请输入有效数量', 'error'); return; }
        if ((item.quantity||0) < n) { showToast('库存不足（当前仅'+item.quantity+item.unit+'）', 'error'); return; }
        dataService.update('inventory', id, {quantity: (item.quantity||0)-n});
        safeRefreshInventory(); logOperation('出库','库存',item.name+' -'+n+item.unit); showToast(item.name+' 出库 -'+n+item.unit, 'success');
      } catch(e) { console.error('invQuickOut cb err:', e); showToast('操作失败:'+e.message, 'error'); }
    });
  } catch(e) { showToast('出错了', 'error'); }
};

window.invAddItem = function() {
  var h = '<div class="space-y-3"><div><label class="text-xs text-gray-500">物品名称</label><input id="inv-name" class="w-full px-3 py-2 border rounded text-sm" placeholder="氮肥"></div><div><label class="text-xs text-gray-500">类型</label><select id="inv-type" class="w-full px-3 py-2 border rounded text-sm"><option value="fertilizer">肥料</option><option value="pesticide">农药</option><option value="seed">种子</option><option value="tool">工具</option><option value="other">其他</option></select></div><div class="grid grid-cols-2 gap-2"><div><label class="text-xs text-gray-500">数量</label><input id="inv-qty" class="w-full px-3 py-2 border rounded text-sm" value="100"></div><div><label class="text-xs text-gray-500">单位</label><input id="inv-unit" class="w-full px-3 py-2 border rounded text-sm" value="kg"></div></div><div><label class="text-xs text-gray-500">最低库存预警</label><input id="inv-min" class="w-full px-3 py-2 border rounded text-sm" value="10"></div></div>';
  showConfirm('添加新物品', h, function(ok){
    if (!ok) return;
    var nm = (document.getElementById('inv-name')||{}).value||'';
    if (!nm.trim()) { showToast('请输入名称','error'); return; }
    dataService.insert('inventory', {
      name: nm.trim(), type: (document.getElementById('inv-type')||{}).value||'fertilizer',
      quantity: parseInt((document.getElementById('inv-qty')||{}).value)||0,
      unit: (document.getElementById('inv-unit')||{}).value||'kg',
      minStock: parseInt((document.getElementById('inv-min')||{}).value)||5
    });
    safeRefreshInventory(); logOperation('新增','库存',nm); showToast(nm+' 已添加', 'success');
  });
};

window.invDeleteItem = function(id) {
  var item = dataService.getById('inventory', id);
  if (!item) return;
  showConfirm('删除物品', '<p class="text-sm">确定删除 <b>'+item.name+'</b> 吗？当前库存: '+item.quantity+item.unit+'</p>', function(ok){
    if (!ok) return;
    dataService.delete('inventory', id);
    safeRefreshInventory(); logOperation('删除','库存',item.name); showToast(item.name+' 已删除', 'success');
  });
};

window.invStockIn = function() {
  var items = dataService.getAll('inventory')||[];
  if (!items.length) { showToast('请先添加物品','error'); return; }
  var opts = items.map(function(i){return '<option value="'+i.id+'">'+i.name+' (当前:'+i.quantity+i.unit+')</option>';}).join('');
  var h = '<div class="space-y-3"><div><label class="text-xs text-gray-500">选择物品</label><select id="inv-si-item" class="w-full px-3 py-2 border rounded text-sm">'+opts+'</select></div><div><label class="text-xs text-gray-500">入库数量</label><input id="inv-si-qty" class="w-full px-3 py-2 border rounded text-sm" value="50"></div></div>';
  showConfirm('批量入库', h, function(ok){
    if (!ok) return;
    var id = (document.getElementById('inv-si-item')||{}).value;
    var n = parseInt((document.getElementById('inv-si-qty')||{}).value)||0;
    var item = dataService.getById('inventory', id);
    if (!item||n<=0) return;
    dataService.update('inventory', id, {quantity: (item.quantity||0)+n});
    safeRefreshInventory(); showToast(item.name+' 入库 '+n+item.unit, 'success');
  });
};

window.invStockOut = function() {
  var items = dataService.getAll('inventory')||[];
  if (!items.length) { showToast('请先添加物品','error'); return; }
  var opts = items.map(function(i){return '<option value="'+i.id+'">'+i.name+' (当前:'+i.quantity+i.unit+')</option>';}).join('');
  var h = '<div class="space-y-3"><div><label class="text-xs text-gray-500">选择物品</label><select id="inv-so-item" class="w-full px-3 py-2 border rounded text-sm">'+opts+'</select></div><div><label class="text-xs text-gray-500">出库数量</label><input id="inv-so-qty" class="w-full px-3 py-2 border rounded text-sm" value="10"></div></div>';
  showConfirm('批量出库', h, function(ok){
    if (!ok) return;
    var id = (document.getElementById('inv-so-item')||{}).value;
    var n = parseInt((document.getElementById('inv-so-qty')||{}).value)||0;
    var item = dataService.getById('inventory', id);
    if (!item||n<=0||(item.quantity||0)<n) { showToast('库存不足','error'); return; }
    dataService.update('inventory', id, {quantity: (item.quantity||0)-n});
    safeRefreshInventory(); showToast(item.name+' 出库 '+n+item.unit, 'success');
  });
};

// === 设备监管交互 ===
window.devDetail = function(id) {
  var d = dataService.getById('devices', id);
  if (!d) { showToast('设备不存在', 'error'); return; }
  var m = (typeof d.metrics==='string') ? (function(){try{return JSON.parse(d.metrics);}catch(e){return {};}})() : (d.metrics||{});
  var st = {online:'<span class="px-2 py-1 text-xs bg-green-100 text-green-600 rounded">运行中</span>',offline:'<span class="px-2 py-1 text-xs bg-red-100 text-red-600 rounded">已离线</span>',fault:'<span class="px-2 py-1 text-xs bg-yellow-100 text-yellow-600 rounded">故障</span>',maintenance:'<span class="px-2 py-1 text-xs bg-yellow-100 text-yellow-600 rounded">待维护</span>'};
  var tp = {pump:'水泵',fertilizer:'施肥机',sensor:'传感器',weather:'气象站',greenhouse:'温控'};
  var h = '<div class="space-y-3"><div class="flex items-center justify-between"><h4 class="font-semibold">'+d.name+'</h4>'+(st[d.status]||'')+'</div>';
  h += '<div class="grid grid-cols-2 gap-3 text-sm"><div><span class="text-gray-500">类型：</span>'+(tp[d.type]||d.type)+'</div><div><span class="text-gray-500">位置：</span>'+d.location+'</div><div><span class="text-gray-500">IP：</span>'+d.ipAddress+'</div><div><span class="text-gray-500">固件：</span>'+d.firmwareVersion+'</div><div><span class="text-gray-500">运行：</span>'+d.runHours+'小时</div><div><span class="text-gray-500">上次维护：</span>'+d.lastMaintenance+'</div></div>';
  h += '<div class="bg-gray-50 p-3 rounded text-sm"><p class="font-medium mb-1">实时指标</p>' + Object.entries(m).filter(function(e){return e[0]!=='currentTask';}).map(function(e){return '<div class="flex justify-between"><span class="text-gray-500">'+e[0]+'</span><span>'+e[1]+'</span></div>';}).join('') + '</div>';
  if (d.nextMaintenance) h += '<p class="text-xs text-gray-400">下次维护：'+d.nextMaintenance+'</p>';
  h += '</div>';
  showConfirm('设备详情', h, function(){});
};

window.devControl = function(id) {
  var btn = document.querySelector('[data-id="'+id+'"]');
  var d = dataService.getById('devices', id);
  if (!d) return;
  var h = '<p class="text-sm mb-3">设备: <b>'+d.name+'</b> · 当前状态: '+d.status+'</p><div class="flex gap-3">'+
    '<button class="flex-1 py-2 bg-yellow-500 text-white text-sm rounded" onclick="dataService.update(\'devices\',\''+id+'\',{status:\'maintenance\'});devRefreshAll();var m=document.querySelector(\'.perm-modal\');if(m)m.remove();">维护模式</button>'+
    '<button class="flex-1 py-2 bg-blue-500 text-white text-sm rounded" onclick="dataService.update(\'devices\',\''+id+'\',{status:\'online\'});devRefreshAll();var m=document.querySelector(\'.perm-modal\');if(m)m.remove();">重新上线</button></div>';
  showConfirm('远程控制 - '+d.name, h, function(){});
};

window.devReport = function(id) {
  dataService.update('devices', id, {status:'maintenance'});
  devRefreshAll(); showToast('已提交报修申请', 'success');
};

window.devRestart = function(id) {
  var d = dataService.getById('devices', id);
  dataService.update('devices', id, {status:'online'});
  devRefreshAll(); showToast(d.name+' 已重新上线', 'success');
};

window.devStart = function(id) {
  var d = dataService.getById('devices', id);
  dataService.update('devices', id, {status:'online'});
  devRefreshAll(); showToast(d.name+' 已启动', 'success');
};

window.devRefreshAll = function() {
  renderDevices(); renderDashboard();
  logOperation('刷新','设备','全部设备状态已刷新'); showToast('设备状态已刷新', 'success');
};

window.devEmergencyStop = function() {
  showConfirm('紧急停止', '<p class="text-sm text-red-600"><b>警惕确定停止所有运行中的设备吗？</b></p><p class="text-xs text-gray-500 mt-2">这将中断所有灌溉、施肥和温室控制任务。</p>', function(ok) {
    if (!ok) return;
    var devices = dataService.getAll('devices')||[];
    devices.forEach(function(d){ if (d.status==='online') dataService.update('devices', d.id, {status:'maintenance'}); });
    devRefreshAll(); logOperation('控制','设备','紧急停止所有设备'); showToast('所有设备已紧急停止', 'warning');
  });
};

window.devScheduleMaint = function(id) {
  var d = dataService.getById('devices', id);
  var today = new Date().toISOString().slice(0,10);
  dataService.update('devices', id, {lastMaintenance: today, status:'online'});
  devRefreshAll(); showToast(d.name+' 维护完成，已恢复上线', 'success');
};

window.devAddDevice = function() {
  var h = '<div class="space-y-3"><div><label class="text-xs text-gray-500">设备名称</label><input id="dea-name" class="w-full px-3 py-2 border rounded text-sm" placeholder="灌溉泵 #2"></div><div><label class="text-xs text-gray-500">类型</label><select id="dea-type" class="w-full px-3 py-2 border rounded text-sm"><option value="pump">水泵</option><option value="fertilizer">施肥机</option><option value="sensor">传感器</option><option value="weather">气象站</option><option value="greenhouse">温控</option></select></div><div><label class="text-xs text-gray-500">位置</label><input id="dea-loc" class="w-full px-3 py-2 border rounded text-sm" placeholder="A区"></div><div><label class="text-xs text-gray-500">IP地址</label><input id="dea-ip" class="w-full px-3 py-2 border rounded text-sm" placeholder="192.168.1.200"></div></div>';
  showConfirm('添加新设备', h, function(ok) {
    if (!ok) return;
    var nm = document.getElementById('dea-name').value.trim();
    if (!nm) { showToast('请输入设备名称','error'); return; }
    var id = 'dev_' + Math.floor(Math.random()*9000+1000);
    dataService.insert('devices', {
      id: id, name: nm, type: document.getElementById('dea-type').value,
      location: document.getElementById('dea-loc').value, status:'online',
      metrics: '{}', runHours: 0,
      lastMaintenance: new Date().toISOString().slice(0,10),
      nextMaintenance: '', ipAddress: document.getElementById('dea-ip').value,
      firmwareVersion: 'v1.0.0'
    });
    devRefreshAll(); logOperation('新增','设备','新设备已添加'); showToast('设备添加成功', 'success');
  });
};

window.devQuickCtrl = function(sys, label) {
  showToast(sys+' 鈫? '+label+' | 指令已下发', 'info');
};

// === 农事交互统一 ===
window.farmRefreshAll = function() {
  renderFarming();
  renderDashboard();
  if (document.getElementById('management') && !document.getElementById('management').classList.contains('hidden')) {
    renderManagement();
  }
};

window.farmDeleteIrrigation = function(id) {
  var p = dataService.getById('irrigation_plans', id);
  showConfirm('删除灌溉方案', '<p class="text-sm">确定删除 <b>地块'+p.fieldCode+' '+p.cropName+'</b> 的灌溉方案吗？</p>', function(ok) {
    if (!ok) return;
    dataService.delete('irrigation_plans', id);
    farmRefreshAll(); logOperation('删除','灌溉方案','方案已删除'); showToast('灌溉方案已删除', 'success');
  });
};

window.farmExecIrrigation = function(id) {
  var p = dataService.getById('irrigation_plans', id);
  if (!p) return;
  dataService.update('irrigation_plans', id, {status:'completed', currentMoisture: p.targetMoisture});
  farmRefreshAll(); logOperation('执行','灌溉方案','方案已执行'); showToast('灌溉方案已执行，湿度已更新', 'success');
};

window.farmDeleteTask = function(id) {
  var t = dataService.getById('farming_tasks', id);
  showConfirm('删除任务', '<p class="text-sm">确定删除 <b>地块'+t.fieldCode+' '+(t.type||'')+'</b> 任务吗？</p>', function(ok) {
    if (!ok) return;
    dataService.delete('farming_tasks', id);
    farmRefreshAll(); logOperation('删除','农事任务','任务已删除'); showToast('任务已删除', 'success');
  });
};

window.farmSetTaskStatus = function(id, status) {
  dataService.update('farming_tasks', id, {status: status});
  farmRefreshAll(); logOperation('修改','农事任务','任务状态已更新'); showToast('任务状态已更新', 'success');
};

window.farmEditPlan = function(table, id) {
  var row = dataService.getById(table, id);
  if (!row) return;
  var h = '<div class="space-y-2">';
  if (table==='irrigation_plans') {
    h += '<div><label class="text-xs text-gray-500">目标湿度(%)</label><input id="fp-tm" class="w-full px-3 py-2 border rounded text-sm" value="'+row.targetMoisture+'"></div><div><label class="text-xs text-gray-500">水量(m鲁)</label><input id="fp-wv" class="w-full px-3 py-2 border rounded text-sm" value="'+row.waterVolume+'"></div><div><label class="text-xs text-gray-500">时长(分钟)</label><input id="fp-ed" class="w-full px-3 py-2 border rounded text-sm" value="'+row.estimatedDuration+'"></div>';
  }
  if (table==='fertilization_plans') {
    h += '<div class="grid grid-cols-2 gap-2"><div><label class="text-xs text-gray-500">氮肥 N (kg)</label><input id="fp2-n" class="w-full px-3 py-2 border rounded text-sm" value="'+(row.nKg||0)+'"></div><div><label class="text-xs text-gray-500">磷肥 P (kg)</label><input id="fp2-p" class="w-full px-3 py-2 border rounded text-sm" value="'+(row.pKg||0)+'"></div><div><label class="text-xs text-gray-500">钾肥 K (kg)</label><input id="fp2-k" class="w-full px-3 py-2 border rounded text-sm" value="'+(row.kKg||0)+'"></div><div><label class="text-xs text-gray-500">有机肥 (kg)</label><input id="fp2-o" class="w-full px-3 py-2 border rounded text-sm" value="'+(row.organicKg||0)+'"></div></div>';
  }
  h += '</div>';
  showConfirm(table==='fertilization_plans'?'调整施肥参数':'调整方案参数', h, function(ok) {
    if (!ok) return;
    var changes = {};
    if (table==='irrigation_plans') {
      changes.targetMoisture = parseInt(document.getElementById('fp-tm').value)||65;
      changes.waterVolume = parseInt(document.getElementById('fp-wv').value)||10;
      changes.estimatedDuration = parseInt(document.getElementById('fp-ed').value)||30;
    }
    if (table==='fertilization_plans') {
      changes.nKg = parseInt(document.getElementById('fp2-n').value)||0;
      changes.pKg = parseInt(document.getElementById('fp2-p').value)||0;
      changes.kKg = parseInt(document.getElementById('fp2-k').value)||0;
      changes.organicKg = parseInt(document.getElementById('fp2-o').value)||0;
    }
    dataService.update(table, id, changes);
    farmRefreshAll(); showToast('参数已更新', 'success');
  });
};

window.farmFieldDetail = function(id) {
  var f = dataService.getById('fields', id);
  if (!f) return;
  var h = '<div class="space-y-2 text-sm"><div class="grid grid-cols-2 gap-2"><div><span class="text-gray-500">地块：</span>'+f.code+'</div><div><span class="text-gray-500">面积：</span>'+f.area+'亩</div><div><span class="text-gray-500">作物：</span>'+f.cropName+'</div><div><span class="text-gray-500">状态：</span>'+f.status+'</div><div><span class="text-gray-500">湿度：</span>'+f.soilMoisture+'%</div><div><span class="text-gray-500">pH：</span>'+f.soilPh+'</div><div><span class="text-gray-500">种植：</span>'+f.plantedDate+'</div><div><span class="text-gray-500">预计采收：</span>'+f.expectedHarvest+'</div></div><p class="text-xs text-gray-400">位置：'+f.location+'</p></div>';
  showConfirm('地块详情 - '+f.code, h, function(){});
};

window.farmAddField = function() {
  var h = '<div class="space-y-3"><div><label class="text-xs text-gray-500">地块编号</label><input id="faf-code" class="w-full px-3 py-2 border rounded text-sm" placeholder="A3"></div><div><label class="text-xs text-gray-500">地块名称</label><input id="faf-name" class="w-full px-3 py-2 border rounded text-sm" placeholder="茄子田"></div><div><label class="text-xs text-gray-500">作物</label><input id="faf-crop" class="w-full px-3 py-2 border rounded text-sm" placeholder="茄子"></div><div><label class="text-xs text-gray-500">面积(亩)</label><input id="faf-area" class="w-full px-3 py-2 border rounded text-sm" value="2.0"></div><div><label class="text-xs text-gray-500">位置</label><input id="faf-loc" class="w-full px-3 py-2 border rounded text-sm" placeholder="A区"></div></div>';
  showConfirm('添加地块', h, function(ok) {
    if (!ok) return;
    dataService.insert('fields', {
      id: 'fld_'+Date.now().toString(36),
      code: document.getElementById('faf-code').value, name: document.getElementById('faf-name').value,
      cropName: document.getElementById('faf-crop').value, area: parseFloat(document.getElementById('faf-area').value)||2,
      status:'growing', soilMoisture:50, soilPh:7, location: document.getElementById('faf-loc').value,
      plantedDate: new Date().toISOString().slice(0,10)
    });
    farmRefreshAll(); showToast('地块添加成功', 'success');
  });
};

// === 权限管理 ===
window.permEditRole = function(id) {
  var rl = dataService.getById('roles', id); if (!rl) return;
  var mods = ['dashboard','disease','farming','management','devices','permission'];
  var names = {dashboard:'数据总览',disease:'病虫害识别',farming:'农事管理',management:'农场管理',devices:'设备监控',permission:'权限管理'};
  var perm = typeof rl.permissions==='string' ? JSON.parse(rl.permissions) : (rl.permissions||{});
  var h = '<div class="space-y-3"><div><label class="text-xs text-gray-500">角色名</label><input id="er-nm" class="w-full px-3 py-2 border rounded text-sm" value="'+rl.name+'"></div><p class="text-sm font-medium mt-2">模块权限</p>';
  mods.forEach(function(m){var p=perm[m]||{view:false,edit:false};h+='<div class="flex items-center justify-between p-2 bg-gray-50 rounded"><span class="text-sm">'+names[m]+'</span><div class="flex gap-3"><label class="text-xs"><input type="checkbox" id="per-'+m+'-v" '+(p.view?'checked':'')+'> 查看</label><label class="text-xs"><input type="checkbox" id="per-'+m+'-e" '+(p.edit?'checked':'')+'> 编辑</label></div></div>';});
  h+='</div>';
  showConfirm('编辑角色权限', h, function(ok) {
    if (!ok) return;
    var np = {}; mods.forEach(function(m){np[m]={view:document.getElementById('per-'+m+'-v').checked,edit:document.getElementById('per-'+m+'-e').checked};});
    dataService.update('roles', id, {name:document.getElementById('er-nm').value,permissions:JSON.stringify(np)});
    renderPermission(); showToast('权限已更新','success');
  });
};

// === 预警联动 ===
window.refreshAlerts = function() {
  var alerts = [];
  var tasks = dataService.getAll('farming_tasks')||[];
  var pending = tasks.filter(function(t){return t.status==='pending'||t.status==='in_progress';});
  if (pending.length>=3) alerts.push({module:'farming',title:'待办积压',msg:pending.length+'个农事任务待处理',severity:pending.length>5?'high':'medium',action:'farming'});
  var devices = dataService.getAll('devices')||[];
  var faults = devices.filter(function(d){return d.status==='fault'||d.status==='offline';});
  if (faults.length) alerts.push({module:'devices',title:'设备异常',msg:faults.length+'台故障: '+faults.map(function(d){return d.name;}).join('、'),severity:'high',action:'devices'});
  var inv = dataService.getAll('inventory')||[];
  var low = inv.filter(function(i){return (i.quantity||0)<=(i.minStock||5);});
  if (low.length) alerts.push({module:'management',title:'库存偏低',msg:low.map(function(i){return i.name+'仅剩'+(i.quantity||0)+i.unit;}).join('，'),severity:'medium',action:'management'});

  var alertList = document.getElementById('alert-list');
  if (!alertList) return;
  var sevBg = {high:'border-red-200 bg-red-50',medium:'border-yellow-200 bg-yellow-50',low:'border-blue-200 bg-blue-50'};
  var sevBadge = {high:'bg-red-100 text-red-600',medium:'bg-yellow-100 text-yellow-600',low:'bg-blue-100 text-blue-600'};
  var sevTxt = {high:'高',medium:'中',low:'低'};
  var modMap = {weather:'天气',disease:'病害',farming:'农事',market:'市场',devices:'设备',management:'库存'};
  var modIcon = {weather:'fa-cloud',disease:'fa-bug',farming:'fa-leaf',market:'fa-line-chart',devices:'fa-cog',management:'fa-cube'};

  if (!alerts.length) {
    alertList.innerHTML = '<div class="text-center text-gray-400 py-8"><i class="fa fa-check-circle text-3xl text-green-400 mb-2 block"></i>所有模块运行正常</div>';
    setText('stat-alert-count', 0); return;
  }
  alertList.innerHTML = alerts.map(function(a){
    return '<div class="p-3 '+(sevBg[a.severity]||'')+' rounded-lg border cursor-pointer" onclick="switchToMenu(\''+(a.action||'')+'\')"><div class="flex items-center justify-between mb-1"><span class="text-sm font-medium">'+a.title+'</span><span class="px-1.5 py-0.5 text-xs rounded '+(sevBadge[a.severity]||'')+'">'+(sevTxt[a.severity]||'')+'</span></div><p class="text-xs text-gray-500">'+a.message+'</p><div class="flex items-center justify-between mt-1.5"><span class="text-xs text-gray-400"><i class="fa '+(modIcon[a.module]||'fa-bell')+' mr-1"></i>'+(modMap[a.module]||a.module)+'</span><span class="text-xs text-blue-500">点击跳转 <i class="fa fa-arrow-right"></i></span></div></div>';
  }).join('');
  setText('stat-alert-count', alerts.length);
};

window.switchToMenu = function(menuId) {
  if (!menuId) return;
  var btn = document.querySelector('.sidebar-item[data-menu="'+menuId+'"]');
  if (btn) btn.click();
};

// === 天气真实API ===
window.weatherCity = 'kunming';
window.weatherCache = null;
var CITY_COORDS = {
  kunming:{name:'昆明',lat:25.04,lon:102.68},yuxi:{name:'玉溪',lat:24.35,lon:102.54},
  dali:{name:'大理',lat:25.59,lon:100.23},qujing:{name:'曲靖',lat:25.49,lon:103.79},
  baoshan:{name:'保山',lat:25.12,lon:99.17},zhaotong:{name:'昭通',lat:27.34,lon:103.72},
  lijiang:{name:'丽江',lat:26.87,lon:100.23},puer:{name:'普洱',lat:22.78,lon:100.97},
  lincang:{name:'临沧',lat:23.89,lon:100.09},chuxiong:{name:'楚雄',lat:25.04,lon:101.55},
  honghe:{name:'红河·蒙自',lat:23.37,lon:103.39},wenshan:{name:'文山',lat:23.37,lon:104.24},
  xishuangbanna:{name:'西双版纳·景洪',lat:22.01,lon:100.80},dehong:{name:'德宏·芒市',lat:24.43,lon:98.59},
  nujiang:{name:'怒江·泸水',lat:25.85,lon:98.86},diqing:{name:'迪庆·香格里拉',lat:27.83,lon:99.70}
};

// === 挂载后自动覆盖 app.js 中的 renderManagement/renderFarming/renderDevices/renderWeather/renderMarket/renderDashboard ===
console.log('[SmartFarm] 改进补丁已加载 - 库存/设备/农事/预警/天气函数就绪');

// === 真实天气 API (Open-Meteo, 免费无需 Key) ===
window.fetchWeatherReal = function() {
  if (window.weatherCache && window.weatherCache.time && (Date.now() - window.weatherCache.time < 300000)) {
    renderWeatherAs(window.weatherCache);
    return;
  }
  var city = CITY_COORDS[window.weatherCity || 'kunming'] || CITY_COORDS['kunming'];
  var url = 'https://api.open-meteo.com/v1/forecast?latitude='+city.lat+'&longitude='+city.lon+'&current=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,rain,weather_code&daily=temperature_2m_max,temperature_2m_min,rain_sum,weather_code&timezone=Asia/Shanghai&forecast_days=7';
  fetch(url).then(function(r){return r.json();}).then(function(data){
    var wc = {city:city.name, time:Date.now(), forecast:[]};
    var cur = data.current || {};
    wc.temp = cur.temperature_2m || 25;
    wc.humidity = cur.relative_humidity_2m || 60;
    wc.wind = cur.wind_speed_10m || 2;
    wc.windDir = cur.wind_direction_10m || 180;
    var daily = data.daily || {};
    wc.rain = (daily.rain_sum && daily.rain_sum[0]) || cur.rain || 0;
    wc.code = cur.weather_code || 0;
    // WMO 天气代码 → 中文标签（正确映射，不再出现暴雪等不合理结果）
    var wmoMap = {0:'晴天',1:'晴',2:'少云',3:'多云',45:'雾',48:'雾凇',51:'毛毛雨',53:'小雨',55:'中雨',61:'小雨',63:'中雨',65:'大雨',71:'小雪',73:'中雪',75:'大雪',77:'雪粒',80:'阵雨',81:'中阵雨',82:'大阵雨',85:'小阵雪',86:'大阵雪',95:'雷暴',96:'雷暴+冰雹',99:'强雷暴'};
    wc.condLabel = wmoMap[wc.code] || (wc.code >= 80 ? '阵雨' : wc.code >= 60 ? '雨' : wc.code >= 50 ? '小雨' : wc.code >= 40 ? '雾' : wc.code >= 30 ? '沙尘' : wc.code <= 3 ? '晴' : '未知');
    for (var i=0;i<(daily.time||[]).length;i++) {
      wc.forecast.push({date:daily.time[i].slice(5),high:daily.temperature_2m_max[i],low:daily.temperature_2m_min[i],rain:daily.rain_sum[i],code:daily.weather_code[i]});
    }
    window.weatherCache = wc;
    renderWeatherAs(wc);
  }).catch(function(){});
};

window.renderWeatherAs = function(wc) {
  setText('stat-temp', wc.temp+'\u00b0C');
  setText('stat-temp-change', wc.city + ' \u00b7 ' + (wc.condLabel||''));
  setText('stat-rainfall', (wc.rain||0)+'mm');
  setText('stat-rainfall-desc', (wc.rain||0)>0?'\u6709\u964d\u96e8':'\u65e0\u964d\u96e8');
  setText('stat-humidity', wc.humidity+'%');
  setText('stat-wind', wc.wind+'m/s');
  setText('stat-condition', '天气: ' + wc.condLabel);
  var fcCont = document.getElementById('weather-forecast-list');
  if (fcCont && wc.forecast) {
    var ic = {'0':'fa-sun-o text-orange-400','1':'fa-cloud text-gray-400','2':'fa-cloud text-gray-400','3':'fa-cloud text-gray-500','45':'fa-align-justify text-gray-400','51':'fa-tint text-blue-400','61':'fa-tint text-blue-400','80':'fa-tint text-blue-600','95':'fa-bolt text-yellow-500'};
    fcCont.innerHTML = wc.forecast.slice(0,7).map(function(f){
      var ik = String(Math.round((f.code||0)/10)*10);
      return '<div class="flex items-center justify-between p-2 bg-gray-50 rounded-lg"><span class="text-sm text-gray-700 w-14">'+f.date+'</span><i class="fa '+(ic[ik]||ic['0'])+' text-lg"></i><span class="text-sm font-medium">'+f.high+'\u00b0 / '+f.low+'\u00b0</span></div>';
    }).join('');
  }
  var av = document.getElementById('weather-advice');
  if (av) {
    var a = wc.temp>30?'\u26a0 \u9ad8\u6e29\u9884\u8b66\uff01\u5efa\u8bae\u6e05\u6668\u548c\u508d\u665a\u8fdb\u884c\u519c\u4e8b\u4f5c\u4e1a\uff0c\u6ce8\u610f\u4eba\u5458\u9632\u6691\u964d\u6e29\u3002':
        wc.rain>10?'\u2614 \u964d\u96e8\u9884\u8b66\uff01\u5efa\u8bae\u6682\u505c\u6237\u5916\u519c\u4e8b\u4f5c\u4e1a\uff0c\u68c0\u67e5\u6392\u6c34\u7cfb\u7edf\u548c\u5927\u68da\u7a33\u56fa\u3002':
        wc.wind>15?'\ud83c\udf2c \u5927\u98ce\u9884\u8b66\uff01\u5efa\u8bae\u52a0\u56fa\u5927\u68da\uff0c\u6682\u505c\u55b7\u836f\u4f5c\u4e1a\u3002':
        '\u2705 \u5929\u6c14\u72b6\u51b5\u826f\u597d\uff0c\u9002\u5408\u4f5c\u4e1a\u3002\u5efa\u8bae\u6839\u636e\u571f\u58e4\u5e72\u6e7f\u60c5\u51b5\u5b89\u6392\u704c\u6e89\u3002';
    av.innerHTML = '<i class="fa fa-info-circle mr-1"></i>'+a;
  }
  // API 数据到达后再渲染图表
  if (typeof initWeatherCharts === 'function') setTimeout(initWeatherCharts, 200);
};

// === AI 治疗方案推荐 (DeepSeek) ===
window.diseaseAskAI = function(diseaseName, cropAffected) {
  if (typeof APP_CONFIG === 'undefined' || !APP_CONFIG.DEEPSEEK_API_KEY) {
    showToast('AI Key 未配置','error'); return;
  }
  var overlay = document.createElement('div');
  overlay.className = 'fixed inset-0 bg-black/50 z-50 flex items-center justify-center perm-modal';
  overlay.innerHTML = '<div class="bg-white rounded-xl p-6 max-w-lg w-full mx-4 shadow-xl"><h3 class="text-lg font-semibold mb-4">AI 治疗方案分析中...</h3><div class="flex items-center justify-center py-8"><i class="fa fa-spinner fa-spin text-blue-500 text-3xl"></i><span class="ml-3 text-sm text-gray-500">DeepSeek 正在分析病害方案...</span></div><div class="flex justify-end"><button onclick="this.closest(\x27.perm-modal\x27).remove()" class="px-4 py-2 border rounded-lg text-sm">取消</button></div></div>';
  document.body.appendChild(overlay);

  fetch('https://api.deepseek.com/chat/completions', {
    method:'POST',
    headers:{'Content-Type':'application/json','Authorization':'Bearer '+APP_CONFIG.DEEPSEEK_API_KEY},
    body:JSON.stringify({
      model:'deepseek-chat',
      messages:[{role:'system',content:'你是高级农业植保专家，精通病虫害诊断和防治。请用简洁专业的中文回复。'},
                {role:'user',content:'作物"'+cropAffected+'"出现"'+diseaseName+'"，请提供专业的治疗方案及预防建议。请包含：1.病因简介 2.化学防治方案 3.生物/农业防治方案 4.预防建议。每项用简洁的要点列出。'}],
      max_tokens:800,temperature:0.3
    })
  }).then(function(r){return r.json();}).then(function(data){
    var msg = (data.choices||[])[0].message.content || '暂无可用的治疗方案';
    overlay.innerHTML = '<div class="bg-white rounded-xl p-6 max-w-lg w-full mx-4 shadow-xl"><h3 class="text-lg font-semibold mb-4">\u2728 AI 治疗方案</h3><div class="text-sm space-y-2 max-h-96 overflow-y-auto mb-4"><div class="bg-gray-50 p-3 rounded text-xs leading-relaxed whitespace-pre-wrap">'+msg.replace(/</g,'&lt;').replace(/>/g,'&gt;')+'</div></div><p class="text-xs text-gray-400 text-center mb-3">\u2014\u2014 DeepSeek AI \u2014\u2014</p><div class="flex justify-end"><button onclick="this.closest(\x27.perm-modal\x27).remove()" class="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm">关闭</button></div></div>';
  }).catch(function(){
    overlay.innerHTML = '<div class="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl"><h3 class="text-lg font-semibold mb-4">请求失败</h3><p class="text-sm text-gray-500">AI 服务暂不可用，请稍后重试。</p><div class="flex justify-end mt-4"><button onclick="this.closest(\x27.perm-modal\x27).remove()" class="px-4 py-2 bg-gray-500 text-white rounded-lg text-sm">关闭</button></div></div>';
  });
};

// === 重写 viewDiseaseRecord 加入 AI 按钮 ===
var _origViewDiseaseRecord = viewDiseaseRecord;
viewDiseaseRecord = function(id) {
  if (!dsReady()) return;
  var r = ds().getById('disease_records', id);
  if (!r) { showToast('记录不存在', 'error'); return; }
  var sevMap = { low:'低', medium:'中', high:'高', critical:'严重' };
  var sev = r.severity || 'medium';
  var conf = Math.round((r.confidence||0)*100);

  var html = '<div class="space-y-4 text-sm">';
  html += '<div class="bg-blue-50 p-4 rounded-xl text-center"><div class="text-xl font-bold text-blue-700 mb-1">'+(r.diseaseName||'未知病害')+'</div><div class="text-xs text-blue-500">置信度 '+conf+'% \u00b7 '+sevMap[sev]+'严重 \u00b7 '+formatDateTime(r.detectedAt)+'</div></div>';
  html += '<div class="text-xs text-gray-600">作物：'+(r.cropAffected||'未知')+'</div>';
  if (r.detail) html += '<div class="bg-gray-50 p-3 rounded text-xs"><p class="font-medium mb-1">Top5 预测结果</p>'+r.detail.replace(/\\n/g,'<br>')+'</div>';
  html += '<div class="flex justify-center pt-2"><button onclick="var m=document.querySelector(\x27.perm-modal\x27);if(m)m.remove();diseaseAskAI(\x27'+(r.diseaseName||'').replace(/\x27/g,'\\\x27')+'\x27,\x27'+(r.cropAffected||'').replace(/\x27/g,'\\\x27')+'\x27)" class="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm rounded-lg hover:opacity-90">\ud83e\ude84 AI 治疗方案推荐</button></div>';
  html += '</div>';
  showConfirm('识别详情', html, function(){});
};

// === 删除识别历史记录 ===
window.deleteDiseaseRecord = function(id) {
  var r = dataService.getById('disease_records', id);
  showConfirm('删除记录', '<p class="text-sm">确定删除识别记录 <b>'+(r ? r.diseaseName : '')+'</b> 吗？</p>', function(ok){
    if (!ok) return;
    dataService.delete('disease_records', id);
    try { dataService._saveToLocal(); } catch(e) {}
    if (typeof renderDisease === 'function') renderDisease();
    showToast('已删除', 'success');
  });
};

console.log('[SmartFarm] 补丁已加载: 库存/设备/农事/预警/天气/DiseaseAI');

// === 操作日志渲染 ===
window.renderOperationLogs = function() {
  var logs = (dataService._tables && dataService._tables['operation_logs']) ? dataService._tables['operation_logs'] : [];
  logs = logs.slice(-50).reverse(); // 最近50条，最新在前
  var container = document.getElementById('operation-log-list');
  if (!container) return;
  if (!logs.length) { container.innerHTML = '<p class="text-sm text-gray-400 text-center py-4">暂无操作记录</p>'; return; }
  var actionBadge = {'新增':'bg-green-100 text-green-600','修改':'bg-blue-100 text-blue-600','删除':'bg-red-100 text-red-600','执行':'bg-purple-100 text-purple-600','入库':'bg-teal-100 text-teal-600','出库':'bg-orange-100 text-orange-600','控制':'bg-yellow-100 text-yellow-600','刷新':'bg-gray-100 text-gray-600','登录':'bg-indigo-100 text-indigo-600'};
  container.innerHTML = logs.map(function(l){
    var badge = actionBadge[l.action] || 'bg-gray-100 text-gray-600';
    return '<div class="flex items-center justify-between p-2 bg-gray-50 rounded-lg text-xs"><div class="flex items-center gap-2"><span class="px-1.5 py-0.5 rounded '+badge+'">'+l.action+'</span><span class="text-gray-600">'+l.target+'</span><span class="text-gray-500">'+ (l.detail||'') +'</span></div><div class="text-gray-400"><span class="mr-3">'+ (l.operator||'') +'</span>'+ (l.operatedAt||'') +'</div></div>';
  }).join('');
};

// === 查看全部操作日志 ===
window.viewAllLogs = function() {
  var logs = (dataService._tables && dataService._tables['operation_logs']) ? dataService._tables['operation_logs'] : [];
  logs = logs.slice().reverse(); // 全部，最新在上
  if (!logs.length) { showToast('暂无操作记录', 'info'); return; }
  var actionBg = {'新增':'bg-green-100','入库':'bg-teal-100','出库':'bg-orange-100','修改':'bg-blue-100','删除':'bg-red-100','执行':'bg-purple-100','控制':'bg-yellow-100','刷新':'bg-gray-100','登录':'bg-indigo-100'};
  var html = '<div class="space-y-2 max-h-96 overflow-y-auto">';
  logs.forEach(function(l){
    var bg = actionBg[l.action] || 'bg-gray-100';
    html += '<div class="flex items-center justify-between p-2 '+bg+' rounded-lg text-xs"><div class="flex items-center gap-2"><span class="font-medium text-gray-700">'+l.action+'</span><span class="text-gray-600">'+l.target+'</span><span class="text-gray-500">'+(l.detail||'')+'</span></div><div class="text-gray-400 flex-shrink-0"><span class="mr-2">'+(l.operator||'')+'</span>'+(l.operatedAt||'')+'</div></div>';
  });
  html += '</div>';
  showConfirm('全部操作日志 ('+logs.length+'条)', html, function(){});
};

;

;

