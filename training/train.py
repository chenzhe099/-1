"""
植物病害分类训练 — 一键运行
- 自动下载 PlantVillage 数据集 (ModelScope 国内镜像)
- MobileNetV3-Small + CUDA 训练
"""
import json, time, os, zipfile, shutil
import torch, torch.nn as nn, torch.optim as optim
import numpy as np
from tqdm import tqdm
from torch.utils.data import DataLoader, Dataset, Subset
from torchvision import transforms, models
from PIL import Image

# ===== 配置 =====
BATCH_SIZE = 48
EPOCHS = 30
LR = 0.001
IMAGE_SIZE = 224
VAL_SPLIT = 0.15
SEED = 42
OUT_DIR = "output"
DATA_DIR = "data/plantvillage"

# ===== 下载数据集 =====
#
# 手动下载地址（任选一个）：
#  https://zenodo.org/records/15519919/files/plant-disease.zip          (1.4GB, 国际)
#  https://data.mendeley.com/datasets/tywbtsjrjv/1                     (国际)
#  https://www.kaggle.com/datasets/emmarex/plantdisease/download        (需翻墙)
#
# 下载后放到 training/ 目录下，命名为 plant_disease_dataset.zip，脚本会自动解压。
# 或者把已解压的类别文件夹放到 training/data/plantvillage/ 下。
#
ZIP_FILE = "plant_disease_dataset.zip"

os.makedirs(DATA_DIR, exist_ok=True)
if not os.listdir(DATA_DIR) and os.path.exists(ZIP_FILE):
    print(f"📦 解压 {ZIP_FILE}...")
    with zipfile.ZipFile(ZIP_FILE, 'r') as zf:
        zf.extractall(DATA_DIR)
    print(f"✅ 已解压到: {DATA_DIR}")
elif not os.listdir(DATA_DIR):
    print(f"⚠️  请手动下载 PlantVillage 数据集")
    print(f"   地址: https://zenodo.org/records/15519919/files/plant-disease.zip")
    print(f"   放到: {os.path.abspath(ZIP_FILE)}")
    print(f"   然后重新运行 python train.py")
    exit(1)

# ===== 扫描图片 =====
images, labels = [], []
classes = sorted([d for d in os.listdir(DATA_DIR) if os.path.isdir(os.path.join(DATA_DIR, d))])
class_to_idx = {c: i for i, c in enumerate(classes)}
for cls in classes:
    cls_dir = os.path.join(DATA_DIR, cls)
    for fname in os.listdir(cls_dir):
        if fname.lower().endswith(('.jpg', '.jpeg', '.png')):
            images.append(os.path.join(cls_dir, fname))
            labels.append(class_to_idx[cls])

print(f"📊 {len(classes)} 个类别, {len(images)} 张图片")
for i, c in enumerate(classes):
    cnt = labels.count(i)
    print(f"  {i+1:2d}. {c}: {cnt} 张")

np.random.seed(SEED)
indices = np.random.permutation(len(images))
val_n = int(len(images) * VAL_SPLIT)
train_idx, val_idx = indices[val_n:], indices[:val_n]

# ===== 数据集 =====
train_tf = transforms.Compose([
    transforms.RandomResizedCrop(IMAGE_SIZE, scale=(0.7, 1.0)),
    transforms.RandomHorizontalFlip(0.5),
    transforms.RandomRotation(15),
    transforms.ColorJitter(0.2, 0.2, 0.2),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
])
val_tf = transforms.Compose([
    transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
])

class ImgDataset(Dataset):
    def __init__(self, imgs, labels, transform):
        self.imgs, self.labels, self.transform = imgs, labels, transform
    def __len__(self): return len(self.imgs)
    def __getitem__(self, i):
        return self.transform(Image.open(self.imgs[i]).convert("RGB")), self.labels[i]

train_ds = ImgDataset([images[i] for i in train_idx], [labels[i] for i in train_idx], train_tf)
val_ds = ImgDataset([images[i] for i in val_idx], [labels[i] for i in val_idx], val_tf)

train_loader = DataLoader(train_ds, BATCH_SIZE, shuffle=True, num_workers=4, pin_memory=True)
val_loader = DataLoader(val_ds, BATCH_SIZE, num_workers=4, pin_memory=True)
print(f" 训练: {len(train_ds)} | 验证: {len(val_ds)}")

# ===== 模型 =====
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"\n🔧 设备: {device}")
model = models.mobilenet_v3_small(weights=models.MobileNet_V3_Small_Weights.IMAGENET1K_V1)
model.classifier[-1] = nn.Linear(model.classifier[-1].in_features, len(classes))
model = model.to(device)

criterion = nn.CrossEntropyLoss()
optimizer = optim.AdamW(model.parameters(), lr=LR, weight_decay=1e-4)
scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=EPOCHS)

os.makedirs(OUT_DIR, exist_ok=True)
with open(f"{OUT_DIR}/class_names.json", "w", encoding="utf-8") as f:
    json.dump(classes, f, ensure_ascii=False, indent=2)

# ===== 训练 =====
print(f"\n🚀 开始训练 ({EPOCHS} epochs)...")
best_acc = 0.0
for epoch in range(EPOCHS):
    model.train()
    tl, tc = 0, 0
    pbar = tqdm(train_loader, desc=f"Ep{epoch+1}/{EPOCHS} 训练", leave=False, ncols=100)
    for img, lbl in pbar:
        img, lbl = img.to(device), lbl.to(device)
        optimizer.zero_grad()
        out = model(img)
        loss = criterion(out, lbl)
        loss.backward()
        optimizer.step()
        tl += loss.item()
        tc += (out.argmax(1) == lbl).sum().item()
        pbar.set_postfix(loss=f"{loss.item():.3f}")

    model.eval()
    vl, vc = 0, 0
    pbar_v = tqdm(val_loader, desc=f"Ep{epoch+1}/{EPOCHS} 验证", leave=False, ncols=100)
    with torch.no_grad():
        for img, lbl in pbar_v:
            img, lbl = img.to(device), lbl.to(device)
            out = model(img)
            vl += criterion(out, lbl).item()
            vc += (out.argmax(1) == lbl).sum().item()

    scheduler.step()
    ta, va = 100*tc/len(train_ds), 100*vc/len(val_ds)
    print(f"Ep{epoch+1:2d} | loss {tl/len(train_loader):.3f}→{vl/len(val_loader):.3f} | "
          f"acc {ta:.1f}%→{va:.1f}%")

    if va > best_acc:
        best_acc = va
        torch.save(model.state_dict(), f"{OUT_DIR}/plant_disease_model.pth")
        print(f"  ✅ 最佳: {va:.1f}%")

t = time.time() - __import__('time').time() if 't0' in dir() else 0
print(f"\n✅ 完成! 最佳准确率: {best_acc:.1f}%")
print(f"📁 {OUT_DIR}/plant_disease_model.pth")
print(f"📁 {OUT_DIR}/class_names.json")
