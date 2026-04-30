const REVIEW_STORAGE_KEY = 'product_reviews';

const DEFAULT_NAMES = ['安国老客', '轻养买家', '家庭药膳客', '办公室养生族'];
const DEFAULT_TEXTS = [
  '包装很稳，批次信息清楚，扫码能看到来路，用起来比较安心。',
  '味道自然，日常冲泡方便，家里人接受度也不错。',
  '发货和封装都挺细致，作为日常轻养补充刚好。',
  '溯源信息完整，产品说明也清楚，会继续回购。'
];

function getAllReviews() {
  const stored = wx.getStorageSync(REVIEW_STORAGE_KEY);
  return stored && typeof stored === 'object' ? stored : {};
}

function saveAllReviews(allReviews) {
  wx.setStorageSync(REVIEW_STORAGE_KEY, allReviews);
}

function getSeed(id) {
  return String(id || '').split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
}

function getDefaultReview(productId) {
  const seed = getSeed(productId);
  return {
    id: `default-${productId}`,
    name: DEFAULT_NAMES[seed % DEFAULT_NAMES.length],
    rating: seed % 5 === 0 ? 4 : 5,
    content: DEFAULT_TEXTS[seed % DEFAULT_TEXTS.length],
    date: `2026-04-${String(10 + seed % 18).padStart(2, '0')}`,
    isDefault: true
  };
}

function normalizeReview(review) {
  const rating = Math.max(1, Math.min(5, Number(review.rating) || 5));
  return {
    ...review,
    rating,
    avatarText: String(review.name || '买').slice(0, 1),
    stars: '★★★★★'.slice(0, rating),
    emptyStars: '★★★★★'.slice(0, 5 - rating)
  };
}

function getProductReviews(productId) {
  const allReviews = getAllReviews();
  const reviews = allReviews[productId] || [];
  return [getDefaultReview(productId), ...reviews].map(normalizeReview);
}

function getReviewSummary(productId) {
  const reviews = getProductReviews(productId);
  const count = reviews.length;
  const avg = count ? reviews.reduce((sum, item) => sum + item.rating, 0) / count : 0;
  const rounded = Math.round(avg);
  return {
    count,
    avg: avg.toFixed(1),
    stars: '★★★★★'.slice(0, rounded),
    emptyStars: '★★★★★'.slice(0, 5 - rounded)
  };
}

function addProductReview(productId, review) {
  const allReviews = getAllReviews();
  const list = allReviews[productId] || [];
  const rating = Math.max(1, Math.min(5, Number(review.rating) || 5));
  const nextReview = {
    id: `review-${Date.now()}`,
    name: review.name || '匿名买家',
    rating,
    content: String(review.content || '').trim(),
    date: new Date().toLocaleDateString('zh-CN'),
    isMine: true
  };
  allReviews[productId] = [nextReview, ...list];
  saveAllReviews(allReviews);
  return normalizeReview(nextReview);
}

module.exports = {
  getProductReviews,
  getReviewSummary,
  addProductReview
};
