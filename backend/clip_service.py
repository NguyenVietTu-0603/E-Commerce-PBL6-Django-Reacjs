import torch
from PIL import Image
from transformers import AutoProcessor, CLIPModel

_device = "cuda" if torch.cuda.is_available() else "cpu"
_model = None
_processor = None

def get_model():
    global _model, _processor
    if _model is None:
        _model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32", use_safetensors=True).to(_device)
        _model.eval()
        _processor = AutoProcessor.from_pretrained("openai/clip-vit-base-patch32")
    return _model, _processor, _device

@torch.inference_mode()
def embed_images(paths: list[str]) -> torch.Tensor:
    model, processor, device = get_model()
    pil_images = [Image.open(p).convert("RGB") for p in paths]
    try:
        inputs = processor(images=pil_images, return_tensors="pt").to(device)
        feats = model.get_image_features(**inputs)
        feats = feats / feats.norm(p=2, dim=-1, keepdim=True)
        return feats.detach().cpu()
    finally:
        for im in pil_images:
            try:
                im.close()
            except Exception:
                pass

@torch.inference_mode()
def embed_pil(image: Image.Image) -> torch.Tensor:
    model, processor, device = get_model()
    img = image.convert("RGB")
    inputs = processor(images=[img], return_tensors="pt").to(device)
    feats = model.get_image_features(**inputs)
    feats = feats / feats.norm(p=2, dim=-1, keepdim=True)
    return feats.detach().cpu()[0]