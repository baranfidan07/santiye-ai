"""
Qwen3-VL Construction Safety Analyzer
Uses Hugging Face Pipeline with 4-bit quantization
"""

import torch
from transformers import pipeline, BitsAndBytesConfig
from PIL import Image
import os

print("=" * 50)
print("QWEN3-VL SAFETY ANALYZER (PIPELINE)")
print("=" * 50)

# Model ID
MODEL_ID = "Qwen/Qwen3-VL-8B-Instruct"

# 4-bit quantization for RTX 4060 (8GB VRAM)
bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_compute_dtype=torch.float16,
    bnb_4bit_quant_type="nf4",
    bnb_4bit_use_double_quant=True
)

print(f"Loading model: {MODEL_ID}")
print("Mode: Pipeline with 4-bit quantization")

try:
    # Initialize pipeline with quantization
    pipe = pipeline(
        "image-text-to-text",
        model=MODEL_ID,
        model_kwargs={
            "quantization_config": bnb_config, 
            "device_map": "auto"
        },
        trust_remote_code=True
    )
    print("✅ Pipeline loaded successfully!")
except Exception as e:
    print(f"❌ Pipeline creation failed: {e}")
    exit()

# Load image
image_path = "backend/edge_eye/santiye_test.jpg"
if not os.path.exists(image_path):
    image_path = "santiye_test.jpg"

if not os.path.exists(image_path):
    print(f"❌ Image not found: {image_path}")
    exit()

img = Image.open(image_path).convert("RGB")

# Resize for better performance (optional, keeping it safe)
MAX_SIZE = 1024 # Qwen3 handles larger res better, bumped from 640
if max(img.size) > MAX_SIZE:
    ratio = MAX_SIZE / max(img.size)
    new_size = (int(img.width * ratio), int(img.height * ratio))
    img = img.resize(new_size, Image.Resampling.LANCZOS)
    print(f"Image resized to {new_size}")

# Prompt
messages = [
    {
        "role": "user",
        "content": [
            {"type": "image", "image": img},
            {"type": "text", "text": """Analyze this construction site image for safety compliance.

Count and report:
1. Total number of workers visible
2. Number of workers wearing hard hats (helmets)
3. Number of workers NOT wearing hard hats

Provide the counts as numbers."""}
        ]
    }
]

print("Analyzing image...")

# Run inference
# Pipeline handles processing automatically
output = pipe(text=messages, max_new_tokens=256)

print("\n" + "=" * 50)
print("SAFETY ANALYSIS RESULT:")
print("=" * 50)
# Output format from pipeline for VLM is usually a list of dicts with 'generated_text'
print(output)
