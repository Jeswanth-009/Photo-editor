let image = null;
let cropper = null;
const canvas = document.getElementById('imageCanvas');
const ctx = canvas.getContext('2d');

// Upload Image and initialize Cropper.js
document.getElementById('imageInput').addEventListener('change', function (e) {
    const file = e.target.files[0];
    const reader = new FileReader();
    
    reader.onload = function (event) {
        const imgElement = document.getElementById('imageToEdit');
        imgElement.src = event.target.result;

        if (cropper) {
            cropper.destroy();
        }
        cropper = new Cropper(imgElement, {
            aspectRatio: 1,
            viewMode: 1
        });
    };

    reader.readAsDataURL(file);
});

// Crop the image
document.getElementById('cropButton').addEventListener('click', function () {
    const croppedCanvas = cropper.getCroppedCanvas();
    canvas.width = croppedCanvas.width;
    canvas.height = croppedCanvas.height;
    ctx.drawImage(croppedCanvas, 0, 0);
});

// Resize the image (50% of original size)
document.getElementById('resizeButton').addEventListener('click', function () {
    canvas.width = cropper.getCanvasData().width * 0.5;
    canvas.height = cropper.getCanvasData().height * 0.5;
    ctx.scale(0.5, 0.5);
    ctx.drawImage(cropper.getCroppedCanvas(), 0, 0);
});

// Rotate the image (90 degrees)
document.getElementById('rotateButton').addEventListener('click', function () {
    cropper.rotate(90);
    const rotatedCanvas = cropper.getCroppedCanvas();
    canvas.width = rotatedCanvas.width;
    canvas.height = rotatedCanvas.height;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(rotatedCanvas, 0, 0);
});

// Add Text to the image
document.getElementById('addTextButton').addEventListener('click', function () {
    const text = prompt('Enter text to add:');
    if (text) {
        ctx.font = '30px Arial';
        ctx.fillStyle = 'black';
        ctx.fillText(text, 50, 50);
    }
});

// Download the edited image
document.getElementById('downloadButton').addEventListener('click', function () {
    const link = document.createElement('a');
    link.href = canvas.toDataURL();
    link.download = 'edited_image.png';
    link.click();
});
