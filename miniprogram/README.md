# 云上祁州 · 微信小程序版

本目录是从 `bencao-suoyuan-v2.html` 迁移而来的微信小程序工程，AI 能力走部署在 **Google Cloud Run** 的 Node 服务（见 `server/` 目录），前端通过 `utils/api.js` 调用。

---

## 一、你需要准备的东西

- [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)（最新稳定版）
- 微信小程序 AppID：`wxf545b50ac94ffa95`
- 已部署的 AI 后端服务地址（Cloud Run URL，配置在 `utils/config.js` 的 `API_BASE_URL`）

---

## 二、项目结构

```
miniprogram/
├── app.js / app.json / app.wxss        # 小程序入口与全局配置
├── project.config.json                  # 开发者工具工程配置
├── sitemap.json
├── utils/
│   └── data.js                          # 产品/节气/专家数据（18 款产品全保留）
├── pages/
│   ├── index/        首页（Hero + 扫码 + 分类 + 特色功能 + 节气 + 精选）
│   ├── shop/         商城 Tab（按分类筛选）
│   ├── expert/       问诊 Tab（舌诊/面诊/本草君 + 三位专家）
│   ├── my/           我的 Tab（菜单入口）
│   ├── detail/       产品详情
│   ├── trace/        产品溯源时间线
│   ├── chat/         本草君 AI 聊天
│   ├── expert-chat/  专家角色聊天
│   └── vision/       舌诊 / 面诊 / AR 识药材（复用同一页面，mode 参数区分）
└── ...

# AI 后端（Node + Express）位于项目根目录的 ../server/，部署到 Google Cloud Run。
```

---

## 三、导入到微信开发者工具（第一次跑起来）

1. **打开微信开发者工具** → 右上角"+"新建项目
2. **目录**优先选择 `D:\Desktop\Weixin2\Wexin`（使用根目录 `project.config.json`）；如果只导入本目录，则选择 `D:\Desktop\Weixin2\Wexin\miniprogram`
3. **AppID** 填 `wxf545b50ac94ffa95`
4. **后端服务**选"不使用云服务"→ 确定
5. 确认 [utils/config.js](utils/config.js) 中的 `API_BASE_URL` 指向已部署的 Cloud Run 服务
6. 部署后端服务（详见 [../server/README.md](../server/README.md)）
7. 点**编译**（或按 Ctrl+B），模拟器应显示首页

> 上线时需在小程序后台 → 开发管理 → 服务器域名里配置 Cloud Run 域名为 `request` / `uploadFile` / `downloadFile` 合法域名。

---

## 四、跑通核心链路（必做验证）

### ① 首页能打开
- 看到"云上祁州" Hero、扫码按钮、"逛一逛"四个分类、"本草秘境"六宫格、节气带、今日精选 6 款产品。

### ② AI 对话
- 首页点击 **"本草君 · AI 养生助手"** → 输入"我最近痰湿重怎么调理？" → 发送
- 1-3 秒后应收到一段 200 字左右的中医回答，带产品推荐
- 如果长时间没回，到 Cloud Run 控制台查看后端服务日志

### ③ 舌诊
- 底 Tab "问诊" → 点"舌诊" → "拍照"或"从相册选择" → 点"开始辨证"
- 10-20 秒后看到辨证报告（体质、评分、特征、寄语、推荐产品）
- 若失败返回降级的"痰湿"示例数据（`_fallback: true`）

### ④ 扫码溯源
- 首页点"扫码溯源" → 扫一个二维码，内容包含 `easy1` / `home2` / `spec2` 这类 id
- 可以用开发者工具的"预览"生成二维码自己扫自己（或在电脑上显示测试二维码）

---

## 五、常见坑（强烈建议先看）

### 坑 1：AI 返回"服务暂时不可用"
- 到 Cloud Run 控制台查看 `bencao-ai` 服务日志，找具体错误
- 最常见是 **API Key 无效**或**额度用完**

### 坑 2：真机预览请求失败
- 确认 Cloud Run 域名已配置进小程序后台的 `request` / `uploadFile` / `downloadFile` 合法域名
- `project.config.json` 已开启 `urlCheck: true`；真机失败时优先检查小程序后台合法域名

### 坑 3：图片过大
- 舌诊传图用了 base64 编码，过大会请求失败。
- 拍照时系统默认会压缩，一般没问题。如要更保险，可在 `pages/vision/vision.js` 的 `pickImage` 改用 `wx.compressImage` 再读取。

### 坑 4：API Key 与环境变量
- API Key 配置在 Cloud Run 服务的环境变量里（详见 [../server/README.md](../server/README.md)），不要写在前端代码或仓库中。

---

## 六、与 HTML 版的差异与取舍

| HTML 原版 | 小程序版 |
|---|---|
| SVG 内联 icon | 先用 Emoji 占位（🌼🌱🎁🍵🪙📍），如要精美图标可换为 `/images/*.png` |
| 品牌字体（LXGW WenKai / Ma Shan Zheng） | 字体经 Cloud Run `/fonts/*` 转发；发布前需把 Cloud Run 域名同时配置到 request/downloadFile 合法域名 |
| Pannellum VR 全景 | 小程序 WebGL canvas 全景页，素材经 Cloud Run `/vr/*` 提供 |
| jsQR 扫码 | 改用 `wx.scanCode`（原生、更快） |
| Flask `/api/chat`、`/api/vision` | Cloud Run `/api/chat`、`/api/vision`（前端用 `wx.request`，封装在 `utils/api.js`） |
| `localStorage` | 如需本地存储改用 `wx.setStorageSync` |

**当前已完成的页面**（27 个）：
- 4 Tab：首页 / 商城 / 问诊 / 我的
- 主功能：登录 / 详情 / 溯源 / VR 全景 / 本草君聊天 / 专家聊天 / 辨证（舌/面/药材）
- 本草秘境：图鉴（atlas）/ 产地地图（origin-map）/ 研学（study）/ AR（vision）/ 礼盒 DIY（gift-diy）/ 积分（points）
- 内容与权益：品牌故事 / 节气详情 / 优惠券
- 我的子页：订单 / 购物车 / 收货地址 / 收藏 / 设置 / 溯源记录 / 问诊历史 / 溯源码生成中心

**图标系统**：新增 `components/icon/icon` 组件，使用 data URL 渲染 inline SVG，覆盖原 HTML 50+ 图标。
页面使用：`"usingComponents": { "icon": "/components/icon/icon" }`，然后 `<icon name="tea" size="40rpx" color="#B5452A"/>`。

**原 UI 还原**：
- 六宫格特色功能卡使用原版渐变（feat-atlas / feat-map / feat-study / feat-ar / feat-gift / feat-points）
- 标题采用 `STKaiti / KaiTi` 近似原版毛笔字体
- 壹·贰·叁 序号标记保留

---

## 七、上线前清单

- [ ] Cloud Run 服务的 `AI_API_KEY` 通过环境变量注入，不要写进代码
- [ ] 保持 `project.config.json` 里的 `urlCheck: true`，并通过真机验证合法域名
- [ ] 小程序后台 → 开发管理 → 服务器域名 → 配置 Cloud Run 域名到 `request`/`uploadFile`/`downloadFile`
- [ ] 替换 Emoji 图标为正式 PNG/SVG，放 `/images/`

---

## 八、如何继续加页面

每个页面包含 4 个文件：`.wxml`（结构）、`.wxss`（样式）、`.js`（逻辑）、`.json`（配置）。
添加新页面要做两件事：
1. 建目录 `pages/xxx/` 并放 4 个文件
2. 在 `app.json` 的 `pages` 数组里加 `"pages/xxx/xxx"`

然后就能在其它页面用 `wx.navigateTo({ url: '/pages/xxx/xxx' })` 跳过去。
