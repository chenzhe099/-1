"""
多模型病虫害识别 — DeepSeek / Qwen-VL / Gemini
"""
import json, os, base64, hashlib, logging, time
from typing import Optional
from config import DATA_DIR, MODEL_CONFIDENCE_THRESHOLD, MODELS, DEFAULT_MODEL

logger = logging.getLogger(__name__)

DISEASE_PATTERNS = {
    "late_blight": "番茄晚疫病", "powdery": "白粉病", "aphid": "蚜虫",
    "downy": "霜霉病", "blight": "晚疫病", "rust": "锈病",
    "mosaic": "花叶病毒病", "spot": "叶斑病", "rot": "软腐病",
    "wilt": "枯萎病", "tomato": "番茄晚疫病", "cucumber": "霜霉病",
    "pepper": "蚜虫", "strawberry": "白粉病", "eggplant": "枯萎病",
}

SYSTEM_PROMPT = """你是农业病虫害诊断专家。观察图片症状返回JSON：
{"diseaseName":"病名","scientificName":"学名","confidence":0.9,"severity":"low/medium/high",
"symptoms":"症状","causes":"原因","treatment":{"chemical":["药+剂量"],
"biological":["生防"],"agricultural":["农防"]},"description":"建议","isUnknown":false}
非作物图设isUnknown=true。只返回JSON。"""

class MultiModelClassifier:
    def __init__(self):
        self._knowledge_base = self._load_kb()
        self._clients = {}
        for key, cfg in MODELS.items():
            if cfg["api_key"]:
                try:
                    from openai import OpenAI
                    self._clients[key] = OpenAI(
                        api_key=cfg["api_key"], base_url=cfg["base_url"],
                        timeout=cfg["timeout"])
                    logger.info(f"✅ {cfg['name']} 客户端就绪")
                except Exception as e:
                    logger.warning(f"❌ {cfg['name']} 初始化失败: {e}")

    def _load_kb(self):
        kb_path = os.path.join(DATA_DIR, "pest_knowledge_base.json")
        if os.path.exists(kb_path):
            with open(kb_path, "r", encoding="utf-8") as f:
                return json.load(f)
        return []

    def _build_context(self):
        if not self._knowledge_base: return ""
        lines = [f"## 已登记病害 ({len(self._knowledge_base)}种)"]
        for kb in self._knowledge_base:
            lines.append(f"- {kb.get('name','')}: {kb.get('symptoms','')[:60]}")
        return "\n".join(lines)

    def predict(self, image_bytes: bytes, filename: str = "unknown.jpg",
                crop_name: Optional[str] = None, model: str = DEFAULT_MODEL) -> dict:
        cfg = MODELS.get(model, MODELS.get(DEFAULT_MODEL, {}))
        if not cfg.get("api_key") or model not in self._clients:
            if model != DEFAULT_MODEL and DEFAULT_MODEL in self._clients:
                logger.info(f"{model}不可用，回退到{DEFAULT_MODEL}")
                return self.predict(image_bytes, filename, crop_name, DEFAULT_MODEL)
            return self._mock_predict(image_bytes, filename, crop_name, model)

        if model == "gemini":
            return self._call_gemini(image_bytes, filename, crop_name, cfg)
        else:
            return self._call_openai_compat(image_bytes, filename, crop_name, cfg, model)

    def _call_openai_compat(self, image_bytes, filename, crop_name, cfg, model_key):
        client = self._clients[model_key]
        mime = "image/jpeg"
        ext = (filename or "x.jpg").rsplit(".", 1)[-1].lower()
        if ext in ("png", "webp", "gif"): mime = f"image/{ext}"
        b64 = base64.b64encode(image_bytes).decode()
        data_url = f"data:{mime};base64,{b64}"

        ctx = self._build_context()
        user_text = f"作物: {crop_name or '未知'}\n{ctx}\n诊断并返回JSON。"

        messages = [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": [
                {"type": "image_url", "image_url": {"url": data_url}},
                {"type": "text", "text": user_text}
            ]}
        ]

        try:
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
                        "symptoms": content[:300], "modelUsed": cfg["name"], "severity": "low",
                        "treatment": {}}
        except Exception as e:
            # 模型调用失败，回退到 qwen 或 mock
            logger.warning(f"{cfg['name']}调用失败: {e}")
            fallback_key = "qwen" if model_key != "qwen" and "qwen" in self._clients else None
            if fallback_key:
                return self._call_openai_compat(image_bytes, filename, crop_name,
                    MODELS[fallback_key], fallback_key)
            return {"diseaseName": "诊断失败", "confidence": 0, "isUnknown": True,
                    "symptoms": f"{cfg['name']}调用失败: {str(e)[:200]}", "severity": "low",
                    "treatment": {}, "modelUsed": f"{cfg['name']}(失败)"}

    def _call_gemini(self, image_bytes, filename, crop_name, cfg):
        ext = (filename or "x.jpg").rsplit(".", 1)[-1].lower()
        mime_map = {"jpg": "image/jpeg", "jpeg": "image/jpeg", "png": "image/png"}
        mime = mime_map.get(ext, "image/jpeg")
        b64 = base64.b64encode(image_bytes).decode()

        import urllib.request
        body = json.dumps({
            "contents": [{"parts": [
                {"inlineData": {"mimeType": mime, "data": b64}},
                {"text": SYSTEM_PROMPT + f"\n作物: {crop_name or '未知'}"}
            ]}],
            "generationConfig": {"temperature": 0.2, "maxOutputTokens": 800}
        }).encode()

        url = cfg["base_url"] + "?key=" + cfg["api_key"]
        req = urllib.request.Request(url, data=body,
            headers={"Content-Type": "application/json"}, method="POST")
        resp = json.loads(urllib.request.urlopen(req, timeout=cfg["timeout"]).read())
        content = resp["candidates"][0]["content"]["parts"][0]["text"].strip()
        if content.startswith("```json"): content = content[7:]
        if content.startswith("```"): content = content[3:]
        if content.endswith("```"): content = content[:-3]
        try:
            r = json.loads(content.strip())
            r["modelUsed"] = cfg["name"]
            return r
        except:
            return {"diseaseName": "解析异常", "confidence": 0, "isUnknown": True,
                    "symptoms": content[:300], "modelUsed": cfg["name"], "severity": "low",
                    "treatment": {}}

    def _mock_predict(self, image_bytes, filename, crop_name, model_key):
        fname = (filename or "").lower()
        disease = "未知病害"
        conf = 0.5
        for key, name in DISEASE_PATTERNS.items():
            if key in fname:
                disease, conf = name, 0.75
                break
        return {
            "diseaseName": disease, "scientificName": "", "confidence": conf,
            "severity": "medium", "symptoms": "(文件名推测，请配置API Key)",
            "treatment": {"chemical": ["请完善API配置"], "biological": [], "agricultural": []},
            "isUnknown": conf < 0.7, "modelUsed": f"本地 ({model_key})"
        }

# 全局单例
classifier = MultiModelClassifier()
