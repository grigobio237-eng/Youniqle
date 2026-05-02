import cv2
import numpy as np
from PIL import Image
from rembg import remove
import os

# Create output directory
out_dir = r"f:\youniqle\public\images\characters"
os.makedirs(out_dir, exist_ok=True)

# Path to the image
img_path = r"C:\Users\sin93\.gemini\antigravity\brain\7058e1ba-52ea-4912-96eb-9f87e051d19e\media__1777353518231.jpg"

print("Removing background...")
# Load image and remove background
with open(img_path, 'rb') as i:
    input_data = i.read()

output_data = remove(input_data)
img = Image.frombytes("RGBA", Image.open(img_path).size, output_data)
img_np = np.array(img)

print("Finding contours...")
# Find contours of the characters
gray = cv2.cvtColor(img_np, cv2.COLOR_RGBA2GRAY)
_, thresh = cv2.threshold(gray, 10, 255, cv2.THRESH_BINARY)

# Find contours
contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

# Filter out small noise
min_area = 5000
char_boxes = []
for cnt in contours:
    x, y, w, h = cv2.boundingRect(cnt)
    if w * h > min_area:
        char_boxes.append((x, y, w, h))

# Sort boxes top-to-bottom, then left-to-right
char_boxes.sort(key=lambda b: (b[1] // 200, b[0]))

print(f"Found {len(char_boxes)} characters")

# Crop and save the first 4 (or 4 specific ones)
# Let's just take the first 4 for the 4 tools
saved = 0
for idx, (x, y, w, h) in enumerate(char_boxes):
    if saved >= 4:
        break
    # Add a little padding
    pad = 20
    x1 = max(0, x - pad)
    y1 = max(0, y - pad)
    x2 = min(img_np.shape[1], x + w + pad)
    y2 = min(img_np.shape[0], y + h + pad)
    
    char_img = Image.fromarray(img_np[y1:y2, x1:x2])
    
    # Resize to something reasonable
    char_img.thumbnail((256, 256))
    
    out_path = os.path.join(out_dir, f"char_{saved+1}.png")
    char_img.save(out_path)
    print(f"Saved {out_path}")
    saved += 1

print("Done!")
