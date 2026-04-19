"""
本草溯源 - AI 中转服务 (v3 - OpenAI 兼容通用版)
===============================================================
支持任意 OpenAI 兼容 API：智谱AI / 硅基流动 / 通义千问 / OpenAI 等
  /api/chat    - 普通文本对话
  /api/vision  - 舌/面照片识别，返回体质辨证 JSON
  /api/health  - 健康检查

推荐服务商（按免费额度排序）：
  智谱AI    https://open.bigmodel.cn      GLM-4V-Flash 免费
  硅基流动  https://siliconflow.cn        Qwen2-VL 免费
  通义千问  https://dashscope.aliyun.com  有免费额度

使用方法：
1. pip install flask openai
2. 配置下方环境变量后运行：python api_server.py
"""

from flask import Flask, request, jsonify
from openai import OpenAI
import os, base64, json, random

app = Flask(__name__)

def _log(*args):
    print(*args, flush=True)

# ===============================================================
#  配置区 —— 修改这里切换服务商
# ===============================================================

# ---------- 智谱AI (默认，GLM-4V-Flash 免费) ----------
API_KEY      = os.environ.get('AI_API_KEY', '你的智谱AI-Key')
API_BASE_URL = os.environ.get('AI_BASE_URL', 'https://open.bigmodel.cn/api/paas/v4/')
CHAT_MODEL   = os.environ.get('AI_CHAT_MODEL',   'glm-4-flash')   # 免费对话模型
VISION_MODEL = os.environ.get('AI_VISION_MODEL', 'glm-4v-flash')  # 免费视觉模型

# ---------- 硅基流动 (备选，取消注释即可) ----------
# API_KEY      = os.environ.get('AI_API_KEY', '你的SiliconFlow-Key')
# API_BASE_URL = 'https://api.siliconflow.cn/v1'
# CHAT_MODEL   = 'Qwen/Qwen2.5-7B-Instruct'
# VISION_MODEL = 'Qwen/Qwen2-VL-7B-Instruct'

# ---------- 通义千问 (备选) ----------
# API_KEY      = os.environ.get('AI_API_KEY', '你的DashScope-Key')
# API_BASE_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1'
# CHAT_MODEL   = 'qwen-turbo'
# VISION_MODEL = 'qwen-vl-max'

# ---------- OpenAI (备选) ----------
# API_KEY      = os.environ.get('AI_API_KEY', '你的OpenAI-Key')
# API_BASE_URL = 'https://api.openai.com/v1'
# CHAT_MODEL   = 'gpt-4o-mini'
# VISION_MODEL = 'gpt-4o-mini'

client = OpenAI(api_key=API_KEY, base_url=API_BASE_URL)

# ===============================================================
#  System Prompts
# ===============================================================
AI_SYSTEM_PROMPT = """你是"本草溯源"平台的AI养生助手，名叫"本草君"。你是一位资深中医养生顾问，精通：
- 中医体质辨识（九种体质）
- 中药材功效与配伍禁忌
- 四季养生、食疗方案
- 穴位保健与经络调理

平台在售产品如下，推荐时请严格从此列表选择：

【便捷养生系列】
1. 单味祁菊花茶包（¥9.9/盒）——清肝明目，低温烘焙锁香，三角独立茶包，日常轻补首选
2. 即食薏米代餐糕（¥19.9/袋）——安国薏米配山药、红豆，健脾利湿，饱腹轻盈，适合上班族代早餐
3. 祁菊花枸杞护眼茶包（¥12.9/盒）——祁菊花+宁夏枸杞，专为屏幕族调方，清肝明目缓解久视疲劳
4. 祁菊金银茉莉三花灭火茶（¥15.9/盒）——祁菊花、金银花、茉莉花三花同袋，清热解毒，熬夜上火首选
5. 熟制破壁祁薏米粉（¥15.9/罐）——安国祁薏米熟制破壁，即冲即饮，健脾祛湿
6. 祛湿薏米茶包（¥9.9/盒）——祁薏米配赤小豆、茯苓、芡实，专为湿气重、水肿困倦人群
7. 清润沙参茶包（¥12.9/盒）——安国祁沙参，润肺养阴，清嗓生津，适合久咳干燥人群
8. 沙参玉竹六物饮（¥19.9/盒）——沙参、玉竹、麦冬、百合、陈皮、甘草，滋阴润肺，养胃生津

【家庭药膳系列】
9. 罐装祁山药片（¥15.9/罐）——道地祁山药鲜切烘干，煲汤炖粥皆可，健脾益胃
10. 家用白芷卤料包（¥15.9/袋）——道地白芷配十味香辛料，祛风散寒，家常卤味更香
11. 去皮切段祁山药（¥19.9/袋）——现挖现切去皮，开袋即用，炖汤/鲜蒸可选
12. 罐装祁山药丁（¥15.9/罐）——小丁装罐，煮粥拌饭快手家常
13. 白芷去腥调味粉（¥9.9/瓶）——白芷研磨细粉配姜粉花椒，去腥提香，厨房常备

【特色创新系列】
14. 裹糖冻干祁山药（¥15.9/袋）——冻干锁鲜外裹薄糖衣，酥脆健康，办公追剧零食
15. 亲民礼盒·八大祁药（¥99.9/盒）——菊花、山药、薏米、沙参等八大祁药，新中式礼盒，送礼自用皆宜
16. 祁紫菀超细药用粉（¥9.9/袋）——800目药用级细粉，润肺下气
17. 祁芥穗超细药用粉（¥9.9/袋）——800目药用级细粉，祛风解表，散寒止痒
18. 商务礼盒·祁药+名贵滋补（¥259/盒）——八大祁药配野山参、石斛、花胶，商务尊赠高端之选

回复要求：
1. 用专业但通俗易懂的语言回答
2. 根据用户症状或需求，优先从以上产品中匹配推荐，注明产品名称和价格
3. 回答控制在200字以内，分条列出要点
4. 遇到严重疾病症状时，明确建议用户就医，不可替代医疗诊断
5. 语气温和专业，像老中医跟患者聊天"""

VISION_SYSTEM_PROMPT = """你是一位精通中医望诊的资深中医师，正在为一位用户分析其上传的舌象/面色照片。

请严格返回以下 JSON 格式（不要有任何额外文字）：

{
  "constitution": "主体质类型，从九种体质中选：平和/气虚/阳虚/阴虚/痰湿/湿热/血瘀/气郁/特禀",
  "subtype": "偏颇程度，可填：轻度偏颇/偏颇/显著偏颇",
  "confidence": 置信度数值60-95,
  "summary": "简短辨证概括，例如：主证痰湿 · 兼见气虚",
  "scores": [
    {"k":"痰湿","v":数值0-10,"c":"#B5452A"},
    {"k":"气虚","v":数值0-10,"c":"#C4935A"},
    {"k":"阳虚","v":数值0-10,"c":"#D4694E"},
    {"k":"阴虚","v":数值0-10,"c":"#4A7C59"},
    {"k":"血瘀","v":数值0-10,"c":"#6B9E78"},
    {"k":"平和","v":数值0-10,"c":"#8B7A6B"}
  ],
  "traits": ["舌象/面色特征1", "特征2", "特征3", "特征4"],
  "blessing": "一段温暖的中医问诊寄语，2-3句，文雅有温度。支持<br>换行",
  "recommendations": [
    {"name":"产品名","desc":"功效描述<br>产地信息","price":数值,"unit":"盒","match":匹配度80-99,"icon":"i-tea或i-sprout或i-flower"}
  ],
  "followup": "一句后续引导语",
  "quickQs": [
    {"q":"完整问题","label":"短标题"}
  ],
  "feature_count": 识别的特征点数量30-60
}

平台可推荐产品：枸杞菊花养生茶、红枣桂圆暖身茶、玫瑰红糖姜茶、艾草安神香铃、薄荷醒神风铃、陈皮茯苓健脾茶、薏米赤豆祛湿饮。"""

HERB_VISION_PROMPT = """你是一位精通中药材辨识的资深中药师。请仔细分析用户上传的药材（或植物/花卉/果实）照片。

严格只返回一个 JSON（不要任何多余文字、不要 Markdown 代码块）。

若能识别到药材/植物，返回：
{
  "matched": true,
  "name": "中文名（优先中药材名，如不是药材则用植物/食材通用名）",
  "latin": "拉丁学名",
  "confidence": 数值60-95,
  "nature": "性味归经，如：性微寒，味甘苦。归肺、肝经。若非药材可写 —",
  "effect": "主要功效或用途，30-80字",
  "notes": "从颜色/形态/表面特征等给出的识别依据，40-100字",
  "known_id": "若对应到下方列表之一，填该 id，否则省略"
}

若照片里无明显目标、光线太差、模糊不清或确实无法辨识，返回：
{
  "matched": false,
  "reason": "简短原因，例：未检测到药材 / 光线不足 / 图像模糊"
}

平台常见八味祁药及 known_id：
- 祁菊花 juhua (Chrysanthemum morifolium) 小黄白菊花头
- 祁山药 shanyao (Dioscorea opposita) 白色圆柱形切片
- 祁薏米 yimi (Coix lacryma-jobi) 灰白色卵圆形颗粒
- 沙参 shashen (Adenophora stricta) 长条根
- 白芷 baizhi (Angelica dahurica) 白色圆柱根段
- 紫菀 ziwan (Aster tataricus) 紫红色根茎
- 芥穗 jiesui (Schizonepeta tenuifolia) 干花穗
- 玉竹 yuzhu (Polygonatum odoratum) 黄白色扁平根茎
"""

def expert_system_prompt(persona_id):
    experts = {
        'li':   {'name': '李明远 教授', 'title': '北京中医药大学 · 主任医师', 'speciality': '内科杂病 · 失眠眩晕'},
        'wang': {'name': '王婉清 主任', 'title': '广州中医药大学 · 副主任医师', 'speciality': '妇科调理 · 食疗药膳'},
        'chen': {'name': '陈国安 博士', 'title': '成都中医药大学 · 药学博士', 'speciality': '中药辨识 · 配伍禁忌'},
    }
    e = experts.get(persona_id)
    if not e: return None
    return f"你扮演「{e['name']}」。执业背景：{e['title']}，专长：{e['speciality']}。语气沉稳权威温和。遇到重疾建议就医。不自称AI。每次150-250字。"

# ===============================================================
#  降级数据
# ===============================================================
FALLBACK_REPORTS = [
    {
        "constitution": "痰湿", "subtype": "偏颇", "confidence": 86,
        "summary": "主证痰湿 · 兼见气虚",
        "scores": [{"k":"痰湿","v":8.4,"c":"#B5452A"},{"k":"气虚","v":6.2,"c":"#C4935A"},
                   {"k":"阳虚","v":4.8,"c":"#D4694E"},{"k":"阴虚","v":3.1,"c":"#4A7C59"},
                   {"k":"血瘀","v":2.5,"c":"#6B9E78"},{"k":"平和","v":3.6,"c":"#8B7A6B"}],
        "traits": ["舌体胖大","舌苔白腻","边有齿痕","舌色淡红"],
        "blessing": "湿邪缠绵，非一日可除。宜避生冷油腻。",
        "recommendations": [{"name":"陈皮茯苓健脾茶","desc":"化湿健脾","price":88,"unit":"盒","match":96,"icon":"i-tea"}],
        "followup": "若愿详述睡眠饮食，本草君可细化方案。",
        "quickQs": [{"q":"痰湿忌口什么？","label":"忌口指南"}],
        "feature_count": 42
    }
]

def _random_fallback():
    return json.loads(json.dumps(random.choice(FALLBACK_REPORTS)))

# ===============================================================
#  /api/chat
# ===============================================================
@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json() or {}
        messages = data.get('messages', [])

        sys_prompt = data.get('system_prompt')
        persona = data.get('persona')
        if not sys_prompt and persona:
            sys_prompt = expert_system_prompt(persona)
        if not sys_prompt:
            sys_prompt = AI_SYSTEM_PROMPT

        full_messages = [{'role': 'system', 'content': sys_prompt}] + messages

        resp = client.chat.completions.create(
            model=CHAT_MODEL,
            messages=full_messages,
            temperature=0.7,
            max_tokens=800,
        )
        reply = resp.choices[0].message.content or '抱歉，服务暂时不可用。'
        return jsonify({'reply': reply})

    except Exception as e:
        _log(f'[chat] Error: {e}')
        return jsonify({'reply': '抱歉，服务暂时不可用。'}), 500

# ===============================================================
#  /api/vision
# ===============================================================
@app.route('/api/vision', methods=['POST'])
def vision():
    try:
        data = request.get_json() or {}
        img_data_url = data.get('image', '')
        mode = data.get('mode', 'tongue')

        if not img_data_url:
            return jsonify({'error': 'missing image'}), 400

        if mode == 'herb':
            sys_prompt = HERB_VISION_PROMPT
            user_text = '请辨识照片中的药材或植物，严格按JSON格式返回。'
            max_tok = 700
        else:
            sys_prompt = VISION_SYSTEM_PROMPT
            user_text = {'tongue': '请对这张舌象照片进行辨证，严格按JSON格式返回。',
                         'face':   '请对这张面部照片进行辨证，严格按JSON格式返回。'
                        }.get(mode, '请辨识此照片，严格按JSON格式返回。')
            max_tok = 1500

        resp = client.chat.completions.create(
            model=VISION_MODEL,
            messages=[
                {'role': 'system', 'content': sys_prompt},
                {'role': 'user', 'content': [
                    {'type': 'text', 'text': user_text},
                    {'type': 'image_url', 'image_url': {'url': img_data_url}},
                ]}
            ],
            temperature=0.3 if mode == 'herb' else 0.4,
            max_tokens=max_tok,
        )

        raw = resp.choices[0].message.content or ''
        # 提取 JSON（有些模型会在 JSON 前后加说明文字）
        match = __import__('re').search(r'\{[\s\S]+\}', raw)
        report = json.loads(match.group() if match else raw)
        return jsonify(report)

    except Exception as e:
        _log(f'[vision] Error: {e}')
        mode = (request.get_json(silent=True) or {}).get('mode', 'tongue')
        if mode == 'herb':
            return jsonify({'matched': False, 'reason': '识别服务暂不可用，请稍后重试', '_fallback': True})
        fb = _random_fallback()
        fb['_fallback'] = True
        return jsonify(fb)

# ===============================================================
#  /api/health
# ===============================================================
@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'ok',
        'service': 'bencao-api-v3',
        'chat_model': CHAT_MODEL,
        'vision_model': VISION_MODEL,
        'key_configured': bool(API_KEY and '你的' not in API_KEY)
    })

if __name__ == '__main__':
    _log(f'Starting BenCao API Server (chat={CHAT_MODEL}, vision={VISION_MODEL}) on port 5000...')
    app.run(host='127.0.0.1', port=5000)
