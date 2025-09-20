const express = require('express');
const router = express.Router();
const { upload, deleteImage, getImageUrl } = require('../config/cloudinary');

// POST /api/upload/image - Upload single image
router.post('/image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    res.json({
      success: true,
      data: {
        public_id: req.file.public_id,
        secure_url: req.file.secure_url,
        original_name: req.file.originalname,
        size: req.file.size,
        format: req.file.format
      },
      message: 'Image uploaded successfully'
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload image'
    });
  }
});

// POST /api/upload/images - Upload multiple images
router.post('/images', upload.array('images', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No image files provided'
      });
    }

    const uploadedImages = req.files.map(file => ({
      public_id: file.public_id,
      secure_url: file.secure_url,
      original_name: file.originalname,
      size: file.size,
      format: file.format
    }));

    res.json({
      success: true,
      data: uploadedImages,
      count: uploadedImages.length,
      message: 'Images uploaded successfully'
    });
  } catch (error) {
    console.error('Error uploading images:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload images'
    });
  }
});

// DELETE /api/upload/image/:publicId - Delete image
router.delete('/image/:publicId', async (req, res) => {
  try {
    const { publicId } = req.params;
    
    if (!publicId) {
      return res.status(400).json({
        success: false,
        message: 'Public ID is required'
      });
    }

    const result = await deleteImage(publicId);
    
    if (result.result === 'ok') {
      res.json({
        success: true,
        message: 'Image deleted successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Image not found or already deleted'
      });
    }
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete image'
    });
  }
});

// GET /api/upload/image/:publicId/url - Get image URL with transformations
router.get('/image/:publicId/url', (req, res) => {
  try {
    const { publicId } = req.params;
    const { width, height, crop, quality, format } = req.query;
    
    if (!publicId) {
      return res.status(400).json({
        success: false,
        message: 'Public ID is required'
      });
    }

    const options = {};
    if (width) options.width = parseInt(width);
    if (height) options.height = parseInt(height);
    if (crop) options.crop = crop;
    if (quality) options.quality = quality;
    if (format) options.format = format;

    const imageUrl = getImageUrl(publicId, options);
    
    res.json({
      success: true,
      data: {
        public_id: publicId,
        url: imageUrl,
        transformations: options
      }
    });
  } catch (error) {
    console.error('Error generating image URL:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate image URL'
    });
  }
});

module.exports = router;
