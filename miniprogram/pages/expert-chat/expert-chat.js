const { EXPERTS } = require('../../utils/data.js');
const { aiChat } = require('../../utils/api.js');
const { recordChatHistory } = require('../../utils/history.js');

Page({
  data: {
    expert: null,
    personaId: 'li',
    messages: [],
    input: '',
    sending: false,
    scrollTop: 0
  },
  onLoad(options) {
    const id = options.id || options.persona || 'li';
    const e = EXPERTS.find(x => x.id === id) || EXPERTS[0];
    this.setData({
      expert: e,
      personaId: e.id,
      messages: [{ role: 'assistant', content: e.greet }]
    });
    wx.setNavigationBarTitle({ title: e.name });
  },
  onInput(e) { this.setData({ input: e.detail.value }); },
  async onSend() {
    const text = (this.data.input || '').trim();
    if (!text || this.data.sending) return;
    const userMsg = { role: 'user', content: text };
    const msgs = [...this.data.messages, userMsg];
    this.setData({ messages: msgs, input: '', sending: true, scrollTop: 99999 });

    try {
      const r = await aiChat({
        persona: this.data.personaId,
        messages: msgs.slice(-20).map(m => ({ role: m.role, content: m.content }))
      });
      const reply = r?.reply || '抱歉，我没能回答。';
      const nextMessages = [...this.data.messages, { role: 'assistant', content: reply }];
      this.setData({
        messages: nextMessages,
        sending: false,
        scrollTop: 99999
      });
      recordChatHistory({
        title: this.data.expert ? this.data.expert.name : '专家问诊',
        last: reply,
        persona: this.data.personaId
      });
    } catch (e) {
      console.warn('[expert-chat] error:', e && e.message);
      this.setData({
        messages: [...this.data.messages, { role: 'assistant', content: '抱歉，当前网络不稳定，请稍后重试。' }],
        sending: false
      });
    }
  }
});
