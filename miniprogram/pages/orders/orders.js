Page({
  data: {
    tabs: [
      { k: 'all',  n: '全部' },
      { k: 'paid', n: '待发货' },
      { k: 'ship', n: '待收货' },
      { k: 'done', n: '已完成' }
    ],
    active: 'all',
    orders: [],
    filteredOrders: []
  },

  onShow() {
    // 合并默认 demo 订单与本地下单记录
    const stored = wx.getStorageSync('orders') || [];
    const normalized = stored.map(o => ({
      id: o.no,
      status: o.status || '待发货',
      statusK: this.mapStatus(o.status || '待发货'),
      items: o.items || [],
      total: o.total,
      time:  o.date
    }));
    const demo = [
      { id:'O2026041201', status:'待发货', statusK:'paid',
        items:[{ name:'祛湿薏米茶包', cat:'easy', qty:2, price:9.9 }],
        total:'19.8', time:'2026-04-12 10:24' },
      { id:'O2026040902', status:'已完成', statusK:'done',
        items:[{ name:'家用白芷卤料包', cat:'home', qty:1, price:15.9 }],
        total:'15.9', time:'2026-04-09 19:02' }
    ];
    // 去重：只添加真实订单中不存在的 demo 订单
    const realIds = new Set(normalized.map(o => o.id));
    const uniqueDemo = demo.filter(d => !realIds.has(d.id));
    this.setData({ orders: [...normalized, ...uniqueDemo] });
    this.applyFilter();
  },

  mapStatus(s) {
    if (s.includes('收货')) return 'ship';
    if (s.includes('完成')) return 'done';
    if (s.includes('发货')) return 'paid';
    return 'paid';
  },

  switchTab(e) {
    this.setData({ active: e.currentTarget.dataset.k });
    this.applyFilter();
  },

  applyFilter() {
    const { active, orders } = this.data;
    const filteredOrders = active === 'all' ? orders : orders.filter(o => o.statusK === active);
    this.setData({ filteredOrders });
  },

  goShop() { wx.switchTab({ url: '/pages/shop/shop' }); }
});
