const { GIFT_BOXES, PRODUCTS } = require('../../utils/data.js');

const ALL_PRODUCTS = Object.values(PRODUCTS).filter(p => p.cat !== 'special');

function buildProducts(pickedIds) {
  const set = new Set(pickedIds);
  return ALL_PRODUCTS.map(p => ({ ...p, picked: set.has(p.id) }));
}

Page({
  data: {
    step: 1,
    boxes: GIFT_BOXES,
    products: buildProducts([]),
    pickedBox: null,
    pickedIds: [],
    card: ''
  },
  pickBox(e) {
    const id = e.currentTarget.dataset.id;
    this.setData({ pickedBox: this.data.boxes.find(b => b.id === id) });
  },
  next() {
    if (this.data.step === 1 && !this.data.pickedBox) {
      return wx.showToast({ title: '请先选礼盒', icon: 'none' });
    }
    if (this.data.step === 2 && this.data.pickedIds.length !== this.data.pickedBox.cap) {
      return wx.showToast({ title: `需选满 ${this.data.pickedBox.cap} 件`, icon: 'none' });
    }
    this.setData({ step: this.data.step + 1 });
  },
  prev() { this.setData({ step: Math.max(1, this.data.step - 1) }); },
  toggle(e) {
    const id = e.currentTarget.dataset.id;
    const cur = [...this.data.pickedIds];
    const idx = cur.indexOf(id);
    if (idx >= 0) cur.splice(idx, 1);
    else if (cur.length < this.data.pickedBox.cap) cur.push(id);
    else return wx.showToast({ title: '已达上限', icon: 'none' });
    this.setData({ pickedIds: cur, products: buildProducts(cur) });
  },
  onCard(e) { this.setData({ card: e.detail.value }); },
  submit() {
    wx.showToast({ title: '已下单，期待您收到', icon: 'success' });
    setTimeout(() => wx.navigateBack(), 1200);
  }
});
