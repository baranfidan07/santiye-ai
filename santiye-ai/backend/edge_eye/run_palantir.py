
import sys
import os

# === PATH HACK ===
# Add the cloned folder directly to Python path to bypass "pip install" errors
current_dir = os.path.dirname(os.path.abspath(__file__))
deepseek_path = os.path.join(current_dir, "DeepSeek-VL2")
sys.path.append(deepseek_path)
# =================

import torch
from transformers import AutoModelForCausalLM
try:
    from deepseek_vl2.models import DeepseekVLV2ForCausalLM, DeepseekVLV2Processor
    from PIL import Image
except ImportError as e:
    import traceback
    print(f"Kutuphane Yukleme Hatasi (Detayli): {e}")
    # traceback.print_exc()
    print("Kutuphane bulunamadi! 'deepseek_vl2' klasoru 'backend/edge_eye/DeepSeek-VL2' icinde mi?")
    print(f"Aranan Yol: {deepseek_path}")
    exit()

print("PALANTIR SYSTEM STARTING...")

# 1. Model ve Processor'ı Yükle
model_path = "deepseek-ai/deepseek-vl2-tiny"
try:
    processor = DeepseekVLV2Processor.from_pretrained(model_path)
    model = DeepseekVLV2ForCausalLM.from_pretrained(
        model_path, 
        trust_remote_code=True,
        torch_dtype=torch.float16,
        device_map="auto"
    )
    # model.to("cuda") # device_map="auto" handles this automatically
except Exception as e:
    print(f"Kutuphane Hatasi: {repr(e)}")
    print("Lutfen eksik paketleri yukle: 'pip install timm attrdict einops sentencepiece'")
    exit()

print("✅ Model Loaded!")

# 2. Goruntuyu ve Komutu (Prompt) Hazirla
image_path = "backend/edge_eye/santiye_test.jpg"

if not os.path.exists(image_path):
    # Try local path if running from inside folder
    image_path = "santiye_test.jpg"

if not os.path.exists(image_path):
    print(f"HATA: Resim bulunamadi! 'santiye_test.jpg' dosyasi 'backend/edge_eye' klasorune atilmali.")
    print(f"Aranan yollar: backend/edge_eye/santiye_test.jpg veya ./santiye_test.jpg")
    exit()

img = Image.open(image_path).convert("RGB")

# Resize large images for better VLM performance (max 640x480)
MAX_WIDTH = 640
MAX_HEIGHT = 480
if img.width > MAX_WIDTH or img.height > MAX_HEIGHT:
    ratio = min(MAX_WIDTH / img.width, MAX_HEIGHT / img.height)
    new_size = (int(img.width * ratio), int(img.height * ratio))
    img = img.resize(new_size, Image.Resampling.LANCZOS)
    print(f"Image resized from {Image.open(image_path).size} to {new_size}")

images = [img]

# Optimized prompt based on DeepSeek-VL2 best practices:
# TEST 8: Positive framing (what they ARE wearing)
prompt = """<image>
Look at the construction workers. Count how many are wearing white hard hats and how many have no hard hat."""

# 3. Modeli Çalıştır (Inference)
prepare_inputs = processor(
    prompt=prompt,
    images=images,
    force_batchify=True
).to(device="cuda", dtype=torch.float16)

inputs_embeds = model.prepare_inputs_embeds(**prepare_inputs)

print("Analyzing...")

outputs = model.generate(
    inputs_embeds=inputs_embeds,
    max_new_tokens=512,
    do_sample=False,
    bos_token_id=processor.tokenizer.bos_token_id,
    eos_token_id=processor.tokenizer.eos_token_id,
    pad_token_id=processor.tokenizer.pad_token_id
)

answer = processor.tokenizer.decode(outputs[0], skip_special_tokens=True)
print(f"Palantir Yaniti: {answer}")
