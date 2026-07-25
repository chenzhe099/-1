"""AI 服务配置"""
import os
from pathlib import Path
from dotenv import load_dotenv

_env_path = Path(__file__).parent / ".env"
load_dotenv(_env_path)

MOCK_MODE = os.getenv("MOCK_MODE", "false").lower() == "true"
MODEL_CONFIDENCE_THRESHOLD = float(os.getenv("CONFIDENCE_THRESHOLD", "0.7"))
DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "frontend", "data")

# ==================== 模型配置 ====================
# 格式: { "key": {"name": "...", "api_key": "...", "base_url": "...", "model": "...", "timeout": 30} }
# 在 .env 中配置后自动加载

MODELS = {}

# 默认模型
DEFAULT_MODEL = os.getenv("DEFAULT_MODEL", "")
