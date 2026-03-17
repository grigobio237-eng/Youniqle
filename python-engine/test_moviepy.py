import sys
print("Start import...", flush=True)
try:
    from moviepy.editor import VideoFileClip
    print("MoviePy imported successfully!", flush=True)
except Exception as e:
    print(f"MoviePy import failed: {e}", flush=True)

try:
    import imageio
    print(f"Imageio version: {imageio.__version__}", flush=True)
    # Check ffmpeg
    from imageio.plugins.ffmpeg import get_exe
    print(f"FFmpeg exe: {get_exe()}", flush=True)
except Exception as e:
    print(f"FFmpeg check failed: {e}", flush=True)
