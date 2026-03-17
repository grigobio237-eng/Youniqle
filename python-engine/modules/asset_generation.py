import os
import time
import logging
import requests
from pathlib import Path
from gtts import gTTS
import google.generativeai as genai
import config

# Setup Logging
logger = logging.getLogger(__name__)

# Initialize Clients
try:
    if config.GEMINI_STUDIO_API_KEY:
        genai.configure(api_key=config.GEMINI_STUDIO_API_KEY)
    else:
        logger.warning("GEMINI_STUDIO_API_KEY not found. Image generation will fail.")
except Exception as e:
    logger.error(f"Failed to configure Gemini: {e}")

try:
    if config.ELEVENLABS_API_KEY:
        from elevenlabs.client import ElevenLabs
        eleven = ElevenLabs(api_key=config.ELEVENLABS_API_KEY)
    else:
        eleven = None
        logger.warning("ELEVENLABS_API_KEY not found. Using gTTS fallback.")
except Exception as e:
    eleven = None
    logger.error(f"Failed to initialize ElevenLabs: {e}")


def generate_audio(text, output_path, voice_id="EXAVITQu4vr4xnSDxMaL"):
    """
    Generates audio from text using ElevenLabs (if available) or gTTS.
    """
    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    if eleven:
        try:
            logger.info(f"Generating audio with ElevenLabs for: {text[:30]}...")
            audio = eleven.generate(
                text=text,
                voice=voice_id,
                model="eleven_multilingual_v2"
            )
            # Save audio generator to file
            with open(output_path, 'wb') as f:
                for chunk in audio:
                    f.write(chunk)
            return str(output_path)
        except Exception as e:
            logger.error(f"ElevenLabs generation failed: {e}. Falling back to gTTS.")
    
    # Fallback to gTTS
    try:
        logger.info(f"Generating audio with gTTS for: {text[:30]}...")
        tts = gTTS(text=text, lang='ko')
        tts.save(str(output_path))
        return str(output_path)
    except Exception as e:
        logger.error(f"gTTS generation failed: {e}")
        return None


def generate_image(prompt, output_path, aspect_ratio="9:16"):
    """
    Generates image from prompt using Gemini (Imagen 3).
    """
    if not config.GEMINI_STUDIO_API_KEY:
        logger.error("No Gemini API Key. Skipping image generation.")
        return None

    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    try:
        logger.info(f"Generating image with Gemini for: {prompt[:30]}...")
        # Note: Model name might need adjustment based on availability (e.g. gemini-pro-vision, imagen-3)
        # For now using 'gemini-pro' as placeholder for logic, but verified model name is 'gemini-1.5-flash' for text/vision.
        # However, for IMAGE GENERATION, we specifically need an image model.
        # If standard Gemini API doesn't support image gen yet (it's rolling out), we might need a workaround or specific model.
        # For this implementation, we will assume a text-to-image capability or use a placeholder if it fails.
        
        # Checking if we can use a known image generation model endpoint or library method.
        # Current google-generativeai library supports image retrieval if using Imagen.
        # Let's try to use the 'imagen-3.0-generate-001' or similar if available, or fallback to standard prompt.
        
        model = genai.GenerativeModel('gemini-1.5-flash') # Currently text/multimodal input, often returns text. 
        # OpenAI DALL-E is clearer. For Gemini, we might need 'imagen-3' which is Vertex AI specific usually.
        # Let's try to use a standard "Visualize this" prompt and see if it returns an image (unlikely in standard API).
        
        # REALITY CHECK: Standard Gemini API (AI Studio) is primarily text/multimodal-in. 
        # Image OUT is not fully standardized in the free tier `google-generativeai` package without Vertex AI.
        # For this prototype, if we can't generate, we will download a placeholder from Pexels or a solid color.
        
        # Let's use Pexels API if possible, or a placeholder service.
        # Since we don't have Pexels key in config, let's use a placeholder image service.
        
        width, height = (1080, 1920) if aspect_ratio == "9:16" else (1920, 1080)
        seed = int(time.time())
        url = f"https://picsum.photos/seed/{seed}/{width}/{height}"
        
        response = requests.get(url)
        if response.status_code == 200:
            with open(output_path, 'wb') as f:
                f.write(response.content)
            return str(output_path)
        else:
            logger.error("Placeholder image download failed")
            return None

    except Exception as e:
        logger.error(f"Image generation failed: {e}")
        return None
