"""AI 服务配置"""
import os

MOCK_MODE = os.getenv("MOCK_MODE", "true").lower() == "true"
MODEL_CONFIDENCE_THRESHOLD = float(os.getenv("CONFIDENCE_THRESHOLD", "0.7"))
DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "frontend", "data")
