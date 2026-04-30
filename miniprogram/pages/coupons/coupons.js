const { ensureCoupons, claimCoupons } = require('../../utils/coupons.js');

function formatDate(ts) {
  if (!ts) return '长期有效';
  const d = new Date(ts);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}.${m}.${day}`;
}

function normalizeCoupon(coupon) {
  const used = !!coupon.used;
  return {
    ...coupon,
    amount: Number(coupon.discount || 0),
    condition: `满 ${coupon.threshold} 元可用`,
    statusText: used ? '已使用' : '可使用',
    statusClass: used ? 'used' : 'available',
    claimedText: `领取时间：${formatDate(coupon.claimedAt)}`,
    usedText: coupon.usedAt ? `使用时间：${formatDate(coupon.usedAt)}` : '',
    rule: '结算时满足门槛会自动提示是否使用，每笔订单限用一张。'
  };
}

Page({
  data: {
    active: 'available',
    tabs: [
      { id: 'available', name: '可用' },
      { id: 'used', name: '已使用' }
    ],
    availableCoupons: [],
    usedCoupons: [],
    list: []
  },

  onShow() {
    this.refresh();
  },

  refresh() {
    const coupons = ensureCoupons().map(normalizeCoupon);
    const availableCoupons = coupons.filter(coupon => !coupon.used);
    const usedCoupons = coupons.filter(coupon => coupon.used);
    const list = this.data.active === 'used' ? usedCoupons : availableCoupons;
    this.setData({ availableCoupons, usedCoupons, list });
  },

  switchTab(e) {
    const active = e.currentTarget.dataset.id;
    this.setData({ active }, () => this.refresh());
  },

  claimToday() {
    const added = claimCoupons();
    this.refresh();
    wx.showToast({ title: `已领取${added.length}张券`, icon: 'success' });
  },

  goShop() {
    wx.switchTab({ url: '/pages/shop/shop' });
  }
});
