const { aiChat } = require('../../utils/api.js');
const { recordChatHistory } = require('../../utils/history.js');

const QUIZ_QS = [
  { q:'您平时的精力与体力状态如何？', opts:['精力充沛，不易疲劳','容易疲倦，动则气短','畏寒怕冷，手脚常凉','午后烦热，夜间盗汗'] },
  { q:'您的消化与饮食状况如何？', opts:['消化良好，食欲正常','腹胀便溏，食欲欠佳','身体沉重，大便黏腻','容易上火，口干口苦'] },
  { q:'您的睡眠质量如何？', opts:['入睡快，睡眠好','失眠多梦，思虑难眠','嗜睡困倦，睡不够','睡眠浅，容易惊醒'] },
  { q:'您的情绪与心理状态如何？', opts:['情绪稳定，心态平和','闷闷不乐，容易叹气','烦躁易怒，情绪波动大','性格内向，不善表达'] },
  { q:'您对寒热的感受与外在体征？', opts:['不冷不热，适应力强','特别怕冷，四肢冰凉','特别怕热，动则汗出','面色偏暗，唇色偏紫'] }
];

const GREETINGS = ['你好','您好','嗨','hi','hello','在吗','在么'];
const LOCAL_FALLBACK = {
  '失眠': '失眠多由肝郁、心血不足、痰热扰心引起。\n\n· 睡前一杯温热的"沙参玉竹六物饮"养阴安神\n· 子时（23点前）入睡，睡前忌屏幕\n· 心脾两虚者可酌加桂圆红枣\n\n⚠️ 长期失眠请及时就医，必要时可向我们的中医专家在线咨询。',
  '枸杞': '枸杞，性平味甘，归肝肾经。\n\n主要功效：滋补肝肾、明目润肺、延缓衰老。\n\n适合体质：阴虚体质尤为适宜。脾虚泄泻、感冒发热者慎用。\n\n推荐用法：每日10-15粒泡茶或干嚼，搭配祁菊花效果更佳——可参考"祁菊花枸杞护眼茶包"。',
  '上火': '熬夜上火多为肝火上炎、心火亢盛。\n\n· "祁菊金银茉莉三花灭火茶"一袋即解\n· 多饮温水，少辛辣油腻\n· 23点前入睡为宜\n\n如反复口腔溃疡、牙龈肿痛，建议就医。',
  '办公': '办公族久视耗肝血、久坐伤脾。\n\n推荐：\n· 上午"祁菊花枸杞护眼茶包"——清肝明目\n· 下午"清润沙参茶包"——润肺养嗓\n· 久坐每小时起身舒展3分钟',
  '艾草': '艾草，性温味苦辛，归肝脾肾经。\n\n主要功效：温经止血、散寒止痛、安神助眠。\n\n常见用法：\n· 艾灸足三里、关元温补阳气\n· 端午挂菖蒲艾草驱邪避秽\n· 艾草泡脚改善宫寒\n\n阴虚火旺者慎用。',
  '春季': '春季阳气升发，宜养肝。\n\n推荐：\n· "单味祁菊花茶包"——清肝明目\n· "祛湿薏米茶包"——春雨潮湿祛湿健脾\n· 清晨饮温开水疏肝理气',
  'default': '感谢您的咨询。我可以为您提供：\n\n· 体质辨识与分析\n· 季节养生建议\n· 药材功效查询\n· 养生茶饮推荐\n· 穴位保健指导\n\n请描述您的健康问题。\n\n⚠️ AI建议仅供参考，如有疾病请及时就医。'
};

function localReply(msg) {
  const m = (msg || '').toLowerCase().trim();
  if (GREETINGS.some(g => m === g || m.startsWith(g))) {
    return '您好！我是本草君——您的 AI 养生助手。\n\n您可以问我：\n· 体质辨识（点击下方"体质评测"）\n· 药材功效，例如"枸杞功效"\n· 节气养生，例如"春季喝什么茶"\n· 症状调理，例如"熬夜上火"、"失眠"\n\n请问哪里不适？';
  }
  for (const k of Object.keys(LOCAL_FALLBACK)) {
    if (k !== 'default' && msg.includes(k)) return LOCAL_FALLBACK[k];
  }
  return LOCAL_FALLBACK.default;
}

Page({
  data: {
    messages: [
      { role: 'assistant', content: '您好，我是本草君——您的AI养生助手。\n\n我熟悉中医养生、药材功效、体质调理等知识。请问有什么可以帮您的？' }
    ],
    input: '',
    sending: false,
    scrollTop: 0,
    quickHidden: false,

    // cam sheet
    camSheetOpen: false,

    // quiz overlay
    quizOpen: false,
    tags: ['A','B','C','D'],
    quizTotal: QUIZ_QS.length,
    quizIdx: 0,
    quizCur: QUIZ_QS[0],
    quizAns: [null, null, null, null, null]
  },

  noop() {},

  onInput(e) { this.setData({ input: e.detail.value }); },

  async onSend() {
    const text = (this.data.input || '').trim();
    if (!text || this.data.sending) return;
    await this.ask(text);
  },

  async ask(text) {
    const userMsg = { role: 'user', content: text };
    const msgs = [...this.data.messages, userMsg];
    this.setData({
      messages: msgs, input: '',
      sending: true, quickHidden: true,
      scrollTop: 99999
    });

    let reply = '';
    try {
      const r = await aiChat({ messages: msgs.slice(-20).map(m => ({ role: m.role, content: m.content })) });
      reply = r?.reply;
      if (r?.error || !reply) throw new Error(r?.error || 'empty reply');
    } catch (e) {
      console.warn('[ai-chat] fallback:', e && e.message);
      wx.showToast({ title: 'AI 暂不可用，使用本地模式', icon: 'none', duration: 2200 });
      reply = localReply(text);
    }
    const nextMessages = [...this.data.messages, { role: 'assistant', content: reply }];
    this.setData({
      messages: nextMessages,
      sending: false,
      scrollTop: 99999
    });
    recordChatHistory({
      title: text.length > 18 ? `${text.slice(0, 18)}...` : text,
      last: reply
    });
  },

  onQuickAsk(e) {
    const q = e.currentTarget.dataset.q;
    this.setData({ input: q });
    this.onSend();
  },

  /* ========== cam sheet ========== */
  openCamSheet()  { this.setData({ camSheetOpen: true }); },
  closeCamSheet() { this.setData({ camSheetOpen: false }); },
  goVision(e) {
    const mode = e.currentTarget.dataset.mode;
    this.setData({ camSheetOpen: false });
    wx.navigateTo({ url: `/pages/vision/vision?mode=${mode}` });
  },

  /* ========== quiz overlay ========== */
  openQuiz() {
    this.setData({
      quizOpen: true,
      quizIdx: 0,
      quizCur: QUIZ_QS[0],
      quizAns: [null, null, null, null, null]
    });
  },
  closeQuiz() { this.setData({ quizOpen: false }); },

  selectOpt(e) {
    const i = e.currentTarget.dataset.i;
    const ans = this.data.quizAns.slice();
    ans[this.data.quizIdx] = i;
    this.setData({ quizAns: ans });
  },

  quizPrev() {
    if (this.data.quizIdx === 0) return;
    const idx = this.data.quizIdx - 1;
    this.setData({ quizIdx: idx, quizCur: QUIZ_QS[idx] });
  },

  quizNext() {
    const { quizIdx, quizAns } = this.data;
    if (quizAns[quizIdx] === null || quizAns[quizIdx] === undefined) {
      wx.showToast({ title: '请先选择一个选项', icon: 'none' });
      return;
    }
    if (quizIdx < QUIZ_QS.length - 1) {
      const idx = quizIdx + 1;
      this.setData({ quizIdx: idx, quizCur: QUIZ_QS[idx] });
    } else {
      this.submitQuiz();
    }
  },

  async submitQuiz() {
    const { tags, quizAns } = this.data;
    const summary = QUIZ_QS.map((q, i) =>
      `${i+1}. ${q.q} → ${tags[quizAns[i]]}. ${q.opts[quizAns[i]]}`
    ).join('\n');
    this.setData({ quizOpen: false });

    const prompt = `用户完成了中医体质评测，回答如下：\n${summary}\n\n请你：\n1. 判断用户最可能的体质类型（九种体质之一）\n2. 给出 3 条简短的个性化养生建议\n3. 从平台在售产品中推荐 1-2 款，注明产品名与一句推荐理由\n\n回答控制在 200 字以内，温和亲切。`;

    // 在历史里只显示用户友好版，不显示完整 prompt
    const userDisplay = `【体质评测】\n${summary}`;
    const msgs = [...this.data.messages, { role: 'user', content: userDisplay }];
    this.setData({
      messages: msgs,
      sending: true, quickHidden: true,
      scrollTop: 99999
    });

    let reply = '';
    try {
      const aiMsgs = msgs.slice(0, -1).concat({ role: 'user', content: prompt });
      const r = await aiChat({ messages: aiMsgs.slice(-20).map(m => ({ role: m.role, content: m.content })) });
      reply = r?.reply;
      if (r?.error || !reply) throw new Error(r?.error || 'empty');
    } catch (e) {
      wx.showToast({ title: 'AI 暂不可用，使用本地模式', icon: 'none' });
      reply = '根据您的体质评测，建议从以下方面调理：\n\n· 起居规律，子时前入睡\n· 饮食清淡，少辛辣油腻\n· 适度运动，舒展筋骨\n\n如需更详细的体质分析，建议咨询我们的中医专家。';
    }
    const nextMessages = [...this.data.messages, { role: 'assistant', content: reply }];
    this.setData({
      messages: nextMessages,
      sending: false,
      scrollTop: 99999
    });
    recordChatHistory({
      title: '体质评测',
      last: reply
    });
  }
});
