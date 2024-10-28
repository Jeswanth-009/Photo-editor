from flask import Flask, render_template, request, jsonify, send_file
from PIL import Image, ImageDraw, ImageFont
import os
import io
import shutil
from werkzeug.utils import secure_filename
import colorsys

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'static/uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def hex_to_rgb(hex_color):
    # Remove the leading '#' if present
    hex_color = hex_color.lstrip('#')
    # Convert hex to RGB
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

# Clear uploads folder on startup
def clear_uploads_folder():
    if os.path.exists(app.config['UPLOAD_FOLDER']):
        shutil.rmtree(app.config['UPLOAD_FOLDER'])
    os.makedirs(app.config['UPLOAD_FOLDER'])

# Initialize the application
clear_uploads_folder()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'})
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'})
    
    if file and allowed_file(file.filename):
        try:
            # Secure the filename and save
            filename = 'image.jpg'
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            
            # Open and convert image to RGB mode
            img = Image.open(file)
            if img.mode in ('RGBA', 'LA'):
                background = Image.new('RGB', img.size, (255, 255, 255))
                background.paste(img, mask=img.split()[-1])
                img = background
            elif img.mode != 'RGB':
                img = img.convert('RGB')
            
            img.save(filepath, 'JPEG')
            return jsonify({'success': True, 'filename': filename})
        except Exception as e:
            return jsonify({'error': str(e)})
    
    return jsonify({'error': 'Invalid file type'})

@app.route('/crop', methods=['POST'])
def crop_image():
    try:
        data = request.json
        img_path = os.path.join(app.config['UPLOAD_FOLDER'], 'image.jpg')
        img = Image.open(img_path)
        
        left = max(0, int(float(data['left'])))
        top = max(0, int(float(data['top'])))
        right = min(img.width, int(float(data['right'])))
        bottom = min(img.height, int(float(data['bottom'])))
        
        if right > left and bottom > top:
            img = img.crop((left, top, right, bottom))
            img.save(img_path, 'JPEG')
            return jsonify({'success': True})
        else:
            return jsonify({'error': 'Invalid crop dimensions'})
    except Exception as e:
        return jsonify({'error': str(e)})

@app.route('/edit', methods=['POST'])
def edit_image():
    try:
        data = request.json
        operation = data['operation']
        img_path = os.path.join(app.config['UPLOAD_FOLDER'], 'image.jpg')
        img = Image.open(img_path)

        if operation == 'resize':
            size = min(2000, max(50, int(data['size'])))  # Limit size between 50 and 2000
            img.thumbnail((size, size), Image.LANCZOS)
            
        elif operation == 'rotate':
            angle = int(data['angle']) % 360
            img = img.rotate(angle, expand=True)
            
        elif operation == 'add_text':
            draw = ImageDraw.Draw(img)
            size = min(200, max(8, int(data['size'])))  # Limit text size
            
            try:
                if data['style'] == 'bold':
                    font = ImageFont.truetype("arialbd.ttf", size)
                elif data['style'] == 'italic':
                    font = ImageFont.truetype("ariali.ttf", size)
                elif data['style'] == 'bold-italic':
                    font = ImageFont.truetype("arialbi.ttf", size)
                elif data['style'] == 'handwritten':
                    font = ImageFont.truetype("handwritten.ttf", size)
                else:
                    font = ImageFont.truetype("arial.ttf", size)
            except:
                # Fallback to default font if custom font not found
                font = ImageFont.load_default()

            # Convert hex color to RGB
            color = hex_to_rgb(data['color'])
            
            x = max(0, min(img.width, int(data['x'])))
            y = max(0, min(img.height, int(data['y'])))
            
            draw.text((x, y), data['text'], font=font, fill=color)

        img.save(img_path, 'JPEG')
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)})

@app.route('/download')
def download_image():
    try:
        return send_file(
            os.path.join(app.config['UPLOAD_FOLDER'], 'image.jpg'),
            mimetype='image/jpeg',
            as_attachment=True,
            download_name='edited_image.jpg'
        )
    except Exception as e:
        return jsonify({'error': str(e)})

if __name__ == '__main__':
    app.run(debug=True)