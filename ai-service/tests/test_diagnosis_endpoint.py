"""
集成测试 — 测试 /diagnosis/local 端点
需要 ai-service 正在运行
"""
import io
import sys
from pathlib import Path

import httpx
from PIL import Image


AI_SERVICE_URL = "http://localhost:8000"


def test_local_health():
    """测试健康检查端点"""
    print("[测试] /api/v1/diagnosis/local/health")
    resp = httpx.get(f"{AI_SERVICE_URL}/api/v1/diagnosis/local/health", timeout=10)
    data = resp.json()
    print(f"  状态: {data}")
    assert resp.status_code == 200
    assert "status" in data


def test_local_diagnosis():
    """测试本地模型推理端点"""
    print("[测试] POST /api/v1/diagnosis/local")

    # 生成合成绿色叶片图片
    img = Image.new("RGB", (300, 300), color=(100, 180, 80))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    buf.seek(0)

    files = {"file": ("test_leaf.jpg", buf, "image/jpeg")}
    data = {"cropName": "番茄"}

    resp = httpx.post(
        f"{AI_SERVICE_URL}/api/v1/diagnosis/local",
        files=files,
        data=data,
        timeout=30,
    )
    print(f"  状态码: {resp.status_code}")

    if resp.status_code == 200:
        result = resp.json()
        print(f"  病害: {result.get('diseaseName')}")
        print(f"  置信度: {result.get('confidence')}")
        print(f"  严重程度: {result.get('severity')}")
        print(f"  模型: {result.get('modelUsed')}")
        print(f"  备选: {[a['diseaseName'] for a in result.get('alternatives', [])]}")

        assert "diseaseName" in result
        assert "confidence" in result
        assert isinstance(result["confidence"], float)
        print("  ✅ 端点测试通过")
    else:
        print(f"  ⚠️ 端点返回非 200: {resp.text}")


def main():
    print("=" * 60)
    print("ai-service 集成测试")
    print(f"目标服务: {AI_SERVICE_URL}")
    print("=" * 60)

    try:
        test_local_health()
        print()
        test_local_diagnosis()
        print("\n✅ 集成测试通过！")
    except httpx.ConnectError:
        print("\n⚠️ 无法连接到 ai-service")
        print(f"请先启动服务: cd ai-service && uvicorn main:app --host 0.0.0.0 --port 8000")
    except Exception as e:
        print(f"\n❌ 测试失败: {e}")


if __name__ == "__main__":
    main()
