const TRACE_HISTORY_KEY = 'trace_hist';
const CHAT_HISTORY_KEY = 'chat_hist';
const MAX_HISTORY_ITEMS = 50;

function formatTime(date = new Date()) {
  const pad = n => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function safeList(key) {
  const value = wx.getStorageSync(key);
  return Array.isArray(value) ? value : [];
}

function recordTraceHistory(product) {
  if (!product || !product.id) return [];
  const item = {
    id: product.id,
    name: product.name || '',
    batch: product.batch || '',
    t: formatTime()
  };
  const list = safeList(TRACE_HISTORY_KEY).filter(x => x && x.id !== product.id);
  const next = [item, ...list].slice(0, MAX_HISTORY_ITEMS);
  wx.setStorageSync(TRACE_HISTORY_KEY, next);
  return next;
}

function recordChatHistory(options = {}) {
  const title = String(options.title || '问诊记录').trim();
  const last = String(options.last || '').trim();
  if (!last) return [];

  const key = options.persona ? `expert-${options.persona}` : 'bencao';
  const item = {
    key,
    title,
    last: last.length > 42 ? `${last.slice(0, 42)}...` : last,
    persona: options.persona || '',
    t: formatTime()
  };
  const list = safeList(CHAT_HISTORY_KEY).filter(x => x && x.key !== key);
  const next = [item, ...list].slice(0, MAX_HISTORY_ITEMS);
  wx.setStorageSync(CHAT_HISTORY_KEY, next);
  return next;
}

module.exports = {
  TRACE_HISTORY_KEY,
  CHAT_HISTORY_KEY,
  recordTraceHistory,
  recordChatHistory
};
