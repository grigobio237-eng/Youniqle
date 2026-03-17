import os
from dotenv import load_dotenv
from pathlib import Path

# Load env from parent directory
env_path = Path(__file__).resolve().parent.parent / '.env.local'
load_dotenv(dotenv_path=env_path)

# Fallback to local .env if exists
load_dotenv()

# MongoDB
MONGODB_URI = os.getenv("MONGODB_URI")

# API Keys
GEMINI_STUDIO_API_KEY = os.getenv("GEMINI_STUDIO_API_KEY")
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")

# Reddit
REDDIT_CLIENT_ID = os.getenv("REDDIT_CLIENT_ID")
REDDIT_CLIENT_SECRET = os.getenv("REDDIT_CLIENT_SECRET")
REDDIT_USER_AGENT = os.getenv("REDDIT_USER_AGENT", "AutoVideoBot/1.0")

# YouTube
YOUTUBE_CLIENT_SECRETS_FILE = "client_secrets.json"
YOUTUBE_API_SERVICE_NAME = "youtube"
YOUTUBE_API_VERSION = "v3"

# Asset Paths
ASSETS_DIR = Path(__file__).parent / "assets"
TEMP_DIR = Path(__file__).parent / "temp"
OUTPUT_DIR = Path(__file__).parent / "output"

# Quota
DAILY_UPLOAD_LIMIT = 5

# Ensure directories exist
ASSETS_DIR.mkdir(exist_ok=True)
TEMP_DIR.mkdir(exist_ok=True)
OUTPUT_DIR.mkdir(exist_ok=True)
