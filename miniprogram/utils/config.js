// 后端服务地址 —— 部署完 server/ 后改成你的 HTTPS 地址
//   Cloud Run 形如：https://bencao-ai-xxxxx-de.a.run.app
//   自有域名：     https://api.your-domain.com
// 地址必须是 HTTPS，且需在微信公众平台 -> 开发管理 -> 服务器域名 -> request 合法域名 中添加。
const API_BASE_URL = 'https://bencao-ai-853378687793.asia-east1.run.app';
// 与后端共享的 API 访问凭证。如果后端配置了 API_CLIENT_TOKEN，则此处必须填写相同的值，
// 否则所有 AI 请求会被 401 拒绝。留空表示不使用 token 鉴权（仅限开发环境）。
const API_CLIENT_TOKEN = '';
const VR_ASSET_BASE_URL = API_BASE_URL.replace(/\/+$/, '') + '/vr';

module.exports = { API_BASE_URL, API_CLIENT_TOKEN, VR_ASSET_BASE_URL };
