#!/bin/bash
# ============================================================
#  本草溯源 一键部署脚本 (已修复 Gemini API & Nginx HTTPS 问题)
#  在你的 VPS 上运行这个脚本即可完成部署
# ============================================================

# ⚠️ 注意：这里已经为你改为了【纯域名】，不要带端口号！
YOUR_DOMAIN="gameking131445.ccwu.cc"        
"   

# ============================================================
#  第1步：安装依赖
# ============================================================
echo "▸ [1/6] 安装 Nginx + Python..."
apt update -y
apt install -y nginx python3 python3-pip certbot python3-certbot-nginx
# 已经为你加入了 google-generativeai 依赖
pip3 install flask requests google-generativeai --break-system-packages 

# ============================================================
#  第2步：创建项目目录
# ============================================================
echo "▸ [2/6] 创建项目目录..."
mkdir -p /opt/bencao/www/images

# ============================================================
#  第3步：检查文件
# ============================================================
echo "▸ [3/6] 检查文件..."
if [ ! -f /opt/bencao/www/bencao-suoyuan-v2.html ]; then
    echo "⚠ 请先上传 bencao-suoyuan-v2.html 到 /opt/bencao/www/"
    exit 1
fi
if [ ! -f /opt/bencao/api_server.py ]; then
    echo "⚠ 请先上传 api_server.py 到 /opt/bencao/"
    exit 1
fi

# ============================================================
#  第4步：配置 Nginx (已修复为 8443 端口 & 开启 SSL)
# ============================================================
echo "▸ [4/6] 配置 Nginx..."
cat > /etc/nginx/sites-available/bencao << NGINX_EOF
server {
    listen 8443 ssl;
    listen [::]:8443 ssl;
    http2 on;

    server_name ${YOUR_DOMAIN};

    # 使用你的真实 HTTPS 证书路径
    ssl_certificate     /etc/letsencrypt/live/${YOUR_DOMAIN}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${YOUR_DOMAIN}/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:10m;

    client_max_body_size 12M;

    root /opt/bencao/www;
    index bencao-suoyuan-v2.html;

    location / {
        try_files \$uri \$uri/ /bencao-suoyuan-v2.html;
    }

    location /api/vision {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 90s;
        proxy_send_timeout 90s;
        client_body_buffer_size 12M;
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods "POST, GET, OPTIONS";
        add_header Access-Control-Allow-Headers "Content-Type";
        if (\$request_method = OPTIONS) { return 204; }
    }

    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 60s;
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods "POST, GET, OPTIONS";
        add_header Access-Control-Allow-Headers "Content-Type";
        if (\$request_method = OPTIONS) { return 204; }
    }

    location /images/ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
NGINX_EOF

# 启用站点并重启 Nginx
ln -sf /etc/nginx/sites-available/bencao /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx

# ============================================================
#  第5步：配置 AI 后端服务 (已修复 Gemini API Key 的环境变量名)
# ============================================================
echo "▸ [5/6] 配置 AI 后端..."
cat > /etc/systemd/system/bencao-api.service << SERVICE_EOF
[Unit]
Description=BenCao AI API Server (Gemini Version)
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/bencao
# 【已修复】：这里改成了 GEMINI_API_KEY，让 Python 代码能正确读取到密钥
Environment=GEMINI_API_KEY=${GEMINI_API_KEY}
ExecStart=/usr/bin/python3 /opt/bencao/api_server.py
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
SERVICE_EOF

systemctl daemon-reload
systemctl enable bencao-api
systemctl restart bencao-api

# ============================================================
#  第6步：完成！
# ============================================================
echo ""
echo "============================================"
echo "  ✓ 部署完成！"
echo "============================================"
echo ""
echo "  网站地址:  https://${YOUR_DOMAIN}:8443"
echo "  AI接口:    https://${YOUR_DOMAIN}:8443/api/health"
echo ""
echo "  【检查服务状态】:"
echo "    systemctl status bencao-api"
echo "    systemctl status nginx"
echo "============================================"