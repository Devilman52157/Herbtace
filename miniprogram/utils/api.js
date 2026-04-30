const { API_BASE_URL, API_CLIENT_TOKEN } = require('./config.js');

function request(path, data, timeout = 60000) {
  return new Promise((resolve, reject) => {
    const header = { 'content-type': 'application/json' };
    if (API_CLIENT_TOKEN) header['x-api-key'] = API_CLIENT_TOKEN;
    if (path !== '/api/login') {
      const session = wx.getStorageSync('wechat_session') || {};
      if (session.token) header.Authorization = `Bearer ${session.token}`;
    }

    wx.request({
      url: API_BASE_URL.replace(/\/+$/, '') + path,
      method: 'POST',
      data,
      header,
      timeout,
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) resolve(res.data);
        else reject(new Error(`HTTP ${res.statusCode}: ${JSON.stringify(res.data)}`));
      },
      fail: (err) => reject(new Error(err.errMsg || 'request failed'))
    });
  });
}

const aiChat   = (payload) => request('/api/chat',   payload, 60000);
const aiVision = (payload) => request('/api/vision', payload, 90000);
const loginWithCode = (payload) => request('/api/login', payload, 15000);

module.exports = { request, aiChat, aiVision, loginWithCode };
