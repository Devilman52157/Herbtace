Page({
  data: { list: [] },
  onShow() { this.setData({ list: wx.getStorageSync('chat_hist') || [] }); },
  go(e) {
    const persona = e.currentTarget.dataset.p;
    if (persona) wx.navigateTo({ url: `/pages/expert-chat/expert-chat?persona=${persona}` });
    else wx.navigateTo({ url: '/pages/chat/chat' });
  }
});
