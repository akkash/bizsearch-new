from PIL import Image

def remove_background(input_path, output_path):
    try:
        print(f"Opening {input_path}...")
        img = Image.open(input_path)
        img = img.convert("RGBA")
        datas = img.getdata()

        newData = []
        for item in datas:
            # Change all white (also shades of whites) to transparent
            # Threshold: 240 for R, G, B
            if item[0] > 240 and item[1] > 240 and item[2] > 240:
                newData.append((255, 255, 255, 0))
            else:
                newData.append(item)

        img.putdata(newData)
        print(f"Saving to {output_path}...")
        img.save(output_path, "PNG")
        print("Successfully removed background!")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    remove_background('public/logo.png', 'public/logo.png')
