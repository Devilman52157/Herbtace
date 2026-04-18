"""
生成全部产品溯源二维码（含商品名称标签）
运行后在 qrcodes/ 文件夹生成 PNG 图片

依赖：pip install qrcode[pil] pillow
"""
import qrcode
import os
from PIL import Image, ImageDraw, ImageFont

# ============================================
#  改成你的实际域名或 IP
# ============================================
BASE_URL = "https://gameking131445.ccwu.cc:8443"

# ============================================
#  全部商品（与 HTML 中 P 对象保持同步）
# ============================================
PRODUCTS = {
    # 便捷养生
    'easy1': '单味祁菊花茶包',
    'easy2': '即食薏米代餐糕',
    'easy3': '祁菊花枸杞护眼茶包',
    'easy4': '祁菊金银茉莉三花灭火茶',
    'easy5': '熟制破壁祁薏米粉',
    'easy6': '祛湿薏米茶包',
    'easy7': '清润沙参茶包',
    'easy8': '沙参玉竹六物饮',
    # 家庭药膳
    'home1': '罐装祁山药片',
    'home2': '家用白芷卤料包',
    'home3': '去皮切段祁山药',
    'home4': '罐装祁山药丁',
    'home5': '白芷去腥调味粉',
    # 特色创新
    'spec1': '裹糖冻干祁山药',
    'spec2': '亲民礼盒（八大祁药）',
    'spec3': '祁紫菀超细药用粉',
    'spec4': '祁芥穗超细药用粉',
    'spec5': '商务礼盒（祁药+名贵滋补）',
}

# ============================================
#  样式参数
# ============================================
QR_FILL   = "#2A1F14"   # 二维码前景色（深墨色）
QR_BACK   = "#F8F2E8"   # 二维码背景色（宣纸色）
LABEL_BG  = "#F8F2E8"   # 标签背景
LABEL_FG  = "#2A1F14"   # 标签文字
FONT_SIZE = 18          # 文字大小（像素）
PAD_TOP   = 10          # 二维码与标签之间的间距
PAD_BTM   = 14          # 标签下边距
PAD_LR    = 16          # 标签左右内边距

# 字体路径（优先尝试常见中文字体，找不到则用默认）
FONT_CANDIDATES = [
    "/usr/share/fonts/truetype/wqy/wqy-microhei.ttc",      # Ubuntu/Debian
    "/usr/share/fonts/truetype/arphic/uming.ttc",
    "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc",
    "/System/Library/Fonts/PingFang.ttc",                   # macOS
    "C:/Windows/Fonts/msyh.ttc",                            # Windows 微软雅黑
    "C:/Windows/Fonts/simhei.ttf",
    "C:/Windows/Fonts/simsun.ttc",
]

def load_font(size):
    for path in FONT_CANDIDATES:
        if os.path.exists(path):
            try:
                return ImageFont.truetype(path, size)
            except Exception:
                continue
    # 最终兜底：PIL 内置字体（不支持中文，会显示方框，但不崩溃）
    return ImageFont.load_default()

def make_qr_with_label(pid, name, url):
    # 1. 生成二维码
    qr = qrcode.QRCode(
        version=2,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=12,
        border=3,
    )
    qr.add_data(url)
    qr.make(fit=True)
    qr_img = qr.make_image(fill_color=QR_FILL, back_color=QR_BACK).convert("RGB")
    qr_w, qr_h = qr_img.size

    # 2. 量出标签高度
    font = load_font(FONT_SIZE)
    # 用临时 Draw 量文字尺寸
    dummy = ImageDraw.Draw(Image.new("RGB", (1, 1)))
    bbox = dummy.textbbox((0, 0), name, font=font)
    text_w = bbox[2] - bbox[0]
    text_h = bbox[3] - bbox[1]
    label_h = PAD_TOP + text_h + PAD_BTM

    # 3. 拼合画布
    total_h = qr_h + label_h
    canvas = Image.new("RGB", (qr_w, total_h), LABEL_BG)
    canvas.paste(qr_img, (0, 0))

    # 4. 写文字（水平居中）
    draw = ImageDraw.Draw(canvas)
    x = (qr_w - text_w) // 2
    y = qr_h + PAD_TOP
    draw.text((x, y), name, fill=LABEL_FG, font=font)

    # 5. 细分割线（可选）
    draw.line([(PAD_LR, qr_h + 1), (qr_w - PAD_LR, qr_h + 1)],
              fill="#C4935A", width=1)

    return canvas

# ============================================
#  主逻辑
# ============================================
out_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'qrcodes')
os.makedirs(out_dir, exist_ok=True)

for pid, name in PRODUCTS.items():
    url = f"{BASE_URL}/#trace/{pid}"
    img = make_qr_with_label(pid, name, url)
    # 文件名只用 ASCII，避免路径问题
    filename = os.path.join(out_dir, f"qr_{pid}.png")
    img.save(filename)
    print(f"✓ {name}  →  {filename}")
    print(f"  URL: {url}")

print(f"\n共生成 {len(PRODUCTS)} 个二维码，保存在 {out_dir}/")
