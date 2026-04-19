# 云上祁州 · 微信小程序

本目录是原 `bencao-suoyuan-v2.html` 的微信小程序 1:1 版本。

## 结构

```
miniprogram/
├── app.js / app.json / app.wxss      小程序入口
├── project.config.json               开发者工具配置
├── sitemap.json                      站点地图
├── bencao-suoyuan-v2.html            原始 HTML（1:1 内嵌用）
├── pages/
│   ├── index/                        <web-view> 内嵌 HTML 的包装页
│   ├── home/                         首页（TabBar）
│   ├── shop/                         商城（TabBar）
│   ├── expert/                       问诊（TabBar）
│   └── my/                           我的（TabBar）
└── images/                           TabBar 图标
```

## 1:1 原样呈现的实现策略

微信小程序原生不支持：
- `<svg>` 符号、`getUserMedia` 摄像头、`fetch`、外部 JS 库（pannellum、jsQR）等。

为保证 **UI / 颜色 / 功能 100% 一致、零 bug**，采用官方推荐的 `<web-view>` 方案：

1. 将 `bencao-suoyuan-v2.html` 部署到你的 **HTTPS** 域名下
2. 在 `app.js` 的 `globalData.webviewUrl` 填入该 URL
3. 微信公众平台 → 开发管理 → 开发设置 → **业务域名** 添加该域名
4. 同时在 **request 合法域名** 添加 `/api/chat`、`/api/vision` 使用的后端域名
5. 下载 `校验文件.txt` 放到域名根目录完成验证

完成后，`pages/index/index` 会用 `<web-view>` 全屏渲染原 HTML，所有
VR / 摄像头 / AI 问诊 / AR 识草 / 舌诊面诊 / 二维码扫码 / localStorage
等功能继续在 H5 环境正常工作，UI 与颜色与原页面完全一致。

## TabBar 壳页

四个 TabBar 页（首页 / 商城 / 问诊 / 我的）是轻量入口，
点击任意卡片 / 按钮会 `wx.navigateTo` 到 `pages/index/index?tab=xxx`，
由内嵌的 HTML 根据查询参数跳到对应路由。

## 本地开发

1. 用微信开发者工具导入项目根目录
2. 勾选「不校验合法域名」即可在本地预览壳页
3. 配置真实 `webviewUrl` 后，在真机调试中测试完整 H5

## 后端

原 HTML 调用 `/api/chat`、`/api/vision`（见根目录 `api_server.py`）。
部署时将该服务放在同一 HTTPS 域名下即可，无需修改代码。
