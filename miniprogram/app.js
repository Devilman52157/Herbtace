// app.js — 云上祁州 (Cloud Qizhou) WeChat Mini Program
// 1:1 port of bencao-suoyuan-v2.html

App({
  globalData: {
    // The HTTPS URL that hosts bencao-suoyuan-v2.html for the <web-view> shell.
    // IMPORTANT: this domain must be added to the "业务域名" whitelist in the
    // WeChat admin console before the web-view can load it in production.
    webviewUrl: 'https://your-domain.example.com/bencao-suoyuan-v2.html',

    // API host used by /api/chat and /api/vision (wx.request domain whitelist).
    apiHost: 'https://your-domain.example.com',

    // Persisted state (mirrors the localStorage keys from the original HTML).
    cart: [],
    orders: [],
    addrs: [],
    traces: [],
    chats: [],
    favs: [],
    settings: { name: '养生家', notify: true },
    points: 0
  },

  onLaunch() {
    const g = this.globalData;
    g.cart = wx.getStorageSync('cart') || [];
    g.orders = wx.getStorageSync('orders') || [];
    g.addrs = wx.getStorageSync('addrs') || [];
    g.traces = wx.getStorageSync('traces') || [];
    g.chats = wx.getStorageSync('chats') || [];
    g.favs = wx.getStorageSync('favs') || [];
    const savedSettings = wx.getStorageSync('settings');
    if (savedSettings) g.settings = savedSettings;
    const savedPoints = wx.getStorageSync('points');
    if (typeof savedPoints === 'number') g.points = savedPoints;
  },

  saveAll() {
    const g = this.globalData;
    wx.setStorageSync('cart', g.cart);
    wx.setStorageSync('orders', g.orders);
    wx.setStorageSync('addrs', g.addrs);
    wx.setStorageSync('traces', g.traces);
    wx.setStorageSync('chats', g.chats);
    wx.setStorageSync('favs', g.favs);
    wx.setStorageSync('settings', g.settings);
    wx.setStorageSync('points', g.points);
  }
});
