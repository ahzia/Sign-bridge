import requests
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_translate_signwriting():
    backend_url = os.getenv("BACKEND_URL", "http://127.0.0.1:8000")
    url = f"{backend_url}/translate_signwriting"
    text = "My name is John."

    response = requests.post(url, json={"text": text})
    print("Status Code:", response.status_code)
    try:
        print("Response JSON:", response.json())
    except Exception as e:
        print("Failed to parse JSON response:", e)
        print("Response text:", response.text)

if __name__ == "__main__":
    test_translate_signwriting()
