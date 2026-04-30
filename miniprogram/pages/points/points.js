const { REWARDS, EARN_ITEMS } = require('../../utils/data.js');

const SIGN_POINTS = 5;
const SEVEN_DAY_BONUS = 20;
const TASK_ICONS = {
  e1: 'calendar',
  e2: 'cart',
  e3: 'scan',
  e4: 'clipboard',
  e5: 'user'
};

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function diffDays(a, b) {
  const ta = new Date(`${a}T00:00:00`).getTime();
  const tb = new Date(`${b}T00:00:00`).getTime();
  return Math.round((ta - tb) / 86400000);
}

function withSignState(items, signedToday, streak) {
  return items.map(item => {
    const next = {
      ...item,
      icon: TASK_ICONS[item.id] || item.icon || 'sprout'
    };

    if (item.id !== 'e1') return next;

    return {
      ...next,
      icon: signedToday ? 'check' : 'calendar',
      done: signedToday,
      desc: signedToday ? `签到成功 · 已连续 ${streak} 天` : item.desc,
      pts: signedToday ? '已完成' : item.pts
    };
  });
}

Page({
  data: {
    balance: 0,
    rewards: REWARDS,
    earnItems: EARN_ITEMS,
    streak: 0,
    signedToday: false,
    signTip: '每日签到 +5'
  },

  onLoad() {
    this.refresh();
  },

  onShow() {
    this.refresh();
  },

  refresh() {
    const balance = wx.getStorageSync('points_balance') || 320;
    const lastSign = wx.getStorageSync('points_last_sign') || '';
    const streak = wx.getStorageSync('points_streak') || 0;
    const today = todayStr();
    const signedToday = lastSign === today;
    const signTip = signedToday
      ? `签到成功 · 连续 ${streak} 天`
      : (streak > 0 ? `每日签到 +5 · 已连签 ${streak} 天` : '每日签到 +5');

    this.setData({
      balance,
      streak,
      signedToday,
      signTip,
      earnItems: withSignState(EARN_ITEMS, signedToday, streak)
    });
  },

  signIn() {
    if (this.data.signedToday) {
      wx.showToast({ title: `今日已签到 · 连续 ${this.data.streak} 天`, icon: 'none' });
      return;
    }

    const today = todayStr();
    const lastSign = wx.getStorageSync('points_last_sign') || '';
    let streak = wx.getStorageSync('points_streak') || 0;

    if (lastSign && diffDays(today, lastSign) === 1) {
      streak += 1;
    } else {
      streak = 1;
    }

    const bonus = (streak > 0 && streak % 7 === 0) ? SEVEN_DAY_BONUS : 0;
    const earned = SIGN_POINTS + bonus;
    const newBalance = this.data.balance + earned;

    wx.setStorageSync('points_balance', newBalance);
    wx.setStorageSync('points_last_sign', today);
    wx.setStorageSync('points_streak', streak);

    this.setData({
      balance: newBalance,
      streak,
      signedToday: true,
      signTip: `签到成功 · 连续 ${streak} 天`,
      earnItems: withSignState(EARN_ITEMS, true, streak)
    });

    wx.showToast({
      title: bonus ? `签到成功 +${earned} · 连续 ${streak} 天` : `签到成功 +5 · 连续 ${streak} 天`,
      icon: 'success',
      duration: 2200
    });
  },

  redeem(e) {
    const id = e.currentTarget.dataset.id;
    const rw = this.data.rewards.find(r => r.id === id);
    if (!rw) return;
    if (this.data.balance < rw.cost) {
      return wx.showToast({ title: '积分不足', icon: 'none' });
    }
    // 检查库存（解析 "剩 X 份" 格式）
    const stockMatch = (rw.stock || '').match(/剩\s*(\d+)/);
    if (stockMatch && Number(stockMatch[1]) <= 0) {
      return wx.showToast({ title: '库存已空', icon: 'none' });
    }
    const b = this.data.balance - rw.cost;
    wx.setStorageSync('points_balance', b);
    this.setData({ balance: b });
    wx.showToast({ title: '兑换成功', icon: 'success' });
  }
});
