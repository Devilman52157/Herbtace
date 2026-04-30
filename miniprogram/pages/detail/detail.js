const { PRODUCTS } = require('../../utils/data.js');
const { getProductReviews, getReviewSummary, addProductReview } = require('../../utils/reviews.js');
const { getProductIdFromOptions } = require('../../utils/product-id.js');

Page({
  data: {
    product: null,
    isFav: false,
    cartCount: 0,
    canReview: false,
    reviews: [],
    reviewSummary: { count: 0, avg: '0.0', stars: '', emptyStars: '★★★★★' },
    reviewStars: [1, 2, 3, 4, 5],
    reviewForm: { rating: 5, content: '' }
  },

  onLoad(options) {
    const productId = getProductIdFromOptions(options);
    const p = PRODUCTS[productId];
    if (!p) {
      wx.showToast({ title: '产品不存在', icon: 'none' });
      return;
    }
    this.setData({ product: p });
    wx.setNavigationBarTitle({ title: p.name });
  },

  onShow() { this.refreshState(); },

  refreshState() {
    if (!this.data.product) return;
    const favs = wx.getStorageSync('favs') || [];
    const cart = wx.getStorageSync('cart') || [];
    const id = this.data.product.id;
    this.setData({
      isFav: favs.includes(id),
      cartCount: cart.length,
      canReview: this.hasPurchased(id),
      reviews: getProductReviews(id),
      reviewSummary: getReviewSummary(id)
    });
  },

  hasPurchased(productId) {
    const orders = wx.getStorageSync('orders') || [];
    return orders.some(order => (order.items || []).some(item => item.id === productId));
  },

  toggleFav() {
    if (!this.data.product) return;
    const id = this.data.product.id;
    let favs = wx.getStorageSync('favs') || [];
    const on = favs.includes(id);
    favs = on ? favs.filter(x=>x!==id) : favs.concat(id);
    wx.setStorageSync('favs', favs);
    wx.showToast({ title: on?'已取消收藏':'已收藏', icon:'none' });
    this.refreshState();
  },

  addToCart() {
    if (!this.data.product) return;
    const id = this.data.product.id;
    const cart = wx.getStorageSync('cart') || [];
    cart.push(id);
    wx.setStorageSync('cart', cart);
    wx.showToast({ title: '已加入购物车', icon: 'success' });
    this.refreshState();
  },

  buyNow() {
    if (!this.data.product) return;
    const id = this.data.product.id;
    const cart = wx.getStorageSync('cart') || [];
    cart.push(id);
    wx.setStorageSync('cart', cart);
    wx.navigateTo({ url: '/pages/cart/cart' });
  },

  goCart() { wx.navigateTo({ url: '/pages/cart/cart' }); },

  goTrace() {
    if (!this.data.product) return;
    wx.navigateTo({ url: `/pages/trace/trace?id=${this.data.product.id}` });
  },

  chooseRating(e) {
    const rating = Number(e.currentTarget.dataset.rating) || 5;
    this.setData({ 'reviewForm.rating': rating });
  },

  onReviewInput(e) {
    this.setData({ 'reviewForm.content': e.detail.value });
  },

  submitReview() {
    if (!this.data.product) return;
    if (!this.data.canReview) {
      wx.showToast({ title: '购买后可评价', icon: 'none' });
      return;
    }
    const content = (this.data.reviewForm.content || '').trim();
    if (content.length < 4) {
      wx.showToast({ title: '评价至少4个字', icon: 'none' });
      return;
    }
    addProductReview(this.data.product.id, {
      rating: this.data.reviewForm.rating,
      content
    });
    this.setData({ reviewForm: { rating: 5, content: '' } });
    this.refreshState();
    wx.showToast({ title: '评价已发布', icon: 'success' });
  }
});
