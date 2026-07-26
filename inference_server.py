"""
植物病害识别推理服务 — Flask API
加载训练好的 MobileNetV3 模型，接受图片上传，返回病害识别结果
"""
import json
import io
import os

import torch
import torch.nn as nn
from torchvision import transforms, models
from PIL import Image
from flask import Flask, request, jsonify, send_from_directory, make_response

# ===== 配置 =====
MODEL_PATH = os.path.join(os.path.dirname(__file__), "training", "output", "plant_disease_model.pth")
CLASS_NAMES_PATH = os.path.join(os.path.dirname(__file__), "training", "output", "class_names.json")
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
IMAGE_SIZE = 224

# ===== 加载类别名 =====
with open(CLASS_NAMES_PATH, "r", encoding="utf-8") as f:
    CLASS_NAMES = json.load(f)

# 中文映射表
CN_MAP = {
    "Apple___Apple_scab": ("苹果", "疮痂病"),
    "Apple___Black_rot": ("苹果", "黑腐病"),
    "Apple___Cedar_apple_rust": ("苹果", "锈病"),
    "Apple___healthy": ("苹果", "健康"),
    "Blueberry___healthy": ("蓝莓", "健康"),
    "Cherry_(including_sour)___Powdery_mildew": ("樱桃", "白粉病"),
    "Cherry_(including_sour)___healthy": ("樱桃", "健康"),
    "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot": ("玉米", "灰斑病"),
    "Corn_(maize)___Common_rust_": ("玉米", "锈病"),
    "Corn_(maize)___Northern_Leaf_Blight": ("玉米", "大斑病"),
    "Corn_(maize)___healthy": ("玉米", "健康"),
    "Grape___Black_rot": ("葡萄", "黑腐病"),
    "Grape___Esca_(Black_Measles)": ("葡萄", "埃斯卡病"),
    "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)": ("葡萄", "叶枯病"),
    "Grape___healthy": ("葡萄", "健康"),
    "Orange___Haunglongbing_(Citrus_greening)": ("柑橘", "黄龙病"),
    "Peach___Bacterial_spot": ("桃子", "细菌性斑点病"),
    "Peach___healthy": ("桃子", "健康"),
    "Pepper,_bell___Bacterial_spot": ("甜椒", "细菌性斑点病"),
    "Pepper,_bell___healthy": ("甜椒", "健康"),
    "Potato___Early_blight": ("马铃薯", "早疫病"),
    "Potato___Late_blight": ("马铃薯", "晚疫病"),
    "Potato___healthy": ("马铃薯", "健康"),
    "Raspberry___healthy": ("覆盆子", "健康"),
    "Soybean___healthy": ("大豆", "健康"),
    "Squash___Powdery_mildew": ("南瓜", "白粉病"),
    "Strawberry___Leaf_scorch": ("草莓", "叶枯病"),
    "Strawberry___healthy": ("草莓", "健康"),
    "Tomato___Bacterial_spot": ("番茄", "细菌性斑点病"),
    "Tomato___Early_blight": ("番茄", "早疫病"),
    "Tomato___Late_blight": ("番茄", "晚疫病"),
    "Tomato___Leaf_Mold": ("番茄", "叶霉病"),
    "Tomato___Septoria_leaf_spot": ("番茄", "斑枯病"),
    "Tomato___Spider_mites Two-spotted_spider_mite": ("番茄", "红蜘蛛"),
    "Tomato___Target_Spot": ("番茄", "靶斑病"),
    "Tomato___Tomato_Yellow_Leaf_Curl_Virus": ("番茄", "黄化曲叶病毒"),
    "Tomato___Tomato_mosaic_virus": ("番茄", "花叶病毒"),
    "Tomato___healthy": ("番茄", "健康"),
}

# ===== 加载模型 =====
model = models.mobilenet_v3_small(weights=None)
model.classifier[-1] = nn.Linear(model.classifier[-1].in_features, len(CLASS_NAMES))
model.load_state_dict(torch.load(MODEL_PATH, map_location=DEVICE, weights_only=True))
model.to(DEVICE)
model.eval()
print(f"[Inference] 模型已加载，设备: {DEVICE}，类别数: {len(CLASS_NAMES)}")

# ===== 第二模型: EfficientNet-B3 (15类，99.8%准确率) =====
MODEL2_PATH = os.path.join(os.path.dirname(__file__), "training", "output", "pest_classifier_efficientnet_b3.pth")
MAPPING2_PATH = os.path.join(os.path.dirname(__file__), "training", "output", "class_mapping.json")
MODEL2_SIZE = 300
model2 = None
model2_mapping = {}
model2_classes = []
if os.path.exists(MODEL2_PATH):
    from torchvision.models import efficientnet_b3, EfficientNet_B3_Weights
    model2 = efficientnet_b3(weights=None)
    # 模型训练时用了 512 输出维度，先按原始维度加载
    model2.classifier[1] = nn.Linear(model2.classifier[1].in_features, 512)
    state = torch.load(MODEL2_PATH, map_location=DEVICE, weights_only=True)
    # 去掉 backbone. 前缀（训练时包装在 NormalizeWrapper 中）
    clean_state = {}
    for k, v in state.items():
        if k.startswith("backbone."):
            clean_state[k[9:]] = v
        elif k.startswith("classifier."):
            clean_state[k] = v
    model2.load_state_dict(clean_state, strict=False)
    # 重建 class_mapping（15类映射到 512 维输出的对应索引）
    if os.path.exists(MAPPING2_PATH):
        with open(MAPPING2_PATH, "r", encoding="utf-8") as f:
            raw_map = json.load(f)
        model2_mapping = raw_map
        for k, v in raw_map.items():
            model2_classes.append({"id": v["id"], "crop": v["crop_cn"], "disease": v["name_cn"], "key": k})
    model2.to(DEVICE)
    model2.eval()
    print(f"[Inference] 第二模型(EfficientNet-B3)已加载，准确率99.84%，输出维度512，已知类别: {len(model2_classes)}")
else:
    print(f"[Inference] 第二模型文件不存在: {MODEL2_PATH}")

def predict_model2(img):
    """用 EfficientNet-B3 推理，从 512 维输出中提取 15 个已知类别"""
    norm2 = transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    tf = transforms.Compose([
        transforms.Resize((MODEL2_SIZE, MODEL2_SIZE)),
        transforms.ToTensor(),
        norm2
    ])
    with torch.no_grad():
        tensor = tf(img).unsqueeze(0).to(DEVICE)
        output = model2(tensor)[0]  # shape: 512
        # 只取 class_mapping 中定义的 15 个类别的 softmax
        class_ids = [c["id"] for c in model2_classes]
        class_logits = output[class_ids]
        probs = torch.softmax(class_logits, dim=0)
        # 取 top5
        top5_probs, top5_local_idx = torch.topk(probs, min(5, len(model2_classes)))
    return top5_probs.tolist(), [class_ids[i] for i in top5_local_idx.tolist()]

# ===== 图像预处理（含 TTA 多视角） =====
# TTA (Test Time Augmentation): 对同一图做多种预处理，综合判断更准
def tta_transforms(base_size=IMAGE_SIZE):
    """返回 4 个不同视角的 transform"""
    norm = transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    to_tensor = transforms.ToTensor()
    return [
        transforms.Compose([transforms.Resize((base_size, base_size)), to_tensor, norm]),  # 原图
        transforms.Compose([transforms.Resize((base_size, base_size)),
                           transforms.RandomHorizontalFlip(p=1.0), to_tensor, norm]),       # 水平翻转
        transforms.Compose([transforms.Resize((int(base_size*1.15), int(base_size*1.15))),
                           transforms.CenterCrop(base_size), to_tensor, norm]),              # 中心裁剪
        transforms.Compose([transforms.Resize((base_size, base_size)),
                           transforms.ColorJitter(brightness=0.15, contrast=0.15),
                           to_tensor, norm]),                                              # 色彩抖动
    ]

def predict_with_tta(img):
    """TTA 综合推理：对图片做4种预处理，结果取平均"""
    sum_probs = None
    with torch.no_grad():
        for tf in tta_transforms():
            try:
                tensor = tf(img).unsqueeze(0).to(DEVICE)
                probs = torch.softmax(model(tensor), dim=1)[0]
                if sum_probs is None:
                    sum_probs = probs
                else:
                    sum_probs = sum_probs + probs
            except Exception:
                continue
    return sum_probs / len(tta_transforms()) if sum_probs is not None else None

# ===== Flask App =====
FRONTEND_DIR = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "frontend"))
app = Flask(__name__)

# ===== API 路由（必须在静态路由前） =====
@app.route("/api/v1/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "model": "MobileNetV3-Small", "classes": len(CLASS_NAMES)})

@app.route("/api/v1/disease/predict", methods=["POST", "OPTIONS"])
def predict():
    if request.method == "OPTIONS":
        return "", 204
    """接受图片上传，返回病害识别结果"""
    if "file" not in request.files:
        return jsonify({"error": "未上传图片"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "文件名为空"}), 400

    try:
        # 预处理 + TTA 综合推理
        img = Image.open(io.BytesIO(file.read())).convert("RGB")
        sum_probs = predict_with_tta(img)
        if sum_probs is None:
            raise Exception("TTA 推理全部失败")
        top5_probs, top5_idx = torch.topk(sum_probs, min(5, len(CLASS_NAMES)))

        results = []
        for i in range(len(top5_idx)):
            en_name = CLASS_NAMES[top5_idx[i].item()]
            crop, disease = CN_MAP.get(en_name, (en_name.split("___")[0], en_name.split("___")[-1]))
            is_healthy = "healthy" in en_name.lower()
            results.append({
                "rank": i + 1,
                "crop": crop,
                "disease": disease,
                "en_name": en_name,
                "probability": round(top5_probs[i].item() * 100, 1),
                "is_healthy": is_healthy
            })

        return jsonify({
            "success": True,
            "predictions": results
        })

    except Exception as e:
        return jsonify({"error": f"识别失败: {str(e)}"}), 500

@app.route("/api/v1/disease/predict-v2", methods=["POST", "OPTIONS"])
def predict_v2():
    """EfficientNet-B3 模型 (15类, 99.8%准确率)"""
    if request.method == "OPTIONS":
        return "", 204
    if model2 is None:
        return jsonify({"success": False, "error": "EfficientNet-B3 模型未加载"}), 503
    try:
        file = request.files.get("file")
        if not file:
            return jsonify({"success": False, "error": "未上传图片"}), 400
        img = Image.open(io.BytesIO(file.read())).convert("RGB")
        top5_probs, top5_idx = predict_model2(img)
        predictions = []
        for prob, idx in zip(top5_probs, top5_idx):
            if idx < len(model2_classes):
                cls = model2_classes[idx]
                predictions.append({
                    "crop": cls["crop"], "disease": cls["disease"], "probability": round(prob * 100, 1), "is_healthy": "健康" in cls["disease"]
                })
        top = predictions[0]
        return jsonify({
            "success": True, "model": "EfficientNet-B3", "accuracy": "99.84%", "classes": 15,
            "predictions": predictions,
            "top": {"crop": top["crop"], "disease": top["disease"], "probability": top["probability"], "is_healthy": top["is_healthy"]}
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# ===== CORS =====
@app.after_request
def add_cors(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    return response

# ===== 静态文件 =====
@app.route("/")
def index():
    with open(os.path.join(FRONTEND_DIR, "index.html"), "r", encoding="utf-8") as f:
        resp = make_response(f.read())
        resp.headers["Content-Type"] = "text/html; charset=utf-8"
        return resp

@app.route("/<path:filename>")
def serve_static(filename):
    filepath = os.path.join(FRONTEND_DIR, filename)
    if os.path.exists(filepath) and os.path.isfile(filepath):
        return send_from_directory(FRONTEND_DIR, filename)
    return "Not Found", 404


if __name__ == "__main__":
    print("[Inference] 服务启动: http://localhost:8000/api/v1")
    app.run(host="0.0.0.0", port=8000, debug=False)
