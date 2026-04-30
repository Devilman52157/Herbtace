// app.js
const { API_BASE_URL } = require('./utils/config.js');
const { getStoredUser, syncGlobalUser } = require('./utils/auth.js');

const FONT_SIZE_KEY = 'app_font_size';
const FONT_SIZE_CLASSES = {
  small: 'app-font-small',
  normal: 'app-font-normal',
  large: 'app-font-large',
  xlarge: 'app-font-xlarge'
};

function getFontSizePreference() {
  const value = wx.getStorageSync(FONT_SIZE_KEY);
  return FONT_SIZE_CLASSES[value] ? value : 'normal';
}

function getFontSizeClass() {
  return FONT_SIZE_CLASSES[getFontSizePreference()];
}

function injectFontSize(PageCtor) {
  const originPage = PageCtor;
  Page = function(options = {}) {
    const originOnLoad = options.onLoad;
    const originOnShow = options.onShow;

    function syncFontSize() {
      const appFontSize = getFontSizePreference();
      this.setData({
        appFontSize,
        appFontClass: FONT_SIZE_CLASSES[appFontSize]
      });

      if (typeof this.getTabBar === 'function') {
        const tabBar = this.getTabBar();
        if (tabBar && typeof tabBar.setData === 'function') {
          tabBar.setData({ appFontClass: FONT_SIZE_CLASSES[appFontSize] });
        }
      }
    }

    options.data = {
      appFontSize: 'normal',
      appFontClass: FONT_SIZE_CLASSES.normal,
      ...(options.data || {})
    };
    options.onLoad = function(...args) {
      syncFontSize.call(this);
      if (originOnLoad) return originOnLoad.apply(this, args);
    };
    options.onShow = function(...args) {
      syncFontSize.call(this);
      if (originOnShow) return originOnShow.apply(this, args);
    };

    return originPage(options);
  };
}

injectFontSize(Page);

App({
  onLaunch() {
    syncGlobalUser(getStoredUser());

    // Fonts are downloaded from the same Cloud Run domain used by the AI API.
    const fontBaseUrl = API_BASE_URL.replace(/\/+$/, '');
    const remoteFonts = [
      { family: 'LXGW WenKai', source: `${fontBaseUrl}/fonts/lxgw-wenkai-lite.ttf` },
      { family: 'Ma Shan Zheng', source: `${fontBaseUrl}/fonts/ma-shan-zheng.ttf` },
    ];
    remoteFonts.forEach(f => {
      try {
        wx.loadFontFace({
          family: f.family,
          source: `url("${f.source}")`,
          global: true,
          scopes: ['webview', 'native'],
          success: () => console.log('[font] loaded', f.family),
          fail: (e) => console.warn('[font] fallback', f.family, e && e.errMsg)
        });
      } catch (e) { /* 旧版本不支持，忽略 */ }
    });
  },
  globalData: {
    fontSizeKey: FONT_SIZE_KEY,
    getFontSizePreference,
    getFontSizeClass,
    userInfo: null,
    isLoggedIn: false
  }
});
