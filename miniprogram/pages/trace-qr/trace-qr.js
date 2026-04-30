const { PRODUCTS } = require('../../utils/data.js');
const { API_BASE_URL, API_CLIENT_TOKEN } = require('../../utils/config.js');

const WXACODE_PAGE_PATH = 'pages/trace/trace';

function buildAdminHeader() {
  const header = {};
  if (API_CLIENT_TOKEN) header['x-api-key'] = API_CLIENT_TOKEN;

  const session = wx.getStorageSync('wechat_session') || {};
  if (session.token) header.Authorization = `Bearer ${session.token}`;
  return header;
}

function fetchWxaCode(productId) {
  return new Promise((resolve, reject) => {
    const filePath = `${wx.env.USER_DATA_PATH}/wxacode-${productId}.png`;
    wx.request({
      url: `${API_BASE_URL.replace(/\/+$/, '')}/api/trace-qr/wxacode?id=${encodeURIComponent(productId)}`,
      method: 'GET',
      timeout: 15000,
      responseType: 'arraybuffer',
      header: buildAdminHeader(),
      success: (res) => {
        if (res.statusCode !== 200 || !res.data) {
          reject(new Error(`HTTP ${res.statusCode}`));
          return;
        }
        wx.getFileSystemManager().writeFile({
          filePath,
          data: res.data,
          success: () => resolve(filePath),
          fail: (err) => reject(new Error(err.errMsg || 'write file failed'))
        });
      },
      fail: (err) => reject(new Error(err.errMsg || 'request failed'))
    });
  });
}

Page({
  data: {
    productList: [],
    selected: null,
    qrUrl: '',
    qrContent: '',
    qrMode: 'wxacode',
    qrModeLabel: '',
    loading: false,
    errorTip: ''
  },

  onLoad() {
    const list = Object.keys(PRODUCTS).map(id => {
      const p = PRODUCTS[id];
      return {
        id: p.id,
        name: p.name,
        icon: p.icon,
        origin: p.origin,
        batch: p.batch,
        price: p.price
      };
    });
    this.setData({ productList: list });
  },

  pickProduct(e) {
    const id = e.currentTarget.dataset.id;
    const product = PRODUCTS[id];
    if (!product) return;
    this.setData({
      selected: {
        id: product.id,
        name: product.name,
        icon: product.icon,
        origin: product.origin,
        batch: product.batch
      },
      loading: true,
      errorTip: '',
      qrUrl: '',
      qrContent: '',
      qrMode: 'wxacode',
      qrModeLabel: ''
    });
    this.resolveQrFor(product.id);
  },

  async resolveQrFor(productId) {
    try {
      const filePath = await fetchWxaCode(productId);
      this.applyWxaCode(productId, filePath);
      this.setData({ loading: false });
    } catch (err) {
      this.setData({
        loading: false,
        errorTip: `小程序码生成失败：${err.message || err}`
      });
    }
  },

  applyWxaCode(productId, filePath) {
    this.setData({
      qrContent: `page=${WXACODE_PAGE_PATH}&scene=${productId}`,
      qrUrl: filePath,
      qrMode: 'wxacode',
      qrModeLabel: `测试小程序码 · scene=${productId}`
    });
  },

  refreshLink() {
    if (!this.data.selected) return;
    this.setData({ loading: true, errorTip: '' });
    this.resolveQrFor(this.data.selected.id);
  },

  copyContent() {
    if (!this.data.qrContent) return;
    wx.setClipboardData({ data: this.data.qrContent });
  },

  previewQr() {
    if (!this.data.qrUrl) return;
    wx.previewImage({ urls: [this.data.qrUrl] });
  },

  goPreviewTrace() {
    if (!this.data.selected) return;
    wx.navigateTo({ url: `/pages/trace/trace?id=${this.data.selected.id}` });
  }
});
