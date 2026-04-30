// 图标组件 —— 将 SVG path 编码为 data URL，通过 <image> 渲染
// name 对应原 HTML <symbol id="i-xxx"> 的 id（去掉 "i-" 前缀后在此查表）
const PATHS = {
  home: '<path d="M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1z"/><path d="M9 21V14h6v7"/>',
  shop: '<path d="M3 9h18v12a1 1 0 01-1 1H4a1 1 0 01-1-1V9z"/><path d="M3 9l1.5-5h15L21 9"/><path d="M9 9v3a3 3 0 006 0V9"/>',
  medical: '<path d="M6 2v6a6 6 0 0012 0V2"/><path d="M6 2H4"/><path d="M18 2h2"/><circle cx="18" cy="18" r="3"/><path d="M18 15v-1a2 2 0 00-2-2h-1"/>',
  user: '<circle cx="12" cy="8" r="4.5"/><path d="M4 21v-1a7 7 0 0114 0v1"/>',
  'brush-home': '<path d="M3.6 11.1C6.5 8.6 9.3 6.2 12 3.7c2.8 2.2 5.6 4.7 8.4 7.2" stroke-width="2.15"/><path d="M5.2 10.8c-.2 3.1-.2 6.1.2 9.1 4.4.5 8.7.5 13.1 0 .3-3 .3-6.1.1-9.1" stroke-width="2.05"/><path d="M9.1 19.9c-.2-2.3-.1-4.4.2-6.3 1.8-.3 3.6-.3 5.3 0 .2 2 .3 4.1.1 6.3" stroke-width="1.35" opacity=".7"/><path d="M6.1 12.6c3.4.2 7.6.1 11.6-.2" stroke-width=".95" opacity=".45"/>',
  'brush-shop': '<path d="M3.8 9.1c5.4-.4 10.9-.3 16.5.1-.1 3.8-.3 7.3-.8 10.7-5 .5-10.1.4-15.2-.1-.3-3.4-.5-6.9-.5-10.7z" stroke-width="2.05"/><path d="M4.1 9.2c.4-1.9.9-3.5 1.5-5 4.4-.4 8.7-.4 12.8 0 .7 1.7 1.2 3.3 1.6 5" stroke-width="1.75"/><path d="M8.6 9.2c-.1 1.9 1.2 3 3.3 3 2.1 0 3.4-1.1 3.3-3" stroke-width="1.45" opacity=".7"/><path d="M6 12.9c3.6.3 7.6.3 12-.1" stroke-width=".95" opacity=".45"/>',
  'brush-medical': '<path d="M6 3.1c-.2 1.5-.2 3.2 0 5 0 3.5 2.4 6.1 6 6.1 3.7 0 6.1-2.6 6-6.1.2-1.8.2-3.5 0-5" stroke-width="2.05"/><path d="M4.2 3.2c1.3-.2 2.4-.2 3.6 0M16.2 3.2c1.2-.2 2.4-.2 3.6 0" stroke-width="1.45"/><path d="M12 14.2c0 2.8 1.8 4.8 4.3 4.8" stroke-width="1.55" opacity=".75"/><path d="M18.1 15.7c1.7.1 2.9 1.3 2.8 2.9-.1 1.7-1.4 2.8-3.1 2.7-1.6-.1-2.7-1.3-2.6-3 .2-1.6 1.3-2.5 2.9-2.6z" stroke-width="1.75"/><path d="M8.8 8.8c1.8.2 3.9.2 6.2 0" stroke-width=".95" opacity=".45"/>',
  'brush-user': '<path d="M12.2 3.5c2.7.1 4.5 1.9 4.4 4.5-.1 2.8-2.1 4.7-4.7 4.6-2.7-.1-4.5-2.1-4.4-4.7.1-2.7 2-4.4 4.7-4.4z" stroke-width="2.05"/><path d="M4.3 20.6c.4-4.3 3.5-6.8 7.8-6.8 4.2 0 7.4 2.6 7.7 6.8" stroke-width="2.15"/><path d="M6.9 18.1c3.2.6 7.1.6 10.5 0" stroke-width=".95" opacity=".45"/>',
  scan: '<path d="M4 8V4h4M20 8V4h-4M4 16v4h4M20 16v4h-4"/><path d="M4 12h16"/>',
  tea: '<path d="M5 8h12v6a5 5 0 01-10 0z"/><path d="M17 10h2a2 2 0 010 4h-2"/><path d="M8 4c0 1 1 1 1 2s-1 1-1 2M12 4c0 1 1 1 1 2s-1 1-1 2"/>',
  flower: '<circle cx="12" cy="12" r="3"/><path d="M12 2a4 4 0 00-1 7.9"/><path d="M12 2a4 4 0 011 7.9"/><path d="M22 12a4 4 0 00-7.9-1"/><path d="M22 12a4 4 0 01-7.9 1"/><path d="M12 22a4 4 0 001-7.9"/><path d="M12 22a4 4 0 01-1-7.9"/><path d="M2 12a4 4 0 007.9 1"/><path d="M2 12a4 4 0 017.9-1"/>',
  sprout: '<path d="M12 22V12"/><path d="M12 12C12 8 8 4 4 4c0 4 4 8 8 8z"/><path d="M12 15c0-4 4-8 8-8-4 0-8 4-8 8z"/>',
  chime: '<path d="M6 2h12"/><path d="M12 2v4"/><path d="M8 6a4 4 0 108 0"/><path d="M8 10v6"/><path d="M12 10v8"/><path d="M16 10v6"/><circle cx="8" cy="17" r="1"/><circle cx="16" cy="17" r="1"/><path d="M12 19l-1 2h2z"/>',
  mountain: '<path d="M3 20L8 10l4 5 4-8 5 13H3z"/><circle cx="17" cy="5" r="2"/>',
  gift: '<path d="M4 10h16v10H4z"/><path d="M12 10v10M4 10V8h16v2M8 8c0-2 2-3 4-1 2-2 4-1 4 1"/>',
  giftbox: '<rect x="3" y="8" width="18" height="13" rx="1"/><path d="M3 12h18M12 8v13"/><path d="M12 8s-3-5-5-5a2 2 0 000 4c2 0 5 1 5 1zM12 8s3-5 5-5a2 2 0 010 4c-2 0-5 1-5 1z"/>',
  map: '<path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2V6z"/><line x1="9" y1="4" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="20"/>',
  route: '<circle cx="6" cy="5" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="M6 7.5v3a4 4 0 004 4h4a4 4 0 014 4v2"/>',
  atlas: '<path d="M4 4v16a2 2 0 002 2h14V4H6a2 2 0 00-2 2z"/><path d="M6 2v16a2 2 0 002 2"/><path d="M10 8h6M10 12h4"/>',
  ar: '<path d="M3 7V5a2 2 0 012-2h2M21 7V5a2 2 0 00-2-2h-2M3 17v2a2 2 0 002 2h2M21 17v2a2 2 0 01-2 2h-2"/><path d="M12 7l5 3v4l-5 3-5-3v-4l5-3z"/><path d="M12 7v3M12 13v4M7 10l5 3 5-3"/>',
  coin: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><path d="M12 7v10M9 10h5a1.5 1.5 0 010 3H9h5a1.5 1.5 0 010 3H9"/>',
  back: '<path d="M15 6l-6 6 6 6"/>',
  chevron: '<path d="M9 6l6 6-6 6"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  check: '<path d="M5 12l5 5L20 7"/>',
  checkbox: '<rect x="3" y="3" width="18" height="18" rx="4"/><path d="M9 12l2 2 4-4"/>',
  shield: '<path d="M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6z"/>',
  chain: '<path d="M10 14a4 4 0 015-5l3-3a4 4 0 11-5 5M14 10a4 4 0 01-5 5l-3 3a4 4 0 11-5-5"/>',
  search: '<circle cx="11" cy="11" r="6"/><path d="M16 16l5 5"/>',
  chat: '<path d="M4 5h16v11H9l-5 4z"/>',
  message: '<path d="M4 5h16v11H9l-5 4z"/><path d="M8 9h8M8 12h5"/>',
  camera: '<path d="M4 8h4l2-2h4l2 2h4v10H4z"/><circle cx="12" cy="13" r="3"/>',
  star: '<path d="M12 3l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2 2M16.4 16.4l2 2M5.6 18.4l2-2M16.4 7.6l2-2"/>',
  cart: '<path d="M4 4h2l2 13h12l2-8H6"/><circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/>',
  box: '<path d="M4 7l8-4 8 4v10l-8 4-8-4z"/><path d="M4 7l8 4 8-4M12 11v10"/>',
  pin: '<path d="M12 3a7 7 0 017 7c0 5-7 11-7 11S5 15 5 10a7 7 0 017-7z"/><circle cx="12" cy="10" r="2.5"/>',
  lab: '<path d="M9 3h6M10 3v6L5 20h14L14 9V3"/>',
  factory: '<path d="M3 20V10l6 3V10l6 3V10l6 3v7z"/>',
  truck: '<path d="M3 7h11v9H3zM14 10h4l3 4v2h-7z"/><circle cx="7" cy="18" r="1.5"/><circle cx="17" cy="18" r="1.5"/>',
  play: '<path d="M8 5l11 7-11 7z"/>',
  doc: '<path d="M6 3h9l4 4v14H6z"/><path d="M15 3v4h4M9 13h6M9 17h6"/>',
  ai: '<path d="M7 4h10v10H7z"/><circle cx="10" cy="9" r="1"/><circle cx="14" cy="9" r="1"/><path d="M10 18v3M14 18v3"/>',
  doctor: '<circle cx="12" cy="7" r="3"/><path d="M5 21c0-4 3-7 7-7s7 3 7 7"/><path d="M12 14v4M10 16h4"/>',
  clipboard: '<path d="M8 5h8v2H8zM6 5h2v14h8V5h2v16H6z"/>',
  bell: '<path d="M6 17V11a6 6 0 0112 0v6l2 2H4z"/><circle cx="12" cy="21" r="1.5"/>',
  grid: '<path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z"/>',
  'brush-grid': '<path d="M4.5 4.6c1.5-.4 3.4-.5 5.5-.2-.1 2-.1 3.7-.4 5.3-1.7.2-3.4.2-5.2-.1.1-1.8.1-3.4.1-5z" stroke-width="2.25"/><path d="M14.3 4.2c1.8-.1 3.6 0 5.4.4.1 1.7.1 3.3-.2 5-1.7.1-3.3.1-5.1-.2-.1-1.8-.1-3.5-.1-5.2z" stroke-width="2.1"/><path d="M4.3 14.1c1.8-.2 3.6-.1 5.4.2-.1 1.8-.2 3.6-.5 5.4-1.6.2-3.3.1-4.9-.3-.1-1.8-.1-3.5 0-5.3z" stroke-width="2.15"/><path d="M14.2 14.3c1.8-.3 3.5-.2 5.3.2.1 1.8 0 3.5-.3 5.1-1.6.2-3.2.1-4.9-.2-.2-1.6-.2-3.3-.1-5.1z" stroke-width="2.2"/><path d="M5.3 10.9c3.8.4 8.5.3 13.2-.2M10.9 5c.2 4.2 0 8.6-.5 13.4" stroke-width=".95" opacity=".45"/>',
  'brush-tea': '<path d="M5.4 8.7c3.7.4 7.7.3 11.5-.2-.1 4.7-1.7 7.2-5.5 7.4-3.6.2-5.8-2.4-6-7.2z" stroke-width="2.25"/><path d="M16.8 10.6c1.9-.4 3.2.3 3.1 1.8 0 1.5-1.3 2.4-3.2 2.4" stroke-width="2.05"/><path d="M7.2 17.4c2.7.8 6.9.7 9.8-.1" stroke-width="1.1" opacity=".5"/><path d="M8.4 3.9c-.8 1.4.9 1.6.1 3M12 3.2c-1 1.6 1 1.8.1 3.5M15.3 3.9c-.8 1.4.8 1.5.2 2.8" stroke-width="1.35" opacity=".72"/>',
  'brush-sprout': '<path d="M12 21.2c-.2-3.1-.1-6.5.2-10.1" stroke-width="2.25"/><path d="M11.9 11.3C9 7.2 6.3 5.9 3.9 6.7c.6 3.4 3.7 5.9 8 4.6z" stroke-width="2.1"/><path d="M12.1 14.2c3-3.9 5.8-5.2 8.2-4.3-.7 3.3-3.7 5.7-8.2 4.3z" stroke-width="2.05"/><path d="M6.1 7.9c1.8.8 3.4 2 4.9 3.4M18 10.9c-1.7.8-3.2 1.9-4.8 3.1" stroke-width=".95" opacity=".5"/>',
  'brush-gift': '<path d="M4.6 9.1c4.7-.5 9.7-.5 14.7.1-.1 3.5-.4 6.9-.9 10-4.1.4-8.3.3-12.6-.2-.5-3.1-.9-6.4-1.2-9.9z" stroke-width="2.2"/><path d="M3.8 8.7c5.4-.8 10.7-.8 16 .1M12 8.7c.2 3.6.1 7.1-.3 10.2M5 12.2c4.6.4 9.4.3 14.1-.2" stroke-width="1.35" opacity=".65"/><path d="M12 8.5C11.1 5.7 9.4 4.4 7.8 5c-1.2.5-.9 2.1.5 2.6 1.1.4 2.3.5 3.7.9zM12.1 8.5c.9-2.8 2.6-4.1 4.2-3.5 1.2.5.9 2.1-.5 2.6-1.1.4-2.3.5-3.7.9z" stroke-width="1.65"/>',
  'brush-atlas': '<path d="M5.7 4.6c3.4-.7 7.6-.6 12.1.3v14.7c-4.2-1.1-8.1-1.1-11.6.1-.4-4.8-.5-9.8-.5-15.1z" stroke-width="2.15"/><path d="M6.4 4.5c-1.1.7-1.8 1.5-1.9 2.5v12.6c.2 1.2 1.2 1.6 2.8 1.1" stroke-width="1.5"/><path d="M9.5 8.8c1.8-.3 3.6-.2 5.4.2M9.4 12.1c1.6-.3 3.2-.2 4.7.1M9.5 15.3c1.9-.4 3.7-.3 5.6.2" stroke-width="1.15" opacity=".6"/>',
  'brush-map': '<path d="M3.8 6.2c1.7-.8 3.4-1.3 5.3-1.7 2 .9 4 1.5 6 1.8 1.8-.8 3.6-1.4 5.5-1.8.2 4.7.1 9.1-.4 13.5-1.8.4-3.5 1-5.3 1.8-2-.6-3.9-1.2-5.8-1.8-1.8.6-3.5 1.2-5.1 1.8-.2-4.6-.3-9.1-.2-13.6z" stroke-width="2.05"/><path d="M9.1 4.8c.2 4.3.2 8.6 0 12.9M15.1 6.5c.1 4.1 0 8.4-.2 12.8" stroke-width="1.25" opacity=".62"/><path d="M5.4 8.4c1.1-.5 2.2-.9 3.4-1.2M16 8.4c1-.4 2-.8 3.1-1" stroke-width=".95" opacity=".48"/>',
  'brush-route': '<path d="M6.1 4.4c1.5-.2 2.7.8 2.7 2.2-.1 1.6-1.4 2.7-3 2.5-1.4-.2-2.3-1.4-2.1-2.9.2-1.1 1.1-1.7 2.4-1.8z" stroke-width="2.05"/><path d="M18.2 16.4c1.5-.2 2.7.8 2.7 2.2-.1 1.6-1.4 2.7-3 2.5-1.4-.2-2.3-1.4-2.1-2.9.2-1.1 1.1-1.7 2.4-1.8z" stroke-width="2.05"/><path d="M6.2 9.4c-.3 2.6 1.1 4.1 4.3 4.4l3.5.2c2.8.2 4 1.2 3.8 3.2" stroke-width="2.15"/><path d="M9.5 13.9c1.5.1 3.1.1 4.9 0" stroke-width=".95" opacity=".5"/>',
  'brush-ar': '<path d="M3.8 7.2c-.1-1.5.3-2.7 1.1-3.4 1-.4 2.1-.5 3.4-.3M20.2 7.2c.1-1.5-.3-2.7-1.1-3.4-1-.4-2.1-.5-3.4-.3M3.8 16.8c-.1 1.5.3 2.7 1.1 3.4 1 .4 2.1.5 3.4.3M20.2 16.8c.1 1.5-.3 2.7-1.1 3.4-1 .4-2.1.5-3.4.3" stroke-width="2.05"/><path d="M12.1 6.8c2.1.9 3.8 1.8 5 3v4.5c-1.6 1.1-3.4 2.1-5.2 3-2-.9-3.7-1.9-5-3v-4.6c1.5-1.1 3.2-2.1 5.2-2.9z" stroke-width="1.9"/><path d="M7 9.9c1.8 1.1 3.4 2 5 2.6 1.6-.7 3.3-1.5 5-2.7M12 12.7c.1 1.6.1 3.1 0 4.5M12 7v3.1" stroke-width="1.05" opacity=".58"/>',
  'brush-giftbox': '<path d="M4.3 8.5c5.1-.6 10.3-.5 15.4.1-.1 3.6-.4 7.2-.9 10.6-4.5.5-9 .4-13.5-.2-.4-3.5-.8-7-.9-10.5z" stroke-width="2.12"/><path d="M3.6 8.5c5.7-.8 11-.8 16.8.1M12 8.6c.1 3.7 0 7.3-.2 10.8M4.8 12.2c4.8.4 9.6.3 14.4-.1" stroke-width="1.28" opacity=".65"/><path d="M12 8.6c-.8-2.6-2.6-4-4.3-3.5-1.4.5-1.1 2.3.5 2.9 1.1.4 2.4.5 3.8.6zM12.1 8.6c.9-2.6 2.7-4 4.4-3.5 1.4.5 1.1 2.3-.5 2.9-1.2.4-2.5.5-3.9.6z" stroke-width="1.55"/>',
  'brush-coin': '<path d="M12.2 3.4c4.9.2 8.1 3.7 8.2 8.4.1 5-3.5 8.7-8.3 8.8-4.9.1-8.5-3.6-8.5-8.4 0-4.9 3.6-8.8 8.6-8.8z" stroke-width="2.08"/><path d="M12.2 7.3c2.8.1 4.7 2.1 4.7 4.7.1 2.9-2 5-4.8 5.1-2.8 0-4.9-2.1-4.9-4.8s2.1-5 5-5z" stroke-width="1.45" opacity=".68"/><path d="M12 7.4c.2 3 .1 6.1-.2 9.3M9.2 10.2c1.5-.2 3.2-.2 5 .1 1.1.2 1.1 2-.1 2.1-1.4.1-2.9.1-4.7-.1M9.3 14.4c1.8.2 3.5.2 5.2 0" stroke-width="1.12" opacity=".72"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2"/>',
  cert: '<circle cx="12" cy="9" r="5"/><path d="M8 13l-2 7 6-3 6 3-2-7"/>',
  calendar: '<path d="M4 6h16v14H4z"/><path d="M4 10h16M8 3v4M16 3v4"/>',
  alert: '<circle cx="12" cy="12" r="9"/><path d="M12 7v6M12 17v1"/>',
  zap: '<path d="M13 2L4 14h7l-1 8 10-13h-7z"/>',
  new: '<rect x="4" y="6" width="16" height="12" rx="2"/><path d="M7 14V10l3 4v-4M12 10h4M12 12h3M12 14h4"/>',
  flame: '<path d="M12 22a7 7 0 007-7c0-4-3-6-4-9-1 3-3 4-4 6-1-2-1-4-1-6-3 3-5 6-5 9a7 7 0 007 7z"/>',
  ticket: '<path d="M4 8a2 2 0 012-2h12a2 2 0 012 2 3 3 0 000 6 2 2 0 01-2 2H6a2 2 0 01-2-2 3 3 0 000-6z"/><path d="M9 15l6-6M9 9h.01M15 15h.01"/>',
  camswitch: '<path d="M4 8h4l2-2h4l2 2h4v10H4z"/><circle cx="12" cy="13" r="3"/>',
  temp: '<path d="M10 4h4v9a4 4 0 11-4 0z"/>',
  humidity: '<path d="M12 4c4 6 6 9 6 12a6 6 0 11-12 0c0-3 2-6 6-12z"/>',
  iot: '<circle cx="12" cy="12" r="2"/><path d="M8 8a5 5 0 018 0M6 6a8 8 0 0112 0"/>'
};

const BRUSH_ALIASES = {
  home: 'brush-home',
  shop: 'brush-shop',
  medical: 'brush-medical',
  user: 'brush-user',
  grid: 'brush-grid',
  tea: 'brush-tea',
  sprout: 'brush-sprout',
  gift: 'brush-gift',
  atlas: 'brush-atlas',
  map: 'brush-map',
  route: 'brush-route',
  ar: 'brush-ar',
  giftbox: 'brush-giftbox',
  coin: 'brush-coin'
};

function toDataUrl(name, color) {
  const key = (name || '').replace(/^i-/, '');
  const brushKey = key.startsWith('brush-') ? key : (BRUSH_ALIASES[key] || key);
  const body = PATHS[brushKey] || PATHS[key] || PATHS['brush-sprout'] || PATHS.sprout;
  const isBrushPath = brushKey.startsWith('brush-');
  const inkLayer = `<g opacity=".18" transform="translate(.18 .14)" stroke-width="${isBrushPath ? '2.7' : '2.9'}">${body}</g>`;
  const mainLayer = `<g stroke-width="${isBrushPath ? '1.9' : '2.08'}">${body}</g>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-linecap="round" stroke-linejoin="round">${inkLayer}${mainLayer}</svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

Component({
  properties: {
    name:  { type: String, value: 'sprout' },
    size:  { type: String, value: '40rpx' },
    color: { type: String, value: '#3B2F28' }
  },
  data: { src: '' },
  observers: {
    'name,color': function(name, color) {
      this.setData({ src: toDataUrl(name, color) });
    }
  },
  lifetimes: {
    attached() {
      this.setData({ src: toDataUrl(this.data.name, this.data.color) });
    }
  }
});
