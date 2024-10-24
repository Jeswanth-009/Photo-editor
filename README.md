# Photo-editor
# Photo Editor

A web-based photo editing application built with Flask and JavaScript that allows users to perform basic image editing operations.

## Features

- Image upload and display
- Basic image editing operations:
  - Crop: Crop images to desired dimensions
  - Resize: Resize images to 200x200 pixels
  - Rotate: Rotate images by 90 degrees
  - Add Text: Add custom text overlays to images
- Real-time preview of edits
- Download edited images

## Technologies Used

- Backend:
  - Flask (Python web framework)
  - Pillow (Python Imaging Library)
- Frontend:
  - HTML5
  - CSS3
  - JavaScript
  - Cropper.js for image cropping functionality

## Project Structure

```
photo-editor/
├── app.py              # Flask application server
├── templates/
│   └── index.html      # Main application template
├── static/
│   ├── css/
│   │   └── style.css   # Application styling
│   └── js/
│       └── main.js     # Frontend JavaScript logic
└── uploads/            # Directory for storing uploaded images
```

## Setup and Installation

1. Clone the repository
2. Install Python dependencies:
```bash
pip install flask pillow
```

3. Create an `uploads` directory in the project root:
```bash
mkdir uploads
```

4. Run the application:
```bash
python app.py
```

5. Open your browser and navigate to `http://localhost:5000`

## Usage

1. Click the upload button to select an image
2. Use the editing tools in the left pane:
   - **Crop**: Click and drag to select crop area
   - **Resize**: Automatically resizes image to 200x200 pixels
   - **Rotate**: Rotates image 90 degrees clockwise
   - **Add Text**: Prompts for text input and adds it to the image
3. Preview the changes in real-time
4. Click the download button to save your edited image

## Development Notes

- The application uses Flask's development server. For production, use a proper WSGI server
- Uploaded images are stored in the `uploads` directory
- Images are processed server-side using the Pillow library
- The frontend uses the Canvas API for image manipulation and preview

## Security Considerations

- The application currently doesn't implement any file type validation
- There's no limit on file size or storage
- No authentication system is in place
- The uploads directory should be properly secured in a production environment

## Future Improvements

- Add image file type validation
- Implement file size limits
- Add more image editing features (filters, brightness/contrast adjustment)
- Add user authentication
- Add image compression
- Implement proper error handling
- Add support for different aspect ratios
- Add undo/redo functionality

