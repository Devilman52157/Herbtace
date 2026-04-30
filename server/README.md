# 云上祁州 AI 后端

独立的 Node.js HTTP 服务，提供两个接口，行为与原微信云函数 `ai-chat` / `ai-vision` 完全一致：

| 路径 | 用途 |
|------|------|
| `POST /api/chat` | 文本问答（本草君 / 三位专家分身） |
| `POST /api/vision` | 望诊（舌诊 / 面诊 / 中药识别） |
| `GET  /api/trace-qr/url-link?id=xxx` | 生成商品溯源 URL Link（任意扫码工具直跳小程序对应商品页） |
| `GET  /healthz` | 健康检查 |

底层默认调用 Google Generative Language 的 OpenAI-compatible 接口，模型为 `gemini-2.5-flash`。如果要切换到其它 OpenAI-compatible 供应商，请同时设置 `AI_BASE_URL`、`AI_CHAT_MODEL` 和 `AI_VISION_MODEL`。

---

## 一、本地跑通（验证密钥可用）

```bash
cd server
cp .env.example .env          # 把里面的 AI_API_KEY 换成你自己的
npm install
node --env-file=.env index.js
```

新开一个终端：

```bash
curl -s http://localhost:8080/healthz
# {"ok":true,"ts":...,"hasKey":true}

curl -s http://localhost:8080/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"你好"}]}'
# 应当返回本草君的开场白
```

返回正常即说明密钥和模型可用。

---

## 二、部署到 GCP

下面给两条最常见的路径，二选一。

### 选项 A · Cloud Run（推荐，最省事，自动 HTTPS）

```bash
# 1) 切到项目并启用所需服务
gcloud config set project YOUR_PROJECT_ID
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com

# 2) 在 server/ 目录下，一键构建 + 部署
cd server
gcloud run deploy bencao-ai \
  --source . \
  --region asia-east1 \
  --allow-unauthenticated \
  --set-env-vars="AI_API_KEY=你的KEY,AI_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai,AI_CHAT_MODEL=gemini-2.5-flash,AI_VISION_MODEL=gemini-2.5-flash,ALLOW_ORIGIN=*"
```

部署完成会输出一条形如 `https://bencao-ai-xxxxx-de.a.run.app` 的地址，HTTPS 自动签发。

> Cloud Run 免费额度：每月 200 万次请求 + 360k vCPU-秒，本项目体量基本免费。

### 选项 B · Compute Engine VM（你已有云主机）

```bash
# 1) SSH 上去，装 Node 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs nginx

# 2) 把整个 server/ 目录上传，例如：
#    scp -r server/ user@VM_IP:/home/user/bencao-ai
cd /home/user/bencao-ai
npm install --omit=dev

# 3) 用 systemd 守护进程（建议）
sudo tee /etc/systemd/system/bencao-ai.service > /dev/null <<'UNIT'
[Unit]
Description=Bencao AI server
After=network.target

[Service]
Environment=PORT=8080
Environment=AI_API_KEY=你的KEY
Environment=AI_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai
Environment=AI_CHAT_MODEL=gemini-2.5-flash
Environment=AI_VISION_MODEL=gemini-2.5-flash
Environment=ALLOW_ORIGIN=*
WorkingDirectory=/home/user/bencao-ai
ExecStart=/usr/bin/node index.js
Restart=always
User=user

[Install]
WantedBy=multi-user.target
UNIT
sudo systemctl daemon-reload
sudo systemctl enable --now bencao-ai

# 4) Nginx 反代 + Let's Encrypt 拿 HTTPS（小程序强制 HTTPS）
sudo tee /etc/nginx/sites-available/bencao-ai > /dev/null <<'NGX'
server {
  server_name api.your-domain.com;
  client_max_body_size 12m;
  location / {
    proxy_pass http://127.0.0.1:8080;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_read_timeout 90s;
  }
}
NGX
sudo ln -sf /etc/nginx/sites-available/bencao-ai /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# 5) 拿证书
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d api.your-domain.com
```

完成后 `https://api.your-domain.com/healthz` 应返回 `{"ok":true,...}`。

GCP 防火墙记得开放 80 / 443：
```bash
gcloud compute firewall-rules create allow-http-https \
  --allow tcp:80,tcp:443 --source-ranges=0.0.0.0/0
```

---

## 三、把小程序切到这个服务

1. **微信公众平台** → 你的小程序 → 开发管理 → **服务器域名** → "request 合法域名" 加上你的 HTTPS 地址（例如 `https://bencao-ai-xxxxx-de.a.run.app` 或 `https://api.your-domain.com`）。开发期可在开发者工具里勾选"不校验合法域名"先调通。

2. 修改 `miniprogram/utils/config.js` 里的 `API_BASE_URL` 为你的服务地址（详见客户端改造说明）。

3. 重新编译，发送消息验证，控制台应当看到 `wx.request` 200 而不是云函数错误。

---

## 三bis、溯源码（URL Link）配置

`/api/trace-qr/url-link` 调用微信开放接口 `urllink.generate`，把 `pages/trace/trace?id={productId}` 包装成 `https://wxaurl.cn/xxx` 永久短链。任意扫码工具扫到这个短链都会拉起微信并跳转到对应商品溯源页。

需在服务端环境变量里加：

```bash
WX_APPID=wx你的小程序AppID
WX_SECRET=你的小程序AppSecret
TRACE_PAGE_PATH=pages/trace/trace   # 可选，默认就是这个
```

> AppSecret 在「微信公众平台 → 开发管理 → 开发设置」里查看/重置。
> `urllink.generate` 默认每个小程序日额 100,000 次；服务端已对 productId 做内存缓存，正常使用不会触顶。
> 上线前还要把当前服务端的出口 IP 加到「开发管理 → IP 白名单」（仅生产环境强校验）。

Cloud Run 部署时一起塞进 `--set-env-vars`：

```bash
gcloud run deploy bencao-ai --source . --region asia-east1 --allow-unauthenticated \
  --set-env-vars="AI_API_KEY=...,AI_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai,AI_CHAT_MODEL=gemini-2.5-flash,AI_VISION_MODEL=gemini-2.5-flash,WX_APPID=wxxxxxxx,WX_SECRET=xxxxxxxxxxxx,ALLOW_ORIGIN=*"
```

---

## 四、安全建议

- API Key 只放服务端环境变量，**不要写到小程序代码里**
- 生产环境把 `ALLOW_ORIGIN` 收紧到具体域名（小程序自身不读 CORS，但浏览器侧调试会用到）
- Cloud Run 可以加 `--max-instances=10` 防爆量；VM 路线建议加 nginx 限速

---

## 五、密钥管理

`.env.example` 只保留占位符。正式上线时请在 Cloud Run、VM 环境变量或密钥管理服务中配置真实 `AI_API_KEY`，不要把密钥写入仓库或小程序前端。
