"""
下载 PlantVillage 数据集
来源: https://github.com/spMohanty/PlantVillage-Dataset
"""
import os, zipfile, shutil
from urllib.request import urlretrieve

# 使用 PlantVillage 整理版 (Kaggle 镜像, 直接有 train/val 分层)
URL = "https://data.mendeley.com/public-files/datasets/tywbtsjrjv/files/d5652a28-c1d8-4b76-97f3-72fb80f94efc/file_downloaded"
ZIP_PATH = "plantvillage.zip"
DATA_DIR = "data/plantvillage"

print("📥 下载 PlantVillage (约 827MB, 取决于网速)...")
urlretrieve(URL, ZIP_PATH)
print(f"✅ 下载完成: {ZIP_PATH}")

print("📦 解压中...")
os.makedirs(DATA_DIR, exist_ok=True)
with zipfile.ZipFile(ZIP_PATH, 'r') as zf:
    zf.extractall(DATA_DIR)

print(f"✅ 解压完成: {DATA_DIR}")

# 清理
os.remove(ZIP_PATH)

# 统计
total = 0
classes = []
for d in os.listdir(DATA_DIR):
    p = os.path.join(DATA_DIR, d)
    if os.path.isdir(p):
        n = len([f for f in os.listdir(p) if f.lower().endswith(('.jpg','.jpeg','.png'))])
        if n > 0:
            classes.append(d)
            total += n
print(f"\n📊 {len(classes)} 个类别, {total} 张图片")
print(f"类别: {classes[:5]}...")
print("\n✅ 准备就绪! 运行: python train.py")
