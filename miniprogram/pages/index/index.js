// pages/index/index.js — web-view wrapper
const app = getApp();

Page({
  data: {
    url: ''
  },

  onLoad(options) {
    const base = app.globalData.webviewUrl || '';
    let url = base;
    if (options && Object.keys(options).length) {
      const qs = Object.keys(options)
        .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(options[k])}`)
        .join('&');
      url = base + (base.indexOf('?') > -1 ? '&' : '?') + qs;
    }
    if (base && base.indexOf('http') === 0 && base.indexOf('your-domain.example.com') === -1) {
      this.setData({ url });
    }
  },

  onShareAppMessage() {
    return {
      title: '云上祁州 — 道地药材一键溯源',
      path: '/pages/index/index'
    };
  },

  onMessage(e) {
    // Handles postMessage from the embedded HTML (fires on back/share/nav).
    // console.log('web-view message:', e.detail.data);
  },

  onLoad2() {},
  onError(e) {
    wx.showToast({ title: '加载失败', icon: 'none' });
  }
});
