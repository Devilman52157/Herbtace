const { ROUTES } = require('../../utils/data.js');
Page({
  data: { routes: ROUTES, picking: null, name: '', phone: '', date: '' },
  book(e) {
    const id = e.currentTarget.dataset.id;
    this.setData({ picking: ROUTES.find(r => r.id === id) });
  },
  close() { this.setData({ picking: null }); },
  noop(){},
  onName(e) { this.setData({ name: e.detail.value }); },
  onPhone(e) { this.setData({ phone: e.detail.value }); },
  onDate(e) { this.setData({ date: e.detail.value }); },
  submit() {
    if (!this.data.name || !this.data.phone || !this.data.date) {
      return wx.showToast({ title: '请填写完整', icon: 'none' });
    }
    if (!/^1[3-9]\d{9}$/.test(this.data.phone)) {
      return wx.showToast({ title: '手机号格式不正确', icon: 'none' });
    }
    wx.showToast({ title: '预约成功，稍后客服联系', icon: 'success' });
    this.setData({ picking: null, name: '', phone: '', date: '' });
  }
});
