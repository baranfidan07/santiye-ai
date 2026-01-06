
import os
import cv2
import json
import torch
import time
from datetime import datetime
from PIL import Image
from transformers import Qwen2_5_VLForConditionalGeneration, AutoProcessor

# === CONFIGURATION ===
# Use a local video file for demo (Mocks RTSP Camera)
VIDEO_SOURCE = "santiye_demo.mp4" 
# Process 1 frame every X seconds
FRAME_INTERVAL = 10 
# Model ID (Qwen 2.5 VL)
MODEL_ID = "Qwen/Qwen2.5-VL-7B-Instruct"

print("👁️ SANTIYE EYE - Initializing...")
print(f"🔧 Device: {torch.cuda.get_device_name(0) if torch.cuda.is_available() else 'CPU'}")

# 1. Load Model (4-bit Quantization for RTX 4060)
try:
    print("⏳ Loading Qwen2.5-VL (Int4)... This may take time first run.")
    model = Qwen2_5_VLForConditionalGeneration.from_pretrained(
        MODEL_ID,
        torch_dtype=torch.float16,
        attn_implementation="flash_attention_2",
        device_map="auto",
        load_in_4bit=True  # Key for 8GB VRAM
    )
    processor = AutoProcessor.from_pretrained(MODEL_ID)
    print("✅ Model Loaded Successfully!")
except Exception as e:
    print(f"❌ Error Loading Model: {e}")
    print("Tip: Install bitsandbytes and flash-attn.")
    exit()

# 2. Vision Analysis Function
def analyze_frame(frame_image):
    prompt = "Describe this construction site scene. List any safety violations (no helmet, no vest) and heavy machinery operating."
    
    messages = [
        {
            "role": "user",
            "content": [
                {"type": "image", "image": frame_image},
                {"type": "text", "text": prompt},
            ],
        }
    ]
    
    # Prepare Inputs
    text = processor.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
    image_inputs, video_inputs = process_vision_info(messages)
    inputs = processor(
        text=[text],
        images=image_inputs,
        videos=video_inputs,
        padding=True,
        return_tensors="pt",
    )
    inputs = inputs.to("cuda")

    # Generate
    generated_ids = model.generate(**inputs, max_new_tokens=128)
    generated_ids_trimmed = [
        out_ids[len(in_ids) :] for in_ids, out_ids in zip(inputs.input_ids, generated_ids)
    ]
    output_text = processor.batch_decode(
        generated_ids_trimmed, skip_special_tokens=True, clean_up_tokenization_spaces=False
    )
    return output_text[0]

# 3. Main Loop (Mock Camera)
cap = cv2.VideoCapture(VIDEO_SOURCE)
last_process_time = 0

print(f"🎥 Starting Surveillance on: {VIDEO_SOURCE}")

while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        print("🔁 Video ended, looping...")
        cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
        continue

    current_time = time.time()
    
    # Process every X seconds
    if current_time - last_process_time > FRAME_INTERVAL:
        last_process_time = current_time
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        print(f"📸 Capturing Frame at {timestamp}...")
        
        # Convert CV2 (BGR) to PIL (RGB)
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        pil_image = Image.fromarray(rgb_frame)
        
        # AI Analysis
        try:
            report = analyze_frame(pil_image)
            
            # Log Structure
            log_entry = {
                "timestamp": timestamp,
                "camera_id": "CAM_01_MainGate",
                "ai_report": report
            }
            
            print(f"🤖 AI REPORT: {report}")
            
            # Append to Local Log (JSONL)
            with open("site_logs.jsonl", "a", encoding="utf-8") as f:
                f.write(json.dumps(log_entry) + "\n")
                
        except Exception as e:
            print(f"⚠️ Analysis Failed: {e}")

    # Display Feed (Optional)
    cv2.imshow('Santiye Eye (Monitoring)', frame)
    
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
