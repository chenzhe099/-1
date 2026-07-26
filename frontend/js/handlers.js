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
function setText(id, text) { var el = document.getElementById(id); if (el) el.textContent = text; }

function showModal(title, html) {
  const old = document.querySelector('.custom-modal-overlay');
  if (old) old.remove();
  const overlay = document.createElement('div');
  overlay.className = 'custom-modal-overlay fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4';
  overlay.innerHTML = '<div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto"><div class="flex items-center justify-between p-4 border-b sticky top-0 bg-white rounded-t-2xl"><h3 class="font-semibold text-gray-800">' + title + '</h3><button class="text-gray-400 hover:text-gray-600 text-xl" onclick="this.closest(\'.custom-modal-overlay\').remove()">×</button></div><div class="p-4">' + html + '</div></div>';
  overlay.onclick = function(e) { if (e.target === overlay) overlay.remove(); };
  document.body.appendChild(overlay);
}

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
  document.getElementById('app-container').style.display = 'none';
  showLoginModal();
  document.getElementById('login-username').value = '';
  document.getElementById('login-password').value = '';
  document.getElementById('login-error').classList.add('hidden');
  document.getElementById('login-username').focus();
  showToast('您已安全退出', 'info');
}

// 绑定退出按钮
var logoutBtn = document.getElementById('btn-logout');
if (logoutBtn) logoutBtn.onclick = doLogout;

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
  // 只负责前三个模块的事件绑定，后八个由 interactions-later.js 的事件委托接管
  var m = {
    dashboard: setupDashboard, disease: setupDisease, farming: setupFarming, 'ai-chat': setupAiChat
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
    showToast('请点击「上传图片」选择照片进行识别','info');
  };

  document.querySelectorAll('#knowledge-base-grid > div').forEach(function(card) {
    card.style.cursor='pointer';
    card.onclick = function() {
      var n = this.querySelector('h4')?.textContent||'';
      if (typeof showDiseaseDetailModal === 'function') showDiseaseDetailModal(n);
    };
  });
}

// ==================== 识别历史查看 & 删除 ====================

function viewDiseaseRecord(id) {
  if (!dsReady()) return;
  var r = ds().getById('disease_records', id);
  if (!r) { showToast('记录不存在', 'error'); return; }
  var sevMap = { low: '低', medium: '中', high: '高', critical: '严重' };
  var treatment = {};
  try { treatment = typeof r.treatmentPlan === 'string' ? JSON.parse(r.treatmentPlan) : (r.treatmentPlan || {}); } catch(e) {}
  var chem = treatment.chemical || [];
  var bio = treatment.biological || [];
  var agri = treatment.agricultural || [];
  var sev = r.severity || 'medium';
  var sevLabel = sevMap[sev] || '中';

  var html = '<div class="space-y-4 text-sm">' +
    '<div class="bg-blue-50 p-4 rounded-xl text-center">' +
      '<div class="text-xl font-bold text-blue-700 mb-1">' + (r.diseaseName||'未知病害') + '</div>' +
      '<div class="text-xs text-blue-500">置信度 ' + Math.round((r.confidence||0)*100) + '% · ' + sevLabel + '严重 · ' + formatDateTime(r.detectedAt) + '</div>' +
    '</div>';

  if (chem.length > 0) {
    html += '<div class="border-l-4 border-red-400 pl-3"><div class="font-medium text-red-700 mb-2"><i class="fa fa-flask mr-1"></i>化学防治</div>' +
      '<ol class="list-decimal list-inside space-y-1 text-gray-600">' +
      chem.map(function(c){ return '<li class="text-xs">' + c + '</li>'; }).join('') +
      '</ol></div>';
  }
  if (bio.length > 0) {
    html += '<div class="border-l-4 border-green-400 pl-3"><div class="font-medium text-green-700 mb-2"><i class="fa fa-leaf mr-1"></i>生物防治</div>' +
      '<ol class="list-decimal list-inside space-y-1 text-gray-600">' +
      bio.map(function(b){ return '<li class="text-xs">' + b + '</li>'; }).join('') +
      '</ol></div>';
  }
  if (agri.length > 0) {
    html += '<div class="border-l-4 border-orange-400 pl-3"><div class="font-medium text-orange-700 mb-2"><i class="fa fa-tint mr-1"></i>农业防治</div>' +
      '<ol class="list-decimal list-inside space-y-1 text-gray-600">' +
      agri.map(function(a){ return '<li class="text-xs">' + a + '</li>'; }).join('') +
      '</ol></div>';
  }

  html += '<div class="text-center text-xs text-gray-400 pt-2 border-t">' +
      '由 AI 多模型协诊断 · 仅供参考，具体用药请遵当地农技指导</div>';
  html += '</div>';

  if (typeof showModal === 'function') showModal('🔍 ' + (r.diseaseName||'诊断详情'), html);
}

function deleteDiseaseRecord(id) {
  if (!dsReady()) return;
  var r = ds().getById('disease_records', id);
  if (!r) { showToast('记录不存在', 'error'); return; }
  if (typeof confirm === 'function' ? confirm('确定删除「' + r.diseaseName + '」的识别记录？') : true) {
    ds().delete('disease_records', id);
    showToast('已删除: ' + r.diseaseName, 'success');
    if (typeof renderDisease === 'function') renderDisease();
  }
}

function handleDiseaseFile(file) {
  if (!file) return;
  if (!['image/jpeg','image/png','image/webp'].includes(file.type)) { showToast('仅支持 JPG、PNG、WebP 格式','error'); return; }
  if (file.size > 10*1024*1024) { showToast('文件不能超过 10MB','error'); return; }

  // 获取选择的模型
  var modelSelect = document.getElementById('disease-model-select');
  var model = modelSelect ? modelSelect.value : 'deepseek';
  var modelName = modelSelect ? modelSelect.options[modelSelect.selectedIndex].text : 'DeepSeek Vision';

  // 显示识别进度条
  var container = document.getElementById('disease-history-list');
  var oldHtml = container.innerHTML;
  container.innerHTML = `
    <div class="bg-blue-50 rounded-lg p-4 border border-blue-200 mb-3">
      <div class="flex items-center mb-2">
        <i class="fa fa-spinner fa-spin text-blue-500 mr-2"></i>
        <span class="text-sm font-medium text-blue-700">${modelName} 正在识别...</span>
      </div>
      <div class="text-xs text-blue-600 mb-2">${file.name} (${(file.size/1024).toFixed(0)}KB)</div>
      <div class="w-full bg-blue-200 rounded-full h-2 mb-1">
        <div class="bg-blue-500 h-2 rounded-full transition-all" style="width:20%" id="diag-bar"></div>
      </div>
      <div class="text-xs text-blue-500" id="diag-status">上传图片到 ${modelName}...</div>
    </div>` + oldHtml;

  var bar = document.getElementById('diag-bar');
  var st = document.getElementById('diag-status');
  var w = 20, t = setInterval(function(){
    if(w<90){ w+=Math.random()*12; if(bar) bar.style.width=w+'%'; }
    if(w>40&&st) st.textContent=modelName+' 分析图像特征...';
    if(w>70&&st) st.textContent='匹配病虫害知识库...';
  },500);

  AiClient.diagnosis.upload(file, null, model).then(function(r){
    clearInterval(t); if(bar) bar.style.width='100%'; if(st) st.textContent='完成';
    console.log('[诊断] 响应:', r);
    if(r && r.diseaseName){
      saveDiseaseRecord(r);
      showToast(r.diseaseName + ' (置信度:'+Math.round(r.confidence*100)+'%)', r.isUnknown?'warning':'success');
    } else if(r && r.error) {
      showToast('服务异常: '+r.error, 'error');
    } else {
      showToast('AI 服务未响应','error');
    }
    setTimeout(function(){ if(typeof renderDisease==='function') renderDisease(); },500);
  }).catch(function(err){
    clearInterval(t); if(st) st.textContent='错误: '+err.message;
    console.error('[诊断] 失败:', err);
    showToast('请求失败: '+(err.message||'网络错误'),'error');
    setTimeout(function(){ if(typeof renderDisease==='function') renderDisease(); },1000);
  });
}


// 安全同步到后端（旧版本数据服务没有syncModuleState方法）
function _safeSync() {
  // 已废弃：ds().insert() 已自动调用 _syncToBackend
}
function saveDiseaseRecord(result) {
  if (!dsReady()) return;
  var name = typeof result === 'string' ? result : (result.diseaseName || 'AI识别结果');
  var sev = result.severity || 'medium';
  var isUnknown = name === '未知病害' || name === '识别失败' || result.isUnknown;
  // 当地时间
  var now = new Date();
  var pad = function(n) { return n < 10 ? '0' + n : n; };
  var localTime = now.getFullYear() + '-' + pad(now.getMonth()+1) + '-' + pad(now.getDate()) + ' ' + pad(now.getHours()) + ':' + pad(now.getMinutes());
  ds().insert('disease_records',{
    id:'dis_'+uid(), fieldId:'field_a1', fieldCode:'A1', diseaseName:name, cropAffected: result.cropAffected || result.cropName || '未指定',
    detectedAt: localTime,
    severity: isUnknown ? 'low' : sev,
    status: isUnknown ? 'review' : 'processing',
    imageUrl: result.imageUrl || '',
    treatmentPlan: result.treatment ? JSON.stringify(result.treatment) : (result.treatmentPlan || ''),
    resolvedAt:null
  });
  _safeSync();
}

// ==================== 精准农事 ====================

function setupFarming() {
  // 灌溉方案按钮：立即执行/定时执行/停止执行
  document.querySelectorAll('.btn-irr-execute').forEach(function(btn) {
    btn.onclick = function() {
      var planId = this.dataset.planId;
      if (!dsReady() || !planId) return;
      var p = ds().getById('irrigation_plans', planId);
      if (!p) return;
      ds().update('irrigation_plans', planId, { status: 'executing' });
      _safeSync();
      renderFarming();
      showToast('地块 ' + p.fieldCode + ' 灌溉方案已启动执行', 'success');
    };
  });

  document.querySelectorAll('.btn-irr-schedule').forEach(function(btn) {
    btn.onclick = function() {
      var planId = this.dataset.planId;
      if (!dsReady() || !planId) return;
      var p = ds().getById('irrigation_plans', planId);
      if (!p) return;
      modal.form({
        title: '定时执行 — 地块' + p.fieldCode + ' ' + p.cropName,
        fields: [
          { name: 'date', label: '执行日期', type: 'date', required: true, value: new Date().toISOString().slice(0, 10) },
          { name: 'time', label: '执行时间', type: 'time', required: true, value: '14:00' }
        ],
        submitLabel: '确认定时',
        onSubmit: function(d) {
          ds().update('irrigation_plans', planId, { status: 'executing', scheduledAt: d.date + ' ' + d.time });
          _safeSync();
          renderFarming();
          showToast('地块' + p.fieldCode + ' 灌溉已定时: ' + d.date + ' ' + d.time, 'success');
        }
      });
    };
  });

  document.querySelectorAll('.btn-irr-stop').forEach(function(btn) {
    btn.onclick = function() {
      var planId = this.dataset.planId;
      if (!dsReady() || !planId) return;
      var p = ds().getById('irrigation_plans', planId);
      if (!p) return;
      ds().update('irrigation_plans', planId, { status: 'completed' });
      if (p.fieldId) {
        var field = ds().getById('fields', p.fieldId);
        if (field && field.soilMoisture < 80) {
          ds().update('fields', p.fieldId, { soilMoisture: Math.min(field.soilMoisture + 15, 80) });
        }
      }
      _safeSync();
      renderFarming();
      showToast('地块 ' + p.fieldCode + ' 灌溉已完成，土壤湿度已更新', 'success');
    };
  });

  // 施肥方案按钮：配置NPK/执行施肥
  document.querySelectorAll('.btn-fert-config').forEach(function(btn) {
    btn.onclick = function() {
      var planId = this.dataset.planId;
      if (!dsReady() || !planId) return;
      var p = ds().getById('fertilization_plans', planId);
      if (!p) return;
      modal.form({
        title: '配置施肥方案 — 地块' + p.fieldCode + ' ' + p.cropName,
        fields: [
          { name: 'nKg', label: '氮肥(N) kg', type: 'number', required: true, value: String(p.nKg || 15), hint: '传感器读数: ' + (p.soilN || 85) },
          { name: 'pKg', label: '磷肥(P) kg', type: 'number', required: true, value: String(p.pKg || 8), hint: '传感器读数: ' + (p.soilP || 72) },
          { name: 'kKg', label: '钾肥(K) kg', type: 'number', required: true, value: String(p.kKg || 12), hint: '传感器读数: ' + (p.soilK || 78) },
          { name: 'organicKg', label: '有机肥 kg', type: 'number', required: true, value: String(p.organicKg || 50) }
        ],
        submitLabel: '保存施肥方案',
        onSubmit: function(d) {
          ds().update('fertilization_plans', planId, {
            nKg: parseFloat(d.nKg), pKg: parseFloat(d.pKg),
            kKg: parseFloat(d.kKg), organicKg: parseFloat(d.organicKg),
            status: 'planned'
          });
          _safeSync();
          renderFarming();
          showToast('地块' + p.fieldCode + ' 施肥方案已保存', 'success');
        }
      });
    };
  });

  document.querySelectorAll('.btn-fert-execute').forEach(function(btn) {
    btn.onclick = function() {
      var planId = this.dataset.planId;
      if (!dsReady() || !planId) return;
      var p = ds().getById('fertilization_plans', planId);
      if (!p) return;
      modal.confirm('执行施肥', '确定立即执行地块 ' + p.fieldCode + ' 的施肥方案吗？\nN: ' + p.nKg + 'kg  P: ' + p.pKg + 'kg  K: ' + p.kKg + 'kg  有机: ' + p.organicKg + 'kg').then(function(ok) {
        if (ok) {
          ds().update('fertilization_plans', planId, { status: 'completed' });
          _safeSync();
          renderFarming();
          showToast('地块 ' + p.fieldCode + ' 施肥已执行', 'success');
        }
      });
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
