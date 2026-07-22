"""AI 病虫害识别服务测试"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'ai-service'))

from services.image_classifier import ImageClassifier


def test_classifier_init():
    """测试分类器初始化"""
    clf = ImageClassifier()
    assert clf._knowledge_base is not None
    assert len(clf._knowledge_base) > 0


def test_predict_tomato():
    """测试番茄晚疫病识别"""
    clf = ImageClassifier()
    result = clf.predict(b"fake_image_data", "tomato_leaf_with_late_blight.jpg")
    assert "diseaseName" in result
    assert "confidence" in result
    assert "treatment" in result
    assert result["confidence"] > 0.7


def test_predict_unknown():
    """测试未知图片识别"""
    clf = ImageClassifier()
    result = clf.predict(b"", "completely_unknown_random_image.jpg")
    assert result["isUnknown"] or result["confidence"] < 0.8


def test_result_structure():
    """测试返回结果结构完整性"""
    clf = ImageClassifier()
    result = clf.predict(b"test", "test.jpg")
    required_keys = ["diseaseName", "confidence", "severity", "symptoms", "treatment", "isUnknown"]
    for key in required_keys:
        assert key in result, f"Missing key: {key}"


if __name__ == '__main__':
    test_classifier_init()
    test_predict_tomato()
    test_predict_unknown()
    test_result_structure()
    print("All diagnosis tests passed!")
