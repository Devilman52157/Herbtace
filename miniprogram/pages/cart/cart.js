const { PRODUCTS } = require('../../utils/data.js');
const { getAvailableCoupons, markCouponUsed } = require('../../utils/coupons.js');

Page({
  data: { items: [], total: '0.0', couponHint: '' },

  onShow() { this.refresh(); },

  refresh() {
    const ids = wx.getStorageSync('cart') || [];
    // 聚合 qty
    const qtyMap = {};
    ids.forEach(id => { qtyMap[id] = (qtyMap[id]||0) + 1; });
    const items = Object.keys(qtyMap)
      .map(id => PRODUCTS[id] && ({ ...PRODUCTS[id], qty: qtyMap[id] }))
      .filter(Boolean);
    const total = items.reduce((s, p) => s + p.price * p.qty, 0);
    const bestCoupon = getAvailableCoupons(total)[0];
    this.setData({
      items,
      total: total.toFixed(1),
      couponHint: bestCoupon ? `可用优惠券：${bestCoupon.title}` : ''
    });
  },

  inc(e) {
    const id = e.currentTarget.dataset.id;
    const ids = wx.getStorageSync('cart') || [];
    ids.push(id);
    wx.setStorageSync('cart', ids);
    this.refresh();
  },

  dec(e) {
    const id = e.currentTarget.dataset.id;
    const ids = wx.getStorageSync('cart') || [];
    const idx = ids.indexOf(id);
    if (idx >= 0) ids.splice(idx, 1);
    wx.setStorageSync('cart', ids);
    this.refresh();
  },

  remove(e) {
    const id = e.currentTarget.dataset.id;
    const ids = (wx.getStorageSync('cart') || []).filter(x => x !== id);
    wx.setStorageSync('cart', ids);
    this.refresh();
  },

  goShop() { wx.switchTab({ url: '/pages/shop/shop' }); },

  checkout() {
    if (!this.data.items.length) return wx.showToast({ title: '购物车为空', icon: 'none' });
    const total = Number(this.data.total) || 0;
    const bestCoupon = getAvailableCoupons(total)[0];
    if (bestCoupon) {
      wx.showModal({
        title: '使用优惠券',
        content: `${bestCoupon.title}，本单可立减 ¥${bestCoupon.discount}，是否使用？`,
        confirmText: '使用',
        cancelText: '不用',
        success: (res) => {
          this.createOrder(res.confirm ? bestCoupon : null);
        }
      });
      return;
    }
    this.createOrder(null);
  },

  createOrder(coupon) {
    const originalTotal = Number(this.data.total) || 0;
    const discount = coupon ? Number(coupon.discount) || 0 : 0;
    const payable = Math.max(0, originalTotal - discount);
    // 生成订单写入本地
    const orders = wx.getStorageSync('orders') || [];
    orders.unshift({
      no: 'BCS' + Date.now().toString().slice(-10),
      items: this.data.items.map(i => ({ id:i.id, name:i.name, cat:i.cat, price:i.price, qty:i.qty, unit:i.unit })),
      originalTotal: originalTotal.toFixed(1),
      discount: discount.toFixed(1),
      total: payable.toFixed(1),
      coupon: coupon ? { id: coupon.id, title: coupon.title, discount: coupon.discount } : null,
      status: '待发货',
      date: new Date().toLocaleString('zh-CN', { hour12:false })
    });
    if (coupon) markCouponUsed(coupon.id);
    wx.setStorageSync('orders', orders);
    wx.setStorageSync('cart', []);
    wx.showToast({ title: coupon ? '优惠已使用' : '下单成功', icon: 'success' });
    setTimeout(() => wx.redirectTo({ url: '/pages/orders/orders' }), 600);
  }
});
