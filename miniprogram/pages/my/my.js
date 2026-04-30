const { getUnusedCoupons } = require('../../utils/coupons.js');
const { getStoredUser, clearLogin } = require('../../utils/auth.js');
const { TRACE_HISTORY_KEY } = require('../../utils/history.js');

Page({
  data: {
    balance: 0,
    cartCount: 0,
    orderCount: 0,
    scanCount: 0,
    couponCount: 0,
    isLoggedIn: false,
    displayName: '养生达人',
    displayId: 'ID: BCS20260414',
    avatarUrl: '',
    couponDesc: '领取后可在结算时使用',
    menus: [
      { id:'orders',        icon:'box',      name:'我的订单' },
      { id:'cart',          icon:'cart',     name:'购物车' },
      { id:'favs',          icon:'star',     name:'我的收藏' },
      { id:'trace-history', icon:'chain',    name:'溯源记录' },
      { id:'chat-history',  icon:'chat',     name:'问诊历史' },
      { id:'address',       icon:'pin',      name:'收货地址' },
      { id:'points',        icon:'coin',     name:'会员积分' },
      { id:'settings',      icon:'settings', name:'设置' }
    ]
  },
  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 3 });
    }
    const cart   = wx.getStorageSync('cart')   || [];
    const orders = wx.getStorageSync('orders') || [];
    const scans  = wx.getStorageSync(TRACE_HISTORY_KEY) || [];
    const coupons = getUnusedCoupons();
    const bestCoupon = coupons[0];
    const user = getStoredUser();
    this.setData({
      balance:    wx.getStorageSync('points_balance') || 320,
      cartCount:  cart.length,
      orderCount: orders.length,
      scanCount:  scans.length,
      couponCount: coupons.length,
      isLoggedIn: !!user,
      displayName: user && user.nickName ? user.nickName : '养生达人',
      displayId: user && user.memberId ? `ID: ${user.memberId}` : 'ID: BCS20260414',
      avatarUrl: user && user.avatarUrl ? user.avatarUrl : '',
      couponDesc: bestCoupon ? `${coupons.length} 张可用 · ${bestCoupon.title}` : '暂无可用券，点击领取今日优惠'
    });
  },
  goLogin() { wx.navigateTo({ url: '/pages/login/login?from=my' }); },
  logout() {
    wx.showModal({
      title: '退出登录',
      content: '退出后仍可浏览商城，本地订单和收藏不会删除。',
      confirmText: '退出',
      confirmColor: '#B5452A',
      success: (res) => {
        if (!res.confirm) return;
        clearLogin();
        this.setData({
          isLoggedIn: false,
          displayName: '养生达人',
          displayId: 'ID: BCS20260414',
          avatarUrl: ''
        });
        wx.showToast({ title: '已退出', icon: 'success' });
      }
    });
  },
  goCoupons() { wx.navigateTo({ url: '/pages/coupons/coupons' }); },
  goMenu(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/${id}/${id}` });
  },
  goCart()         { wx.navigateTo({ url: '/pages/cart/cart' }); },
  goOrders()       { wx.navigateTo({ url: '/pages/orders/orders' }); },
  goTraceHistory() { wx.navigateTo({ url: '/pages/trace-history/trace-history' }); },
  goPoints()       { wx.navigateTo({ url: '/pages/points/points' }); }
});
