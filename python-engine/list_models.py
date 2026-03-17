import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import google.generativeai as genai
import config

try:
    if config.GEMINI_STUDIO_API_KEY:
        genai.configure(api_key=config.GEMINI_STUDIO_API_KEY)
        print("API Key configured.")
        
        print("Listing available models:")
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                print(m.name)
        
    else:
        print("No API Key found.")

except Exception as e:
    print(f"Error: {e}")
