const { aiVision } = require('../../utils/api.js');

const GUIDES = {
  tongue: '将舌头置于框内 · 光线充足',
  face: '面部对准框内 · 避免逆光',
  herb: '对准药材 · 保持清晰'
};

const LABELS = {
  tongue: '望 · 舌 诊',
  face: '望 · 面 诊',
  herb: 'AR 识药材'
};

Page({
  data: {
    mode: 'tongue',
    modeLabel: LABELS.tongue,
    guideText: GUIDES.tongue,
    devicePosition: 'back',
    cameraReady: false,
    camError: false,
    imgPath: '',
    analyzing: false,
    report: null,
    herb: null
  },

  onLoad(options) {
    const m = options.mode || 'tongue';
    this.setData({
      mode: m,
      modeLabel: LABELS[m] || LABELS.tongue,
      guideText: GUIDES[m] || GUIDES.tongue,
      devicePosition: m === 'face' ? 'front' : 'back'
    });
    wx.setNavigationBarTitle({ title: LABELS[m] || '辨证' });

    wx.authorize({
      scope: 'scope.camera',
      success: () => this.setData({ cameraReady: true }),
      fail: () => this.setData({ cameraReady: true, camError: true })
    });
  },

  onCamError() {
    this.setData({ camError: true });
  },

  onSwitchCamera() {
    this.setData({ devicePosition: this.data.devicePosition === 'back' ? 'front' : 'back' });
  },

  onShutter() {
    if (this.data.camError) {
      this.onAlbum();
      return;
    }
    const ctx = wx.createCameraContext();
    ctx.takePhoto({
      quality: 'high',
      success: (res) => this.setData({ imgPath: res.tempImagePath }),
      fail: () => wx.showToast({ title: '拍照失败', icon: 'none' })
    });
  },

  onAlbum() {
    wx.chooseMedia({
      count: 1, mediaType: ['image'], sourceType: ['album'],
      success: (res) => this.setData({ imgPath: res.tempFiles[0].tempFilePath })
    });
  },

  onRetake() {
    this.setData({ imgPath: '', report: null, herb: null });
  },

  async onAnalyze() {
    if (!this.data.imgPath || this.data.analyzing) return;
    this.setData({ analyzing: true });

    try {
      const fs = wx.getFileSystemManager();
      const b64 = await new Promise((resolve, reject) => {
        fs.readFile({
          filePath: this.data.imgPath,
          encoding: 'base64',
          success: r => resolve(r.data),
          fail: reject
        });
      });
      const dataUrl = 'data:image/jpeg;base64,' + b64;
      const result = await aiVision({ image: dataUrl, mode: this.data.mode });

      if (this.data.mode === 'herb') {
        this.setData({ herb: result, analyzing: false });
      } else {
        this.setData({ report: result, analyzing: false });
      }
    } catch (e) {
      wx.showToast({ title: '识别失败：' + (e.errMsg || e.message), icon: 'none', duration: 3000 });
      this.setData({ analyzing: false });
    }
  },

  goChat() { wx.navigateTo({ url: '/pages/chat/chat' }); }
});
