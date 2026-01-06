from transformers import pipeline
import torch

print("Attempting to load Qwen/Qwen3-VL-8B-Instruct via pipeline...")

try:
    pipe = pipeline(
        "image-text-to-text", 
        model="Qwen/Qwen3-VL-8B-Instruct",
        torch_dtype=torch.float16,
        device_map="auto",
        trust_remote_code=True
    )

    messages = [
        {
            "role": "user",
            "content": [
                {"type": "image", "url": "https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/p-blog/candy.JPG"},
                {"type": "text", "text": "What animal is on the candy?"}
            ]
        },
    ]

    print("Model loaded! Running inference...")
    result = pipe(text=messages, max_new_tokens=100)
    print("Result:", result)

except Exception as e:
    print("\nFAILED:")
    print(e)
