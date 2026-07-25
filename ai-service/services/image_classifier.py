"""
病虫害识别 — 本地模型（待训练）+ 文件名推测
"""
import json, os, logging
from config import DATA_DIR, MODEL_CONFIDENCE_THRESHOLD, MODELS, DEFAULT_MODEL

logger = logging.getLogger(__name__)

DISEASE_PATTERNS = {
    "late_blight": "番茄晚疫病", "powdery": "白粉病", "aphid": "蚜虫",
    "downy": "霜霉病", "blight": "晚疫病", "rust": "锈病",
    "mosaic": "花叶病毒病", "spot": "叶斑病", "rot": "软腐病",
    "wilt": "枯萎病",
}

class Classifier:
    def __init__(self):
        self._clients = {}
        for key, cfg in MODELS.items():
            if cfg["api_key"]:
                try:
                    from openai import OpenAI
                    self._clients[key] = OpenAI(
                        api_key=cfg["api_key"], base_url=cfg["base_url"],
                        timeout=cfg["timeout"])
                    logger.info(f"✅ {cfg['name']}")
                except Exception as e:
                    logger.warning(f"❌ {cfg['name']}: {e}")

    def _load_kb(self):
        kb_path = os.path.join(DATA_DIR, "pest_knowledge_base.json")
        if os.path.exists(kb_path):
            with open(kb_path, "r", encoding="utf-8") as f:
                return json.load(f)
        return []

    def predict(self, image_bytes, filename="unknown.jpg", crop_name=None, model=None):
        """统一入口 — 有模型用模型，没模型用文件名推测"""
        # 有云端模型 → 调云端
        if model and model in self._clients:
            cfg = MODELS[model]
            return self._call_openai_compat(image_bytes, filename, crop_name, cfg, model)
        # 无模型 → 文件名推测
        return self._local_classify(filename, crop_name)

    def _call_openai_compat(self, image_bytes, filename, crop_name, cfg, model_key):
        import base64
        client = self._clients[model_key]
        mime = "image/jpeg"
        ext = (filename or "x.jpg").rsplit(".", 1)[-1].lower()
        if ext in ("png",): mime = "image/png"
        elif ext in ("webp",): mime = "image/webp"
        b64 = base64.b64encode(image_bytes).decode()
        data_url = f"data:{mime};base64,{b64}"

        kb = self._load_kb()
        ctx = "\n".join([f"- {k['name']}: {k['symptoms'][:60]}" for k in kb[:10]]) if kb else ""

        messages = [
            {"role": "system", "content": "你是农业病虫害诊断专家。返回JSON: {diseaseName, scientificName, confidence, severity, symptoms, treatment:{chemical:[],biological:[],agricultural:[]}, isUnknown}. 非作物图isUnknown=true. 只返回JSON."},
            {"role": "user", "content": [
                {"type": "image_url", "image_url": {"url": data_url}},
                {"type": "text", "text": f"作物: {crop_name or '未知'}\n已知病害:\n{ctx}\n诊断并返回JSON。"}
            ]}
        ]

        resp = client.chat.completions.create(
            model=cfg["model"], messages=messages, max_tokens=1024, temperature=0.2)
        content = resp.choices[0].message.content.strip()
        if content.startswith("```"): content = content.split("\n", 1)[1].rsplit("\n```", 1)[0]
        try:
            r = json.loads(content)
            r["modelUsed"] = cfg["name"]
            return r
        except:
            return {"diseaseName": "解析异常", "confidence": 0, "isUnknown": True,
                    "symptoms": content[:300], "modelUsed": cfg["name"], "severity": "low", "treatment": {}}

    def _local_classify(self, filename, crop_name):
        fname = filename.lower()
        disease, conf = "未识别", 0.5
        for key, name in DISEASE_PATTERNS.items():
            if key in fname:
                disease, conf = name, 0.7
                break
        kb = self._load_kb()
        treatment = {}
        for k in kb:
            if k.get("name") == disease:
                treatment = {
                    "chemical": k.get("chemicalControl", [])[:5],
                    "biological": k.get("biologicalControl", [])[:3],
                    "agricultural": k.get("agriculturalControl", [])[:5]
                }
                break
        return {
            "diseaseName": disease, "scientificName": "", "confidence": conf,
            "severity": "medium", "symptoms": f"文件名推测: {filename}",
            "treatment": treatment, "isUnknown": conf < 0.7,
            "modelUsed": "本地分类器", "cropAffected": crop_name or "未知"
        }

classifier = Classifier()
