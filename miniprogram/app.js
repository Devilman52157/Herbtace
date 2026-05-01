// app.js
const { API_BASE_URL } = require('./utils/config.js');
const { BRAND_FONT_FAMILY, BRAND_FONT_SOURCE } = require('./utils/brand-font-data.js');
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

function loadBrandFont(source, onFail) {
  try {
    wx.loadFontFace({
      family: BRAND_FONT_FAMILY,
      source,
      global: true,
      scopes: ['webview', 'native'],
      success: () => console.log('[font] loaded', BRAND_FONT_FAMILY),
      fail: (e) => {
        console.warn('[font] load failed', BRAND_FONT_FAMILY, e && e.errMsg);
        if (onFail) onFail();
      }
    });
  } catch (e) {
    if (onFail) onFail();
  }
}

App({
  onLaunch() {
    syncGlobalUser(getStoredUser());

    // ------- 品牌标题字体：优先加载内嵌子集，失败时回退远程字体 -------
    const fontBaseUrl = API_BASE_URL.replace(/\/+$/, '');
    const remoteFontSource = `url("${fontBaseUrl}/fonts/ma-shan-zheng.ttf")`;

    loadBrandFont(BRAND_FONT_SOURCE, () => loadBrandFont(remoteFontSource));
  },
  globalData: {
    fontSizeKey: FONT_SIZE_KEY,
    getFontSizePreference,
    getFontSizeClass,
    userInfo: null,
    isLoggedIn: false
  }
});
