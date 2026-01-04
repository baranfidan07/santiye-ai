import requests
import json

url = "http://127.0.0.1:8000/whatsapp"
payload = {
  "object": "whatsapp_business_account",
  "entry": [
    {
      "id": "33103273479318223",
      "changes": [
        {
          "value": {
            "messaging_product": "whatsapp",
            "messages": [
              {
                "from": "905413847648",
                "text": {
                  "body": "#SANTIYE"
                },
                "type": "text"
              }
            ]
          },
          "field": "messages"
        }
      ]
    }
  ]
}

try:
    print("Sending POST request to localhost...")
    r = requests.post(url, json=payload)
    print(f"Status Code: {r.status_code}")
    print(f"Response: {r.text}")
except Exception as e:
    print(f"Error: {e}")
