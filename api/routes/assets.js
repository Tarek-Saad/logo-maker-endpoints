const express = require('express');
const router = express.Router();
const { query, getClient } = require('../config/database');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// ==============================================
// ASSET MANAGEMENT ENDPOINTS
// ==============================================

// GET /api/assets - Get all assets with filtering
router.get('/', async (req, res) => {
  try {
    const { kind, category, search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramCount = 0;

    if (kind) {
      paramCount++;
      whereClause += ` AND kind = $${paramCount}`;
      params.push(kind);
    }

    if (category) {
      paramCount++;
      whereClause += ` AND meta->>'category' = $${paramCount}`;
      params.push(category);
    }

    if (search) {
      paramCount++;
      whereClause += ` AND (name ILIKE $${paramCount} OR meta->>'tags' ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    paramCount++;
    params.push(limit);
    paramCount++;
    params.push(offset);

    const result = await query(`
      SELECT 
        id, kind, name, storage, url, provider_id, mime_type, 
        bytes_size, width, height, has_alpha, dominant_hex, 
        palette, vector_svg, meta, created_by, created_at, updated_at
      FROM assets 
      ${whereClause}
      ORDER BY created_at DESC 
      LIMIT $${paramCount - 1} OFFSET $${paramCount}
    `, params);

    // Get total count
    const countResult = await query(`
      SELECT COUNT(*) as total 
      FROM assets 
      ${whereClause}
    `, params.slice(0, -2));

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].total),
        pages: Math.ceil(countResult.rows[0].total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching assets:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch assets' });
  }
});

// GET /api/assets/:id - Get asset by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await query(`
      SELECT 
        id, kind, name, storage, url, provider_id, mime_type, 
        bytes_size, width, height, has_alpha, dominant_hex, 
        palette, vector_svg, meta, created_by, created_at, updated_at
      FROM assets 
      WHERE id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching asset:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch asset' });
  }
});

// POST /api/assets/sign-upload - Get signed upload URL for Cloudinary
router.post('/sign-upload', async (req, res) => {
  try {
    const { folder = 'logo-maker', public_id, resource_type = 'auto' } = req.body;
    
    const timestamp = Math.round(new Date().getTime() / 1000);
    const signature = cloudinary.utils.api_sign_request({
      timestamp: timestamp,
      folder: folder,
      public_id: public_id,
      resource_type: resource_type
    }, process.env.CLOUDINARY_API_SECRET);

    res.json({
      success: true,
      data: {
        signature,
        timestamp,
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        folder,
        public_id,
        resource_type
      }
    });
  } catch (error) {
    console.error('Error generating upload signature:', error);
    res.status(500).json({ success: false, message: 'Failed to generate upload signature' });
  }
});

// POST /api/assets - Create asset record after upload
router.post('/', async (req, res) => {
  try {
    const {
      kind,
      name,
      storage = 'cloudinary',
      url,
      provider_id,
      mime_type,
      bytes_size,
      width,
      height,
      has_alpha,
      dominant_hex,
      palette,
      vector_svg,
      meta = {},
      created_by
    } = req.body;

    if (!kind || !name || !url || !mime_type) {
      return res.status(400).json({ 
        success: false, 
        message: 'kind, name, url, and mime_type are required' 
      });
    }

    const result = await query(`
      INSERT INTO assets (
        kind, name, storage, url, provider_id, mime_type, 
        bytes_size, width, height, has_alpha, dominant_hex, 
        palette, vector_svg, meta, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *
    `, [
      kind, name, storage, url, provider_id, mime_type,
      bytes_size, width, height, has_alpha, dominant_hex,
      palette, vector_svg, meta, created_by
    ]);

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error creating asset:', error);
    res.status(500).json({ success: false, message: 'Failed to create asset' });
  }
});

// POST /api/assets/upload - Direct upload with Cloudinary
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file provided' });
    }

    const { kind, name, meta = {} } = req.body;
    const file = req.file;

    // Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto',
          folder: 'logo-maker',
          public_id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(file.buffer);
    });

    // Determine asset kind if not provided
    const detectedKind = kind || (
      uploadResult.resource_type === 'image' ? 'raster' :
      uploadResult.format === 'svg' ? 'vector' :
      'raster'
    );

    // Extract color palette if it's an image
    let palette = null;
    let dominantHex = null;
    
    if (uploadResult.resource_type === 'image' && uploadResult.colors) {
      palette = uploadResult.colors.map(color => ({
        hex: color,
        ratio: 1 / uploadResult.colors.length
      }));
      dominantHex = uploadResult.colors[0];
    }

    // Create asset record
    const assetResult = await query(`
      INSERT INTO assets (
        kind, name, storage, url, provider_id, mime_type,
        bytes_size, width, height, has_alpha, dominant_hex,
        palette, meta
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `, [
      detectedKind,
      name || file.originalname,
      'cloudinary',
      uploadResult.secure_url,
      uploadResult.public_id,
      file.mimetype,
      uploadResult.bytes,
      uploadResult.width,
      uploadResult.height,
      uploadResult.format === 'png' || uploadResult.format === 'svg',
      dominantHex,
      palette,
      { ...meta, original_filename: file.originalname }
    ]);

    res.status(201).json({ 
      success: true, 
      data: assetResult.rows[0],
      upload: {
        public_id: uploadResult.public_id,
        secure_url: uploadResult.secure_url,
        format: uploadResult.format,
        resource_type: uploadResult.resource_type
      }
    });
  } catch (error) {
    console.error('Error uploading asset:', error);
    res.status(500).json({ success: false, message: 'Failed to upload asset' });
  }
});

// PATCH /api/assets/:id - Update asset metadata
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Build dynamic update query
    const setClause = [];
    const values = [];
    let paramCount = 0;

    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        paramCount++;
        setClause.push(`${key} = $${paramCount}`);
        values.push(updates[key]);
      }
    });

    if (setClause.length === 0) {
      return res.status(400).json({ success: false, message: 'No updates provided' });
    }

    paramCount++;
    values.push(id);

    const result = await query(`
      UPDATE assets 
      SET ${setClause.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount}
      RETURNING *
    `, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error updating asset:', error);
    res.status(500).json({ success: false, message: 'Failed to update asset' });
  }
});

// DELETE /api/assets/:id - Delete asset
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Get asset info first
    const assetResult = await query('SELECT * FROM assets WHERE id = $1', [id]);
    
    if (assetResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }

    const asset = assetResult.rows[0];

    // Delete from Cloudinary if it's stored there
    if (asset.storage === 'cloudinary' && asset.provider_id) {
      try {
        await cloudinary.uploader.destroy(asset.provider_id, {
          resource_type: asset.mime_type.startsWith('image/') ? 'image' : 'raw'
        });
      } catch (cloudinaryError) {
        console.warn('Failed to delete from Cloudinary:', cloudinaryError.message);
        // Continue with database deletion even if Cloudinary deletion fails
      }
    }

    // Delete from database
    const result = await query('DELETE FROM assets WHERE id = $1 RETURNING *', [id]);

    res.json({ 
      success: true, 
      message: 'Asset deleted successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error deleting asset:', error);
    res.status(500).json({ success: false, message: 'Failed to delete asset' });
  }
});

// GET /api/assets/:id/download - Get download URL (for private assets)
router.get('/:id/download', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await query('SELECT url, storage, provider_id FROM assets WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }

    const asset = result.rows[0];

    // For Cloudinary, generate a signed URL if needed
    if (asset.storage === 'cloudinary') {
      const signedUrl = cloudinary.url(asset.provider_id, {
        secure: true,
        sign_url: true,
        expires_at: Math.floor(Date.now() / 1000) + 3600 // 1 hour
      });
      
      res.json({ 
        success: true, 
        data: { download_url: signedUrl, expires_in: 3600 }
      });
    } else {
      res.json({ 
        success: true, 
        data: { download_url: asset.url }
      });
    }
  } catch (error) {
    console.error('Error generating download URL:', error);
    res.status(500).json({ success: false, message: 'Failed to generate download URL' });
  }
});

module.exports = router;
