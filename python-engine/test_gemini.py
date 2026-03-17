import sys
import os

# Add python-engine directory to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from modules import text_processing
    import google.generativeai as genai
    import config
    
    print(f"Testing Gemini API...")
    print(f"API Key present: {bool(config.GEMINI_STUDIO_API_KEY)}")
    if config.GEMINI_STUDIO_API_KEY:
        print(f"API Key prefix: {config.GEMINI_STUDIO_API_KEY[:4]}****")
    
    # Try with a different model name found in the list
    model_name = 'gemini-flash-latest' 
    print(f"Using model: {model_name}")
    
    # Note: text_processing.py uses the model name hardcoded, so we need to test raw generation here or modify the file first.
    # Let's test raw generation first to confirm the model name works.
    model = genai.GenerativeModel(model_name)
    response = model.generate_content("Hello, can you generate a script?")
    print("\nResult:")
    print(response.text)


except Exception as e:
    print(f"\nTest Script Error: {e}")
