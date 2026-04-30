const { PRODUCTS } = require('../../utils/data.js');
Page({
  data: { list: [] },
  onShow() {
    const ids = wx.getStorageSync('favs') || [];
    this.setData({ list: ids.map(id => PRODUCTS[id]).filter(Boolean) });
  },
  go(e) { wx.navigateTo({ url: `/pages/detail/detail?id=${e.currentTarget.dataset.id}` }); },
  goShop() { wx.switchTab({ url: '/pages/shop/shop' }); },
  remove(e) {
    const id = e.currentTarget.dataset.id;
    const ids = (wx.getStorageSync('favs') || []).filter(x => x !== id);
    wx.setStorageSync('favs', ids);
    this.onShow();
  }
});
