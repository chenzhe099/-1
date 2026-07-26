"""
植物病害分类训练脚本 — MobileNetV3-Small + PlantVillage
- GPU: RTX 4060 8GB (CUDA)
- 模型输出: models/plant_disease_model.pth
- 类别映射: models/class_names.json
"""
import os, json, time
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, random_split
from torchvision import datasets, transforms, models

# ===== 配置 =====
DATA_DIR = "data/plantvillage"          # 解压后的数据集目录
OUT_DIR = "output"
BATCH_SIZE = 64                         # RTX 4060 8GB 推荐 64-128
EPOCHS = 30
LEARNING_RATE = 0.001
IMAGE_SIZE = 224
NUM_WORKERS = 4
VAL_SPLIT = 0.15

os.makedirs(OUT_DIR, exist_ok=True)
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"🔧 使用设备: {device}")

# ===== 数据预处理 =====
train_transform = transforms.Compose([
    transforms.RandomResizedCrop(IMAGE_SIZE, scale=(0.7, 1.0)),
    transforms.RandomHorizontalFlip(p=0.5),
    transforms.RandomRotation(15),
    transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
])

val_transform = transforms.Compose([
    transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
])

# ===== 加载数据 =====
print("📦 加载数据集...")
full_dataset = datasets.ImageFolder(DATA_DIR, transform=train_transform)
val_size = int(len(full_dataset) * VAL_SPLIT)
train_size = len(full_dataset) - val_size
train_dataset, val_dataset = random_split(full_dataset, [train_size, val_size])
val_dataset.dataset.transform = val_transform  # 验证集用无增强的 transform

train_loader = DataLoader(train_dataset, BATCH_SIZE, shuffle=True, num_workers=NUM_WORKERS, pin_memory=True)
val_loader = DataLoader(val_dataset, BATCH_SIZE, shuffle=False, num_workers=NUM_WORKERS, pin_memory=True)

class_names = full_dataset.classes
print(f" 类别数: {len(class_names)}")
print(f" 训练集: {train_size} 张")
print(f" 验证集: {val_size} 张")

with open(f"{OUT_DIR}/class_names.json", "w", encoding="utf-8") as f:
    json.dump(class_names, f, ensure_ascii=False, indent=2)

# ===== 模型 =====
model = models.mobilenet_v3_small(weights=models.MobileNet_V3_Small_Weights.IMAGENET1K_V1)
model.classifier[-1] = nn.Linear(model.classifier[-1].in_features, len(class_names))
model = model.to(device)

criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(model.parameters(), lr=LEARNING_RATE)
scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=EPOCHS)

# ===== 训练 =====
print(f"\n🚀 开始训练 ({EPOCHS} epochs)...")
best_acc = 0.0
total_time = 0
for epoch in range(EPOCHS):
    t0 = time.time()
    model.train()
    train_loss, train_correct = 0, 0
    for images, labels in train_loader:
        images, labels = images.to(device), labels.to(device)
        optimizer.zero_grad()
        outputs = model(images)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()
        train_loss += loss.item()
        train_correct += (outputs.argmax(1) == labels).sum().item()

    # 验证
    model.eval()
    val_loss, val_correct = 0, 0
    with torch.no_grad():
        for images, labels in val_loader:
            images, labels = images.to(device), labels.to(device)
            outputs = model(images)
            val_loss += criterion(outputs, labels).item()
            val_correct += (outputs.argmax(1) == labels).sum().item()

    scheduler.step()
    elapsed = time.time() - t0
    total_time += elapsed
    train_acc = 100 * train_correct / train_size
    val_acc = 100 * val_correct / val_size

    print(f"Epoch {epoch+1:2d}/{EPOCHS} | "
          f"train: {train_loss/len(train_loader):.3f} {train_acc:.1f}% | "
          f"val: {val_loss/len(val_loader):.3f} {val_acc:.1f}% | {elapsed:.0f}s")

    if val_acc > best_acc:
        best_acc = val_acc
        torch.save(model.state_dict(), f"{OUT_DIR}/plant_disease_model.pth")
        print(f"  ✅ 保存最佳模型 (val_acc={val_acc:.1f}%)")

print(f"\n✅ 训练完成! 最佳准确率: {best_acc:.1f}% | 总用时: {total_time:.0f}s ({total_time/60:.1f}min)")
print(f"模型: {OUT_DIR}/plant_disease_model.pth")
print(f"类别: {OUT_DIR}/class_names.json")
