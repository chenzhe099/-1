"""AI 服务配置"""
import os
from pathlib import Path
from dotenv import load_dotenv

# 强制从 ai-service 目录加载 .env
_env_path = Path(__file__).parent / ".env"
load_dotenv(_env_path)

MOCK_MODE = os.getenv("MOCK_MODE", "true").lower() == "true"
MODEL_CONFIDENCE_THRESHOLD = float(os.getenv("CONFIDENCE_THRESHOLD", "0.7"))
DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "frontend", "data")

# DeepSeek API 配置
DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY", "")
DEEPSEEK_BASE_URL = os.getenv("DEEPSEEK_BASE_URL", "https://api.deepseek.com/v1")
DEEPSEEK_MODEL = os.getenv("DEEPSEEK_MODEL", "deepseek-chat")
DEEPSEEK_TIMEOUT = int(os.getenv("DEEPSEEK_TIMEOUT", "30"))
