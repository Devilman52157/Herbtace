Page({
  data: {
    fontSize: 'normal',
    fontOptions: [
      { id: 'small', label: '小', desc: '紧凑' },
      { id: 'normal', label: '标准', desc: '默认' },
      { id: 'large', label: '大', desc: '舒适' },
      { id: 'xlarge', label: '特大', desc: '醒目' }
    ],
    version: '1.0.0',
    traceAdminUnlocked: false,
    _versionTaps: 0,
    _lastVersionTapAt: 0
  },
  onLoad() {
    const app = getApp();
    const fontSize = app.globalData.getFontSizePreference
      ? app.globalData.getFontSizePreference()
      : (wx.getStorageSync('app_font_size') || 'normal');

    this.setData({
      fontSize,
      traceAdminUnlocked: wx.getStorageSync('trace_admin_unlocked') === true
    });
  },
  tapVersion() {
    if (this.data.traceAdminUnlocked) return;
    const now = Date.now();
    const taps = (now - this.data._lastVersionTapAt < 1500) ? this.data._versionTaps + 1 : 1;
    this.setData({ _versionTaps: taps, _lastVersionTapAt: now });
    if (taps >= 5) {
      wx.setStorageSync('trace_admin_unlocked', true);
      this.setData({ traceAdminUnlocked: true, _versionTaps: 0 });
      wx.showToast({ title: '溯源管理已解锁', icon: 'success' });
    } else if (taps >= 3) {
      wx.showToast({ title: `再点 ${5 - taps} 次解锁`, icon: 'none', duration: 800 });
    }
  },
  goTraceQr() { wx.navigateTo({ url: '/pages/trace-qr/trace-qr' }); },
  lockTraceAdmin() {
    wx.showModal({
      title: '锁定溯源管理',
      content: '锁定后该入口将隐藏，需在版本号上连点 5 次重新解锁。',
      success: (r) => {
        if (r.confirm) {
          wx.removeStorageSync('trace_admin_unlocked');
          this.setData({ traceAdminUnlocked: false });
          wx.showToast({ title: '已锁定', icon: 'success' });
        }
      }
    });
  },
  chooseFontSize(e) {
    const id = e.currentTarget.dataset.id;
    const app = getApp();
    const key = app.globalData.fontSizeKey || 'app_font_size';
    wx.setStorageSync(key, id);
    this.setData({
      fontSize: id,
      appFontSize: id,
      appFontClass: app.globalData.getFontSizeClass ? app.globalData.getFontSizeClass() : `app-font-${id}`
    });

    const pages = getCurrentPages();
    pages.forEach(page => {
      if (page && page.setData) {
        page.setData({
          appFontSize: id,
          appFontClass: app.globalData.getFontSizeClass ? app.globalData.getFontSizeClass() : `app-font-${id}`
        });
      }
    });

    wx.showToast({ title: '字体大小已更新', icon: 'success' });
  },
  clearCache() {
    wx.showModal({
      title: '清除缓存',
      content: '将清除本地购物车、收藏、历史等',
      success: (r) => {
        if (r.confirm) {
          ['cart','favs','orders','addr','trace_hist','chat_hist','product_reviews','coupons','points_balance','points_last_sign','points_streak'].forEach(k => wx.removeStorageSync(k));
          wx.showToast({ title: '已清除', icon: 'success' });
        }
      }
    });
  },
  about() { wx.showModal({ title:'关于云上祁州', content:'国创赛参赛作品 v1.0.0\n© 云上祁州', showCancel:false }); }
});
