$(document).ready(function() {
    let image = document.getElementById('image');
    let cropper;
    let isImageLoaded = false;

    function showError(message) {
        alert(message);
    }

    function updateImage(shouldInitCropper = false) {
        const timestamp = new Date().getTime();
        image.src = '/static/uploads/image.jpg?' + timestamp;
        
        if (shouldInitCropper && cropper) {
            cropper.destroy();
        }
        
        image.onload = function() {
            if (shouldInitCropper) {
                cropper = new Cropper(image, {
                    aspectRatio: NaN,
                    viewMode: 1,
                    background: false,
                    responsive: true,
                    restore: false,
                    zoomable: true,
                    scalable: true,
                    movable: true,
                    guides: true,
                    center: true,
                    highlight: true,
                    cropBoxMovable: true,
                    cropBoxResizable: true,
                    toggleDragModeOnDblclick: true
                });
            }
        };
    }

    $('#file-input').change(function(e) {
        const file = e.target.files[0];
        if (!file) return;

        // Check file type
        const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!validTypes.includes(file.type)) {
            showError('Please select a valid image file (JPEG, PNG, or GIF)');
            return;
        }

        // Check file size (max 16MB)
        if (file.size > 16 * 1024 * 1024) {
            showError('File size must be less than 16MB');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        // Show loading indicator
        image.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';
        image.style.opacity = '0.5';

        $.ajax({
            url: '/upload',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function(response) {
                if (response.success) {
                    isImageLoaded = true;
                    image.style.opacity = '1';
                    updateImage(true);
                } else {
                    image.style.opacity = '1';
                    showError(response.error || 'Failed to upload image');
                }
            },
            error: function() {
                image.style.opacity = '1';
                showError('Failed to upload image');
            }
        });
    });

    $('#crop-btn').click(function() {
        if (!isImageLoaded) {
            showError('Please upload an image first');
            return;
        }

        if (cropper) {
            try {
                const cropData = cropper.getData();
                
                $.ajax({
                    url: '/crop',
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify({
                        left: Math.round(cropData.x),
                        top: Math.round(cropData.y),
                        right: Math.round(cropData.x + cropData.width),
                        bottom: Math.round(cropData.y + cropData.height)
                    }),
                    success: function(response) {
                        if (response.success) {
                            updateImage(true);
                        } else {
                            showError(response.error || 'Failed to crop image');
                        }
                    },
                    error: function() {
                        showError('Failed to crop image');
                    }
                });
            } catch (error) {
                showError('Please select a valid crop area first');
            }
        } else {
            showError('Cropper not initialized. Please try uploading the image again.');
        }
    });

    $('#resize-btn').click(function() {
        if (!isImageLoaded) {
            showError('Please upload an image first');
            return;
        }

        const size = prompt('Enter new size (width in pixels, 50-2000):', '300');
        if (size) {
            const numSize = parseInt(size);
            if (isNaN(numSize) || numSize < 50 || numSize > 2000) {
                showError('Please enter a valid size between 50 and 2000 pixels');
                return;
            }

            $.ajax({
                url: '/edit',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({
                    operation: 'resize',
                    size: numSize
                }),
                success: function(response) {
                    if (response.success) {
                        if (cropper) {
                            cropper.destroy();
                            cropper = null;
                        }
                        updateImage();
                    } else {
                        showError(response.error || 'Failed to resize image');
                    }
                },
                error: function() {
                    showError('Failed to resize image');
                }
            });
        }
    });

    $('#rotate-btn').click(function() {
        if (!isImageLoaded) {
            showError('Please upload an image first');
            return;
        }

        const angle = prompt('Enter rotation angle (in degrees):', '90');
        if (angle) {
            const numAngle = parseInt(angle);
            if (isNaN(numAngle)) {
                showError('Please enter a valid number for rotation angle');
                return;
            }

            $.ajax({
                url: '/edit',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({
                    operation: 'rotate',
                    angle: numAngle
                }),
                success: function(response) {
                    if (response.success) {
                        if (cropper) {
                            cropper.destroy();
                            cropper = null;
                        }
                        updateImage();
                    } else {
                        showError(response.error || 'Failed to rotate image');
                    }
                },
                error: function() {
                    showError('Failed to rotate image');
                }
            });
        }
    });

    $('#add-text-btn').click(function() {
        if (!isImageLoaded) {
            showError('Please upload an image first');
            return;
        }

        const text = $('#text-input').val().trim();
        if (!text) {
            showError('Please enter text to add');
            return;
        }

        const size = parseInt($('#text-size').val());
        if (isNaN(size) || size < 8 || size > 72) {
            showError('Text size must be between 8 and 72');
            return;
        }

        const color = $('#text-color').val();
        const style = $('#text-style').val();

        $.ajax({
            url: '/edit',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                operation: 'add_text',
                text: text,
                size: size,
                x: 10,
                y: 10,
                color: color,
                style: style
            }),
            success: function(response) {
                if (response.success) {
                    if (cropper) {
                        cropper.destroy();
                        cropper = null;
                    }
                    updateImage();
                    // Clear text input after successful addition
                    $('#text-input').val('');
                } else {
                    showError(response.error || 'Failed to add text');
                }
            },
            error: function() {
                showError('Failed to add text');
            }
        });
    });

    $('#download-btn').click(function(e) {
        e.preventDefault();
        
        if (!isImageLoaded) {
            showError('Please upload an image first');
            return;
        }

        // Create a temporary anchor element
        const link = document.createElement('a');
        const timestamp = new Date().getTime();
        link.href = '/download?' + timestamp; // Add timestamp to prevent caching
        link.download = 'edited_image.jpg';
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    // Function to check if image is loaded
    function checkImageLoaded() {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = '/static/uploads/image.jpg?' + new Date().getTime();
        });
    }

    // Handle drag and drop
    const dropZone = document.getElementById('image-container');

    dropZone.addEventListener('dragover', function(e) {
        e.preventDefault();
        e.stopPropagation();
        this.style.backgroundColor = '#e9ecef';
    });

    dropZone.addEventListener('dragleave', function(e) {
        e.preventDefault();
        e.stopPropagation();
        this.style.backgroundColor = '';
    });

    dropZone.addEventListener('drop', function(e) {
        e.preventDefault();
        e.stopPropagation();
        this.style.backgroundColor = '';

        const file = e.dataTransfer.files[0];
        if (file) {
            const input = document.getElementById('file-input');
            input.files = e.dataTransfer.files;
            $(input).trigger('change');
        }
    });

    // Key bindings for common operations
    $(document).keydown(function(e) {
        if (!isImageLoaded) return;

        // Ctrl/Cmd + S for download
        if ((e.ctrlKey || e.metaKey) && e.keyCode === 83) {
            e.preventDefault();
            $('#download-btn').click();
        }
        // Delete/Backspace to reset cropper
        else if (e.keyCode === 46 || e.keyCode === 8) {
            if (cropper) {
                e.preventDefault();
                cropper.reset();
            }
        }
    });

    // Check for existing image on page load
    checkImageLoaded().then(exists => {
        if (exists) {
            isImageLoaded = true;
            updateImage(true);
        }
    });

    // Handle window resize
    let resizeTimer;
    $(window).resize(function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            if (cropper) {
                cropper.resize();
            }
        }, 250);
    });

    // Prevent accidental page leave when editing
    window.onbeforeunload = function() {
        if (isImageLoaded) {
            return "You have unsaved changes. Are you sure you want to leave?";
        }
    };
});