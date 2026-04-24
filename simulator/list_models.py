import os
from dotenv import load_dotenv
from google.generativeai import GenerativeModel, list_models, configure

load_dotenv()
API_KEY = os.environ.get("GEMINI_API_KEY")
configure(api_key=API_KEY)

print("Listing available models for this key...")
try:
    for m in list_models():
        if 'generateContent' in m.supported_generation_methods:
            print(f"Model: {m.name}")
except Exception as e:
    print(f"Error: {e}")
