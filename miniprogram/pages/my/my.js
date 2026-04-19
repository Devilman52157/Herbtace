const app = getApp();

Page({
  data: {
    settings: { name: '养生家', notify: true },
    points: 0,
    level: 1,
    cart: [],
    orders: [],
    addrs: [],
    traces: [],
    chats: [],
    favs: []
  },

  onShow() {
    const g = app.globalData;
    const pts = g.points || 0;
    const level = pts >= 1000 ? 5 : pts >= 500 ? 4 : pts >= 200 ? 3 : pts >= 50 ? 2 : 1;
    this.setData({
      settings: g.settings,
      points: pts,
      level,
      cart: g.cart,
      orders: g.orders,
      addrs: g.addrs,
      traces: g.traces,
      chats: g.chats,
      favs: g.favs
    });
  },

  openFull(e) {
    const kind = e.currentTarget.dataset.kind || 'my';
    const base = app.globalData.webviewUrl || '';
    if (!base || base.indexOf('your-domain.example.com') > -1) {
      wx.showToast({ title: '请先配置 webviewUrl', icon: 'none' });
      return;
    }
    wx.navigateTo({ url: `/pages/index/index?tab=my&kind=${kind}` });
  }
});
