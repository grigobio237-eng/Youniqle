from PIL import Image
import os

img_path = r"C:\Users\sin93\.gemini\antigravity\brain\7058e1ba-52ea-4912-96eb-9f87e051d19e\media__1777353518231.jpg"
out_dir = r"f:\youniqle\public\images\characters"
os.makedirs(out_dir, exist_ok=True)

img = Image.open(img_path).convert("RGBA")
width, height = img.size

# It looks like 3 rows, 4 columns (maybe last row has fewer). Let's assume 3 rows, 4 columns.
# Let's just crop 4 regions for the 4 tools.
# Row 1 has 3 chars (Running, running, running)
# Row 2 has 4 chars
# Row 3 has 4 chars

# Actually let's just do a simple grid: 4 columns, 3 rows.
w = width // 4
h = height // 3

# Characters to extract:
# 1. (col 0, row 0) -> Running
# 2. (col 2, row 1) -> Reading book
# 3. (col 3, row 1) -> Celebrating
# 4. (col 1, row 2) -> Pointing/Looking

crops = [
    (0, 0), # 1
    (2, 1), # 2
    (3, 1), # 3
    (1, 2)  # 4
]

for idx, (col, row) in enumerate(crops):
    left = col * w
    top = row * h
    right = left + w
    bottom = top + h
    
    char_img = img.crop((left, top, right, bottom))
    
    # Try to make checkerboard transparent
    data = char_img.getdata()
    newData = []
    for item in data:
        # Checkerboard is often white and gray
        # Check if color is close to white or gray
        # (255,255,255) and (230,230,230) or (204,204,204)
        if (item[0] > 200 and item[1] > 200 and item[2] > 200 and abs(item[0]-item[1]) < 15 and abs(item[1]-item[2]) < 15):
            newData.append((255, 255, 255, 0))
        else:
            newData.append(item)
            
    char_img.putdata(newData)
    
    out_path = os.path.join(out_dir, f"char_{idx+1}.png")
    char_img.save(out_path, "PNG")
    print(f"Saved {out_path}")

print("Done extracting 4 characters")
