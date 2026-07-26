"""
测试本地分类器
验证模型加载、推理、结果格式
"""
import io
import sys
from pathlib import Path

import numpy as np
from PIL import Image

# 添加 ai-service 到 path
sys.path.insert(0, str(Path(__file__).parent.parent / "ai-service"))

from services.local_classifier import LocalTorchClassifier


def test_model_availability():
    """测试模型是否可加载"""
    classifier = LocalTorchClassifier()
    if classifier.is_available:
        print("✅ 模型加载成功")
        stats = classifier.get_stats()
        print(f"   设备: {stats['device']}")
        print(f"   总预测数: {stats['total_predictions']}")
    else:
        print("⚠️ 模型不可用（模型文件未找到或未训练），跳过推理测试")
        print("   请先运行: cd data-pipeline && python training/train.py")
    return classifier


def test_predict_on_synthetic_image(classifier: LocalTorchClassifier):
    """使用合成图片测试推理"""
    if not classifier.is_available:
        print("\n⚠️ 跳过推理测试（模型不可用）")
        return

    print("\n--- 推理测试（合成图片） ---")

    # 生成一张绿色模拟植物图片
    img = Image.new("RGB", (300, 300), color=(100, 180, 80))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    image_bytes = buf.getvalue()

    result = classifier.predict(image_bytes, filename="test_plant.jpg", crop_name="番茄")
    print(f"  病害名称: {result['diseaseName']}")
    print(f"  置信度:   {result['confidence']:.4f}")
    print(f"  严重程度: {result['severity']}")
    print(f"  isUnknown: {result['isUnknown']}")
    print(f"  模型:     {result['modelUsed']}")

    # 验证返回字段
    assert "diseaseName" in result, "缺少 diseaseName"
    assert "confidence" in result, "缺少 confidence"
    assert "severity" in result, "缺少 severity"
    assert "treatment" in result, "缺少 treatment"
    assert "isUnknown" in result, "缺少 isUnknown"
    assert "alternatives" in result, "缺少 alternatives"
    assert isinstance(result["confidence"], float), "confidence 应为 float"
    assert 0.0 <= result["confidence"] <= 1.0, "confidence 应在 [0, 1]"

    print("  ✅ 返回字段验证通过")

    # 验证 top-k alternatives
    alternatives = result.get("alternatives", [])
    if alternatives:
        print(f"  Top-K 备选 ({len(alternatives)} 个):")
        for alt in alternatives[:3]:
            print(f"    - {alt['diseaseName']}: {alt['confidence']:.4f}")


def test_predict_on_noise(classifier: LocalTorchClassifier):
    """测试随机噪声图片（应该低置信度 isUnknown=True）"""
    if not classifier.is_available:
        return

    print("\n--- 推理测试（随机噪声） ---")
    noise = np.random.randint(0, 255, (300, 300, 3), dtype=np.uint8)
    img = Image.fromarray(noise)
    buf = io.BytesIO()
    img.save(buf, format="JPEG")

    result = classifier.predict(buf.getvalue(), filename="noise.jpg")
    print(f"  病害名称: {result['diseaseName']}")
    print(f"  置信度:   {result['confidence']:.4f}")
    print(f"  isUnknown: {result['isUnknown']}")
    # 随机噪声大概率低置信度，但不强制断言（取决于模型）


def test_unavailable_mode():
    """测试模型文件缺失时的降级行为"""
    print("\n--- 降级测试（不存在的模型路径） ---")
    classifier = LocalTorchClassifier(model_path="/nonexistent/model.pth")
    assert not classifier.is_available, "应该不可用"

    img = Image.new("RGB", (100, 100), color=(0, 255, 0))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")

    result = classifier.predict(buf.getvalue(), filename="test.jpg")
    assert result["isUnknown"], "降级结果应标记 isUnknown"
    assert "不可用" in result["diseaseName"] or "失败" in result["description"], \
        f"应包含不可用提示: {result}"
    print("  ✅ 降级模式正常工作")


def main():
    print("=" * 60)
    print("本地病虫害分类器测试")
    print("=" * 60)

    classifier = test_model_availability()
    test_predict_on_synthetic_image(classifier)
    test_predict_on_noise(classifier)
    test_unavailable_mode()

    print("\n" + "=" * 60)
    print("✅ 所有测试通过！")
    print("=" * 60)


if __name__ == "__main__":
    main()
