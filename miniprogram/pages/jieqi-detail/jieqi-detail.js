const { JIEQI, PRODUCTS, getJieqiStatus, formatJieqiDate } = require('../../utils/data.js');

const JQ_ICON = {
  lichun: 'sprout', yushui: 'sprout', jingzhe: 'sprout',
  chunfen: 'flower', qingming: 'flower', guyu: 'flower',
  lixia: 'flower', xiaoman: 'flower', mangzhong: 'flower',
  xiazhi: 'chime', xiaoshu: 'chime', dashu: 'chime',
  liqiu: 'mountain', chushu: 'mountain', bailu: 'mountain',
  qiufen: 'mountain', hanlu: 'mountain', shuangjiang: 'mountain',
  lidong: 'chime', xiaoxue: 'chime', daxue: 'chime', dongzhi: 'chime',
  xiaohan: 'chime', dahan: 'chime'
};

const JIEQI_TIPS = {
  lichun: ['健脾升阳：即食薏米代餐糕一块暖胃开春', '一冲即饮：破壁薏米粉配温豆浆', '春捂护阳：忌过早减衣'],
  yushui: ['祛湿茶饮：祛湿薏米茶包一袋一杯', '代餐轻补：薏米代餐糕替代早餐', '舒展筋骨：晨起伸展十分钟'],
  jingzhe: ['祛风防敏：出门戴口罩，减少花粉暴露', '祛湿健脾：祛湿薏米茶包下午一杯', '防花粉：外出后及时清洁口鼻'],
  chunfen: ['清肝明目：单味祁菊花茶包一袋一冲', '屏幕族必备：菊花枸杞护眼茶包一日两杯', '舒畅情志：郊游踏青'],
  qingming: ['上火即解：三花灭火茶一袋下火', '清肝明目：单味祁菊花茶包日常轻补', '送礼有心：亲民礼盒送长辈亲友'],
  guyu: ['祛湿备夏：祛湿薏米茶包一日一袋', '护眼轻补：菊花枸杞护眼茶包屏幕族必备', '防过敏：外出后及时清洁口鼻'],
  lixia: ['清心降火：三花灭火茶袋冲即饮', '送礼心意：亲民礼盒馈赠师友', '清淡为主：少辛多酸'],
  xiaoman: ['健脾祛湿：祛湿薏米茶包一日一袋', '即冲代餐：破壁薏米粉配豆浆', '勿贪凉：冷饮伤脾胃'],
  mangzhong: ['代餐饱腹：即食薏米代餐糕一块一餐', '煮粥健脾：罐装祁山药丁一把即下', '勤洗澡：消暑解乏'],
  xiazhi: ['健脾养心：罐装祁山药片煲汤或煮粥', '鲜切免削：去皮切段祁山药鲜蒸即食', '午睡养心：小憩半小时'],
  xiaoshu: ['煮粥清补：罐装祁山药丁煮杂粮粥', '滋阴润肺：沙参玉竹六物饮一壶', '忌烦怒：心火旺伤神'],
  dashu: ['养阴润肺：沙参玉竹六物饮煎服', '健脾补气：罐装祁山药片与莲子同煮', '防中暑：避烈日外出'],
  liqiu: ['清润嗓音：清润沙参茶包一袋一冲', '润燥小食：裹糖冻干祁山药替代甜点', '晨起饮温水润肺'],
  chushu: ['滋阴养胃：沙参玉竹六物饮一日一壶', '解馋不油：裹糖冻干祁山药下午茶首选', '早睡早起：收敛神气'],
  bailu: ['清润润肺：清润沙参茶包早晚一杯', '滋阴润肺：沙参玉竹六物饮一壶', '健鼻：晨起按迎香穴'],
  qiufen: ['清肝明目：单味祁菊花茶包温水现冲', '团圆礼赠：亲民礼盒送中秋佳节', '尊贵馈赠：商务礼盒走访客户'],
  hanlu: ['温养脾胃：即食薏米代餐糕配热粥', '清润防燥：清润沙参茶包温饮', '足部保暖：足寒则全身寒'],
  shuangjiang: ['鲜切温补：去皮切段祁山药炖汤', '煲汤健脾：罐装祁山药片与排骨同煮', '暖胃：宜食温软'],
  lidong: ['温中散寒：家用白芷卤料包卤一锅暖身', '去腥提香：白芷调味粉炖肉煎鱼', '藏养：早睡晚起'],
  xiaoxue: ['暖胃驱寒：家用白芷卤料包卤牛肉', '健脾益胃：罐装祁山药片煮汤', '情志调畅：多晒太阳'],
  daxue: ['卤味进补：家用白芷卤料包卤羊肉暖身', '去腥提香：白芷调味粉炖牛腩', '足浴：睡前泡脚半小时'],
  dongzhi: ['一锅暖年：家用白芷卤料包备年夜卤味', '商务尊赠：商务礼盒馈赠贵客', '亲友礼赠：亲民礼盒送长辈'],
  xiaohan: ['温热饮食：家用白芷卤料包炖暖菜', '鲜切温补：去皮切段祁山药炖羊肉', '早睡晚起：待日而作'],
  dahan: ['收藏暖补：家用白芷卤料包一包一锅', '年礼尊赠：商务礼盒致谢客户', '头部保暖：头为诸阳之会']
};

Page({
  data: { jq: null, recProducts: [] },
  onLoad(q) {
    const jq = JIEQI.find(j => j.id === q.id) || JIEQI[0];
    const status = getJieqiStatus(jq, new Date());
    const recProducts = (jq.products || [])
      .map(pid => PRODUCTS[pid] && ({
        ...PRODUCTS[pid],
        displayTag: PRODUCTS[pid].tags && (PRODUCTS[pid].tags[2] || PRODUCTS[pid].tags[0])
      }))
      .filter(Boolean);

    this.setData({
      jq: {
        ...jq,
        icon: JQ_ICON[jq.id] || 'sprout',
        isCurrent: status === 'current',
        dateRange: formatJieqiDate(jq),
        tips: jq.tips || JIEQI_TIPS[jq.id] || []
      },
      recProducts
    });
  },
  goDetail(e) {
    wx.navigateTo({ url: `/pages/detail/detail?id=${e.currentTarget.dataset.id}` });
  },
  goHome() {
    wx.switchTab({ url: '/pages/index/index' });
  }
});
