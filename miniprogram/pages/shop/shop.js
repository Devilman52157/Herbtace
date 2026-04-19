const app = getApp();

Page({
  openFull(e) {
    const cat = e.currentTarget.dataset.cat || 'all';
    const base = app.globalData.webviewUrl || '';
    if (!base || base.indexOf('your-domain.example.com') > -1) {
      wx.showToast({ title: '请先配置 webviewUrl', icon: 'none' });
      return;
    }
    wx.navigateTo({ url: `/pages/index/index?tab=shop&cat=${cat}` });
  }
});
