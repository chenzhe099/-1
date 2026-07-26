"""病虫害识别测试脚本 — 直接上传图片识别"""
import sys, json, httpx

if len(sys.argv) < 2:
    print("用法: python test_disease.py 图片路径.jpg [作物名称]")
    print("示例: python test_disease.py my_leaf.jpg 番茄")
    sys.exit(1)

image_path = sys.argv[1]
crop_name = sys.argv[2] if len(sys.argv) > 2 else "番茄"

print(f"上传图片: {image_path}")
print(f"作物类型: {crop_name}")
print("-" * 40)

with open(image_path, "rb") as f:
    resp = httpx.post(
        "http://localhost:8000/api/v1/diagnosis/local",
        files={"file": (image_path, f, "image/jpeg")},
        data={"cropName": crop_name},
        timeout=30,
    )

result = resp.json()
print(f"病害名称: {result['diseaseName']}")
print(f"置信度:   {result['confidence']:.2%}")
print(f"严重程度: {result['severity']}")
print(f"是否未知: {result['isUnknown']}")

if result.get("treatment"):
    t = result["treatment"]
    if t.get("chemical"):
        print(f"化学防治: {t['chemical'][:2]}")
    if t.get("biological"):
        print(f"生物防治: {t['biological'][:2]}")
    if t.get("agricultural"):
        print(f"农业防治: {t['agricultural'][:2]}")

if result.get("alternatives"):
    print(f"其他可能: {[a['diseaseName'] for a in result['alternatives'][:3]]}")
