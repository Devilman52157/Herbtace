const { HERBS } = require('../../utils/data.js');
Page({
  data: { herbs: HERBS, active: null },
  openHerb(e) {
    const id = e.currentTarget.dataset.id;
    const h = HERBS.find(x => x.id === id);
    this.setData({ active: h });
  },
  close() { this.setData({ active: null }); },
  noop() {}
});
