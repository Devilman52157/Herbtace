Page({
  data: {
    list: [],
    editing: false,
    form: { name:'', phone:'', detail:'' }
  },
  onShow() { this.setData({ list: wx.getStorageSync('addr') || [] }); },
  openAdd() { this.setData({ editing: true, form: { name:'', phone:'', detail:'' } }); },
  close() { this.setData({ editing: false }); },
  noop(){},
  onName(e){ this.setData({ 'form.name': e.detail.value }); },
  onPhone(e){ this.setData({ 'form.phone': e.detail.value }); },
  onDetail(e){ this.setData({ 'form.detail': e.detail.value }); },
  save() {
    const f = this.data.form;
    if (!f.name || !f.phone || !f.detail) return wx.showToast({ title:'请填写完整', icon:'none' });
    if (!/^1[3-9]\d{9}$/.test(f.phone)) return wx.showToast({ title:'手机号格式不正确', icon:'none' });
    const list = [...this.data.list, Object.assign({ id: 'a'+Date.now() }, f)];
    wx.setStorageSync('addr', list);
    this.setData({ list, editing: false });
  },
  remove(e) {
    const id = e.currentTarget.dataset.id;
    const list = this.data.list.filter(a => a.id !== id);
    wx.setStorageSync('addr', list);
    this.setData({ list });
  }
});
