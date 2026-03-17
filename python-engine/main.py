import time
import sys
import logging
import json
from pymongo import MongoClient
import config
from modules.content_sourcing import source_content
from modules.text_processing import generate_script
# from modules.video_synthesis import create_video
# from modules.uploader import upload_to_youtube
from modules.quota_manager import check_quota, increment_quota

# Setup Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('engine.log')
    ]
)
logger = logging.getLogger(__name__)

def connect_db():
    try:
        client = MongoClient(config.MONGODB_URI)
        db = client.get_default_database()
        return db
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {e}")
        return None

def process_step_1_scripting(db, project):
    """
    Step 1: Content Sourcing & Script Generation
    Trigger: status == 'pending'
    Next Status: 'script_generated'
    """
    project_id = project['_id']
    logger.info(f"[Scripting] Starting for project {project_id}")
    
    try:
        db.videoprojects.update_one({'_id': project_id}, {'$set': {'status': 'scripting'}})
        
        # Sourcing
        content = source_content(project['topic'])
        
        # Scripting
        script_data = generate_script(content, style=project.get('config', {}).get('style', 'informative'))
        
        # Save & Wait for Approval
        # script_data가 JSON 객체이므로 문자열로 저장
        db.videoprojects.update_one(
            {'_id': project_id},
            {'$set': {
                'status': 'script_generated',
                'script': json.dumps(script_data, ensure_ascii=False),
                'logs': project.get('logs', []) + ["Script generated, waiting for review"]
            }}
        )
        logger.info(f"[Scripting] Completed for {project_id}")

    except Exception as e:
        logger.error(f"[Scripting] Error: {e}")
        db.videoprojects.update_one({'_id': project_id}, {'$set': {'status': 'failed', 'failReason': str(e)}})


from modules.asset_generation import generate_audio, generate_image

def process_step_2_assets(db, project):
    """
    Step 2: Asset Generation (TTS, Images)
    Trigger: status == 'asset_generating'
    Next Status: 'assets_generated'
    """
    project_id = project['_id']
    logger.info(f"[Assets] Starting for project {project_id}")
    
    try:
        # Load script
        script_data = json.loads(project['script'])
        segments = script_data.get('segments', [])
        
        assets_base_dir = config.ASSETS_DIR / str(project_id)
        assets_base_dir.mkdir(parents=True, exist_ok=True)
        
        updated_segments = []
        
        for idx, segment in enumerate(segments):
            logger.info(f"Processing segment {idx+1}/{len(segments)}")
            
            # 1. Audio Generation
            audio_filename = f"segment_{idx}_audio.mp3"
            audio_path = assets_base_dir / audio_filename
            segment_text = segment.get('text', segment.get('narration', '')) # Support both keys
            
            if not audio_path.exists():
                generated_audio = generate_audio(segment_text, audio_path)
                if generated_audio:
                    segment['audio_path'] = str(generated_audio)
                else:
                    logger.warning(f"Audio generation failed for segment {idx}")
            else:
                 segment['audio_path'] = str(audio_path)

            # 2. Image Generation
            image_filename = f"segment_{idx}_image.jpg"
            image_path = assets_base_dir / image_filename
            if not image_path.exists():
                # Use visual_cue or fallback to text for prompt
                prompt = segment.get('visual_cue', segment_text)
                generated_image = generate_image(prompt, image_path, aspect_ratio="9:16" if project['platform'] == 'shorts' else "16:9")
                if generated_image:
                    segment['image_path'] = str(generated_image)
                else:
                    logger.warning(f"Image generation failed for segment {idx}")
            else:
                segment['image_path'] = str(image_path)
            
            updated_segments.append(segment)
            time.sleep(1) # Rate limit politeness

        # Update Script/Assets in DB
        script_data['segments'] = updated_segments
        
        db.videoprojects.update_one(
            {'_id': project_id},
            {'$set': {
                'status': 'assets_generated',
                'script': json.dumps(script_data, ensure_ascii=False), # Save updated paths
                'logs': project.get('logs', []) + [f"Generated assets for {len(segments)} segments"]
            }}
        )
        logger.info(f"[Assets] Completed for {project_id}")

    except Exception as e:
        logger.error(f"[Assets] Error: {e}")
        db.videoprojects.update_one({'_id': project_id}, {'$set': {'status': 'failed', 'failReason': str(e)}})


from modules.video_synthesis import create_video

def process_step_3_rendering(db, project):
    """
    Step 3: Video Rendering
    Trigger: status == 'rendering'
    Next Status: 'review_ready'
    """
    project_id = project['_id']
    logger.info(f"[Rendering] Starting for project {project_id}")
    
    try:
        # Load script for content (used by synthesis)
        if isinstance(project['script'], str):
            script_data = json.loads(project['script'])
        else:
            script_data = project['script']

        # Video Synthesis Logic
        # time.sleep(3) # Removed fake processing
        
        output_path = create_video(project_id, script_data, project['platform'])
        
        # Determine accessible URL (Localhost vs Production)
        # For local dev, we might need to expose the output folder via Next.js or just use file path for verification
        # Next.js should map /api/video/stream?path=...
        # For now, saving absolute path.
        
        db.videoprojects.update_one(
            {'_id': project_id},
            {'$set': {
                'status': 'review_ready',
                'youtubeUrl': output_path, # Storing path for now
                'logs': project.get('logs', []) + ["Video synthesized successfully"]
            }}
        )
        logger.info(f"[Rendering] Completed for {project_id}")

    except Exception as e:
        logger.error(f"[Rendering] Error: {e}")
        db.videoprojects.update_one({'_id': project_id}, {'$set': {'status': 'failed', 'failReason': str(e)}})


def process_step_4_uploading(db, project):
    """
    Step 4: YouTube Upload
    Trigger: status == 'uploading'
    Next Status: 'completed'
    NOTE: Skipping actual upload as per user request.
    """
    project_id = project['_id']
    logger.info(f"[Uploading] Starting for project {project_id}")
    
    try:
        logger.info("Skipping actual YouTube upload as requested.")
        time.sleep(1) 
        
        if 'youtubeUrl' in project and project['youtubeUrl']:
            final_url = project['youtubeUrl']
        else:
            final_url = "" 
        
        db.videoprojects.update_one(
            {'_id': project_id},
            {'$set': {
                'status': 'completed',
                'youtubeUrl': final_url,
                'logs': project.get('logs', []) + ["Upload skipped (simulation mode)"]
            }}
        )
        logger.info(f"[Uploading] Completed (Skipped) for {project_id}")

    except Exception as e:
        logger.error(f"[Uploading] Error: {e}")
        db.videoprojects.update_one({'_id': project_id}, {'$set': {'status': 'failed', 'failReason': str(e)}})

    except Exception as e:
        logger.error(f"[Uploading] Error: {e}")
        db.videoprojects.update_one({'_id': project_id}, {'$set': {'status': 'failed', 'failReason': str(e)}})


def main():
    logger.info("Starting Auto Video Engine (Step-by-Step Mode)...")
    db = connect_db()
    if db is None:
        return

    while True:
        try:
            # Check for each state in order of priority (or parallel)
            
            # 1. New Projects -> Generate Script
            pending = db.videoprojects.find_one({'status': 'pending'})
            if pending: process_step_1_scripting(db, pending)

            # 2. Approved Script -> Generate Assets
            approved_script = db.videoprojects.find_one({'status': 'asset_generating'})
            if approved_script: process_step_2_assets(db, approved_script)

            # 3. Approved Assets -> Render Video
            approved_assets = db.videoprojects.find_one({'status': 'rendering'})
            if approved_assets: process_step_3_rendering(db, approved_assets)

            # 4. Approved Video -> Upload
            approved_video = db.videoprojects.find_one({'status': 'uploading'})
            if approved_video: process_step_4_uploading(db, approved_video)

            time.sleep(3)
                
        except KeyboardInterrupt:
            logger.info("Stopping engine...")
            break
        except Exception as e:
            logger.error(f"Unexpected error in main loop: {e}")
            time.sleep(10)

if __name__ == "__main__":
    main()
