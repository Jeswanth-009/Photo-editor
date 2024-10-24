from flask import Flask, render_template, request, send_file
from PIL import Image
import os

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads/'

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_image():
    if 'file' not in request.files:
        return 'No file part'
    
    file = request.files['file']
    if file.filename == '':
        return 'No selected file'
    
    if file:
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
        file.save(filepath)
        return filepath

if __name__ == '__main__':
    app.run(debug=True)


@app.route('/process', methods=['POST'])
def process_image():
    action = request.form['action']
    img_path = request.form['image_path']
    img = Image.open(img_path)
    
    if action == 'resize':
        img = img.resize((200, 200))  # Example resize to 200x200
    elif action == 'rotate':
        img = img.rotate(90)
    elif action == 'add_text':
        from PIL import ImageDraw, ImageFont
        draw = ImageDraw.Draw(img)
        font = ImageFont.load_default()
        draw.text((10, 10), "Sample Text", font=font, fill="black")

    output_path = os.path.join(app.config['UPLOAD_FOLDER'], 'edited_image.png')
    img.save(output_path)
    
    return send_file(output_path, mimetype='image/png')
