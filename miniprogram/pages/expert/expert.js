const { EXPERTS, HOT_TOPICS } = require('../../utils/data.js');

Page({
  data: {
    activeTab: 'ask',
    experts: EXPERTS,
    hotTopics: HOT_TOPICS,
    tabs: [
      { id: 'ask', name: '在线提问' },
      { id: 'faq', name: '问题库' }
    ],
    faqs: [
      {
        q: '如何判断自己是否湿气重？',
        a: '湿气重的常见表现包括：舌苔厚腻、大便粘腻不成形、身体困重、容易疲劳、皮肤油腻、面部浮肿等。建议通过在线问诊进一步确认。'
      },
      {
        q: '祁菊花茶适合什么人群？',
        a: '祁菊花茶适合长期用眼、肝火偏旺、眼睛干涩、视物模糊的人群。具有清热解毒、明目养肝的日常调理价值。'
      },
      {
        q: '药膳料包如何食用？',
        a: '药膳料包建议与鸡肉、排骨等肉类一起炖煮，大火烧开后转小火炖 1-2 小时，每周食用 2-3 次为宜。'
      },
      {
        q: '冻干山药脆片可以直接吃吗？',
        a: '可以直接食用，也可以泡水、泡牛奶，或加入酸奶、燕麦中食用。口感酥脆，适合作为轻养零食。'
      },
      {
        q: '气血不足如何调理？',
        a: '气血不足建议规律作息，避免熬夜和过度劳累，可适当食用四物汤、八珍汤等补气养血药膳，严重不适请咨询医生。'
      },
      {
        q: '熬夜上火适合喝什么？',
        a: '可选择菊花、金银花、枸杞等清润茶饮，饮食上少辛辣油腻，多补充水分。若反复口腔溃疡或咽痛，应及时问诊。'
      }
    ]
  },
  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 2 });
    }
  },
  switchTab(e) {
    const id = e.currentTarget.dataset.id;
    this.setData({ activeTab: id });
  },
  goBencao() { wx.navigateTo({ url: '/pages/chat/chat' }); },
  goTongue() { wx.navigateTo({ url: '/pages/vision/vision?mode=tongue' }); },
  goFace()   { wx.navigateTo({ url: '/pages/vision/vision?mode=face' }); },
  goExpert(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/expert-chat/expert-chat?id=${id}` });
  }
});
