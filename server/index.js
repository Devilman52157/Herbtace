// ============================================================
// 云上祁州 AI 后端
//   POST /api/chat               —— 文本问答（本草君 / 专家分身）
//   POST /api/vision             —— 望诊（舌诊 / 面诊 / 识药）
//   GET  /api/trace-qr/url-link  —— 生成商品溯源 URL Link（微信 urllink.generate）
//   GET  /healthz                —— 健康检查
//
// 环境变量：
//   AI_API_KEY        AI provider API Key（必填）
//   AI_BASE_URL       默认 https://generativelanguage.googleapis.com/v1beta/openai
//   AI_CHAT_MODEL     默认 gemini-2.5-flash
//   AI_VISION_MODEL   默认 gemini-2.5-flash
//   WX_APPID          微信小程序 AppID（生成溯源 URL Link 必填）
//   WX_SECRET         微信小程序 AppSecret（生成溯源 URL Link 必填）
//   TRACE_PAGE_PATH   默认 pages/trace/trace
//   PORT              默认 8080
//   ALLOW_ORIGIN      CORS 白名单，逗号分隔；为 "*" 允许全部，留空禁用 CORS
// ============================================================
const express = require('express');
const cors = require('cors');
const https = require('https');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { URL } = require('url');

const AI_API_KEY = process.env.AI_API_KEY || '';
const AI_BASE_URL = process.env.AI_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta/openai';
const CHAT_MODEL = process.env.AI_CHAT_MODEL || 'gemini-2.5-flash';
const VISION_MODEL = process.env.AI_VISION_MODEL || 'gemini-2.5-flash';
const PORT = parseInt(process.env.PORT || '8080', 10);
const ALLOW_ORIGIN = process.env.ALLOW_ORIGIN || '*';
const WX_APPID = process.env.WX_APPID || '';
const WX_SECRET = process.env.WX_SECRET || '';
const TRACE_PAGE_PATH = process.env.WXACODE_PAGE_PATH || process.env.TRACE_PAGE_PATH || 'pages/trace/trace';
const WXACODE_PAGE_PATH = TRACE_PAGE_PATH;
const WXACODE_ENV_VERSION = process.env.WXACODE_ENV_VERSION || 'trial';
const WXACODE_CHECK_PATH = String(process.env.WXACODE_CHECK_PATH || 'false').toLowerCase() === 'true';
const API_CLIENT_TOKEN = process.env.API_CLIENT_TOKEN || '';
const SESSION_SECRET = process.env.SESSION_SECRET || WX_SECRET || API_CLIENT_TOKEN || '';
const RATE_LIMIT_WINDOW_MS = Math.max(1000, parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10));
const RATE_LIMIT_MAX = Math.max(1, parseInt(process.env.RATE_LIMIT_MAX || '30', 10));
const PRODUCT_IMAGE_DIR = path.join(__dirname, 'static/products');
const KNOWN_PRODUCT_IDS = loadKnownProductIds();
const FONT_SOURCES = {
  'lxgw-wenkai-lite.ttf': {
    url: 'https://raw.githubusercontent.com/lxgw/LxgwWenKai-Lite/main/fonts/TTF/LXGWWenKaiLite-Regular.ttf',
    type: 'font/ttf'
  },
  'ma-shan-zheng.woff2': {
    url: 'https://fonts.gstatic.com/s/mashanzheng/v10/NaPecZTRCLxvwo41b4gvzkXaRMTsDIRSfr0.woff2',
    type: 'font/woff2'
  },
  'ma-shan-zheng.ttf': {
    url: 'https://raw.githubusercontent.com/google/fonts/main/ofl/mashanzheng/MaShanZheng-Regular.ttf',
    type: 'font/ttf'
  }
};

if (!AI_API_KEY) {
  console.warn('[WARN] AI_API_KEY 未设置 —— 所有 AI 请求都会失败。请先 export AI_API_KEY=...');
}

if (!API_CLIENT_TOKEN) {
  console.warn('[WARN] API_CLIENT_TOKEN 未设置 —— AI 接口仅受限流保护，建议生产环境配置共享 token。');
}

if (!SESSION_SECRET) {
  console.warn('[WARN] SESSION_SECRET 未设置 —— /api/login 无法签发可校验的会话 token。');
}

const AI_SYSTEM_PROMPT = `你是"云上祁州"平台的AI养生助手，名叫"本草君"。你是一位资深中医养生顾问，精通：
- 中医体质辨识（九种体质）
- 中药材功效与配伍禁忌
- 四季养生、食疗方案
- 穴位保健与经络调理

平台在售产品如下，推荐时请严格从此列表选择：

【便捷养生系列】
1. 单味祁菊花茶包（¥9.9/盒）——清肝明目，低温烘焙锁香
2. 即食薏米代餐糕（¥19.9/袋）——健脾利湿，饱腹轻盈
3. 祁菊花枸杞护眼茶包（¥12.9/盒）——屏幕族调方，清肝明目
4. 祁菊金银茉莉三花灭火茶（¥15.9/盒）——清热解毒，熬夜上火首选
5. 熟制破壁祁薏米粉（¥15.9/罐）——即冲即饮，健脾祛湿
6. 祛湿薏米茶包（¥9.9/盒）——祁薏米配赤小豆茯苓芡实
7. 清润沙参茶包（¥12.9/盒）——润肺养阴，清嗓生津
8. 沙参玉竹六物饮（¥19.9/盒）——滋阴润肺，养胃生津

【家庭药膳系列】
9. 罐装祁山药片（¥15.9/罐）——煲汤炖粥，健脾益胃
10. 家用白芷卤料包（¥15.9/袋）——祛风散寒，家常卤味
11. 去皮切段祁山药（¥19.9/袋）——炖汤/鲜蒸
12. 罐装祁山药丁（¥15.9/罐）——煮粥拌饭
13. 白芷去腥调味粉（¥9.9/瓶）——去腥提香

【特色创新系列】
14. 裹糖冻干祁山药（¥15.9/袋）——酥脆健康零食
15. 亲民礼盒·八大祁药（¥99.9/盒）——送礼自用皆宜
16. 祁紫菀超细药用粉（¥9.9/袋）——800目，润肺下气
17. 祁芥穗超细药用粉（¥9.9/袋）——800目，祛风解表
18. 商务礼盒·祁药+名贵滋补（¥259/盒）——商务尊赠

回复要求：
1. 用专业但通俗易懂的语言回答
2. 根据用户症状或需求，优先从以上产品中匹配推荐，注明产品名称和价格
3. 回答控制在200字以内，分条列出要点
4. 遇到严重疾病症状时，明确建议用户就医
5. 语气温和专业
6. 严禁使用任何 Markdown 语法（不要使用 **加粗**、*斜体*、# 标题、\`代码\`、--- 分隔线等符号）。直接输出纯文本。需要列点时用"·"或"1. 2. 3."序号，需要强调时用书名号《》或引号""，不要用星号`;

const VISION_SYSTEM_PROMPT = `你是一位精通中医望诊的资深中医师。
请严格返回以下 JSON 格式（不要任何额外文字、不要 Markdown 代码块）：
{
  "constitution": "主体质类型，从九种体质中选：平和/气虚/阳虚/阴虚/痰湿/湿热/血瘀/气郁/特禀",
  "subtype": "偏颇程度，可填：轻度偏颇/偏颇/显著偏颇",
  "confidence": 置信度数值60-95,
  "summary": "简短辨证概括",
  "scores": [
    {"k":"痰湿","v":数值0-10,"c":"#B5452A"},
    {"k":"气虚","v":数值0-10,"c":"#C4935A"},
    {"k":"阳虚","v":数值0-10,"c":"#D4694E"},
    {"k":"阴虚","v":数值0-10,"c":"#4A7C59"},
    {"k":"血瘀","v":数值0-10,"c":"#6B9E78"},
    {"k":"平和","v":数值0-10,"c":"#8B7A6B"}
  ],
  "traits": ["特征1", "特征2", "特征3", "特征4"],
  "blessing": "一段温暖的中医问诊寄语，2-3句",
  "recommendations": [
    {"name":"产品名","desc":"功效描述","price":数值,"unit":"盒","match":匹配度80-99,"icon":"i-tea"}
  ],
  "followup": "一句后续引导语",
  "quickQs": [{"q":"完整问题","label":"短标题"}],
  "feature_count": 数值30-60
}`;

const HERB_VISION_PROMPT = `你是一位精通中药材辨识的资深中药师。请分析照片并严格返回 JSON：
若识别到药材/植物：{"matched":true,"name":"中文名","latin":"拉丁学名","confidence":数值60-95,"nature":"性味归经","effect":"功效","notes":"识别依据"}
若无法辨识：{"matched":false,"reason":"原因"}`;

const VISION_FALLBACK = {
  constitution: '痰湿', subtype: '偏颇', confidence: 86,
  summary: '主证痰湿 · 兼见气虚',
  scores: [
    { k: '痰湿', v: 8.4, c: '#B5452A' }, { k: '气虚', v: 6.2, c: '#C4935A' },
    { k: '阳虚', v: 4.8, c: '#D4694E' }, { k: '阴虚', v: 3.1, c: '#4A7C59' },
    { k: '血瘀', v: 2.5, c: '#6B9E78' }, { k: '平和', v: 3.6, c: '#8B7A6B' }
  ],
  traits: ['舌体胖大', '舌苔白腻', '边有齿痕', '舌色淡红'],
  blessing: '湿邪缠绵，非一日可除。宜避生冷油腻。',
  recommendations: [{ name: '祛湿薏米茶包', desc: '健脾祛湿', price: 9.9, unit: '盒', match: 96, icon: 'i-tea' }],
  followup: '若愿详述睡眠饮食，本草君可细化方案。',
  quickQs: [{ q: '痰湿忌口什么？', label: '忌口指南' }],
  feature_count: 42,
  _fallback: true
};

function expertPrompt(persona) {
  const E = {
    li: { name: '李明远 教授', title: '北京中医药大学 · 主任医师', speciality: '内科杂病 · 失眠眩晕' },
    wang: { name: '王婉清 主任', title: '广州中医药大学 · 副主任医师', speciality: '妇科调理 · 食疗药膳' },
    chen: { name: '陈国安 博士', title: '成都中医药大学 · 药学博士', speciality: '中药辨识 · 配伍禁忌' }
  };
  const e = E[persona];
  if (!e) return null;
  return `你扮演「${e.name}」。执业背景：${e.title}，专长：${e.speciality}。语气沉稳权威温和。遇到重疾建议就医。不自称AI。每次150-250字。`;
}

function postJson(fullUrl, bodyObj, headers = {}, timeoutMs = 60000) {
  return new Promise((resolve, reject) => {
    const u = new URL(fullUrl);
    const body = JSON.stringify(bodyObj);
    const req = https.request({
      hostname: u.hostname,
      port: u.port || 443,
      path: u.pathname + u.search,
      method: 'POST',
      headers: Object.assign({
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }, headers)
    }, (res) => {
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => {
        const text = Buffer.concat(chunks).toString('utf8');
        try { resolve({ status: res.statusCode, data: JSON.parse(text), raw: text }); }
        catch { resolve({ status: res.statusCode, data: null, raw: text }); }
      });
    });
    req.on('error', reject);
    req.setTimeout(timeoutMs, () => req.destroy(new Error('timeout')));
    req.write(body);
    req.end();
  });
}

function postBuffer(fullUrl, bodyObj, headers = {}, timeoutMs = 60000) {
  return new Promise((resolve, reject) => {
    const u = new URL(fullUrl);
    const body = JSON.stringify(bodyObj);
    const req = https.request({
      hostname: u.hostname,
      port: u.port || 443,
      path: u.pathname + u.search,
      method: 'POST',
      headers: Object.assign({
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }, headers)
    }, (res) => {
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => {
        resolve({ status: res.statusCode, headers: res.headers, body: Buffer.concat(chunks) });
      });
    });
    req.on('error', reject);
    req.setTimeout(timeoutMs, () => req.destroy(new Error('timeout')));
    req.write(body);
    req.end();
  });
}

function getJson(fullUrl, timeoutMs = 30000) {
  return new Promise((resolve, reject) => {
    const u = new URL(fullUrl);
    const req = https.get({
      hostname: u.hostname,
      port: u.port || 443,
      path: u.pathname + u.search,
      headers: { 'User-Agent': 'yunshang-qizhou-server/1.0' }
    }, (res) => {
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => {
        const text = Buffer.concat(chunks).toString('utf8');
        try { resolve({ status: res.statusCode, data: JSON.parse(text), raw: text }); }
        catch { resolve({ status: res.statusCode, data: null, raw: text }); }
      });
    });
    req.on('error', reject);
    req.setTimeout(timeoutMs, () => req.destroy(new Error('timeout')));
  });
}

function base64Url(input) {
  return Buffer.from(input).toString('base64url');
}

function signSession(payload) {
  if (!SESSION_SECRET) throw new Error('SESSION_SECRET not configured');
  const body = base64Url(JSON.stringify(payload));
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(body).digest('base64url');
  return `${body}.${sig}`;
}

function verifySession(token) {
  if (!SESSION_SECRET || !token || !token.includes('.')) return null;
  const [body, sig] = String(token).split('.');
  const expected = crypto.createHmac('sha256', SESSION_SECRET).update(body).digest('base64url');
  if (!tokenMatches(sig, expected)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (!payload.exp || payload.exp < Date.now()) return null;
    return payload;
  } catch (e) {
    return null;
  }
}

// ---------- 微信 access_token / url_link 缓存 ----------
const wxTokenCache = { token: '', expiresAt: 0 };
const urlLinkCache = new Map(); // key = productId, value = { url, expiresAt }
const wxaCodeCache = new Map(); // key = page/env/productId, value = { body, expiresAt }
const URL_LINK_TTL_MS = 25 * 24 * 60 * 60 * 1000; // url_link 永久有效；这里仅做服务端 25 天软缓存
const WXACODE_TTL_MS = 24 * 60 * 60 * 1000;

async function getWxAccessToken() {
  if (!WX_APPID || !WX_SECRET) {
    throw new Error('WX_APPID / WX_SECRET 未配置');
  }
  const now = Date.now();
  if (wxTokenCache.token && wxTokenCache.expiresAt - now > 60 * 1000) {
    return wxTokenCache.token;
  }
  const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${encodeURIComponent(WX_APPID)}&secret=${encodeURIComponent(WX_SECRET)}`;
  const r = await getJson(url);
  if (r.status !== 200 || !r.data || !r.data.access_token) {
    throw new Error(`access_token 获取失败：${r.raw || 'no-body'}`);
  }
  wxTokenCache.token = r.data.access_token;
  wxTokenCache.expiresAt = now + ((r.data.expires_in || 7200) * 1000) - (5 * 60 * 1000);
  return wxTokenCache.token;
}

async function generateTraceUrlLink(productId) {
  const cached = urlLinkCache.get(productId);
  if (cached && cached.expiresAt > Date.now()) return cached.url;

  const token = await getWxAccessToken();
  const r = await postJson(
    `https://api.weixin.qq.com/wxa/generate_urllink?access_token=${encodeURIComponent(token)}`,
    {
      path: TRACE_PAGE_PATH,
      query: `id=${encodeURIComponent(productId)}`,
      is_expire: false,
      expire_type: 0
    }
  );
  if (r.status !== 200 || !r.data) {
    throw new Error(`urllink HTTP ${r.status}：${r.raw}`);
  }
  if (r.data.errcode && r.data.errcode !== 0) {
    throw new Error(`urllink errcode=${r.data.errcode}：${r.data.errmsg}`);
  }
  const link = r.data.url_link;
  if (!link) throw new Error(`urllink 返回缺 url_link：${r.raw}`);
  urlLinkCache.set(productId, { url: link, expiresAt: Date.now() + URL_LINK_TTL_MS });
  return link;
}

async function generateProductWxaCode(productId) {
  const cacheKey = `${WXACODE_PAGE_PATH}|${WXACODE_ENV_VERSION}|${productId}`;
  const cached = wxaCodeCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return cached.body;

  const token = await getWxAccessToken();
  const r = await postBuffer(
    `https://api.weixin.qq.com/wxa/getwxacodeunlimit?access_token=${encodeURIComponent(token)}`,
    {
      scene: productId,
      page: WXACODE_PAGE_PATH,
      check_path: WXACODE_CHECK_PATH,
      env_version: WXACODE_ENV_VERSION,
      width: 430,
      auto_color: false,
      line_color: { r: 181, g: 69, b: 42 },
      is_hyaline: false
    }
  );

  const contentType = String(r.headers['content-type'] || '');
  const raw = r.body.toString('utf8');
  if (r.status !== 200) {
    throw new Error(`wxacode HTTP ${r.status}: ${raw}`);
  }
  if (contentType.includes('application/json') || raw.trim().startsWith('{')) {
    let data = null;
    try { data = JSON.parse(raw); } catch (e) {}
    const detail = data ? `errcode=${data.errcode}, errmsg=${data.errmsg}` : raw;
    throw new Error(`wxacode failed: ${detail}`);
  }

  wxaCodeCache.set(cacheKey, { body: r.body, expiresAt: Date.now() + WXACODE_TTL_MS });
  return r.body;
}

function getBinary(fullUrl, timeoutMs = 60000) {
  return new Promise((resolve, reject) => {
    const u = new URL(fullUrl);
    const req = https.get({
      hostname: u.hostname,
      port: u.port || 443,
      path: u.pathname + u.search,
      headers: { 'User-Agent': 'yunshang-qizhou-font-proxy/1.0' }
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        res.resume();
        return resolve(getBinary(new URL(res.headers.location, fullUrl).toString(), timeoutMs));
      }
      if (res.statusCode !== 200) {
        res.resume();
        return reject(new Error(`font upstream HTTP ${res.statusCode}`));
      }
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    });
    req.on('error', reject);
    req.setTimeout(timeoutMs, () => req.destroy(new Error('font upstream timeout')));
  });
}

const app = express();
app.use(express.json({ limit: '12mb' }));

const rateBuckets = new Map();

// 定期清理过期的限流桶，防止内存泄漏
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of rateBuckets) {
    if (now - bucket.startedAt >= RATE_LIMIT_WINDOW_MS * 2) {
      rateBuckets.delete(key);
    }
  }
}, RATE_LIMIT_WINDOW_MS * 2);

function getClientIp(req) {
  const forwarded = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  return forwarded || req.socket.remoteAddress || 'unknown';
}

function rateLimit(req, res, next) {
  const now = Date.now();
  const key = `${getClientIp(req)}:${req.path}`;
  const bucket = rateBuckets.get(key);
  if (!bucket || now - bucket.startedAt >= RATE_LIMIT_WINDOW_MS) {
    rateBuckets.set(key, { startedAt: now, count: 1 });
    return next();
  }
  bucket.count += 1;
  if (bucket.count > RATE_LIMIT_MAX) {
    const retryAfter = Math.ceil((RATE_LIMIT_WINDOW_MS - (now - bucket.startedAt)) / 1000);
    res.set('Retry-After', String(retryAfter));
    return res.status(429).json({ error: 'rate-limited', message: '请求过于频繁，请稍后再试' });
  }
  return next();
}

function loadKnownProductIds() {
  try {
    return new Set(
      fs.readdirSync(PRODUCT_IMAGE_DIR)
        .filter(name => /\.png$/i.test(name))
        .map(name => path.basename(name, path.extname(name)))
        .filter(id => /^[A-Za-z0-9_-]+$/.test(id))
    );
  } catch (e) {
    console.warn('[WARN] product catalog load failed:', e && e.message);
    return new Set();
  }
}

function validateTraceProductId(raw) {
  const id = String(raw || '').trim();
  if (!id || !/^[A-Za-z0-9_-]+$/.test(id) || id.length > 32) {
    return { status: 400, error: 'invalid-id', message: 'invalid product id' };
  }
  if (!KNOWN_PRODUCT_IDS.has(id)) {
    return { status: 404, error: 'unknown-product', message: 'product id not found' };
  }
  return { id };
}

function tokenMatches(received, expected) {
  if (!received || !expected) return false;
  const a = Buffer.from(String(received));
  const b = Buffer.from(String(expected));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function requireClientToken(req, res, next) {
  const auth = String(req.headers.authorization || '');
  const bearer = auth.toLowerCase().startsWith('bearer ') ? auth.slice(7).trim() : '';
  if (bearer && verifySession(bearer)) return next();

  if (!API_CLIENT_TOKEN) return next();
  const token = req.headers['x-api-key'];
  if (!tokenMatches(token, API_CLIENT_TOKEN)) {
    return res.status(401).json({ error: 'unauthorized', message: '缺少或无效的 API 访问凭证' });
  }
  return next();
}

const protectAiEndpoint = [rateLimit, requireClientToken];

if (ALLOW_ORIGIN) {
  app.use(cors({
    origin: ALLOW_ORIGIN === '*' ? true : ALLOW_ORIGIN.split(',').map(s => s.trim()),
    methods: ['GET', 'POST', 'OPTIONS']
  }));
}

app.get('/healthz', (req, res) => {
  res.json({ ok: true, ts: Date.now(), hasKey: !!AI_API_KEY });
});

app.post('/api/login', rateLimit, async (req, res) => {
  const code = String((req.body && req.body.code) || '').trim();
  if (!code) return res.status(400).json({ error: 'missing-code' });
  if (!WX_APPID || !WX_SECRET) {
    return res.status(503).json({ error: 'wx-credentials-missing', message: '后端未配置 WX_APPID / WX_SECRET' });
  }
  if (!SESSION_SECRET) {
    return res.status(503).json({ error: 'session-secret-missing', message: '后端未配置 SESSION_SECRET' });
  }

  try {
    const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${encodeURIComponent(WX_APPID)}&secret=${encodeURIComponent(WX_SECRET)}&js_code=${encodeURIComponent(code)}&grant_type=authorization_code`;
    const r = await getJson(url);
    if (r.status !== 200 || !r.data || r.data.errcode) {
      return res.status(502).json({ error: 'code2session-failed', detail: r.data || r.raw });
    }
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
    const token = signSession({ openid: r.data.openid, unionid: r.data.unionid || '', exp: expiresAt });
    res.json({ token, expiresAt });
  } catch (e) {
    console.error('[login] exception', e);
    res.status(500).json({ error: 'login-failed', message: String(e && e.message || e) });
  }
});

// 静态产品图：/products/easy1.png 等
app.use('/products', express.static(path.join(__dirname, 'static/products'), {
    setHeaders: (res) => {
      res.set('Cache-Control', 'no-cache');
      res.set('Access-Control-Allow-Origin', '*');
    }
  }));

// VR 全景图：/vr/field-panorama.png 等
app.use('/vr', express.static(path.join(__dirname, 'static/vr'), {
    setHeaders: (res) => {
      res.set('Cache-Control', 'public, max-age=31536000, immutable');
      res.set('Access-Control-Allow-Origin', '*');
    }
  }));

app.get('/fonts/:name', async (req, res) => {
  const font = FONT_SOURCES[req.params.name];
  if (!font) return res.status(404).json({ error: 'font not found' });

  try {
    // 内存缓存：字体文件不会变，只需下载一次
    if (!font._cache) {
      font._cache = await getBinary(font.url);
    }
    res.set({
      'Content-Type': font.type,
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Access-Control-Allow-Origin': '*'
    });
    res.send(font._cache);
  } catch (e) {
    console.error('[font] proxy failed', req.params.name, e);
    res.status(502).json({ error: 'font proxy failed' });
  }
});

// ---------------- /api/chat ----------------
app.post('/api/chat', protectAiEndpoint, async (req, res) => {
  const { messages = [], system_prompt, persona } = req.body || {};
  let sys = system_prompt;
  if (!sys && persona) sys = expertPrompt(persona);
  if (!sys) sys = AI_SYSTEM_PROMPT;

  const body = {
    model: CHAT_MODEL,
    messages: [
      { role: 'system', content: sys },
      ...messages.slice(-20)  // 限制历史长度，防止超出 token 上限
    ],
    temperature: 0.7,
    max_tokens: 4096,
    reasoning_effort: 'low'
  };

  try {
    const r = await postJson(`${AI_BASE_URL}/chat/completions`, body, {
      Authorization: `Bearer ${AI_API_KEY}`
    });
    if (r.status !== 200) {
      console.error('[chat] non-200', r.status, r.raw);
      return res.status(502).json({ reply: '抱歉，服务暂时不可用。', error: `HTTP ${r.status}`, detail: r.raw });
    }
    let reply = r.data?.choices?.[0]?.message?.content || '抱歉，我没能回答。';
    reply = stripMarkdown(reply);
    res.json({ reply });
  } catch (e) {
    console.error('[chat] exception', e);
    res.status(500).json({ reply: '抱歉，服务暂时不可用。', error: String(e && e.message || e) });
  }
});

function stripMarkdown(s) {
  if (!s) return s;
  return s
    .replace(/\*\*\*(.+?)\*\*\*/g, '$1')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '$1')
    .replace(/__(.+?)__/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^\s*[-*+]\s+/gm, '· ')
    .replace(/^\s*---+\s*$/gm, '');
}

// ---------------- /api/vision ----------------
app.post('/api/vision', protectAiEndpoint, async (req, res) => {
  const { image = '', mode = 'tongue' } = req.body || {};
  if (!image) return res.status(400).json({ error: 'missing image' });

  const isHerb = mode === 'herb';
  const sys = isHerb ? HERB_VISION_PROMPT : VISION_SYSTEM_PROMPT;
  const userText = isHerb
    ? '请辨识照片中的药材或植物，严格按JSON格式返回。'
    : (mode === 'face' ? '请对这张面部照片进行辨证，严格按JSON格式返回。'
                       : '请对这张舌象照片进行辨证，严格按JSON格式返回。');

  const imageUrl = image.startsWith('http') || image.startsWith('data:')
    ? image : `data:image/jpeg;base64,${image}`;

  const body = {
    model: VISION_MODEL,
    messages: [
      { role: 'system', content: sys },
      { role: 'user', content: [
        { type: 'text', text: userText },
        { type: 'image_url', image_url: { url: imageUrl } }
      ]}
    ],
    temperature: isHerb ? 0.3 : 0.4,
    max_tokens: isHerb ? 2048 : 4096,
    reasoning_effort: 'low'
  };

  try {
    const r = await postJson(`${AI_BASE_URL}/chat/completions`, body, {
      Authorization: `Bearer ${AI_API_KEY}`
    });
    if (r.status !== 200) {
      console.error('[vision] non-200', r.status, r.raw);
      if (isHerb) return res.json({ matched: false, reason: `HTTP ${r.status}`, _fallback: true });
      return res.json(Object.assign({}, VISION_FALLBACK, { _error: `HTTP ${r.status}` }));
    }
    const raw = r.data?.choices?.[0]?.message?.content || '';
    const m = raw.match(/\{[\s\S]+\}/);
    try {
      return res.json(JSON.parse(m ? m[0] : raw));
    } catch (e) {
      console.error('[vision] json-parse-fail', raw);
      if (isHerb) return res.json({ matched: false, reason: '返回格式异常', _fallback: true });
      return res.json(VISION_FALLBACK);
    }
  } catch (e) {
    console.error('[vision] exception', e);
    if (isHerb) return res.json({ matched: false, reason: '识别服务暂不可用，请稍后重试', _fallback: true });
    return res.json(VISION_FALLBACK);
  }
});

// ---------------- /api/trace-qr/url-link ----------------
// GET /api/trace-qr/url-link?id=easy1
//   返回 { url_link: "https://wxaurl.cn/xxx" }
//   该链接由微信 OpenAPI 直接颁发，任意扫码工具扫描后均会拉起微信并跳转到
//   小程序 /pages/trace/trace?id=easy1 页面。
app.get('/api/trace-qr/url-link', protectAiEndpoint, async (req, res) => {
  const checked = validateTraceProductId(req.query.id);
  if (checked.error) {
    return res.status(checked.status).json({ error: checked.error, message: checked.message });
  }
  const id = checked.id;
  if (!WX_APPID || !WX_SECRET) {
    return res.status(503).json({
      error: 'wx-credentials-missing',
      message: '后端未配置 WX_APPID / WX_SECRET，无法生成 URL Link'
    });
  }
  try {
    const url_link = await generateTraceUrlLink(id);
    res.set('Cache-Control', 'public, max-age=86400');
    res.json({ id, url_link, page: TRACE_PAGE_PATH, query: `id=${id}` });
  } catch (e) {
    console.error('[trace-qr] generate failed', e);
    res.status(502).json({ error: 'generate-failed', message: String(e && e.message || e) });
  }
});

// ---------------- /api/trace-qr/wxacode ----------------
// GET /api/trace-qr/wxacode?id=easy1
//   Returns a PNG mini-program code for pages/trace/trace with scene=easy1.
app.get('/api/trace-qr/wxacode', protectAiEndpoint, async (req, res) => {
  const checked = validateTraceProductId(req.query.id);
  if (checked.error) {
    return res.status(checked.status).json({ error: checked.error, message: checked.message });
  }
  const id = checked.id;
  if (!WX_APPID || !WX_SECRET) {
    return res.status(503).json({
      error: 'wx-credentials-missing',
      message: '后端未配置 WX_APPID / WX_SECRET，无法生成小程序码'
    });
  }
  try {
    const body = await generateProductWxaCode(id);
    res.set({
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=86400'
    });
    res.send(body);
  } catch (e) {
    console.error('[trace-qr] wxacode generate failed', e);
    res.status(502).json({
      error: 'wxacode-generate-failed',
      message: String(e && e.message || e),
      page: WXACODE_PAGE_PATH,
      scene: id,
      env_version: WXACODE_ENV_VERSION
    });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[bencao-ai] listening on :${PORT}  (model=${CHAT_MODEL} / ${VISION_MODEL})`);
});
