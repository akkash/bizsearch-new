from PIL import Image

def create_dark_logo(input_path, output_path):
    try:
        print(f"Opening {input_path}...")
        img = Image.open(input_path)
        img = img.convert("RGBA")
        datas = img.getdata()

        newData = []
        for item in datas:
            # Check for transparency
            if item[3] == 0:
                newData.append(item)
                continue

            # Logic: If the pixel is dark (low R, G, B), make it white.
            # Green has high G, so we want to avoid changing green.
            # "Biz" is Dark Blue (~0, 0, 100), "Search" is Green.
            
            r, g, b, a = item
            
            # Simple heuristic: If it's dark blue/black, it will have low Red and Green.
            # The green color is roughly R:38 G:166 B:154 (from brand guidelines/artifacts)
            # Dark blue is likely R:<50, G:<50, B:>50 or just generally dark.
            
            # If Red and Green are low, it's likely the dark blue part.
            if r < 100 and g < 100: 
                # Turn it white
                newData.append((255, 255, 255, a))
            else:
                # Keep it as is (likely the green part)
                newData.append(item)

        img.putdata(newData)
        print(f"Saving to {output_path}...")
        img.save(output_path, "PNG")
        print("Successfully created dark mode logo!")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    create_dark_logo('public/logo.png', 'public/logo-dark.png')
