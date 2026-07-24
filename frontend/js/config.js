/**
 * 智慧农业管理系统 - 统一配置
 * 
 * 修改 API_URL 即可切换后端地址：
 *   - 同事电脑: http://172.20.10.2:9090/api/v1
 *   - 本机后端: http://localhost:9090/api/v1
 *   - 其他机器: http://<IP>:9090/api/v1
 * 
 * 修改后刷新浏览器即生效，无需改任何其他文件。
 */
// 后端 API 地址
// 本机: http://localhost:9090/api/v1
// 同事电脑: http://10.141.141.159:9090/api/v1
const API_URL = 'http://10.141.141.159:9090/api/v1';

// AI 服务地址（Python FastAPI ai-service，默认端口 8000）
// 用于前端直连 AI 服务的场景（如图像识别、AI对话等）
const AI_SERVICE_URL = 'http://' + window.location.hostname + ':8000/api/v1';
