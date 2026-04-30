const { getStoredUser, loginWithLocalAccount, loginWithWechat } = require('../../utils/auth.js');

Page({
  data: {
    mode: 'login',
    loading: false,
    username: '',
    password: '',
    confirmPassword: '',
    accepted: true
  },

  onLoad() {
    this.redirectIfLoggedIn();
  },

  onShow() {
    this.redirectIfLoggedIn();
  },

  redirectIfLoggedIn() {
    if (!getStoredUser() || this.justLoggedIn) return;
    wx.switchTab({ url: '/pages/index/index' });
  },

  switchMode(e) {
    const mode = e.currentTarget.dataset.mode || 'login';
    this.setData({ mode });
  },

  onUsernameInput(e) {
    this.setData({ username: e.detail.value.trim() });
  },

  onPasswordInput(e) {
    this.setData({ password: e.detail.value });
  },

  onConfirmInput(e) {
    this.setData({ confirmPassword: e.detail.value });
  },

  toggleAccept() {
    this.setData({ accepted: !this.data.accepted });
  },

  handleAccountLogin() {
    if (this.data.loading) return;

    const { mode, username, password, confirmPassword, accepted } = this.data;
    if (!username) {
      wx.showToast({ title: '请输入用户名', icon: 'none' });
      return;
    }
    if (!password) {
      wx.showToast({ title: '请输入密码', icon: 'none' });
      return;
    }
    if (mode === 'register' && password !== confirmPassword) {
      wx.showToast({ title: '两次密码不一致', icon: 'none' });
      return;
    }
    if (!accepted) {
      wx.showToast({ title: '请先同意用户协议', icon: 'none' });
      return;
    }

    this.setData({ loading: true });
    loginWithLocalAccount(username)
      .then(() => {
        this.justLoggedIn = true;
        wx.showToast({ title: mode === 'register' ? '注册成功' : '登录成功', icon: 'success' });
        setTimeout(() => this.goMain(), 450);
      })
      .catch(() => {
        wx.showToast({ title: '登录失败，请重试', icon: 'none' });
      })
      .finally(() => {
        this.setData({ loading: false });
      });
  },

  handleWechatLogin() {
    if (this.data.loading) return;
    if (!this.data.accepted) {
      wx.showToast({ title: '请先同意用户协议', icon: 'none' });
      return;
    }

    this.setData({ loading: true });
    loginWithWechat()
      .then(() => {
        this.justLoggedIn = true;
        wx.showToast({ title: '微信登录成功', icon: 'success' });
        setTimeout(() => this.goMain(), 450);
      })
      .catch(() => {
        wx.showToast({ title: '微信登录已取消', icon: 'none' });
      })
      .finally(() => {
        this.setData({ loading: false });
      });
  },

  goMain() {
    wx.switchTab({ url: '/pages/index/index' });
  }
});
