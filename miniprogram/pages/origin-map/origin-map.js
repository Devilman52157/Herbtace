const { ORIGIN_POINTS, HERBS } = require('../../utils/data.js');

// H5 同款 SVG 地图：朱砂虚线安国轮廓 + 翠绿等高线 + 安国/YAOZHOU 文字
const MAP_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 340">
<defs><radialGradient id="g" cx="50%" cy="40%" r="70%"><stop offset="0%" stop-color="%23FBF1DC"/><stop offset="100%" stop-color="%23E9D9B8"/></radialGradient></defs>
<path d="M40,70 Q80,40 140,50 T250,60 Q290,80 280,140 T260,230 Q240,290 170,300 T70,280 Q30,240 40,180 T40,70 Z" fill="url(%23g)" stroke="%23B5452A" stroke-width="1.5" stroke-dasharray="3 3" opacity=".85"/>
<path d="M60,140 Q100,120 150,130 T240,140" stroke="%236B9E78" stroke-width="1" fill="none" opacity=".6"/>
<path d="M80,200 Q130,180 180,195 T250,210" stroke="%236B9E78" stroke-width="1" fill="none" opacity=".5"/>
<text x="160" y="175" text-anchor="middle" fill="%238B7A6B" font-size="10" letter-spacing="4" font-family="Ma Shan Zheng,serif">安国</text>
<text x="160" y="188" text-anchor="middle" fill="%23C4935A" font-size="7" letter-spacing="2">YAOZHOU</text>
</svg>`;

const HERB_BY_ID = HERBS.reduce((m, h) => (m[h.id] = h, m), {});

const POINTS = ORIGIN_POINTS.map(p => ({
  ...p,
  tag: (HERB_BY_ID[p.id] && HERB_BY_ID[p.id].tag) || '道地'
}));

Page({
  data: {
    points: POINTS,
    mapSrc: 'data:image/svg+xml;utf8,' + MAP_SVG.replace(/\n/g, ''),
    active: null
  },
  openPoint(e) {
    const id = e.currentTarget.dataset.id;
    this.setData({ active: HERB_BY_ID[id] || null });
  },
  close() { this.setData({ active: null }); },
  noop() {}
});
