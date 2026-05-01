const { PRODUCTS } = require('../../utils/data.js');
const { getProductReviews, getReviewSummary, addProductReview } = require('../../utils/reviews.js');
const { getProductIdFromOptions } = require('../../utils/product-id.js');

const ARCHIVE_META = {
  easy1: { enName: 'Qiju Chrysanthemum Tea', birthplace: '安国祁菊花基地', water: '90°C左右热水', partner: '枸杞、桑叶、蜂蜜', moment: '午后久视屏幕后', motto: '清风入盏，眼底有光', note: '适合日常冲泡饮用，花香清雅，入口微甘。' },
  easy2: { enName: 'Coix Meal Cake', birthplace: '安国薏米山药加工坊', water: '常温食用，可配温饮', partner: '豆浆、牛奶、红豆茶', moment: '通勤早餐或加班间隙', motto: '轻盈饱腹，也要认真吃饭', note: '独立小包便于携带，适合早餐、下午茶和轻代餐场景。' },
  easy3: { enName: 'Qiju Goji Eye Tea', birthplace: '安国祁菊花枸杞配方室', water: '90°C左右热水', partner: '枸杞、决明子、桑叶', moment: '长时间看屏幕后', motto: '把疲惫留在杯底', note: '适合屏幕族日常冲泡，清润温和，花果香明显。' },
  easy4: { enName: 'Triple Flower Cooling Tea', birthplace: '安国三花拼配工坊', water: '85-90°C热水', partner: '金银花、茉莉、菊花', moment: '熬夜后或口干时', motto: '热气退场，清香上桌', note: '三花同袋，适合需要清爽口感的办公室与居家场景。' },
  easy5: { enName: 'Cooked Coix Powder', birthplace: '安国熟制破壁车间', water: '80°C左右热水或温奶', partner: '牛奶、豆浆、燕麦', moment: '早餐或睡前轻食', motto: '细腻一杯，脾胃有底', note: '熟制破壁后即冲即饮，适合早餐、加餐和轻养生人群。' },
  easy6: { enName: 'Dampness Relief Coix Tea', birthplace: '安国四味配方工坊', water: '90°C左右热水', partner: '赤小豆、茯苓、芡实', moment: '雨天、久坐或湿重时', motto: '一袋一杯，轻盈回身', note: '四味配方独立茶包，适合日常祛湿、轻负担饮用。' },
  easy7: { enName: 'Adenophora Throat Tea', birthplace: '安国祁沙参切片基地', water: '90°C左右热水', partner: '玉竹、麦冬、百合', moment: '秋冬干燥或用嗓后', motto: '润过喉咙，也润过日常', note: '沙参清润，适合秋冬干燥、久咳久说后的温和冲泡。' },
  easy8: { enName: 'Six Herbs Moistening Drink', birthplace: '安国六物配方室', water: '90°C左右热水', partner: '玉竹、麦冬、百合', moment: '晚间放松或干燥季节', motto: '慢慢喝，慢慢润', note: '六物同配，口感温润，适合滋阴润燥和日常养护。' },
  home1: { enName: 'Qishan Yam Slices', birthplace: '安国祁山药鲜切烘干坊', water: '炖煮30分钟以上', partner: '排骨、鸡汤、小米', moment: '周末煲汤或晚餐炖粥', motto: '一片入锅，家常有补', note: '片形完整，适合煲汤、炖粥、煮水等家庭烹饪。' },
  home2: { enName: 'Angelica Dahurica Spice Pack', birthplace: '安国白芷香辛料工坊', water: '随汤锅慢煮', partner: '八角、桂皮、山楂', moment: '卤味、炖肉或家宴备菜', motto: '烟火气里，也有本草香', note: '一包一锅，适合卤肉、炖汤、焖菜等家用烹饪。' },
  home3: { enName: 'Fresh Cut Qishan Yam', birthplace: '安国鲜山药锁鲜车间', water: '蒸煮15-20分钟', partner: '排骨、红枣、小米粥', moment: '快手晚餐或清淡炖汤', motto: '新鲜切段，省心上桌', note: '去皮切段真空锁鲜，开袋即可烹饪，适合家庭快手菜。' },
  home4: { enName: 'Qishan Yam Cubes', birthplace: '安国祁山药切丁工坊', water: '煮粥或焖饭同煮', partner: '大米、小米、杂粮', moment: '早餐粥、便当饭', motto: '小丁入碗，家常更稳', note: '小丁规格便于煮粥、拌饭和做杂粮饭，适合高频家庭使用。' },
  home5: { enName: 'Baizhi Seasoning Powder', birthplace: '安国白芷研磨工坊', water: '烹饪时直接撒入', partner: '姜粉、花椒、鱼肉', moment: '煎鱼、炖肉或炒菜前', motto: '去腥提香，留住锅气', note: '细粉即撒，适合厨房去腥、提香和日常调味。' },
  spec1: { enName: 'Freeze Dried Qishan Yam Snack', birthplace: '安国冻干零食工坊', water: '开袋即食，可配温茶', partner: '清茶、酸奶、坚果', moment: '办公追剧或旅途中', motto: '轻甜不腻，脆得刚好', note: '冻干锁鲜搭配薄糖口感，适合办公室和外出零食。' },
  spec2: { enName: 'Eight Qiyao Gift Box', birthplace: '安国八大祁药礼盒工坊', water: '按内含单品分别冲泡/烹饪', partner: '家人、朋友、节庆餐桌', moment: '节庆送礼或家庭常备', motto: '八味成礼，把安国带回家', note: '八大祁药各一款，适合尝鲜、送礼和家庭本草入门。' },
  spec5: { enName: 'Premium Qiyao Gift Box', birthplace: '安国高端滋补礼盒工坊', water: '按内含单品分别冲泡/炖煮', partner: '商务宴请、长辈礼赠', moment: '重要拜访或节日尊赠', motto: '体面成盒，心意有据', note: '祁药八品搭配名贵滋补，适合商务礼赠与高规格拜访。' }
};

function getInfoValue(product, key) {
  return product.info && product.info[key] ? product.info[key] : '';
}

function buildProductInfoRows(product) {
  const meta = ARCHIVE_META[product.id] || {};
  const rows = [
    { label: '中文名', value: product.name },
    { label: '英文名', value: meta.enName || product.id },
    { label: '籍贯', value: product.origin },
    { label: '出生地', value: meta.birthplace || `${product.origin}道地本草基地` },
    { label: '喜欢的水温', value: meta.water || '90°C左右热水' },
    { label: '喜欢的搭档', value: meta.partner || (product.tags || []).join('、') },
    { label: '喜欢的时光', value: meta.moment || '日常轻养生时刻' },
    { label: '崇尚的格言', value: meta.motto || '道地本草，日常有养' }
  ];
  ['生产日期', '保质期', '净含量', '内含', '认证'].forEach(key => {
    const value = getInfoValue(product, key);
    if (value) rows.push({ label: key, value });
  });
  return rows;
}

Page({
  data: {
    product: null,
    productInfoRows: [],
    productArchiveNote: '',
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
    this.setData({
      product: p,
      productInfoRows: buildProductInfoRows(p),
      productArchiveNote: (ARCHIVE_META[p.id] && ARCHIVE_META[p.id].note) || p.desc
    });
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
