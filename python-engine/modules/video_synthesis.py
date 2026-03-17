from moviepy.editor import ImageClip, AudioFileClip, concatenate_videoclips, CompositeVideoClip, TextClip
from pathlib import Path
import logging
import os
import config
import PIL.Image

# Patch for Pillow 10+ compatibility with MoviePy
if not hasattr(PIL.Image, 'ANTIALIAS'):
    PIL.Image.ANTIALIAS = PIL.Image.LANCZOS

logger = logging.getLogger(__name__)

# Set ImageMagick binary if needed (Windows often requires full path if not in PATH)
# For now assuming it is in PATH or MoviePy finds it. If error occurs, might need config.

def create_video(project_id, script_data, platform="shorts"):
    """
    Synthesize video using MoviePy.
    Combines images and audio segments into a single video file.
    """
    try:
        logger.info(f"Starting video synthesis for project {project_id} ({platform})")
        
        assets_base_dir = config.ASSETS_DIR / str(project_id)
        
        # Save to public/generated_videos for web access
        web_output_dir = Path(__file__).resolve().parent.parent.parent / "public" / "generated_videos"
        web_output_dir.mkdir(parents=True, exist_ok=True)
        
        # Keep internal output for reference/backup if needed, but primary is web accessible
        output_dir = web_output_dir 
        output_dir.mkdir(exist_ok=True)
        
        segments = script_data.get('segments', [])
        clips = []
        
        # Dimensions
        if platform == "shorts":
            w, h = 1080, 1920
        else:
            w, h = 1920, 1080
            
        print(f"Target dimensions: {w}x{h}", flush=True)

        for i, segment in enumerate(segments):
            print(f"Processing clip {i}...", flush=True)
            image_path = segment.get('image_path')
            audio_path = segment.get('audio_path')
            text = segment.get('text', segment.get('narration', ''))
            
            if not image_path or not os.path.exists(image_path):
                logger.warning(f"Missing image for segment {i}, skipping.")
                continue
                
            if not audio_path or not os.path.exists(audio_path):
                logger.warning(f"Missing audio for segment {i}, skipping.")
                continue
                
            # Create Audio Clip
            print(f"  - Loading audio: {audio_path}", flush=True)
            audio_clip = AudioFileClip(audio_path)
            duration = audio_clip.duration
            print(f"  - Duration: {duration}", flush=True)
            
            # Create Image Clip
            print(f"  - Loading image: {image_path}", flush=True)
            img_clip = ImageClip(image_path).set_duration(duration)
            print(f"  - Resizing image...", flush=True)
            img_clip = img_clip.resize(newsize=(w, h)) # Basic resize, arguably crop is better but simple for now
            
            # TODO: Add TextClip (Subtitles) - disabling for now to avoid ImageMagick dependency issues commonly found on Windows
            # text_clip = TextClip(text, fontsize=50, color='white', size=(w-100, None), method='caption').set_duration(duration).set_position(('center', 'bottom'))
            # final_clip = CompositeVideoClip([img_clip, text_clip])
            
            # Combine
            print(f"  - Setting audio...", flush=True)
            clip = img_clip.set_audio(audio_clip)
            clips.append(clip)
            print(f"  - Clip {i} ready.", flush=True)
            
        if not clips:
            raise Exception("No valid clips created.")
            
        # Concatenate all clips
        print(f"Concatenating {len(clips)} clips...", flush=True)
        final_video = concatenate_videoclips(clips, method="compose")
        
        # Output file
        output_filename = f"{project_id}_{platform}.mp4"
        output_path = output_dir / output_filename
        
        logger.info(f"Writing video to {output_path}...")
        final_video.write_videofile(
            str(output_path), 
            fps=24, 
            codec="libx264", 
            audio_codec="aac",
            threads=4,
            logger=None # Hide moviepy bar to keep log clean or use 'bar'
        )
        
        logger.info(f"Video synthesis complete: {output_path}")
        
        # Return web-ready relative path
        return f"/generated_videos/{output_filename}"

    except Exception as e:
        logger.error(f"Video synthesis failed: {e}")
        raise e
