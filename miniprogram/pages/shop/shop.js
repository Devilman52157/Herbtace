const { PRODUCTS, JIEQI, getJieqiStatus } = require('../../utils/data.js');

function seededRandom(seed) {
  let value = seed % 2147483647;
  if (value <= 0) value += 2147483646;
  return function() {
    value = value * 16807 % 2147483647;
    return (value - 1) / 2147483646;
  };
}

function getDailySeed() {
  const d = new Date();
  return Number(`${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`);
}

function shuffleWithSeed(items, seed) {
  const list = items.slice();
  const rand = seededRandom(seed);
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}

function hashId(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) { h = ((h << 5) - h) + s.charCodeAt(i); h |= 0; }
  return Math.abs(h);
}

function buildCampaigns() {
  const all = Object.values(PRODUCTS);
  const picked = shuffleWithSeed(all, getDailySeed());
  const sale = picked.slice(0, 5).map((p, index) => {
    const discount = 0.72 + (index % 4) * 0.04;
    return {
      id: p.id,
      salePrice: (p.price * discount).toFixed(1),
      discountText: `${Math.round(discount * 100) / 10}折`,
      promoTag: '秒杀'
    };
  });
  const fresh = picked.slice(5, 10).map(p => ({ id: p.id, promoTag: '新品' }));
  const hot = picked.slice(10, 15).map(p => ({ id: p.id, promoTag: '热销' }));
  return { sale, new: fresh, hot };
}

Page({
  data: {
    cat: 'all',
    sort: 'default',
    activeMode: '',
    campaigns: { sale: [], new: [], hot: [] },
    keyword: '',
    tabs: [
      { id:'all',     name:'全部' },
      { id:'easy',    name:'便捷养生' },
      { id:'home',    name:'家庭药膳' },
      { id:'special', name:'特色创新' }
    ],
    counts: { all:0, easy:0, home:0, special:0 },
    list: [],
    favs: {},
    promo: { tagJq:'谷雨', title:'时令祛湿专场', sub:'薏米 · 茯苓 · 山药 · 满99减15', hh:'02', mm:'14', ss:'38' }
  },

  onLoad() {
    this.setData({ campaigns: buildCampaigns() });
    this.setupPromo();
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 1 });
    }
    const app = getApp();
    const cat = app.globalData.shopCat || this.data.cat || 'all';
    const sort = app.globalData.shopSort || this.data.sort || 'default';
    const entry = app.globalData.shopEntry || '';
    app.globalData.shopCat = null;
    app.globalData.shopSort = null;
    app.globalData.shopEntry = null;
    this.loadFavs();
    this.setData({ cat, sort, activeMode: ['sale','new','hot'].includes(entry) ? entry : '' });
    this.refresh();
    this.startCountdown();
  },

  onHide()   { this.stopCountdown(); },
  onUnload() { this.stopCountdown(); },

  /* ---------- 筛选 / 排序 ---------- */
  switchCat(e)   { this.setData({ cat: e.currentTarget.dataset.id, activeMode: '' }); this.refresh(); },
  switchSort(e)  { this.setData({ sort: e.currentTarget.dataset.s, activeMode: '' }); this.refresh(); },
  onSearchInput(e){ this.setData({ keyword: e.detail.value }); this.refresh(); },
  clearSearch()  { this.setData({ keyword: '' }); this.refresh(); },
  resetAll()     { this.setData({ keyword:'', cat:'all', sort:'default', activeMode:'' }); this.refresh(); },

  refresh() {
    const { cat, sort, keyword, activeMode, campaigns } = this.data;
    const all = Object.values(PRODUCTS);

    // 分类计数（含搜索过滤后的计数更符合预期，这里用全量计数保持稳定）
    const counts = { all: all.length, easy:0, home:0, special:0 };
    all.forEach(p => { counts[p.cat] = (counts[p.cat]||0) + 1; });

    let list;
    if (activeMode && campaigns[activeMode]) {
      list = campaigns[activeMode]
        .map(item => PRODUCTS[item.id] && ({ ...PRODUCTS[item.id], ...item }))
        .filter(Boolean);
    } else {
      list = cat === 'all' ? all.slice() : all.filter(p => p.cat === cat);
      list = list.map(p => ({
        ...p,
        promoTag: p.cat === 'special' ? '热卖' : ''
      }));
    }

    // 搜索
    const kw = (keyword || '').trim().toLowerCase();
    if (kw) {
      list = list.filter(p =>
        (p.name||'').toLowerCase().includes(kw) ||
        (p.origin||'').toLowerCase().includes(kw) ||
        (p.desc||'').toLowerCase().includes(kw) ||
        (p.tags||[]).some(t => (t||'').toLowerCase().includes(kw))
      );
    }

    // 排序
    if (!activeMode) {
      if (sort === 'priceAsc')  list.sort((a,b)=>a.price-b.price);
      if (sort === 'priceDesc') list.sort((a,b)=>b.price-a.price);
      if (sort === 'new')       list.sort((a,b)=>(b.batch||'').localeCompare(a.batch||''));
      if (sort === 'hot')       list.sort((a,b)=>this.getHotScore(b)-this.getHotScore(a));
    }

    // 价格拆分 + 完整规格 + 销量/评分（按 id 生成，稳定不抖动）
    list = list.map(p => {
      const shown = String(p.salePrice || p.price);
      const dot = shown.indexOf('.');
      const unitText = (p.unit || '').replace(/（/g, '(').replace(/）/g, ')');
      const seed = hashId(p.id);
      const soldNum = 120 + (seed % 4880);
      const sold = soldNum >= 1000 ? `${(soldNum/1000).toFixed(1)}k` : String(soldNum);
      const rating = (4.5 + ((seed >> 4) % 5) / 10).toFixed(1);
      return {
        ...p,
        priceInt: dot < 0 ? shown : shown.slice(0, dot),
        priceDec: dot < 0 ? ''    : shown.slice(dot),
        unitText,
        sold,
        rating
      };
    });

    this.setData({ list, counts });
  },

  getHotScore(p) {
    const price = Number(p.price) || 0;
    return (p.cat === 'special' ? 1000 : 0) + price;
  },

  /* ---------- 收藏 ---------- */
  loadFavs() {
    const ids = wx.getStorageSync('favs') || [];
    const favs = {};
    ids.forEach(id => favs[id] = true);
    this.setData({ favs });
  },
  toggleFav(e) {
    const id = e.currentTarget.dataset.id;
    let ids = wx.getStorageSync('favs') || [];
    const on = ids.includes(id);
    ids = on ? ids.filter(x=>x!==id) : ids.concat(id);
    wx.setStorageSync('favs', ids);
    wx.showToast({ title: on?'已取消收藏':'已收藏', icon:'none' });
    this.loadFavs();
  },

  /* ---------- 详情 ---------- */
  goDetail(e) {
    wx.navigateTo({ url: `/pages/detail/detail?id=${e.currentTarget.dataset.id}` });
  },

  /* ---------- 加购 ---------- */
  addCart(e) {
    const id = e.currentTarget.dataset.id;
    const ids = wx.getStorageSync('cart') || [];
    ids.push(id);
    wx.setStorageSync('cart', ids);
    wx.showToast({ title: '已加入购物车', icon: 'none' });
  },

  /* ---------- 限时促销（当令节气 + 倒计时） ---------- */
  setupPromo() {
    const now = new Date();
    const current = JIEQI.find(j => getJieqiStatus(j, now) === 'current') || JIEQI[0];
    this.promoEnd = new Date(current.end + 'T23:59:59').getTime();
    // 简单映射一些节气主题
    const themes = {
      guyu:      { title:'时令祛湿专场', sub:'薏米 · 茯苓 · 山药 · 满99减15' },
      qingming:  { title:'清肝明目专场', sub:'菊花 · 枸杞 · 桑叶 · 满99减15' },
      lixia:     { title:'清心养神专场', sub:'莲子 · 百合 · 麦冬 · 满99减15' },
      xiazhi:    { title:'解暑生津专场', sub:'绿豆 · 薄荷 · 乌梅 · 满99减15' },
      liqiu:     { title:'润肺防燥专场', sub:'沙参 · 玉竹 · 梨膏 · 满99减15' },
      shuangjiang:{title:'温补肝肾专场', sub:'山药 · 枸杞 · 黑豆 · 满99减15' },
      lidong:    { title:'温补气血专场', sub:'当归 · 黄芪 · 红枣 · 满99减15' },
      dongzhi:   { title:'冬至进补专场', sub:'人参 · 阿胶 · 桂圆 · 满99减15' }
    };
    const theme = themes[current.id] || { title:`${current.name}养生专场`, sub:'时令精选 · 满99减15' };
    this.setData({ promo: { ...this.data.promo, tagJq: current.name, title: theme.title, sub: theme.sub } });
    this.tickCountdown();
  },

  startCountdown() {
    this.stopCountdown();
    this.timer = setInterval(() => this.tickCountdown(), 1000);
  },
  stopCountdown() { if (this.timer) { clearInterval(this.timer); this.timer = null; } },
  tickCountdown() {
    if (!this.promoEnd) return;
    let diff = Math.max(0, Math.floor((this.promoEnd - Date.now())/1000));
    const d = Math.floor(diff/86400); diff -= d*86400;
    const hh = String(Math.floor(diff/3600)).padStart(2,'0'); diff -= Math.floor(diff/3600)*3600;
    const mm = String(Math.floor(diff/60)).padStart(2,'0');
    const ss = String(diff%60).padStart(2,'0');
    // 超过24小时显示"Xd HH"，否则 HH:MM:SS
    const promo = { ...this.data.promo,
      hh: d>0 ? `${d}d` : hh,
      mm: d>0 ? hh : mm,
      ss: d>0 ? mm : ss
    };
    this.setData({ promo });
  },

  applyPromo() {
    this.setData({ cat: 'all', sort: 'default', activeMode: 'sale' });
    this.refresh();
    wx.showToast({ title: '已进入限时秒杀', icon: 'none' });
  }
});
