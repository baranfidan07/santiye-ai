import requests
import time
from datetime import datetime

# URL of your Santiye AI Backend
# If running locally for testing: http://localhost:8000
# If deployed (Render/Heroku): https://your-app-name.onrender.com
TARGET_URL = "http://localhost:8000" 

print(f"🔄 Keep-Alive System Started!")
print(f"Target: {TARGET_URL}")
print("Press Ctrl+C to stop.")

while True:
    try:
        response = requests.get(TARGET_URL)
        now = datetime.now().strftime("%H:%M:%S")
        
        if response.status_code == 200:
            print(f"[{now}] ✅ Ping Successful! Server is Awake. (Response: {response.json()})")
        else:
            print(f"[{now}] ⚠️ Server returned status: {response.status_code}")
            
    except Exception as e:
        print(f"[{now}] ❌ Error contacting server: {e}")
        
    # Wait for 10 minutes (600 seconds)
    # Most free tiers sleep after 15 mins inactivity.
    time.sleep(600)
