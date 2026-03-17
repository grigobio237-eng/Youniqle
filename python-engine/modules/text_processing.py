import google.generativeai as genai
import config
import json

# Configure Gemini
if config.GEMINI_STUDIO_API_KEY:
    genai.configure(api_key=config.GEMINI_STUDIO_API_KEY)

def generate_script(content, style="informative"):
    """
    Generate a video script from content using Google Gemini.
    """
    if not config.GEMINI_STUDIO_API_KEY:
        return {
            "title": "Error: No API Key",
            "description": "Please set GEMINI_STUDIO_API_KEY in .env",
            "full_text": "API key missing.",
            "segments": []
        }

    try:
        # Verified working model name
        print(f"Using API Key: {config.GEMINI_STUDIO_API_KEY[:5]}...Model: gemini-flash-latest")
        model = genai.GenerativeModel('gemini-flash-latest')
        
        prompt = f"""
        You are a professional YouTube script writer.
        Topic/Content: {content}
        Style: {style}
        
        Create a script for a YouTube Short (under 60 seconds).
        
        Output strictly in JSON format with the following structure:
        {{
            "title": "Catchy Title",
            "description": "YouTube Description with hashtags",
            "full_text": "Full spoken script...",
            "segments": [
                {{"text": "Spoken text segment 1", "duration": 3}},
                {{"text": "Spoken text segment 2", "duration": 5}}
            ]
        }}
        """
        
        print("Sending request to Gemini...")
        response = model.generate_content(prompt)
        text_response = response.text
        
        # Clean up code blocks if Gemini returns them
        if text_response.startswith("```json"):
            text_response = text_response.replace("```json", "").replace("```", "")
            
        return json.loads(text_response)

    except Exception as e:
        print(f"Gemini API Error: {e}")
        with open("python-engine/error.log", "a", encoding="utf-8") as f:
            f.write(f"Gemini API Error: {str(e)}\n")
            
        # Fallback mock for testing if API fails
        return {
            "title": "Error generating script",
            "description": "Error",
            "full_text": "Sorry, I could not generate the script.",
            "segments": []
        }
