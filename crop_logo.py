from PIL import Image, ImageChops

def trim(im):
    bg = Image.new(im.mode, im.size, im.getpixel((0,0)))
    diff = ImageChops.difference(im, bg)
    diff = ImageChops.add(diff, diff, 2.0, -100)
    bbox = diff.getbbox()
    if bbox:
        return im.crop(bbox)
    return im

try:
    img = Image.open('public/logo.png')
    img = img.convert('RGB')
    cropped = trim(img)
    cropped.save('public/logo.png')
    print("Successfully cropped logo.png")
except Exception as e:
    print(f"Error cropping: {e}")
