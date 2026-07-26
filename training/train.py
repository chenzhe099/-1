"""
植物病害分类 — MobileNetV3-Small + PlantVillage (GPU)
"""
import json, os
import torch, torch.nn as nn, torch.optim as optim
import numpy as np
from tqdm import tqdm
from torch.utils.data import DataLoader, Dataset
from torchvision import transforms, models
from PIL import Image

BATCH_SIZE = 24
EPOCHS = 30
LR = 0.001
IMAGE_SIZE = 224
OUT_DIR = "output"
DATA_DIR = "plant_disease_dataset"

# ===== 扫描图片 =====
def scan_images(base_dir):
    imgs, lbls = [], []
    classes = sorted(d for d in os.listdir(base_dir) if os.path.isdir(os.path.join(base_dir, d)) and not d.startswith('.'))
    for cls in classes:
        cls_dir = os.path.join(base_dir, cls)
        for f in os.listdir(cls_dir):
            if f.lower().endswith(('.jpg', '.jpeg', '.png')):
                imgs.append(os.path.join(cls_dir, f))
                lbls.append(cls)
    return imgs, lbls, classes

train_images, train_labels, class_names = scan_images(os.path.join(DATA_DIR, "train"))
val_images, val_labels, _ = scan_images(os.path.join(DATA_DIR, "valid"))
class_to_idx = {c: i for i, c in enumerate(class_names)}
train_lbl = [class_to_idx[l] for l in train_labels]
val_lbl = [class_to_idx[l] for l in val_labels]

print(f"  类别: {len(class_names)} | 训练: {len(train_images)} 张 | 验证: {len(val_images)} 张")

# ===== 数据预处理 =====
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

if __name__ == '__main__':
    train_ds = ImgDataset(train_images, train_lbl, train_tf)
    val_ds = ImgDataset(val_images, val_lbl, val_tf)
    train_loader = DataLoader(train_ds, BATCH_SIZE, shuffle=True, num_workers=2, pin_memory=True)
    val_loader = DataLoader(val_ds, BATCH_SIZE, num_workers=2, pin_memory=True)
    print(f"  DataLoader: train={len(train_loader)} batches, val={len(val_loader)} batches")

    # ===== 模型 =====
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"  设备: {device}")
    model = models.mobilenet_v3_small(weights=models.MobileNet_V3_Small_Weights.IMAGENET1K_V1)
    model.classifier[-1] = nn.Linear(model.classifier[-1].in_features, len(class_names))
    model = model.to(device)

    criterion = nn.CrossEntropyLoss()
    optimizer = optim.AdamW(model.parameters(), lr=LR, weight_decay=1e-4)
    scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=EPOCHS)

    os.makedirs(OUT_DIR, exist_ok=True)
    with open(f"{OUT_DIR}/class_names.json", "w", encoding="utf-8") as f:
        json.dump(class_names, f, ensure_ascii=False, indent=2)

    # ===== 训练 =====
    print(f"\n开始训练 ({EPOCHS} epochs)...")
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
        print(f"Ep{epoch+1:2d} | loss {tl/len(train_loader):.3f}->{vl/len(val_loader):.3f} | acc {ta:.1f}%->{va:.1f}%")
        if va > best_acc:
            best_acc = va
            torch.save(model.state_dict(), f"{OUT_DIR}/plant_disease_model.pth")
            print(f"  save best: {va:.1f}%")

    print(f"\nFinished. Best accuracy: {best_acc:.1f}%")
