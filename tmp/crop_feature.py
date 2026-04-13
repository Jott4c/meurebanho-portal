from PIL import Image
import os

img_path = r'C:\Users\1822\.gemini\antigravity\brain\22c8377f-c99d-4731-9df4-6a40596a6b7a\meurebanho_feature_graphic_1024x500px_1775603537995.png'
output_path = r'C:\Users\1822\.gemini\antigravity\brain\22c8377f-c99d-4731-9df4-6a40596a6b7a\meurebanho_feature_graphic_final_1024x500.png'

if not os.path.exists(img_path):
    print(f"Error: {img_path} not found.")
    exit(1)

with Image.open(img_path) as img:
    width, height = img.size
    print(f"Original size: {width}x{height}")
    
    # Target size 1024x500
    target_w = 1024
    target_h = 500
    
    # Calculate crop area (center)
    left = (width - target_w) / 2
    top = (height - target_h) / 2
    right = (width + target_w) / 2
    bottom = (height + target_h) / 2
    
    img_cropped = img.crop((left, top, right, bottom))
    img_cropped.save(output_path)
    print(f"Saved to: {output_path}")
