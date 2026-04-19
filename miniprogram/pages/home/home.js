const app = getApp();

Page({
  openFull(e) {
    const tab = e.currentTarget.dataset.tab || 'home';
    const base = app.globalData.webviewUrl || '';
    if (!base || base.indexOf('your-domain.example.com') > -1) {
      wx.showToast({ title: '请先配置 webviewUrl', icon: 'none' });
      return;
    }
    wx.navigateTo({ url: `/pages/index/index?tab=${tab}` });
  },

  scan() {
    wx.scanCode({
      onlyFromCamera: false,
      success: (res) => {
        wx.showModal({
          title: '扫码结果',
          content: res.result,
          showCancel: false
        });
      },
      fail: () => {
        wx.showToast({ title: '取消扫码', icon: 'none' });
      }
    });
  }
});
