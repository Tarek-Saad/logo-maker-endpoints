const express = require('express');
const router = express.Router();
const { query, getClient } = require('../config/database');

// ==============================================
// CATEGORY MANAGEMENT
// ==============================================

// GET /api/templates/categories - Get all categories
router.get('/categories', async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        c.id, c.name, c.description, c.created_at, c.updated_at,
        ai.url as icon_url, ai.name as icon_name
      FROM categories c
      LEFT JOIN assets ai ON ai.id = c.icon_asset_id
      ORDER BY c.name ASC
    `);

    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch categories' });
  }
});

// POST /api/templates/categories - Create new category
router.post('/categories', async (req, res) => {
  try {
    const { name, description, icon_asset_id } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'name is required' });
    }

    const result = await query(`
      INSERT INTO categories (name, description, icon_asset_id)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [name, description, icon_asset_id]);

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ success: false, message: 'Failed to create category' });
  }
});

// PATCH /api/templates/categories/:id - Update category
router.patch('/categories/:id', async (req, res) => {
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
      UPDATE categories 
      SET ${setClause.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount}
      RETURNING *
    `, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ success: false, message: 'Failed to update category' });
  }
});

// DELETE /api/templates/categories/:id - Delete category
router.delete('/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM categories WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    res.json({ 
      success: true, 
      message: 'Category deleted successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ success: false, message: 'Failed to delete category' });
  }
});

// ==============================================
// TEMPLATE MANAGEMENT
// ==============================================

// GET /api/templates - Get all templates with filtering
router.get('/', async (req, res) => {
  try {
    const { category_id, search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramCount = 0;

    if (category_id) {
      paramCount++;
      whereClause += ` AND t.category_id = $${paramCount}`;
      params.push(category_id);
    }

    if (search) {
      paramCount++;
      whereClause += ` AND (t.title ILIKE $${paramCount} OR t.description ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    paramCount++;
    params.push(limit);
    paramCount++;
    params.push(offset);

    const result = await query(`
      SELECT 
        t.id, t.title, t.description, t.preview_url, t.created_at, t.updated_at,
        c.name as category_name,
        l.title as logo_title, l.canvas_w, l.canvas_h, l.thumbnail_url
      FROM templates t
      LEFT JOIN categories c ON c.id = t.category_id
      LEFT JOIN logos l ON l.id = t.base_logo_id
      ${whereClause}
      ORDER BY t.created_at DESC
      LIMIT $${paramCount - 1} OFFSET $${paramCount}
    `, params);

    // Get total count
    const countResult = await query(`
      SELECT COUNT(*) as total 
      FROM templates t
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
    console.error('Error fetching templates:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch templates' });
  }
});

// GET /api/templates/:id - Get template by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await query(`
      SELECT 
        t.id, t.title, t.description, t.preview_url, t.created_at, t.updated_at,
        c.name as category_name,
        l.id as logo_id, l.title as logo_title, l.canvas_w, l.canvas_h, l.thumbnail_url
      FROM templates t
      LEFT JOIN categories c ON c.id = t.category_id
      LEFT JOIN logos l ON l.id = t.base_logo_id
      WHERE t.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching template:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch template' });
  }
});

// POST /api/templates - Create new template
router.post('/', async (req, res) => {
  const client = await getClient();
  try {
    const { title, description, category_id, base_logo_id, preview_url } = req.body;

    if (!title || !base_logo_id) {
      return res.status(400).json({ 
        success: false, 
        message: 'title and base_logo_id are required' 
      });
    }

    // Verify that the base logo exists
    const logoCheck = await client.query('SELECT id FROM logos WHERE id = $1', [base_logo_id]);
    if (logoCheck.rows.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Base logo not found' 
      });
    }

    const result = await client.query(`
      INSERT INTO templates (title, description, category_id, base_logo_id, preview_url)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [title, description, category_id, base_logo_id, preview_url]);

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error creating template:', error);
    res.status(500).json({ success: false, message: 'Failed to create template' });
  } finally {
    client.release();
  }
});

// PATCH /api/templates/:id - Update template
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
      UPDATE templates 
      SET ${setClause.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount}
      RETURNING *
    `, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error updating template:', error);
    res.status(500).json({ success: false, message: 'Failed to update template' });
  }
});

// DELETE /api/templates/:id - Delete template
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM templates WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }

    res.json({ 
      success: true, 
      message: 'Template deleted successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error deleting template:', error);
    res.status(500).json({ success: false, message: 'Failed to delete template' });
  }
});

// ==============================================
// TEMPLATE USAGE
// ==============================================

// POST /api/templates/:id/use - Create new logo from template
router.post('/:id/use', async (req, res) => {
  const client = await getClient();
  try {
    const { id } = req.params;
    const { owner_id, title } = req.body;

    if (!owner_id || !title) {
      return res.status(400).json({ 
        success: false, 
        message: 'owner_id and title are required' 
      });
    }

    await client.query('BEGIN');

    // Get template info
    const templateResult = await client.query(`
      SELECT t.base_logo_id, l.title as logo_title, l.canvas_w, l.canvas_h, l.dpi
      FROM templates t
      JOIN logos l ON l.id = t.base_logo_id
      WHERE t.id = $1
    `, [id]);

    if (templateResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Template not found' });
    }

    const { base_logo_id, logo_title, canvas_w, canvas_h, dpi } = templateResult.rows[0];

    // Create new logo
    const logoResult = await client.query(`
      INSERT INTO logos (owner_id, title, canvas_w, canvas_h, dpi)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [owner_id, title, canvas_w, canvas_h, dpi]);

    const newLogo = logoResult.rows[0];

    // Copy all layers from the template logo
    const layersResult = await client.query(`
      SELECT 
        lay.type, lay.name, lay.z_index, lay.x_norm, lay.y_norm, lay.scale, 
        lay.rotation_deg, lay.anchor_x, lay.anchor_y, lay.opacity, lay.blend_mode,
        lay.is_visible, lay.is_locked, lay.common_style,
        lt.content, lt.font_id, lt.font_size, lt.line_height, lt.letter_spacing,
        lt.align, lt.baseline, lt.fill_hex, lt.fill_alpha, lt.stroke_hex,
        lt.stroke_alpha, lt.stroke_width, lt.stroke_align, lt.gradient as text_gradient,
        ls.shape_kind, ls.svg_path, ls.points, ls.rx, ls.ry,
        ls.fill_hex as shape_fill_hex, ls.fill_alpha as shape_fill_alpha,
        ls.gradient as shape_gradient, ls.stroke_hex as shape_stroke_hex,
        ls.stroke_alpha as shape_stroke_alpha, ls.stroke_width as shape_stroke_width,
        ls.stroke_dash, ls.line_cap, ls.line_join, ls.meta as shape_meta,
        li.asset_id as icon_asset_id, li.tint_hex, li.tint_alpha, li.allow_recolor,
        lim.asset_id as image_asset_id, lim.crop, lim.fit, lim.rounding,
        lim.blur, lim.brightness, lim.contrast,
        lb.mode, lb.fill_hex as bg_fill_hex, lb.fill_alpha as bg_fill_alpha,
        lb.gradient as bg_gradient, lb.asset_id as bg_asset_id,
        lb.repeat, lb.position, lb.size
      FROM layers lay
      LEFT JOIN layer_text lt ON lt.layer_id = lay.id
      LEFT JOIN layer_shape ls ON ls.layer_id = lay.id
      LEFT JOIN layer_icon li ON li.layer_id = lay.id
      LEFT JOIN layer_image lim ON lim.layer_id = lay.id
      LEFT JOIN layer_background lb ON lb.layer_id = lay.id
      WHERE lay.logo_id = $1
      ORDER BY lay.z_index ASC
    `, [base_logo_id]);

    const createdLayers = [];

    // Copy each layer
    for (const layerData of layersResult.rows) {
      // Create base layer
      const layerResult = await client.query(`
        INSERT INTO layers (
          logo_id, type, name, z_index, x_norm, y_norm, scale, rotation_deg,
          anchor_x, anchor_y, opacity, blend_mode, is_visible, is_locked, common_style
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        RETURNING *
      `, [
        newLogo.id, layerData.type, layerData.name, layerData.z_index,
        layerData.x_norm, layerData.y_norm, layerData.scale, layerData.rotation_deg,
        layerData.anchor_x, layerData.anchor_y, layerData.opacity, layerData.blend_mode,
        layerData.is_visible, layerData.is_locked, layerData.common_style
      ]);

      const newLayer = layerResult.rows[0];

      // Copy type-specific data
      switch (layerData.type) {
        case 'TEXT':
          if (layerData.content) {
            await client.query(`
              INSERT INTO layer_text (
                layer_id, content, font_id, font_size, line_height, letter_spacing,
                align, baseline, fill_hex, fill_alpha, stroke_hex, stroke_alpha,
                stroke_width, stroke_align, gradient
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
            `, [
              newLayer.id, layerData.content, layerData.font_id, layerData.font_size,
              layerData.line_height, layerData.letter_spacing, layerData.align,
              layerData.baseline, layerData.fill_hex, layerData.fill_alpha,
              layerData.stroke_hex, layerData.stroke_alpha, layerData.stroke_width,
              layerData.stroke_align, layerData.text_gradient
            ]);
          }
          break;

        case 'SHAPE':
          if (layerData.shape_kind) {
            await client.query(`
              INSERT INTO layer_shape (
                layer_id, shape_kind, svg_path, points, rx, ry, fill_hex, fill_alpha,
                gradient, stroke_hex, stroke_alpha, stroke_width, stroke_dash,
                line_cap, line_join, meta
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
            `, [
              newLayer.id, layerData.shape_kind, layerData.svg_path, layerData.points,
              layerData.rx, layerData.ry, layerData.shape_fill_hex, layerData.shape_fill_alpha,
              layerData.shape_gradient, layerData.shape_stroke_hex, layerData.shape_stroke_alpha,
              layerData.shape_stroke_width, layerData.stroke_dash, layerData.line_cap,
              layerData.line_join, layerData.shape_meta
            ]);
          }
          break;

        case 'ICON':
          if (layerData.icon_asset_id) {
            await client.query(`
              INSERT INTO layer_icon (layer_id, asset_id, tint_hex, tint_alpha, allow_recolor)
              VALUES ($1, $2, $3, $4, $5)
            `, [
              newLayer.id, layerData.icon_asset_id, layerData.tint_hex,
              layerData.tint_alpha, layerData.allow_recolor
            ]);
          }
          break;

        case 'IMAGE':
          if (layerData.image_asset_id) {
            await client.query(`
              INSERT INTO layer_image (layer_id, asset_id, crop, fit, rounding, blur, brightness, contrast)
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            `, [
              newLayer.id, layerData.image_asset_id, layerData.crop, layerData.fit,
              layerData.rounding, layerData.blur, layerData.brightness, layerData.contrast
            ]);
          }
          break;

        case 'BACKGROUND':
          if (layerData.mode) {
            await client.query(`
              INSERT INTO layer_background (
                layer_id, mode, fill_hex, fill_alpha, gradient, asset_id, repeat, position, size
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            `, [
              newLayer.id, layerData.mode, layerData.bg_fill_hex, layerData.bg_fill_alpha,
              layerData.bg_gradient, layerData.bg_asset_id, layerData.repeat,
              layerData.position, layerData.size
            ]);
          }
          break;
      }

      createdLayers.push(newLayer);
    }

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      data: {
        ...newLogo,
        layers: createdLayers
      }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error using template:', error);
    res.status(500).json({ success: false, message: 'Failed to use template' });
  } finally {
    client.release();
  }
});

module.exports = router;
