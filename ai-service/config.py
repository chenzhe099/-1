"""AI 服务配置"""
import os
from pathlib import Path
from dotenv import load_dotenv

_env_path = Path(__file__).parent / ".env"
load_dotenv(_env_path)

MOCK_MODE = os.getenv("MOCK_MODE", "false").lower() == "true"
MODEL_CONFIDENCE_THRESHOLD = float(os.getenv("CONFIDENCE_THRESHOLD", "0.7"))
DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "frontend", "data")

# ==================== 多模型配置 ====================

MODELS = {
    "deepseek": {
        "name": "DeepSeek Vision",
        "api_key": os.getenv("DEEPSEEK_API_KEY", ""),
        "base_url": os.getenv("DEEPSEEK_BASE_URL", "https://api.deepseek.com/v1"),
        "model": os.getenv("DEEPSEEK_MODEL", "deepseek-vision"),
        "timeout": int(os.getenv("DEEPSEEK_TIMEOUT", "30")),
    },
    "qwen": {
        "name": "Qwen-VL-Max",
        "api_key": os.getenv("QWEN_API_KEY", ""),
        "base_url": os.getenv("QWEN_BASE_URL", "https://dashscope.aliyuncs.com/compatible-mode/v1"),
        "model": os.getenv("QWEN_MODEL", "qwen-vl-max"),
        "timeout": int(os.getenv("QWEN_TIMEOUT", "30")),
    },
    "openrouter": {
        "name": "Qwen VL 72B",
        "api_key": os.getenv("OPENROUTER_API_KEY", ""),
        "base_url": os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1"),
        "model": os.getenv("OPENROUTER_MODEL", "qwen/qwen-vl-72b-instruct:free"),
        "timeout": int(os.getenv("OPENROUTER_TIMEOUT", "60")),
    },
    "gemini": {
        "name": "Gemini 2.5 Flash",
        "api_key": os.getenv("GEMINI_API_KEY", ""),
        "base_url": os.getenv("GEMINI_BASE_URL", "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"),
        "model": os.getenv("GEMINI_MODEL", "gemini-2.5-flash"),
        "timeout": int(os.getenv("GEMINI_TIMEOUT", "30")),
    },
}

# 默认模型
DEFAULT_MODEL = os.getenv("DEFAULT_MODEL", "deepseek")

# 向后兼容
DEEPSEEK_API_KEY = MODELS["deepseek"]["api_key"]
DEEPSEEK_BASE_URL = MODELS["deepseek"]["base_url"]
DEEPSEEK_MODEL = MODELS["deepseek"]["model"]
DEEPSEEK_TIMEOUT = MODELS["deepseek"]["timeout"]
