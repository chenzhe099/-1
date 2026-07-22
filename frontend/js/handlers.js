/**
 * 智慧农业管理系统 - 完整交互事件处理器 v3
 * 所有弹窗使用 Modal 组件，所有按钮/行/开关均有数据联动
 */

function showToast(msg, type) {
  const old = document.querySelector('.custom-toast');
  if (old) old.remove();
  const colors = { info: 'bg-blue-500', success: 'bg-green-500', warning: 'bg-yellow-500', error: 'bg-red-500' };
  const el = document.createElement('div');
  el.className = `custom-toast fixed bottom-6 right-6 ${colors[type] || colors.info} text-white px-6 py-3 rounded-xl shadow-lg z-50 text-sm`;
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(function(){ el.remove(); }, 3000);
}

function uid() { return 'a' + Date.now().toString(36) + Math.random().toString(36).slice(2,7); }

function dsReady() { return typeof dataService !== 'undefined' && dataService.isReady(); }
function ds() { return dataService; }

// ==================== 初始化 ====================

// ==================== 登录系统 ====================

// ==================== 卡片跳转 ====================

function navigateTo(menuId) {
  var btn = document.querySelector('.sidebar-item[data-menu="' + menuId + '"]');
  if (btn && btn.style.display !== 'none') {
    btn.click();
  } else {
    showToast('您没有访问该模块的权限', 'warning');
  }
}

// ==================== 登录系统 ====================

function showLoginModal() {
  document.getElementById('login-overlay').style.display = '';
  document.getElementById('login-username').focus();
}

function hideLoginModal() {
  document.getElementById('login-overlay').style.display = 'none';
}

function doLogin() {
  var username = document.getElementById('login-username').value.trim();
  var password = document.getElementById('login-password').value.trim();
  var errEl = document.getElementById('login-error');

  if (!username || !password) {
    errEl.textContent = '请输入用户名和密码';
    errEl.classList.remove('hidden');
    return;
  }

  var result = Auth.login(username, password);
  if (!result.success) {
    errEl.textContent = result.message;
    errEl.classList.remove('hidden');
    return;
  }

  errEl.classList.add('hidden');
  hideLoginModal();
  document.getElementById('app-container').style.display = '';
  Auth.applyPermissionUI();
  initAppAfterLogin();
  showToast('欢迎回来，' + result.user.displayName + '！', 'success');
}

function doLogout() {
  Auth.logout();

  // 隐藏整个应用界面（含侧边栏）
  document.getElementById('app-container').style.display = 'none';

  // 显示登录弹窗
  showLoginModal();
  document.getElementById('login-username').value = '';
  document.getElementById('login-password').value = '';
  document.getElementById('login-error').classList.add('hidden');
  document.getElementById('login-username').focus();

  showToast('您已安全退出', 'info');
}

document.addEventListener('DOMContentLoaded', function() {
  setTimeout(function() {
    initHeaderEvents();
    observeSectionChanges();
    rebindSectionEvents();
  }, 600);
});

function observeSectionChanges() {
  document.querySelectorAll('.sidebar-item').forEach(function(btn) {
    btn.addEventListener('click', function() { setTimeout(rebindSectionEvents, 150); });
  });
  document.querySelectorAll('[data-menu]').forEach(function(btn) {
    if (!btn.classList.contains('sidebar-item')) {
      btn.addEventListener('click', function() { setTimeout(rebindSectionEvents, 150); });
    }
  });
}

function rebindSectionEvents() {
  var sec = document.querySelector('section:not(.hidden)');
  if (!sec) return;
  var sid = sec.id;
  var m = {
    dashboard: setupDashboard, disease: setupDisease, farming: setupFarming,
    prediction: setupPrediction, management: setupManagement, devices: setupDevices,
    traceability: setupTraceability, permission: setupPermission,
    weather: setupWeather, market: setupMarket, monitor: setupMonitor
  };
  if (m[sid]) m[sid]();
}

// ==================== 头部 ====================

function initHeaderEvents() {
  var si = document.getElementById('header-search');
  if (si) si.addEventListener('keydown', function(e) { if (e.key === 'Enter' && this.value.trim()) performSearch(this.value.trim()); });

  var bb = document.querySelector('header button .fa-bell');
  if (bb) bb.closest('button').addEventListener('click', function() {
    var n = dsReady() ? ds().table('alerts').where('isResolved','eq',false).count() : 0;
    var dot = document.getElementById('notification-dot'); if (dot) dot.classList.add('hidden');
    showNotificationPanel(n);
    setTimeout(function(){ if (dot) dot.classList.remove('hidden'); }, 5000);
  });

  var cb = document.querySelector('header button .fa-calendar');
  if (cb) cb.closest('button').addEventListener('click', function() {
    var d = new Date(); showToast('今天是 ' + d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0'), 'info');
  });

  // 退出登录由 doLogout() (handlers.js line ~60) 统一处理
  // 不再在此处绑定冲突的 onclick 处理器
}

function showNotificationPanel(count) {
  if (!dsReady()) return;
  var alerts = ds().table('alerts').where('isResolved','eq',false).get();
  var rows = alerts.map(function(a) {
    var sc = {critical:'red',warning:'yellow',info:'blue'};
    var c = sc[a.severity]||'gray';
    return '<div class="flex items-start p-3 bg-'+c+'-50 rounded-lg border border-'+c+'-100 mb-2"><i class="fa fa-bell text-'+c+'-500 mr-3 mt-0.5"></i><div class="flex-1"><p class="text-sm font-medium">'+a.title+'</p><p class="text-xs text-gray-600">'+a.message+'</p></div></div>';
  }).join('');
  if (!rows) rows = '<p class="text-center text-gray-400 py-4">暂无未处理预警</p>';
  modal.detail({title:'通知中心 ('+count+'条未处理)', body:rows, width:'max-w-lg'});
}

// ==================== 仪表盘 ====================

function setupDashboard() {
  document.querySelectorAll('#dashboard .time-range-btn').forEach(function(btn) {
    btn.onclick = function() {
      document.querySelectorAll('#dashboard .time-range-btn').forEach(function(b){b.classList.remove('bg-blue-100','text-blue-600');b.classList.add('bg-gray-100','text-gray-600');});
      this.classList.remove('bg-gray-100','text-gray-600'); this.classList.add('bg-blue-100','text-blue-600');
      if (typeof refreshEnvironmentChart === 'function') refreshEnvironmentChart(this.dataset.range);
      showToast('环境数据已切换为"'+this.textContent.trim()+'"视图','info');
    };
  });

  var va = document.getElementById('btn-view-all-tasks');
  if (va) va.onclick = function() { showAllTasksModal(); };

  var ha = document.getElementById('btn-handle-all-alerts');
  if (ha) ha.onclick = function() {
    if (!dsReady()) return;
    var alerts = ds().table('alerts').where('isResolved','eq',false).get();
    if (alerts.length===0) { showToast('没有需要处理的预警','info'); return; }
    modal.confirm('批量处理预警','确定标记全部 ' + alerts.length + ' 条预警为已处理吗？').then(function(ok) {
      if (ok) { alerts.forEach(function(a){ ds().update('alerts',a.id,{isResolved:true,isRead:true}); }); renderDashboard(); showToast('已处理 '+alerts.length+' 条预警','success'); }
    });
  };

  var nt = document.getElementById('btn-new-task');
  if (nt) nt.onclick = function() { showCreateTaskModal(); };
}

// ==================== 病虫害 ====================

function setupDisease() {
  var ua = document.querySelector('#disease .upload-area');
  var fi = document.getElementById('disease-image-upload');
  if (ua && fi) {
    ua.onclick = function(){ fi.click(); };
    ua.ondragover = function(e){ e.preventDefault(); ua.classList.add('border-blue-400','bg-blue-50'); };
    ua.ondragleave = function(){ ua.classList.remove('border-blue-400','bg-blue-50'); };
    ua.ondrop = function(e){ e.preventDefault(); ua.classList.remove('border-blue-400','bg-blue-50'); handleDiseaseFile(e.dataTransfer.files[0]); };
    fi.onchange = function(e){ if (e.target.files[0]) handleDiseaseFile(e.target.files[0]); };
  }

  var ub = document.getElementById('btn-upload-disease');
  if (ub) ub.onclick = function(){ document.getElementById('disease-image-upload').click(); };

  var cm = document.getElementById('btn-camera-disease');
  if (cm) cm.onclick = function() {
    showToast('正在启动摄像头...（模拟模式）','info');
    setTimeout(function() {
      var rs = ['番茄晚疫病','蚜虫','白粉病','霜霉病','无病虫害'];
      var r = rs[Math.floor(Math.random()*rs.length)];
      saveDiseaseRecord(r);
      showToast('AI识别结果: ' + r, r==='无病虫害'?'success':'warning');
    }, 1500);
  };

  document.querySelectorAll('#knowledge-base-grid > div').forEach(function(card) {
    card.style.cursor='pointer';
    card.onclick = function() {
      var n = this.querySelector('h4')?.textContent||'';
      if (typeof showDiseaseDetailModal === 'function') showDiseaseDetailModal(n);
    };
  });
}

function handleDiseaseFile(file) {
  if (!file) return;
  if (!['image/jpeg','image/png','image/webp'].includes(file.type)) { showToast('仅支持 JPG、PNG、WebP 格式','error'); return; }
  if (file.size > 10*1024*1024) { showToast('文件不能超过 10MB','error'); return; }
  showToast('正在分析: '+file.name+' ...','info');
  setTimeout(function() {
    var rs = ['番茄晚疫病','蚜虫','白粉病','霜霉病','无病虫害'];
    saveDiseaseRecord(rs[Math.floor(Math.random()*rs.length)]);
  }, 1500);
}

function saveDiseaseRecord(name) {
  if (!dsReady()) return;
  ds().insert('disease_records',{
    id:'dis_'+uid(), fieldId:'field_a1', fieldCode:'A1', diseaseName:name, cropAffected:'番茄',
    detectedAt:new Date().toISOString().slice(0,16).replace('T',' '),
    severity:name==='无病虫害'?'low':'medium', status:name==='无病虫害'?'resolved':'processing',
    imageUrl:'', treatmentPlan:'', resolvedAt:null
  });
  if (typeof renderDisease === 'function') renderDisease();
}

// ==================== 精准农事 ====================

function setupFarming() {
  document.querySelectorAll('#irrigation-plan-list button').forEach(function(btn) {
    btn.onclick = function() {
      var card = this.closest('.p-4');
      var fn = card?.querySelector('span.font-medium')?.textContent||'';
      var txt = this.textContent.trim();
      if (txt.includes('立即执行')) {
        if (dsReady()) { var p = ds().getAll('irrigation_plans').find(function(x){return fn.includes(x.fieldCode);}); if(p)ds().update('irrigation_plans',p.id,{status:'executing'}); }
        showToast(fn+' 灌溉方案已启动执行','success');
      } else if (txt.includes('定时执行')) {
        modal.form({
          title:'定时执行 — '+fn, fields:[
            {name:'date',label:'执行日期',type:'date',required:true,value:new Date().toISOString().slice(0,10)},
            {name:'time',label:'执行时间',type:'time',required:true,value:'14:00'}
          ], submitLabel:'确认定时', onSubmit:function(d){ showToast(fn+' 灌溉已定时: '+d.date+' '+d.time,'success'); }
        });
      }
    };
  });

  document.querySelectorAll('#fertilization-plan-list button').forEach(function(btn) {
    btn.onclick = function() {
      var card = this.closest('.p-4'); var fn = card?.querySelector('span.font-medium')?.textContent||'';
      if (this.textContent.trim().includes('生成方案')) {
        showToast('正在为'+fn+'生成精准施肥方案...','info');
        setTimeout(function(){ showToast(fn+' 施肥方案已生成','success'); },1500);
      }
    };
  });

  var af = document.getElementById('btn-add-field');
  if (af) af.onclick = function(){ showAddFieldModal(); };

  var at = document.getElementById('btn-add-farming-task');
  if (at) at.onclick = function(){ showCreateTaskModal(); };

  document.querySelectorAll('#field-management-list > div').forEach(function(row) {
    row.style.cursor='pointer';
    row.onclick = function() {
      var name = this.querySelector('p.text-sm')?.textContent||'';
      if (!dsReady()) return;
      var code = name.match(/地块(\w+)/)?.[1]||'';
      var field = ds().table('fields').where('code','eq',code).first();
      if (field) showFieldDetailModal(field.id);
    };
  });

  document.querySelectorAll('#farming .bg-blue-100.text-blue-600.rounded-full').forEach(function(date) {
    date.style.cursor='pointer';
    date.onclick = function() {
      var day = this.textContent.trim();
      if (dsReady()) {
        var plans = ds().table('irrigation_plans').where('scheduledAt','contains','-'+day.padStart(2,'0')).get();
        if (plans.length>0) {
          var html = plans.map(function(p){return '<div class="p-3 bg-blue-50 rounded-lg mb-2"><p class="text-sm font-medium">'+p.fieldCode+' - '+p.cropName+'</p><p class="text-xs text-gray-600">水量: '+p.waterVolume+'m³ | 时长: '+p.estimatedDuration+'分钟 | '+p.status+'</p></div>';}).join('');
          modal.detail({title:day+'日灌溉计划',body:html,width:'max-w-md'});
        } else { showToast(day+'日暂无灌溉计划','info'); }
      }
    };
  });

  document.querySelectorAll('#farming .h-3.bg-gray-100.rounded-full').forEach(function(bar) {
    bar.style.cursor='pointer';
    bar.onclick = function() {
      var label = this.parentElement?.querySelector('span.text-sm')?.textContent||'作业';
      var pct = this.querySelector('.rounded-full')?.style?.width||'0%';
      var tasks = dsReady() ? ds().getAll('farming_tasks') : [];
      var typeMap = {灌溉作业:'watering',施肥作业:'fertilizing',喷药作业:'spraying',修剪作业:'pruning'};
      var type = typeMap[label]||'';
      var related = type ? tasks.filter(function(t){return t.type===type;}) : [];
      var body = '<p class="text-sm text-gray-700 mb-3">进度: <span class="font-bold text-lg">'+pct+'</span></p>';
      if (related.length>0) {
        body += '<div class="space-y-2">'+related.map(function(t){return '<div class="flex justify-between p-2 bg-gray-50 rounded"><span class="text-sm">'+t.fieldCode+taskTypeLabel(t.type)+'</span>'+badge(t.status)+'</div>';}).join('')+'</div>';
      } else { body += '<p class="text-gray-400 text-sm">暂无相关任务</p>'; }
      modal.detail({title:label+'详情',body:body,width:'max-w-md'});
    };
  });
}

// ==================== 产量预测 ====================

function setupPrediction() {
  document.querySelectorAll('.btn-risk-detail').forEach(function(btn) {
    btn.onclick = function() {
      var card = this.closest('.p-3')||this.parentElement;
      var title = card?.querySelector('p.font-medium, p.text-sm.font-medium')?.textContent||'风险';
      if (dsReady()) {
        var alert = ds().table('alerts').where('title','contains',title.replace('预警','').replace('风险','').trim()).first();
        if (alert) modal.detail({title:alert.title, body:'<div class="space-y-3"><div class="p-4 bg-red-50 rounded-lg"><p class="text-sm font-medium text-red-700">'+alert.title+'</p><p class="text-sm text-gray-700 mt-1">'+alert.message+'</p></div><p class="text-xs text-gray-500">创建时间: '+alert.createdAt+'</p><p class="text-sm text-blue-600">建议操作: '+(alert.actionRequired||'查看详情')+'</p></div>', width:'max-w-lg'});
        else showToast(title, 'warning');
      }
    };
  });

  document.querySelectorAll('#crop-prediction-list > div').forEach(function(card) {
    card.style.cursor='pointer';
    card.onclick = function() {
      var crop = this.querySelector('p.text-sm')?.textContent||'';
      var yv = this.querySelector('p.text-lg')?.textContent||'';
      var code = crop.match(/[A-C]\d/)?.[0]||'';
      if (dsReady() && code) {
        var field = ds().table('fields').where('code','eq',code).first();
        if (field) showFieldDetailModal(field.id);
      }
    };
  });

  document.querySelectorAll('#farming-calendar-list > div').forEach(function(item) {
    item.style.cursor='pointer';
    item.onclick = function() {
      var title = this.querySelector('p.text-sm')?.textContent||'';
      var day = this.querySelector('span.text-sm')?.textContent?.match(/(\d+)/)?.[1]||'';
      if (dsReady()) {
        var tasks = ds().getAll('farming_tasks').filter(function(t){return t.scheduledTime.includes('-'+day.padStart(2,'0'));});
        var html = tasks.length>0 ? tasks.map(function(t){return '<div class="p-3 bg-gray-50 rounded-lg mb-2"><p class="text-sm font-medium">'+t.fieldCode+taskTypeLabel(t.type)+'</p><p class="text-xs text-gray-500">'+t.scheduledTime+' · '+t.estimatedDuration+'h</p>'+badge(t.status)+'</div>';}).join('') : '<p class="text-gray-400 text-center py-4">当日无任务</p>';
        modal.detail({title:title+' — 详情',body:html,width:'max-w-md'});
      }
    };
  });
}

// ==================== 农场管理 ====================

function setupManagement() {
  var va = document.getElementById('btn-view-all-records');
  if (va) va.onclick = function() { showAllRecordsModal(); };

  var ap = document.getElementById('btn-add-personnel');
  if (ap) ap.onclick = function() { showAddPersonnelModal(); };

  var sm = document.getElementById('btn-stock-management');
  if (sm) sm.onclick = function() { showInventoryDetailModal(); };

  var fr = document.getElementById('farm-record-list');
  if (fr) fr.querySelectorAll('> div').forEach(function(row) {
    row.style.cursor='pointer'; row.onclick = function() {
      var txt = (row.querySelector('p.text-sm')?.textContent||'').trim();
      var code = txt.match(/([A-C]\d)/)?.[1]||'';
      if (dsReady() && code) showFieldDetailModal(ds().table('fields').where('code','eq',code).first()?.id);
    };
  });

  var pl = document.getElementById('personnel-list');
  if (pl) pl.querySelectorAll('> div').forEach(function(row) {
    row.style.cursor='pointer'; row.onclick = function() {
      var name = row.querySelector('p.text-sm')?.textContent||'';
      if (dsReady()) {
        var p = ds().table('personnel').where('name','eq',name).first();
        if (p) showPersonnelDetailModal(p.id);
      }
    };
  });

  var il = document.getElementById('inventory-list');
  if (il) il.querySelectorAll('> div').forEach(function(row) {
    row.style.cursor='pointer'; row.onclick = function() {
      var name = row.querySelector('p.text-sm')?.textContent||'';
      if (dsReady()) {
        var inv = ds().table('inventory').where('name','eq',name).first();
        if (inv) {
          modal.detail({title:inv.name,body:'<div class="space-y-3"><div class="grid grid-cols-2 gap-3"><div class="bg-gray-50 p-3 rounded"><span class="text-xs text-gray-500">类别</span><p class="font-semibold">'+inv.category+'</p></div><div class="bg-gray-50 p-3 rounded"><span class="text-xs text-gray-500">库存量</span><p class="font-semibold">'+inv.quantity+' '+inv.unit+'</p></div><div class="bg-gray-50 p-3 rounded"><span class="text-xs text-gray-500">警戒线</span><p class="font-semibold text-red-500">≤ '+inv.thresholdLow+'</p></div><div class="bg-gray-50 p-3 rounded"><span class="text-xs text-gray-500">供应商</span><p class="font-semibold">'+inv.supplier+'</p></div></div><p class="text-xs text-gray-500">最后入库: '+inv.lastRestocked+'</p></div>',width:'max-w-md'});
        }
      }
    };
  });
}

// ==================== 设备监控 ====================

function setupDevices() {
  document.querySelectorAll('.btn-device-control').forEach(function(btn) {
    btn.onclick = function() { doDeviceAction(this,'control'); };
  });
  document.querySelectorAll('.btn-device-detail').forEach(function(btn) {
    btn.onclick = function() { doDeviceAction(this,'detail'); };
  });
  document.querySelectorAll('.btn-device-repair').forEach(function(btn) {
    btn.onclick = function() { doDeviceAction(this,'repair'); };
  });
  document.querySelectorAll('.btn-device-data').forEach(function(btn) {
    btn.onclick = function() { doDeviceAction(this,'data'); };
  });
  document.querySelectorAll('.btn-device-restart').forEach(function(btn) {
    btn.onclick = function() { doDeviceAction(this,'restart'); };
  });
  document.querySelectorAll('.btn-device-start-task').forEach(function(btn) {
    btn.onclick = function() { doDeviceAction(this,'start'); };
  });

  document.querySelectorAll('#devices .toggle-switch, #devices button.w-12').forEach(function(tg) {
    tg.onclick = function() {
      var isOn = this.classList.contains('bg-green-500');
      if (isOn) { this.classList.remove('bg-green-500'); this.classList.add('bg-gray-300'); var d=this.querySelector('span'); if(d){d.classList.remove('right-1');d.classList.add('left-1');} }
      else { this.classList.remove('bg-gray-300'); this.classList.add('bg-green-500'); var d=this.querySelector('span'); if(d){d.classList.remove('left-1');d.classList.add('right-1');} }
      var sn = this.closest('.flex.items-center.justify-between')?.querySelector('span.font-medium')?.textContent
            || this.closest('.p-4')?.querySelector('span.font-medium')?.textContent||'系统';
      showToast(sn + ' ' + (isOn?'已关闭':'已开启'), isOn?'warning':'success');
    };
  });

  document.querySelectorAll('.btn-maintenance-schedule').forEach(function(btn) {
    btn.onclick = function() {
      var card = this.closest('.p-3')||this.closest('.bg-white');
      var dn = card?.querySelector('p.text-sm')?.textContent||'设备';
      showMaintenanceModal(dn);
    };
  });

  // 远程控制面板按钮
  document.querySelectorAll('#devices .p-4.bg-gray-50 button').forEach(function(btn) {
    if (btn.classList.contains('toggle-switch')||btn.classList.contains('btn-device-')||btn.classList.contains('btn-maintenance')) return;
    btn.onclick = function() {
      var txt = this.textContent.trim(); var ps = this.closest('.p-4'); var sn = ps?.querySelector('span.font-medium')?.textContent||'';
      if (txt.includes('启动')||txt.includes('开始')||txt.includes('打开')) showToast(sn+': '+txt+' — 指令已发送','success');
      else if (txt.includes('停止')||txt.includes('取消')||txt.includes('关闭')) showToast(sn+': '+txt+' — 已停止','warning');
      else if (txt.includes('+1')||txt.includes('-1')) {
        var cur = parseInt(ps?.querySelector('.bg-gray-100')?.textContent?.trim())||25;
        showToast(sn+': 温度已调至 '+(cur+(txt.includes('+1')?1:-1))+'°C','info');
      }
    };
  });

  // 删除设备按钮
  document.querySelectorAll('.btn-device-delete').forEach(function(btn) {
    btn.onclick = function(e) {
      e.stopPropagation();
      var deviceId = this.dataset.deviceId;
      if (!deviceId || !dsReady()) return;
      var dev = ds().getById('devices', deviceId);
      if (!dev) return;
      modal.confirm('删除设备', '确定要删除设备「' + dev.name + '」吗？此操作不可恢复。').then(function(ok) {
        if (ok) {
          ds().delete('devices', deviceId);
          renderDevices();
          showToast('设备「' + dev.name + '」已删除', 'success');
        }
      });
    };
  });

  // 添加设备按钮
  var addBtn = document.getElementById('btn-add-device');
  if (addBtn) addBtn.onclick = function() { showAddDeviceModal(); };
}

function showAddDeviceModal() {
  if (!dsReady()) return;
  var fields = dsReady() ? ds().getAll('fields') : [];
  modal.form({
    title: '添加新设备',
    fields: [
      { name: 'name', label: '设备名称', type: 'text', required: true, placeholder: '如：土壤传感器 #3' },
      { name: 'type', label: '设备类型', type: 'select', required: true,
        options: [
          { value: 'sensor', label: '传感器' }, { value: 'pump', label: '灌溉泵' },
          { value: 'fertilizer', label: '施肥机' }, { value: 'controller', label: '控制器' },
          { value: 'weather_station', label: '气象站' }
        ]
      },
      { name: 'location', label: '部署位置', type: 'select',
        options: [{ value: '', label: '-- 选择地块 --' }, ...fields.map(f => ({ value: f.id, label: f.code + ' - ' + f.cropName }))]
      },
      { name: 'status', label: '初始状态', type: 'select',
        options: [{ value: 'offline', label: '离线（待上线）' }, { value: 'online', label: '在线' }]
      },
      { name: 'ipAddress', label: 'IP地址', type: 'text', placeholder: '如：192.168.1.200' },
      { name: 'firmwareVersion', label: '固件版本', type: 'text', placeholder: '如：v1.0.0' }
    ],
    submitLabel: '添加设备',
    onSubmit: function(data) {
      if (!dsReady()) return;
      var typeNames = { sensor: '传感器', pump: '灌溉泵', fertilizer: '施肥机', controller: '控制器', weather_station: '气象站' };
      var deviceCount = ds().getAll('devices').length;
      ds().insert('devices', {
        id: 'dev_' + String(deviceCount + 1).padStart(2, '0'),
        name: data.name,
        type: data.type,
        location: data.location || '',
        status: data.status || 'offline',
        metrics: { unit: typeNames[data.type] || data.type },
        runHours: 0,
        lastMaintenance: new Date().toISOString().slice(0, 10),
        nextMaintenance: '',
        ipAddress: data.ipAddress || '',
        firmwareVersion: data.firmwareVersion || 'v1.0.0'
      });
      ds().insert('operation_logs', {
        id: 'log_' + uid(), userId: 'u001', username: 'admin',
        module: 'devices', action: '添加设备: ' + data.name,
        detail: '类型: ' + data.type + ', IP: ' + data.ipAddress,
        timestamp: new Date().toISOString().slice(0, 19).replace('T', ' ')
      });
      renderDevices();
      showToast('设备「' + data.name + '」添加成功', 'success');
    }
  });
}

function doDeviceAction(btn, action) {
  var card = btn.closest('.relative')||btn.closest('.bg-white');
  var dn = card?.querySelector('span.font-medium')?.textContent||'设备';
  if (action==='detail') { if (typeof showDeviceDetailModal==='function') showDeviceDetailModal(dn); return; }
  if (action==='repair'||action==='control') { showMaintenanceModal(dn); return; }
  if (action==='restart') { showToast(dn+' 重启中...','warning'); setTimeout(function(){showToast(dn+' 已重新上线','success');},2000); return; }
  if (action==='start') { showToast(dn+' 任务已启动','success'); return; }
  if (action==='data') {
    if (!dsReady()) return;
    var dev = ds().table('devices').where('name','contains',dn).first();
    if (dev) modal.detail({title:dn+' — 实时数据',body:'<div class="grid grid-cols-2 gap-3">'+Object.entries(dev.metrics||{}).filter(function(x){return x[0]!=='unit';}).map(function(x){return'<div class="bg-gray-50 p-3 rounded"><span class="text-xs text-gray-500">'+x[0]+'</span><p class="font-bold text-lg">'+(x[1]||'--')+'</p></div>';}).join('')+'</div>',width:'max-w-sm'});
  }
}

// ==================== 溯源管理 ====================

function setupTraceability() {
  var ab = document.getElementById('btn-add-product');
  if (ab) ab.onclick = function(){ showAddProductModal(); };

  var qb = document.getElementById('btn-generate-qr');
  if (qb) qb.onclick = function() {
    if (!dsReady()) return;
    var prod = ds().table('products').where('traceStatus','eq','pending').first();
    if (!prod) { showToast('没有待生成溯源码的产品','error'); return; }
    ds().update('products',prod.id,{traceStatus:'traced',qrCode:'QR_'+prod.batchNumber});
    showToast('溯源码已为 '+prod.name+' ('+prod.batchNumber+') 生成','success');
    if (typeof renderTraceability === 'function') renderTraceability();
  };

  document.querySelectorAll('.btn-view-trace').forEach(function(btn) {
    btn.onclick = function() {
      var pid = this.dataset.productId || this.closest('[data-product-id]')?.dataset?.productId;
      if (pid && typeof showTraceDetailModal === 'function') showTraceDetailModal(pid);
    };
  });

  var tl = document.getElementById('timeline-list');
  if (tl) tl.querySelectorAll('> div').forEach(function(row) {
    row.style.cursor='pointer';
    row.onclick = function() {
      var stage = this.querySelector('p.text-sm')?.textContent||'';
      var desc = this.querySelector('p.text-xs.text-gray-600')?.textContent||'';
      showToast(stage+': '+desc,'info');
    };
  });
}

// ==================== 权限管理 ====================

function setupPermission() {
  var au = document.getElementById('btn-add-user');
  if (au) au.onclick = function(){ showAddUserModal(); };

  var ar = document.getElementById('btn-add-role');
  if (ar) ar.onclick = function() { showAddRoleModal(); };

  var vl = document.getElementById('btn-view-all-logs');
  if (vl) vl.onclick = function(){ showAllLogsModal(); };

  document.querySelectorAll('#user-table-body button').forEach(function(btn) {
    btn.onclick = function() {
      var row = this.closest('tr'); var uname = row?.querySelector('td:first-child')?.textContent?.trim()||'';
      if (!dsReady()) return;
      var user = ds().table('users').where('username','eq',uname).first();
      if (!user) return;
      if (this.textContent.trim()==='编辑') { if (typeof showEditUserModal==='function') showEditUserModal(user.id); }
      else {
        modal.confirm('重置密码','确定要重置用户 '+user.displayName+' 的密码吗？').then(function(ok){
          if (ok && dsReady()) {
            ds().insert('operation_logs',{id:'log_'+uid(),action:'重置密码',userId:'u001',username:'admin',module:'权限管理',timestamp:new Date().toISOString().slice(0,16).replace('T',' '),details:'为用户 '+uname+' 重置了密码'});
            showToast('用户 '+user.displayName+' 的密码已重置','warning');
          }
        });
      }
    };
  });

  document.querySelectorAll('#permission .w-12').forEach(function(tg) {
    tg.onclick = function() {
      var isOn = this.classList.contains('bg-green-500');
      if (isOn) { this.classList.remove('bg-green-500'); this.classList.add('bg-gray-300'); var d=this.querySelector('span,.w-4'); if(d){d.classList.remove('right-1');d.classList.add('left-1');} }
      else { this.classList.remove('bg-gray-300'); this.classList.add('bg-green-500'); var d=this.querySelector('span,.w-4'); if(d){d.classList.remove('left-1');d.classList.add('right-1');} }
      var mn = this.closest('.flex.items-center.justify-between')?.querySelector('span.text-sm')?.textContent||'模块';
      showToast(mn+' 权限 '+(isOn?'已禁用':'已启用'), isOn?'warning':'success');
    };
  });

  document.querySelectorAll('#permission input[type="checkbox"]').forEach(function(cb) {
    cb.onchange = function() {
      var label = this.parentElement?.textContent?.trim()||'';
      var mn = this.closest('.flex.items-center.justify-between')?.querySelector('span.text-sm')?.textContent||'';
      showToast(mn+' — '+label+'权限 '+(this.checked?'已勾选':'已取消'),'info');
    };
  });
}

// ==================== 搜索 ====================

function performSearch(query) {
  var map = {'数据':'dashboard','总览':'dashboard','病虫害':'disease','识别':'disease','农事':'farming','灌溉':'farming','施肥':'farming','产量':'prediction','预测':'prediction','农场':'management','记录':'management','设备':'devices','监控':'devices','传感器':'devices','溯源':'traceability','二维码':'traceability','批次':'traceability','权限':'permission','用户':'permission','角色':'permission','天气':'weather','温度':'weather','降雨':'weather','气象':'weather','价格':'market','市场':'market','行情':'market','模型':'monitor','AI':'monitor','漂移':'monitor','Agent':'monitor','样本':'monitor'};
  var q = query.toLowerCase();
  for (var k in map) { if (q.includes(k)) { var b = document.querySelector('.sidebar-item[data-menu="'+map[k]+'"]'); if(b){b.click();return;} } }
  showToast('未找到与 "'+query+'" 相关的模块','info');
}

// ==================== 农场详情弹窗 ====================

function showFieldDetailModal(fieldId) {
  if (!dsReady()) return;
  var f = ds().getById('fields',fieldId); if(!f) return;
  var tasks = ds().table('farming_tasks').where('fieldId','eq',fieldId).orderBy('scheduledTime','desc').limit(6).get();
  var st = {growing:'生长中',watering:'需浇水',disease:'病虫害预警',fallow:'休耕'};
  var body = '<div class="space-y-4">'+
    '<div class="bg-gradient-to-r from-green-50 to-white rounded-xl p-4 border border-green-100">'+
    '<h4 class="text-lg font-bold">'+f.code+' — '+f.cropName+'</h4>'+
    '<p class="text-sm text-gray-500">'+f.name+'</p>'+
    '<div class="grid grid-cols-3 gap-3 mt-3">'+
    '<div class="bg-white p-3 rounded"><span class="text-xs text-gray-500">面积</span><p class="font-bold">'+f.area+'亩</p></div>'+
    '<div class="bg-white p-3 rounded"><span class="text-xs text-gray-500">土壤湿度</span><p class="font-bold">'+f.soilMoisture+'%</p></div>'+
    '<div class="bg-white p-3 rounded"><span class="text-xs text-gray-500">pH值</span><p class="font-bold">'+f.soilPh+'</p></div>'+
    '<div class="bg-white p-3 rounded"><span class="text-xs text-gray-500">种植日期</span><p class="font-bold">'+f.plantedDate+'</p></div>'+
    '<div class="bg-white p-3 rounded"><span class="text-xs text-gray-500">预计采收</span><p class="font-bold">'+(f.expectedHarvest||'--')+'</p></div>'+
    '<div class="bg-white p-3 rounded"><span class="text-xs text-gray-500">状态</span><p class="font-bold">'+(st[f.status]||f.status)+'</p></div>'+
    '</div></div>'+
    (tasks.length>0?'<div class="bg-white rounded-xl p-4 border"><h5 class="font-semibold mb-3">近期农事记录</h5><div class="space-y-2">'+tasks.map(function(t){return '<div class="flex justify-between p-2 bg-gray-50 rounded"><span class="text-sm">'+taskTypeLabel(t.type)+'</span><span class="text-xs text-gray-500">'+t.scheduledTime+'</span>'+badge(t.status)+'</div>';}).join('')+'</div></div>':'')+
    '</div>';
  modal.detail({title:'地块详情 — '+f.code, body:body, width:'max-w-lg'});
}

// ==================== 人员详情弹窗 ====================

function showPersonnelDetailModal(personId) {
  if (!dsReady()) return;
  var p = ds().getById('personnel',personId); if(!p) return;
  var fields = p.assignedFields.map(function(fid){return ds().getById('fields',fid);}).filter(Boolean);
  var body = '<div class="space-y-4">'+
    '<div class="flex items-center"><img src="https://api.dicebear.com/7.x/avataaars/svg?seed='+p.avatar+'" class="w-16 h-16 rounded-full mr-4"><div><h4 class="text-lg font-bold">'+p.name+'</h4><p class="text-sm text-gray-500">'+p.role+'</p></div><span class="ml-auto">'+badge(p.status)+'</span></div>'+
    '<div class="grid grid-cols-2 gap-3"><div class="bg-gray-50 p-3 rounded"><span class="text-xs text-gray-500">手机</span><p class="font-semibold">'+(p.phone||'--')+'</p></div><div class="bg-gray-50 p-3 rounded"><span class="text-xs text-gray-500">邮箱</span><p class="font-semibold">'+(p.email||'--')+'</p></div><div class="bg-gray-50 p-3 rounded"><span class="text-xs text-gray-500">入职日期</span><p class="font-semibold">'+p.joinedAt+'</p></div><div class="bg-gray-50 p-3 rounded"><span class="text-xs text-gray-500">负责地块</span><p class="font-semibold">'+(fields.length>0?fields.map(function(f){return f.code;}).join(', '):'--')+'</p></div></div>'+
    '</div>';
  modal.detail({title:'人员详情 — '+p.name, body:body, width:'max-w-md'});
}

// ==================== 角色添加弹窗 ====================

function showAddRoleModal() {
  var modules = ['dashboard','disease','farming','prediction','management','devices','traceability','permission'];
  var modNames = {dashboard:'数据总览',disease:'病虫害识别',farming:'精准农事',prediction:'产量预测',management:'农场管理',devices:'设备监控',traceability:'溯源管理',permission:'权限管理'};
  modal.form({title:'添加新角色', fields:[
    {name:'name',label:'角色名称',type:'text',required:true,placeholder:'如 质检员'},
    {name:'desc',label:'角色描述',type:'textarea',rows:2,placeholder:'描述该角色的职责和权限范围'},
    {name:'permTemplate',label:'权限模板',type:'select',required:true,
      options:[{value:'farmer',label:'农户模板 — 仅查看'},{value:'technician',label:'技术员模板 — 查看+编辑农事/设备'},{value:'admin',label:'管理员模板 — 全部权限'}]}
  ], submitLabel:'创建角色', onSubmit:function(data) {
    showToast('角色 '+data.name+' 已创建（'+data.permTemplate+'模板）','success');
  }});
}

// ==================== 天气监测 ====================

function setupWeather() {
  document.querySelectorAll('#weather-forecast-list > div').forEach(function(row) {
    row.style.cursor = 'pointer';
    row.onclick = function() {
      var date = this.querySelector('span')?.textContent || '';
      if (dsReady()) {
        var records = ds().table('weather_records').where('date', 'contains', date).get();
        if (records.length > 0) {
          var r = records[0];
          var body = '<div class="space-y-3"><div class="grid grid-cols-2 gap-3">' +
            '<div class="bg-orange-50 p-3 rounded"><span class="text-xs text-gray-500">最高温度</span><p class="font-bold text-orange-600">' + r.temperatureHigh + '°C</p></div>' +
            '<div class="bg-blue-50 p-3 rounded"><span class="text-xs text-gray-500">最低温度</span><p class="font-bold text-blue-600">' + r.temperatureLow + '°C</p></div>' +
            '<div class="bg-cyan-50 p-3 rounded"><span class="text-xs text-gray-500">湿度</span><p class="font-bold text-cyan-600">' + r.humidity + '%</p></div>' +
            '<div class="bg-teal-50 p-3 rounded"><span class="text-xs text-gray-500">风速</span><p class="font-bold text-teal-600">' + r.windSpeed + 'm/s</p></div>' +
            '<div class="bg-indigo-50 p-3 rounded"><span class="text-xs text-gray-500">降雨量</span><p class="font-bold text-indigo-600">' + r.rainfall_mm + 'mm</p></div>' +
            '<div class="bg-green-50 p-3 rounded"><span class="text-xs text-gray-500">预报</span><p class="text-sm">' + r.forecast + '</p></div>' +
            '</div></div>';
          modal.detail({ title: r.date + ' 天气详情', body: body, width: 'max-w-md' });
        }
      }
    };
  });
}

// ==================== 市场价格 ====================

function setupMarket() {
  var sel = document.getElementById('market-crop-selector');
  if (sel) sel.onchange = function() {
    if (dsReady()) {
      var trend = ds().getMarketPriceTrend(this.value);
      refreshPriceChart(trend);
    }
  };

  document.querySelectorAll('#market-price-table-body tr').forEach(function(row) {
    row.style.cursor = 'pointer';
    row.onclick = function() {
      var crop = this.querySelector('td')?.textContent || '';
      if (dsReady()) {
        var prices = ds().table('market_prices').where('cropName', 'eq', crop).orderBy('date', 'asc').get();
        var body = '<div class="space-y-2">' + prices.map(function(p) {
          var tc = p.trend === 'up' ? 'text-red-500' : p.trend === 'down' ? 'text-green-500' : 'text-blue-500';
          return '<div class="flex justify-between p-2 bg-gray-50 rounded"><span class="text-sm">' + p.date + '</span><span class="text-sm font-medium">' + p.pricePerKg.toFixed(2) + '元/kg</span><span class="text-xs ' + tc + '">' + (p.changePercent >= 0 ? '+' : '') + p.changePercent + '%</span></div>';
        }).join('') + '</div>';
        modal.detail({ title: crop + ' 价格走势', body: body, width: 'max-w-md' });
      }
    };
  });
}

function refreshPriceChart(trend) {
  var colors = ['#ef4444','#22c55e','#eab308','#ec4899','#8b5cf6','#f97316'];
  initChart('priceTrendChart', {
    type: 'line',
    data: {
      labels: trend.series[trend.crops[0]] ? trend.series[trend.crops[0]].map(function(p) { return p.date; }) : [],
      datasets: trend.crops.map(function(crop, i) {
        return { label: crop, data: trend.series[crop] ? trend.series[crop].map(function(p) { return p.price; }) : [], borderColor: colors[i % colors.length], backgroundColor: 'transparent', tension: 0.4 };
      })
    },
    options: { responsive: true, plugins: { legend: { position: 'bottom' } }, scales: { y: { beginAtZero: false } } }
  });
}

// ==================== 模型监控 ====================

function setupMonitor() {
  document.querySelectorAll('#model-version-list > div').forEach(function(card) {
    card.style.cursor = 'pointer';
    card.onclick = function() {
      var name = this.querySelector('.text-sm')?.textContent || '';
      var ver = this.querySelector('.text-xs span')?.textContent || '';
      if (dsReady()) {
        var mv = ds().table('model_versions').where('modelName', 'eq', name).first();
        if (mv) {
          var body = '<div class="space-y-4">' +
            '<div class="grid grid-cols-3 gap-3">' +
            '<div class="bg-green-50 p-3 rounded text-center"><span class="text-xs text-gray-500">准确率</span><p class="font-bold text-green-600">' + (mv.accuracy != null ? mv.accuracy + '%' : 'N/A') + '</p></div>' +
            '<div class="bg-yellow-50 p-3 rounded text-center"><span class="text-xs text-gray-500">漂移指数</span><p class="font-bold text-yellow-600">' + (mv.driftScore != null ? mv.driftScore : 'N/A') + '</p></div>' +
            '<div class="bg-blue-50 p-3 rounded text-center"><span class="text-xs text-gray-500">总预测次数</span><p class="font-bold text-blue-600">' + (mv.totalPredictions || 0) + '</p></div>' +
            '</div>' +
            '<div class="bg-gray-50 p-3 rounded"><span class="text-xs text-gray-500">模型版本</span><p class="font-semibold">' + mv.version + '</p></div>' +
            '<div class="bg-gray-50 p-3 rounded"><span class="text-xs text-gray-500">部署时间</span><p class="font-semibold">' + mv.deployedAt + '</p></div>' +
            '<div class="bg-gray-50 p-3 rounded"><span class="text-xs text-gray-500">说明</span><p class="text-sm">' + mv.description + '</p></div>' +
            '</div>';
          modal.detail({ title: mv.modelName + ' 详情', body: body, width: 'max-w-lg' });
        }
      }
    };
  });

  document.querySelectorAll('#unknown-sample-list button').forEach(function(btn) {
    btn.onclick = function(e) {
      e.stopPropagation();
      var action = this.textContent.includes('确认') ? 'approve' : 'reject';
      showToast('样本已' + (action === 'approve' ? '确认通过' : '驳回重新识别'), action === 'approve' ? 'success' : 'warning');
    };
  });
}

/** 审核未知样本 */
function reviewSample(sampleId, action) {
  if (!dsReady()) return;
  if (action === 'approve') {
    ds().update('disease_records', sampleId, { status: 'resolved' });
  } else {
    ds().update('disease_records', sampleId, { severity: 'high', status: 'processing' });
  }
  renderMonitor();
  showToast('样本已' + (action === 'approve' ? '确认通过' : '驳回重新识别'), action === 'approve' ? 'success' : 'warning');
}
