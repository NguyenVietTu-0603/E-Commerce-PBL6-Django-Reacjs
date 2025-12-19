import torch
import torch.nn as nn
from PIL import Image
from torchvision import transforms
from pathlib import Path

_device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
_model = None
_class_names = [
    'backpack', 'belts', 'boots', 'dresses', 'eyewears', 'handbags', 'hatcap', 
    'jackets', 'jeans', 'perfume', 'phones', 'shirts', 'shorts', 'skirts', 
    'slides', 'sneakers', 'wallets', 'watch'
]

# Định nghĩa kiến trúc ResNet giống với training
class BasicBlock(nn.Module):
    expansion = 1
    def __init__(self, in_planes, planes, stride=1):
        super(BasicBlock, self).__init__()
        self.conv1 = nn.Conv2d(in_planes, planes, kernel_size=3, stride=stride, padding=1, bias=False)
        self.bn1 = nn.BatchNorm2d(planes)
        self.conv2 = nn.Conv2d(planes, planes, kernel_size=3, stride=1, padding=1, bias=False)
        self.bn2 = nn.BatchNorm2d(planes)
        self.shortcut = nn.Sequential()
        if stride != 1 or in_planes != self.expansion*planes:
            self.shortcut = nn.Sequential(
                nn.Conv2d(in_planes, self.expansion*planes, kernel_size=1, stride=stride, bias=False),
                nn.BatchNorm2d(self.expansion*planes)
            )

    def forward(self, x):
        out = torch.relu(self.bn1(self.conv1(x)))
        out = self.bn2(self.conv2(out))
        out += self.shortcut(x)
        out = torch.relu(out)
        return out

class ResNet(nn.Module):
    def __init__(self, block, num_blocks, num_classes=18):
        super(ResNet, self).__init__()
        self.in_planes = 64
        
        self.conv1 = nn.Conv2d(3, 64, kernel_size=7, stride=2, padding=3, bias=False)
        self.bn1 = nn.BatchNorm2d(64)
        self.maxpool = nn.MaxPool2d(kernel_size=3, stride=2, padding=1)
        
        self.layer1 = self._make_layer(block, 64, num_blocks[0], stride=1)
        self.layer2 = self._make_layer(block, 128, num_blocks[1], stride=2)
        self.layer3 = self._make_layer(block, 256, num_blocks[2], stride=2)
        self.layer4 = self._make_layer(block, 512, num_blocks[3], stride=2)
        
        self.avgpool = nn.AdaptiveAvgPool2d((1, 1))
        self.dropout = nn.Dropout(p=0.5)
        self.fc = nn.Linear(512*block.expansion, num_classes)

    def _make_layer(self, block, planes, num_blocks, stride):
        strides = [stride] + [1]*(num_blocks-1)
        layers = []
        for stride in strides:
            layers.append(block(self.in_planes, planes, stride))
            self.in_planes = planes * block.expansion
        return nn.Sequential(*layers)

    def forward(self, x):
        out = torch.relu(self.bn1(self.conv1(x)))
        out = self.maxpool(out)
        out = self.layer1(out)
        out = self.layer2(out)
        out = self.layer3(out)
        out = self.layer4(out)
        out = self.avgpool(out)
        out = out.view(out.size(0), -1)
        out = self.dropout(out)
        out = self.fc(out)
        return out

def ResNet18(num_classes):
    return ResNet(BasicBlock, [2, 2, 2, 2], num_classes=num_classes)

def get_model():
    """Load model ResNet18 đã train"""
    global _model
    if _model is None:
        model_path = Path(__file__).parent / 'best_model_resnet.pth'
        if not model_path.exists():
            raise FileNotFoundError(f"Không tìm thấy model tại {model_path}")
        
        _model = ResNet18(num_classes=len(_class_names)).to(_device)
        _model.load_state_dict(torch.load(model_path, map_location=_device))
        _model.eval()
        print(f"✅ Loaded ResNet18 model from {model_path}")
    
    return _model

def get_transform():
    """Transform để xử lý ảnh đầu vào"""
    return transforms.Compose([
        transforms.Resize((256, 256)),
        transforms.CenterCrop(224),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])

@torch.inference_mode()
def classify_image(image: Image.Image) -> str:
    """
    Phân loại ảnh và trả về tên class
    
    Args:
        image: PIL Image object
        
    Returns:
        str: Tên class (ví dụ: 'backpack', 'shoes', etc.)
    """
    model = get_model()
    transform = get_transform()
    
    # Chuyển đổi ảnh
    img = image.convert("RGB")
    img_tensor = transform(img).unsqueeze(0).to(_device)
    
    # Dự đoán
    output = model(img_tensor)
    _, predicted_idx = torch.max(output, 1)
    
    class_name = _class_names[predicted_idx.item()]
    return class_name

def get_class_names():
    """Trả về danh sách tất cả các class"""
    return _class_names.copy()
