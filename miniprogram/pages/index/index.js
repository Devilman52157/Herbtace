const { PRODUCTS, JIEQI, getJieqiStatus, formatJieqiDate } = require('../../utils/data.js');

const JQ_ICON = {
  lichun:'sprout', yushui:'sprout', jingzhe:'sprout',
  chunfen:'flower', qingming:'flower', guyu:'flower',
  lixia:'flower', xiaoman:'flower', mangzhong:'flower',
  xiazhi:'chime', xiaoshu:'chime', dashu:'chime',
  liqiu:'mountain', chushu:'mountain', bailu:'mountain',
  qiufen:'mountain', hanlu:'mountain', shuangjiang:'mountain',
  lidong:'chime', xiaoxue:'chime', daxue:'chime', dongzhi:'chime',
  xiaohan:'chime', dahan:'chime'
};

const SEASON_COLOR = { spring:'#4A7C59', summer:'#D4633C', autumn:'#C4935A', winter:'#5C4A3A' };

function buildJieqiList() {
  const now = new Date();
  return JIEQI.map(jq => ({
    ...jq,
    icon: JQ_ICON[jq.id] || 'sprout',
    iconColor: SEASON_COLOR[jq.season] || '#5C4A3A',
    status: getJieqiStatus(jq, now),
    dateRange: formatJieqiDate(jq)
  }));
}

Page({
  data: {
    activeCat: 'all',
    features: [
      { id:'atlas',  icon:'brush-atlas',   name:'祁八药图鉴',   sub:'八味道地 · 典藏详解' },
      { id:'map',    icon:'brush-map',     name:'产地溯源地图', sub:'药王故里 · 八大产区' },
      { id:'study',  icon:'brush-route',   name:'研学路线预约', sub:'访药 · 识药 · 制药' },
      { id:'ar',     icon:'brush-ar',      name:'AR 识药材',   sub:'相机一扫 · 即时辨识' },
      { id:'gift',   icon:'brush-giftbox', name:'礼盒私人订制', sub:'自选八品 · 匠心包装' },
      { id:'points', icon:'brush-coin',    name:'会员积分',     sub:'扫码得分 · 尊享权益' }
    ],
    cats: [
      { id:'all',     icon:'brush-grid',   name:'全部商品', sub:'进入商城' },
      { id:'easy',    icon:'brush-tea',    name:'便捷养生', sub:'日常轻补' },
      { id:'home',    icon:'brush-sprout', name:'家庭药膳', sub:'厨房良方' },
      { id:'special', icon:'brush-gift',   name:'特色创新', sub:'新潮伴手' },
      { id:'story',   icon:'brush-atlas',  name:'品牌故事', sub:'药都传承' }
    ],
    picks: [],
    jieqiList: [],
    currentJieqiViewId: ''
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 0 });
    }
    this.refreshJieqiStrip();
  },

  onLoad() {
    // 精选 6 款：每类前 2
    const all = Object.values(PRODUCTS);
    const picks = [];
    ['easy','home','special'].forEach(c => {
      all.filter(p => p.cat === c).slice(0, 2).forEach(p => picks.push(p));
    });

    // 节气带 —— 按 H5 原型给每个节气分配 SVG 图标
    const jieqiList = buildJieqiList();

    this.setData({
      picks,
      jieqiList
    }, () => {
      this.scrollToCurrentJieqi();
    });
  },

  refreshJieqiStrip() {
    if (!this.data.jieqiList.length) return;

    this.setData({ jieqiList: buildJieqiList() }, () => {
      this.scrollToCurrentJieqi();
    });
  },

  scrollToCurrentJieqi() {
    const currentJieqi = this.data.jieqiList.find(jq => jq.status === 'current');
    if (!currentJieqi) return;

    const viewId = `jieqi-${currentJieqi.id}`;
    this.setData({ currentJieqiViewId: '' }, () => {
      this.setData({ currentJieqiViewId: viewId });
    });
  },

  onScan() {
    wx.scanCode({
      scanType: ['qrCode'],
      success: (res) => {
        // 约定二维码内容为产品 id 或包含 id 的 URL
        const text = res.result || '';
        const match = text.match(/(easy\d+|home\d+|spec\d+)/);
        const pid = match ? match[1] : '';
        if (pid && PRODUCTS[pid]) {
          wx.navigateTo({ url: `/pages/trace/trace?id=${pid}` });
        } else {
          wx.showToast({ title: '未识别的二维码', icon: 'none' });
        }
      },
      fail: () => wx.showToast({ title: '已取消扫码', icon: 'none' })
    });
  },

  goShop(e) {
    const cat = e.currentTarget.dataset.cat || 'all';
    if (cat === 'story') {
      wx.navigateTo({ url: '/pages/brand-story/brand-story' });
      return;
    }
    // 通过全局状态传类别（简化做法）
    getApp().globalData.shopCat = cat;
    wx.switchTab({ url: '/pages/shop/shop' });
  },

  goTrace(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/trace/trace?id=${id}` });
  },

  goFeat(e) {
    const id = e.currentTarget.dataset.id;
    const map = {
      atlas:  '/pages/atlas/atlas',
      map:    '/pages/origin-map/origin-map',
      study:  '/pages/study/study',
      ar:     '/pages/vision/vision?mode=herb',
      gift:   '/pages/gift-diy/gift-diy',
      points: '/pages/points/points'
    };
    const url = map[id];
    if (url) wx.navigateTo({ url });
    else wx.showToast({ title: '开发中', icon: 'none' });
  },

  goJieqi(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/jieqi-detail/jieqi-detail?id=${id}` });
  },

  goChat() {
    wx.navigateTo({ url: '/pages/chat/chat' });
  }
});
