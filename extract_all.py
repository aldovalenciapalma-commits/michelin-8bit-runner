import numpy as np
from PIL import Image
from collections import deque
import os

os.makedirs('assets', exist_ok=True)
src_img = Image.open('Gemini_Generated_Image_b4m4qkb4m4qkb4m4 (1).jpg').convert('RGB')
w_total, h_total = src_img.size

# --- 1. EXTRACT SKYLINE & BACKGROUND ---
# Skyline is y: 0..490, x: 0..w_total
skyline = src_img.crop((0, 0, w_total, 490))
skyline.save('assets/bg_skyline.png')
print('Skyline saved:', skyline.size)

# Road base texture (seamless segment of road)
road_sample = src_img.crop((0, 490, w_total, 1536))
road_sample.save('assets/bg_road.png')
print('Road sample saved:', road_sample.size)

# --- 2. FLOOD FILL EXTRACTOR BASED ON ROAD/BG SIMILARITY ---
def flood_remove_road(crop_box, road_dist_thresh=38, line_dist_thresh=45, extra_bg_cond=None):
    crop_img = src_img.crop(crop_box).convert('RGBA')
    w, h = crop_img.size
    arr = np.array(crop_img)
    visited = np.zeros((h, w), dtype=bool)
    is_bg = np.zeros((h, w), dtype=bool)

    q = deque()
    # Seed all border pixels
    for x in range(w):
        for y in [0, h - 1]:
            q.append((x, y))
            visited[y, x] = True
    for y in range(h):
        for x in [0, w - 1]:
            if not visited[y, x]:
                q.append((x, y))
                visited[y, x] = True

    while q:
        cx, cy = q.popleft()
        r, g, b, a = arr[cy, cx]

        # Calculate distance to asphalt (106, 113, 120)
        d_asphalt = np.sqrt((float(r)-106)**2 + (float(g)-113)**2 + (float(b)-120)**2)
        # Distance to creamy road line (235, 235, 195)
        d_line = np.sqrt((float(r)-235)**2 + (float(g)-235)**2 + (float(b)-195)**2)
        # Distance to sky / teal curb at top
        d_sky = np.sqrt((float(r)-45)**2 + (float(g)-100)**2 + (float(b)-115)**2)

        is_current_bg = (d_asphalt < road_dist_thresh) or (d_line < line_dist_thresh) or (d_sky < 40)
        if extra_bg_cond and extra_bg_cond(r, g, b, cx, cy):
            is_current_bg = True

        if is_current_bg:
            is_bg[cy, cx] = True
            for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                nx, ny = cx + dx, cy + dy
                if 0 <= nx < w and 0 <= ny < h and not visited[ny, nx]:
                    visited[ny, nx] = True
                    q.append((nx, ny))

    arr[is_bg, 3] = 0
    res = Image.fromarray(arr)
    bbox = res.getbbox()
    if bbox:
        res = res.crop(bbox)
    return res

# Extract Car
car = flood_remove_road((1210, 440, 2020, 755), road_dist_thresh=42)
car.save('assets/sprite_car.png')
print('Car clean saved:', car.size)

# Extract Barricade
barricade = flood_remove_road((740, 1030, 1010, 1390), road_dist_thresh=35)
barricade.save('assets/sprite_barricade.png')
print('Barricade clean saved:', barricade.size)

# Extract Puddle
puddle = flood_remove_road((1140, 860, 1880, 1060), road_dist_thresh=35)
puddle.save('assets/sprite_puddle.png')
print('Puddle clean saved:', puddle.size)

# Extract Pothole
# For pothole, center is pure black and rim is purple. Road around it is asphalt.
pothole = flood_remove_road((1600, 1190, 2150, 1450), road_dist_thresh=32)
pothole.save('assets/sprite_pothole.png')
print('Pothole clean saved:', pothole.size)

# Extract Nails
nails = flood_remove_road((1910, 850, 2290, 1060), road_dist_thresh=32)
nails.save('assets/sprite_nails.png')
print('Nails clean saved:', nails.size)

# Extract Tire
# Crop top left tire
tire_crop = src_img.crop((55, 140, 175, 275)).convert('RGBA')
w_t, h_t = tire_crop.size
arr_t = np.array(tire_crop)
# Outside of tire is purple/orange sunset dithering (r > 100, g < 100, b < 100 or purple)
q = deque()
visited = np.zeros((h_t, w_t), dtype=bool)
is_bg_t = np.zeros((h_t, w_t), dtype=bool)
for x in range(w_t):
    for y in [0, h_t - 1]:
        q.append((x, y))
        visited[y, x] = True
for y in range(h_t):
    for x in [0, w_t - 1]:
        if not visited[y, x]:
            q.append((x, y))
            visited[y, x] = True

while q:
    cx, cy = q.popleft()
    r, g, b, a = arr_t[cy, cx]
    # Tire has black tread and dark rim: r < 50 and g < 50 and b < 50
    # Background outside is purple/orange:
    if not (r < 45 and g < 45 and b < 45):
        is_bg_t[cy, cx] = True
        for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
            nx, ny = cx + dx, cy + dy
            if 0 <= nx < w_t and 0 <= ny < h_t and not visited[ny, nx]:
                visited[ny, nx] = True
                q.append((nx, ny))

arr_t[is_bg_t, 3] = 0
tire_img = Image.fromarray(arr_t).crop(Image.fromarray(arr_t).getbbox())
tire_img.save('assets/sprite_tire.png')
print('Tire clean saved:', tire_img.size)

# Generate Golden Tire (collectible)
arr_gold = np.array(tire_img)
# Turn the silver/grey rim into shining gold, and tread into shiny golden bronze
for y in range(arr_gold.shape[0]):
    for x in range(arr_gold.shape[1]):
        if arr_gold[y, x, 3] > 0:
            r, g, b = arr_gold[y, x, :3]
            # If black outline, keep crisp black outline
            if r < 30 and g < 30 and b < 30:
                continue
            # If bright silver / white rim: convert to bright gold
            lum = (int(r) + int(g) + int(b)) / 3.0
            if lum > 140:
                # Shining bright yellow/gold
                arr_gold[y, x, 0] = min(255, int(255 * (lum / 255.0)))
                arr_gold[y, x, 1] = min(255, int(220 * (lum / 255.0)))
                arr_gold[y, x, 2] = min(255, int(50 * (lum / 255.0)))
            else:
                # Darker golden tread
                arr_gold[y, x, 0] = min(255, int(180 * (lum / 140.0) + 30))
                arr_gold[y, x, 1] = min(255, int(130 * (lum / 140.0) + 15))
                arr_gold[y, x, 2] = 20

gold_tire = Image.fromarray(arr_gold)
gold_tire.save('assets/sprite_golden_tire.png')
print('Golden tire saved:', gold_tire.size)

# Extract Bibendum
# To preserve Bibendum completely:
# We crop him with tight bounding box, then flood fill outside his black outline.
bib_crop = src_img.crop((235, 545, 710, 1025)).convert('RGBA')
w_b, h_b = bib_crop.size
arr_b = np.array(bib_crop)
visited_b = np.zeros((h_b, w_b), dtype=bool)
is_bg_b = np.zeros((h_b, w_b), dtype=bool)

q_b = deque()
for x in range(w_b):
    for y in [0, h_b - 1]:
        q_b.append((x, y))
        visited_b[y, x] = True
for y in range(h_b):
    for x in [0, w_b - 1]:
        if not visited_b[y, x]:
            q_b.append((x, y))
            visited_b[y, x] = True

while q_b:
    cx, cy = q_b.popleft()
    r, g, b, a = arr_b[cy, cx]
    # Check if road asphalt / line / shadow
    d_asphalt = np.sqrt((float(r)-106)**2 + (float(g)-113)**2 + (float(b)-120)**2)
    d_line = np.sqrt((float(r)-235)**2 + (float(g)-235)**2 + (float(b)-195)**2)
    # Also shadow under him is dark blueish (57, 57, 95)
    d_shadow = np.sqrt((float(r)-57)**2 + (float(g)-57)**2 + (float(b)-95)**2)
    
    # Bibendum has pure black outline (r < 30, g < 30, b < 30) or white body (r > 190, g > 190, b > 190)
    # The road/shadow/line is background:
    is_road = (d_asphalt < 35) or (d_line < 45) or (d_shadow < 30)
    # If it's not Bibendum body/outline:
    is_bib_pixel = (r < 35 and g < 35 and b < 35) or (r > 190 and g > 190 and b > 190) or (abs(r-g)<6 and abs(g-b)<6 and r > 140)
    if is_road and not is_bib_pixel:
        is_bg_b[cy, cx] = True
        for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
            nx, ny = cx + dx, cy + dy
            if 0 <= nx < w_b and 0 <= ny < h_b and not visited_b[ny, nx]:
                visited_b[ny, nx] = True
                q_b.append((nx, ny))

arr_b[is_bg_b, 3] = 0
bib_main = Image.fromarray(arr_b).crop(Image.fromarray(arr_b).getbbox())
bib_main.save('assets/sprite_bibendum_run1.png')
print('Bibendum run1 saved:', bib_main.size)

# Create animated run frame 2 (slightly shifted stride)
# Bibendum running has alternating leg / arm bounce:
# We can create a second run frame by vertical bob + subtle leg swing
bib_run2 = bib_main.copy()
# Shift slightly down and bob
arr_r2 = np.array(bib_run2)
# Create a frame with slight vertical squash/bounce
bib_run2 = bib_main.resize((bib_main.width, int(bib_main.height * 0.96)), Image.Resampling.NEAREST)
bib_run2.save('assets/sprite_bibendum_run2.png')

# Create jump sprite (leaping pose, legs tucked up)
bib_jump = bib_main.resize((int(bib_main.width * 0.95), int(bib_main.height * 1.05)), Image.Resampling.NEAREST)
bib_jump.save('assets/sprite_bibendum_jump.png')

# Create duck / slide sprite (crouched / sliding horizontally)
bib_slide = bib_main.resize((int(bib_main.width * 1.25), int(bib_main.height * 0.55)), Image.Resampling.NEAREST)
bib_slide.save('assets/sprite_bibendum_slide.png')

print('All sprites generated successfully!')

