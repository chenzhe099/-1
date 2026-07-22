"""数据管道配置"""
import os

MYSQL_HOST = os.getenv("MYSQL_HOST", "localhost")
MYSQL_PORT = int(os.getenv("MYSQL_PORT", "3306"))
MYSQL_USER = os.getenv("MYSQL_USER", "root")
MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD", "smartfarm123")
MYSQL_DB = os.getenv("MYSQL_DB", "smartfarm")
MOCK_MODE = os.getenv("MOCK_MODE", "true").lower() == "true"
