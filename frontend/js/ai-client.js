/**
 * 智慧农业管理系统 — AI 服务客户端
 * 对接 ai-service (Python FastAPI) 的病虫害识别、RAG检索、Agent决策、AI对话
 *
 * 使用方法：
 *   1. 确保 ai-service 运行在 http://localhost:8000
 *   2. 调用 AiClient.diagnosis.upload(file) 等
 */

const AiClient = (() => {
  // 与 config.js 中的 API_URL 区分，AI 服务独立部署
  const AI_BASE = typeof AI_SERVICE_URL !== 'undefined'
    ? AI_SERVICE_URL
    : 'http://' + window.location.hostname + ':8000/api/v1';

  // ==================== HTTP 封装 ====================

  async function request(method, path, body = null, isFormData = false) {
    const headers = {};
    if (!isFormData) headers['Content-Type'] = 'application/json';

    const config = { method, headers };
    if (body) config.body = isFormData ? body : JSON.stringify(body);

    try {
      const resp = await fetch(`${AI_BASE}${path}`, config);
      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.detail || data.message || `AI服务请求失败 (${resp.status})`);
      }
      return data;
    } catch (e) {
      console.error('AI服务请求错误:', e.message);
      // 降级：如果 AI 服务不可用，返回 null 让调用方使用本地Mock
      return null;
    }
  }

  function get(path) { return request('GET', path); }
  function post(path, body) { return request('POST', path, body); }
  function upload(path, formData) { return request('POST', path, formData, true); }

  // ==================== 病虫害识别 ====================

  const diagnosis = {
    /**
     * 上传图片进行病虫害识别
     * @param {File} file - 图片文件
     * @param {string} cropName - 作物名称（可选）
     * @returns {Object} 识别结果 { diseaseName, confidence, severity, treatment, ... }
     */
    async upload(file, cropName = null) {
      const formData = new FormData();
      formData.append('file', file);
      if (cropName) formData.append('cropName', cropName);
      return upload('/diagnosis', formData);
    },

    /** 健康检查 */
    health: () => get('/diagnosis/health'),
  };

  // ==================== RAG 检索增强生成 ====================

  const rag = {
    /**
     * 检索农技规范（仅检索，不生成）
     * @param {string} query - 查询文本
     * @param {number} topK - 返回数量
     */
    search: (query, topK = 5) => post('/rag/search', { query, topK }),

    /**
     * RAG 增强生成：检索 + AI 生成回答
     * @param {string} query - 查询文本
     * @param {number} topK - 检索文档数量
     */
    generate: (query, topK = 5) => post('/rag/generate', { query, topK }),

    /** 健康检查 */
    health: () => get('/rag/health'),
  };

  // ==================== Agent 农事决策 ====================

  const agent = {
    /**
     * 多Agent协同农事决策
     * @param {Object} params - { fieldId, cropId, currentStage, weatherForecast, soilData, cropName }
     */
    decide: (params) => post('/agent/decision', params),

    /** 健康检查 */
    health: () => get('/agent/health'),
  };

  // ==================== AI 智能对话 ====================

  const chat = {
    /**
     * 发送消息给 AI 助手
     * @param {string} message - 用户消息
     * @param {Object} options - { context, history, useRag }
     */
    async send(message, options = {}) {
      const body = {
        message,
        context: options.context || null,
        history: options.history || [],
        useRag: options.useRag !== false,  // 默认启用RAG
      };
      return post('/chat', body);
    },

    /** 健康检查 */
    health: () => get('/chat/health'),
  };

  // ==================== 模型监控 ====================

  const monitor = {
    versions: () => get('/model/versions'),
    drift: () => get('/model/drift'),
    checkDrift: (modelId) => post(`/model/drift/check?model_id=${modelId}`),
    health: () => get('/model/health'),
  };

  // ==================== 全局健康检查 ====================

  async function health() {
    const result = await get('/health');
    // /health 不在 /api/v1 下，特殊处理
    try {
      const resp = await fetch(`${AI_BASE.replace('/api/v1', '')}/health`);
      return await resp.json();
    } catch {
      return { status: 'unreachable' };
    }
  }

  return { diagnosis, rag, agent, chat, monitor, health };
})();
