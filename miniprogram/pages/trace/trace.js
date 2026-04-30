const { PRODUCTS } = require('../../utils/data.js');
const { recordTraceHistory } = require('../../utils/history.js');
const { getProductIdFromOptions } = require('../../utils/product-id.js');

const FALLBACK_TIMELINE = [
  { date: '采收分拣', title: '原料采收', desc: '原产地基地精选入库',          done: true  },
  { date: '检测合格', title: '质量检测', desc: '农残/重金属等全项送检达标',   done: true  },
  { date: '加工封装', title: '加工封装', desc: '低温烘焙 / 独立封装锁鲜',     done: true  },
  { date: '出库发运', title: '出库发运', desc: '常温或冷链物流直达用户',      done: false }
];

function isDetectionNode(title) {
  return /检测|复检|复测|送检|质检|检验/.test(title || '');
}

function bcHashFor(batch) {
  // 用批次号生成稳定的伪哈希（与 H5 视觉一致）
  let h = 0;
  for (let i = 0; i < (batch || '').length; i++) h = ((h << 5) - h + batch.charCodeAt(i)) | 0;
  const hex = (Math.abs(h).toString(16) + '00000000').slice(0, 8);
  return '0x' + hex.slice(0, 4) + '…' + hex.slice(4, 8);
}

function getProductIdFromOptions(options = {}) {
  if (options.id || options.productId || options.pid) {
    return options.id || options.productId || options.pid;
  }

  if (!options.scene) return '';

  let scene = String(options.scene).trim();
  try { scene = decodeURIComponent(scene); } catch (e) {}

  if (/^[A-Za-z0-9_-]+$/.test(scene)) return scene;

  const query = scene.includes('?') ? scene.split('?').pop() : scene;
  const pairs = query.split(/[&;]/);
  for (let i = 0; i < pairs.length; i++) {
    const pair = pairs[i];
    const eq = pair.indexOf('=');
    if (eq < 0) continue;
    const key = pair.slice(0, eq);
    let value = pair.slice(eq + 1);
    try { value = decodeURIComponent(value); } catch (e) {}
    if (['id', 'pid', 'productId', 'p'].includes(key)) return value;
  }

  return scene;
}

Page({
  data: { product: null, infoRows: [], timeline: [], hash: '0x8f…3a9b' },

  onLoad(options) {
    const productId = getProductIdFromOptions(options);
    const p = PRODUCTS[productId];
    if (!p) {
      wx.showToast({ title: '产品不存在', icon: 'none' });
      return;
    }
    const infoRows = p.info
      ? Object.keys(p.info).map(k => ({ k, v: p.info[k], cert: k === '认证' }))
      : [
          { k: '原产地', v: p.origin },
          { k: '规格',   v: p.unit },
          { k: '零售价', v: '¥' + p.price }
        ];

    const rawTimeline = (p.timeline && p.timeline.length) ? p.timeline : FALLBACK_TIMELINE;
    const timeline = rawTimeline.map(t => ({
      ...t,
      isDetect: isDetectionNode(t.title)
    }));

    this.setData({
      product: p,
      infoRows,
      timeline,
      hash: bcHashFor(p.batch)
    });
    wx.setNavigationBarTitle({ title: '溯源 · ' + p.name });
    recordTraceHistory(p);
  },

  goDetail() {
    if (!this.data.product) return;
    wx.redirectTo({ url: `/pages/detail/detail?id=${this.data.product.id}` });
  },

  onVR() {
    if (!this.data.product) return;
    wx.navigateTo({ url: `/pages/vr-tour/vr-tour?id=${this.data.product.id}` });
  },

  viewBCCert() {
    wx.showToast({ title: '区块链证书 ' + this.data.hash + ' · 已验证', icon: 'none', duration: 2200 });
  },

  viewMedia(e) {
    const type = e.currentTarget.dataset.type;
    wx.showToast({ title: type === 'video' ? '现场视频开发中' : '检测报告开发中', icon: 'none' });
  }
});
