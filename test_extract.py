import numpy as np
from PIL import Image
from collections import deque
import os

def flood_fill_mask(img_rgba, start_points, color_match_fn):
    """Flood fill from border points to detect background."""
    w, h = img_rgba.size
    arr = np.array(img_rgba)
    visited = np.zeros((h, w), dtype=bool)
    mask = np.zeros((h, w), dtype=bool) # True = background
    
    queue = deque(start_points)
    for x, y in start_points:
        if 0 <= x < w and 0 <= y < h:
            visited[y, x] = True
            if color_match_fn(arr[y, x]):
                mask[y, x] = True
                
    while queue:
        cx, cy = queue.popleft()
        for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
            nx, ny = cx + dx, cy + dy
            if 0 <= nx < w and 0 <= ny < h and not visited[ny, nx]:
                visited[ny, nx] = True
                if color_match_fn(arr[ny, nx]):
                    mask[ny, nx] = True
                    queue.append((nx, ny))
                    
    return mask

def extract_car():
    # Load original image
    im = Image.open('Gemini_Generated_Image_b4m4qkb4m4qkb4m4 (1).jpg')
    # Car coordinates
    # Car is approx x: 1210..2020, y: 440..755
    car_crop = im.crop((1210, 440, 2020, 755)).convert('RGBA')
    w, h = car_crop.size
    arr = np.array(car_crop)
    
    # Border points
    border = []
    for x in range(w):
        border.append((x, 0))
        border.append((x, h-1))
    for y in range(h):
        border.append((0, y))
        border.append((w-1, y))
        
    # The car has black outlines (r < 50, g < 50, b < 50) and inside car has red (r > 100), blue (b > 100).
    # Background outside car is either asphalt (approx r: 90..130, g: 100..140, b: 110..150)
    # or sky/green curb (g > 80, b > 90, etc.)
    # Any pixel that is NOT part of the black outline of the car body or car interior
    # Specifically, car outline is black.
    def is_bg(pixel):
        r, g, b, a = pixel[:4]
        # Black outline is r < 40, g < 40, b < 40
        if r < 40 and g < 40 and b < 40:
            return False
        # Red car body: r > 120 and r > b + 10
        if r > 120 and r > b + 10:
            return False
        # Car light/cyan trim: b > 140 and g > 100
        if b > 140 and g > 100:
            return False
        # Car wheel hub/silver: abs(r-g)<15 and abs(g-b)<15 and r > 120
        # Car shadow under wheels: y near bottom
        return True

    # Flood fill
    mask = flood_fill_mask(car_crop, border, is_bg)
    
    # Set background pixels to transparent
    arr[mask, 3] = 0
    res = Image.fromarray(arr)
    
    # Crop to non-transparent bounding box
    bbox = res.getbbox()
    if bbox:
        res = res.crop(bbox)
        
    # Resize to nice retro 8-bit game scale (e.g. height ~ 80px or 120px)
    res.save('assets/sprite_car.png')
    print('Car extracted:', res.size)

extract_car()

