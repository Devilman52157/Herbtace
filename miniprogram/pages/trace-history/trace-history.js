const { PRODUCTS } = require('../../utils/data.js');
const { TRACE_HISTORY_KEY } = require('../../utils/history.js');
Page({
  data: { list: [] },
  onShow() {
    const hist = wx.getStorageSync(TRACE_HISTORY_KEY) || [];
    const list = hist.map(h => Object.assign({}, h, { p: PRODUCTS[h.id] })).filter(x => x.p);
    this.setData({ list });
  },
  go(e) { wx.navigateTo({ url: `/pages/trace/trace?id=${e.currentTarget.dataset.id}` }); }
});
