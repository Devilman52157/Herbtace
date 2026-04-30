const COUPON_STORAGE_KEY = 'coupons';

const DEFAULT_COUPONS = [
  { id:'season15', title:'满99减15', threshold:99, discount:15, desc:'节气养生券' },
  { id:'fresh8', title:'满59减8', threshold:59, discount:8, desc:'新品尝鲜券' }
];

function cloneCoupon(coupon, suffix) {
  return {
    ...coupon,
    id: suffix ? `${coupon.id}-${suffix}` : coupon.id,
    used: false,
    claimedAt: Date.now()
  };
}

function ensureCoupons() {
  const stored = wx.getStorageSync(COUPON_STORAGE_KEY);
  if (Array.isArray(stored)) return stored;

  const coupons = DEFAULT_COUPONS.map(coupon => cloneCoupon(coupon));
  wx.setStorageSync(COUPON_STORAGE_KEY, coupons);
  return coupons;
}

function getUnusedCoupons() {
  return ensureCoupons().filter(coupon => !coupon.used);
}

function getAvailableCoupons(total) {
  const amount = Number(total) || 0;
  return getUnusedCoupons()
    .filter(coupon => amount >= Number(coupon.threshold || 0))
    .sort((a, b) => Number(b.discount || 0) - Number(a.discount || 0));
}

function claimCoupons() {
  const suffix = Date.now();
  const coupons = ensureCoupons();
  const newCoupons = DEFAULT_COUPONS.map((coupon, index) => cloneCoupon(coupon, `${suffix}-${index}`));
  wx.setStorageSync(COUPON_STORAGE_KEY, coupons.concat(newCoupons));
  return newCoupons;
}

function markCouponUsed(id) {
  const coupons = ensureCoupons();
  const next = coupons.map(coupon => (
    coupon.id === id ? { ...coupon, used: true, usedAt: Date.now() } : coupon
  ));
  wx.setStorageSync(COUPON_STORAGE_KEY, next);
}

module.exports = {
  DEFAULT_COUPONS,
  ensureCoupons,
  getUnusedCoupons,
  getAvailableCoupons,
  claimCoupons,
  markCouponUsed
};
