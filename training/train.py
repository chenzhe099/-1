"""
植物病害分类训练 — MobileNetV3 + PlantVillage (自动下载)
- 首次运行自动下载数据集 (~830MB)
"""
import json, time
import torch, torch.nn as nn, torch.optim as optim
from tqdm import tqdm
from torch.utils.data import DataLoader, SubsetRandomSampler
from torchvision import transforms, models
import numpy as np

# ===== 配置 =====
BATCH_SIZE = 48
EPOCHS = 30
LR = 0.001
IMAGE_SIZE = 224
VAL_SPLIT = 0.15
SEED = 42
OUT_DIR = "output"

# 用 torchvision 内置 PlantVillage 数据集（自动下载）
from torchvision.datasets import PlantVillage
print("📦 加载 PlantVillage 数据集（首次运行自动下载，约 830MB）...")
full_dataset = PlantVillage(
    root="data",
    split="train",
    transform=transforms.Compose([
        transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
        transforms.ToTensor(),
    ]),
    download=True,
)

class_names = full_dataset.classes
print(f" 类别: {len(class_names)} 种")
for i, name in enumerate(class_names):
    print(f"  {i+1:2d}. {name}")

# 分层划分训练/验证集
np.random.seed(SEED)
indices = np.random.permutation(len(full_dataset))
val_size = int(len(full_dataset) * VAL_SPLIT)
train_idx, val_idx = indices[val_size:], indices[:val_size]

# 数据增强
train_transform = transforms.Compose([
    transforms.RandomResizedCrop(IMAGE_SIZE, scale=(0.7, 1.0)),
    transforms.RandomHorizontalFlip(0.5),
    transforms.RandomRotation(15),
    transforms.ColorJitter(0.2, 0.2, 0.2),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
])
val_transform = transforms.Compose([
    transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
])

class TransformedSubset(torch.utils.data.Dataset):
    def __init__(self, dataset, indices, transform):
        self.dataset = dataset
        self.indices = indices
        self.transform = transform
    def __len__(self): return len(self.indices)
    def __getitem__(self, i):
        img, label = self.dataset[self.indices[i]]
        return self.transform(img), label

train_dataset = TransformedSubset(full_dataset, train_idx, train_transform)
val_dataset = TransformedSubset(full_dataset, val_idx, val_transform)

train_loader = DataLoader(train_dataset, BATCH_SIZE, shuffle=True, num_workers=4, pin_memory=True)
val_loader = DataLoader(val_dataset, BATCH_SIZE, num_workers=4, pin_memory=True)

print(f" 训练: {len(train_dataset)} 张 | 验证: {len(val_dataset)} 张\n")

# ===== 模型 =====
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"🔧 设备: {device}")
model = models.mobilenet_v3_small(weights=models.MobileNet_V3_Small_Weights.IMAGENET1K_V1)
model.classifier[-1] = nn.Linear(model.classifier[-1].in_features, len(class_names))
model = model.to(device)

criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(model.parameters(), lr=LR)
scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=EPOCHS)

# 保存类别
import os; os.makedirs(OUT_DIR, exist_ok=True)
with open(f"{OUT_DIR}/class_names.json", "w", encoding="utf-8") as f:
    json.dump(class_names, f, ensure_ascii=False, indent=2)

# ===== 训练 =====
print(f"🚀 开始训练 ({EPOCHS} epochs)...")
best_acc, total_time = 0.0, 0
for epoch in range(EPOCHS):
    t0 = time.time()
    model.train()
    tl, tc = 0, 0
    pbar = tqdm(train_loader, desc=f"Ep {epoch+1}/{EPOCHS} [训练]", leave=False, ncols=100)
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
    pbar_v = tqdm(val_loader, desc=f"Ep {epoch+1}/{EPOCHS} [验证]", leave=False, ncols=100)
    with torch.no_grad():
        for img, lbl in pbar_v:
            img, lbl = img.to(device), lbl.to(device)
            out = model(img)
            vl += criterion(out, lbl).item()
            vc += (out.argmax(1) == lbl).sum().item()

    scheduler.step()
    dt = time.time() - t0
    total_time += dt
    ta = 100 * tc / len(train_dataset)
    va = 100 * vc / len(val_dataset)
    print(f"Ep {epoch+1:2d} | loss {tl/len(train_loader):.3f}→{vl/len(val_loader):.3f} | "
          f"acc {ta:.1f}%→{va:.1f}% | {dt:.0f}s")

    if va > best_acc:
        best_acc = va
        torch.save(model.state_dict(), f"{OUT_DIR}/plant_disease_model.pth")
        print(f"  ✅ 最佳: {va:.1f}%")

print(f"\n✅ 完成! 最佳准确率: {best_acc:.1f}% | 用时: {total_time/60:.0f}min")
print(f"📁 {OUT_DIR}/plant_disease_model.pth")
