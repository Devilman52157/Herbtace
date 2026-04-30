Component({
  data: {
    appFontClass: 'app-font-normal',
    selected: 0,
    list: [
      { pagePath: '/pages/index/index', text: '首页',  icon: 'brush-home' },
      { pagePath: '/pages/shop/shop',   text: '商城',  icon: 'brush-shop' },
      { pagePath: '/pages/expert/expert', text: '问诊', icon: 'brush-medical' },
      { pagePath: '/pages/my/my',       text: '我的',  icon: 'brush-user' }
    ]
  },
  lifetimes: {
    attached() {
      const value = wx.getStorageSync('app_font_size') || 'normal';
      const safeValue = ['small', 'normal', 'large', 'xlarge'].includes(value) ? value : 'normal';
      this.setData({ appFontClass: `app-font-${safeValue}` });
    }
  },
  methods: {
    switchTab(e) {
      const { path, index } = e.currentTarget.dataset;
      wx.switchTab({ url: path });
      this.setData({ selected: index });
    }
  }
});
