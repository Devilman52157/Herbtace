const USER_KEY = 'wechat_user';
const SESSION_KEY = 'wechat_session';
const { loginWithCode } = require('./api.js');
const DEMO_USER = {
  nickName: '祁州体验官',
  avatarUrl: '',
  gender: 0,
  country: '',
  province: '河北',
  city: '保定',
  language: 'zh_CN',
  memberId: 'QZ-DEMO-001',
  demo: true
};

function getStoredUser() {
  return wx.getStorageSync(USER_KEY) || null;
}

function syncGlobalUser(user) {
  try {
    const app = getApp();
    if (app && app.globalData) {
      app.globalData.userInfo = user || null;
      app.globalData.isLoggedIn = !!user;
    }
  } catch (e) {}
}

function buildMemberId() {
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const tail = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `QZ${y}${m}${d}${tail}`;
}

function normalizeUser(userInfo = {}) {
  const oldUser = getStoredUser() || {};
  return {
    nickName: userInfo.nickName || oldUser.nickName || '祁州会员',
    avatarUrl: userInfo.avatarUrl || oldUser.avatarUrl || '',
    gender: userInfo.gender || 0,
    country: userInfo.country || '',
    province: userInfo.province || '',
    city: userInfo.city || '',
    language: userInfo.language || '',
    memberId: oldUser.memberId || buildMemberId(),
    loginAt: Date.now()
  };
}

function getWechatProfile() {
  return new Promise((resolve, reject) => {
    if (wx.getUserProfile) {
      wx.getUserProfile({
        desc: '用于展示会员头像昵称',
        success: resolve,
        fail: reject
      });
      return;
    }

    wx.getUserInfo({
      success: resolve,
      fail: reject
    });
  });
}

function getLoginCode() {
  return new Promise((resolve, reject) => {
    wx.login({
      success: (res) => {
        if (res && res.code) resolve(res);
        else reject(new Error('wx.login no code'));
      },
      fail: reject
    });
  });
}

function saveLogin(user, serverSession) {
  const session = serverSession && serverSession.token
    ? {
        token: serverSession.token,
        openid: serverSession.openid || '',
        unionid: serverSession.unionid || '',
        expiresAt: serverSession.expiresAt || 0,
        loginAt: Date.now()
      }
    : {
        localOnly: true,
        loginAt: Date.now()
      };
  wx.setStorageSync(USER_KEY, user);
  wx.setStorageSync(SESSION_KEY, session);
  syncGlobalUser(user);
  return { user, session };
}

function loginWithWechat() {
  return getWechatProfile()
    .then(profile => getLoginCode()
      .then(loginRes => loginWithCode({ code: loginRes.code })
        .then(serverSession => saveLogin(normalizeUser(profile.userInfo), serverSession))
        .catch(() => saveLogin(normalizeUser(profile.userInfo), null))));
}

function loginAsDemo() {
  const user = {
    ...DEMO_USER,
    loginAt: Date.now()
  };
  return Promise.resolve(saveLogin(user, {
    demo: true,
    token: '',
    expiresAt: 0
  }));
}

function loginWithLocalAccount(username) {
  const displayName = String(username || '').trim() || '祁州会员';
  const user = normalizeUser({
    nickName: displayName,
    avatarUrl: '',
    language: 'zh_CN'
  });
  return Promise.resolve(saveLogin(user, {
    localOnly: true,
    token: '',
    expiresAt: 0
  }));
}

function clearLogin() {
  wx.removeStorageSync(USER_KEY);
  wx.removeStorageSync(SESSION_KEY);
  syncGlobalUser(null);
}

module.exports = {
  USER_KEY,
  SESSION_KEY,
  getStoredUser,
  loginAsDemo,
  loginWithLocalAccount,
  loginWithWechat,
  clearLogin,
  syncGlobalUser
};
