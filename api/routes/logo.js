const express = require('express');
const router = express.Router();
const { query, getClient } = require('../config/database');

// ==============================================
// LOGO CRUD OPERATIONS
// ==============================================

// GET /api/logo/:id - Get logo by ID with all layers and their properties
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch logo basic info
    const logoRes = await query(`
      SELECT 
        l.id, l.owner_id, l.title, l.canvas_w, l.canvas_h, l.dpi,
        l.thumbnail_url, l.is_template, l.category_id, l.created_at, l.updated_at,
        c.name as category_name
      FROM logos l
      LEFT JOIN categories c ON c.id = l.category_id
      WHERE l.id = $1
    `, [id]);

    if (logoRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Logo not found' });
    }

    const logo = logoRes.rows[0];

    // Fetch all layers with their type-specific data
    const layersRes = await query(`
      SELECT 
        lay.id, lay.logo_id, lay.type, lay.name, lay.z_index,
        lay.x_norm, lay.y_norm, lay.scale, lay.rotation_deg,
        lay.anchor_x, lay.anchor_y, lay.opacity, lay.blend_mode,
        lay.is_visible, lay.is_locked, lay.common_style,
        lay.created_at, lay.updated_at,
        
        -- Text layer data
        lt.content, lt.font_id, lt.font_size, lt.line_height, lt.letter_spacing,
        lt.align, lt.baseline, lt.fill_hex, lt.fill_alpha, lt.stroke_hex,
        lt.stroke_alpha, lt.stroke_width, lt.stroke_align, lt.gradient as text_gradient,
        
        -- Shape layer data
        ls.shape_kind, ls.svg_path, ls.points, ls.rx, ls.ry,
        ls.fill_hex as shape_fill_hex, ls.fill_alpha as shape_fill_alpha,
        ls.gradient as shape_gradient, ls.stroke_hex as shape_stroke_hex,
        ls.stroke_alpha as shape_stroke_alpha, ls.stroke_width as shape_stroke_width,
        ls.stroke_dash, ls.line_cap, ls.line_join, ls.meta as shape_meta,
        
        -- Icon layer data
        li.asset_id as icon_asset_id, li.tint_hex, li.tint_alpha, li.allow_recolor,
        
        -- Image layer data
        lim.asset_id as image_asset_id, lim.crop, lim.fit, lim.rounding,
        lim.blur, lim.brightness, lim.contrast,
        
        -- Background layer data
        lb.mode, lb.fill_hex as bg_fill_hex, lb.fill_alpha as bg_fill_alpha,
        lb.gradient as bg_gradient, lb.asset_id as bg_asset_id,
        lb.repeat, lb.position, lb.size,
        
        -- Asset data for icons and images
        ai.id as asset_id, ai.kind as asset_kind, ai.name as asset_name,
        ai.url as asset_url, ai.width as asset_width, ai.height as asset_height,
        ai.has_alpha as asset_has_alpha, ai.vector_svg, ai.meta as asset_meta,
        
        -- Font data for text layers
        f.family as font_family, f.style as font_style, f.weight as font_weight,
        f.url as font_url, f.fallbacks as font_fallbacks
      FROM layers lay
      LEFT JOIN layer_text lt ON lt.layer_id = lay.id
      LEFT JOIN layer_shape ls ON ls.layer_id = lay.id
      LEFT JOIN layer_icon li ON li.layer_id = lay.id
      LEFT JOIN layer_image lim ON lim.layer_id = lay.id
      LEFT JOIN layer_background lb ON lb.layer_id = lay.id
      LEFT JOIN assets ai ON (ai.id = li.asset_id OR ai.id = lim.asset_id OR ai.id = lb.asset_id)
      LEFT JOIN fonts f ON f.id = lt.font_id
      WHERE lay.logo_id = $1
      ORDER BY lay.z_index ASC, lay.created_at ASC
    `, [id]);

    // Process layers and group by type
    const layers = layersRes.rows.map(row => {
      const baseLayer = {
        id: row.id,
        logo_id: row.logo_id,
        type: row.type,
        name: row.name,
        z_index: row.z_index,
        x_norm: row.x_norm,
        y_norm: row.y_norm,
        scale: row.scale,
        rotation_deg: row.rotation_deg,
        anchor_x: row.anchor_x,
        anchor_y: row.anchor_y,
        opacity: row.opacity,
        blend_mode: row.blend_mode,
        is_visible: row.is_visible,
        is_locked: row.is_locked,
        common_style: row.common_style,
        created_at: row.created_at,
        updated_at: row.updated_at
      };

      // Add type-specific properties
      switch (row.type) {
        case 'TEXT':
          return {
            ...baseLayer,
            text: {
              content: row.content,
              font_id: row.font_id,
              font_size: row.font_size,
              line_height: row.line_height,
              letter_spacing: row.letter_spacing,
              align: row.align,
              baseline: row.baseline,
              fill_hex: row.fill_hex,
              fill_alpha: row.fill_alpha,
              stroke_hex: row.stroke_hex,
              stroke_alpha: row.stroke_alpha,
              stroke_width: row.stroke_width,
              stroke_align: row.stroke_align,
              gradient: row.text_gradient,
              font: row.font_family ? {
                family: row.font_family,
                style: row.font_style,
                weight: row.font_weight,
                url: row.font_url,
                fallbacks: row.font_fallbacks
              } : null
            }
          };

        case 'SHAPE':
          return {
            ...baseLayer,
            shape: {
              shape_kind: row.shape_kind,
              svg_path: row.svg_path,
              points: row.points,
              rx: row.rx,
              ry: row.ry,
              fill_hex: row.shape_fill_hex,
              fill_alpha: row.shape_fill_alpha,
              gradient: row.shape_gradient,
              stroke_hex: row.shape_stroke_hex,
              stroke_alpha: row.shape_stroke_alpha,
              stroke_width: row.shape_stroke_width,
              stroke_dash: row.stroke_dash,
              line_cap: row.line_cap,
              line_join: row.line_join,
              meta: row.shape_meta
            }
          };

        case 'ICON':
          return {
            ...baseLayer,
            icon: {
              asset_id: row.icon_asset_id,
              tint_hex: row.tint_hex,
              tint_alpha: row.tint_alpha,
              allow_recolor: row.allow_recolor,
              asset: row.asset_id ? {
                id: row.asset_id,
                kind: row.asset_kind,
                name: row.asset_name,
                url: row.asset_url,
                width: row.asset_width,
                height: row.asset_height,
                has_alpha: row.asset_has_alpha,
                vector_svg: row.vector_svg,
                meta: row.asset_meta
              } : null
            }
          };

        case 'IMAGE':
          return {
            ...baseLayer,
            image: {
              asset_id: row.image_asset_id,
              crop: row.crop,
              fit: row.fit,
              rounding: row.rounding,
              blur: row.blur,
              brightness: row.brightness,
              contrast: row.contrast,
              asset: row.asset_id ? {
                id: row.asset_id,
                kind: row.asset_kind,
                name: row.asset_name,
                url: row.asset_url,
                width: row.asset_width,
                height: row.asset_height,
                has_alpha: row.asset_has_alpha,
                meta: row.asset_meta
              } : null
            }
          };

        case 'BACKGROUND':
          return {
            ...baseLayer,
            background: {
              mode: row.mode,
              fill_hex: row.bg_fill_hex,
              fill_alpha: row.bg_fill_alpha,
              gradient: row.bg_gradient,
              asset_id: row.bg_asset_id,
              repeat: row.repeat,
              position: row.position,
              size: row.size,
              asset: row.asset_id ? {
                id: row.asset_id,
                kind: row.asset_kind,
                name: row.asset_name,
                url: row.asset_url,
                width: row.asset_width,
                height: row.asset_height,
                has_alpha: row.asset_has_alpha,
                meta: row.asset_meta
              } : null
            }
          };

        default:
          return baseLayer;
      }
    });

    res.json({ 
      success: true, 
      data: { 
        ...logo, 
        layers 
      } 
    });
  } catch (error) {
    console.error('Error fetching logo with layers:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch logo' });
  }
});

// POST /api/logo - Create new logo with layers
router.post('/', async (req, res) => {
  const client = await getClient();
  try {
    const { 
      owner_id, 
      title, 
      canvas_w = 1080, 
      canvas_h = 1080, 
      dpi, 
      category_id, 
      is_template = false,
      layers = [] 
    } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'title is required' });
    }

    await client.query('BEGIN');

    // Create logo
    const logoRes = await client.query(`
      INSERT INTO logos (owner_id, title, canvas_w, canvas_h, dpi, category_id, is_template)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [owner_id, title, canvas_w, canvas_h, dpi, category_id, is_template]);

    const logo = logoRes.rows[0];
    const createdLayers = [];

    // Process each layer
    for (const layerData of layers) {
      const {
        type, name, z_index = 0, x_norm = 0.5, y_norm = 0.5, scale = 1,
        rotation_deg = 0, anchor_x = 0.5, anchor_y = 0.5, opacity = 1,
        blend_mode = 'normal', is_visible = true, is_locked = false,
        common_style, text, shape, icon, image, background
      } = layerData;

      // Create base layer
      const layerRes = await client.query(`
        INSERT INTO layers (
          logo_id, type, name, z_index, x_norm, y_norm, scale, rotation_deg,
          anchor_x, anchor_y, opacity, blend_mode, is_visible, is_locked, common_style
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        RETURNING *
      `, [
        logo.id, type, name, z_index, x_norm, y_norm, scale, rotation_deg,
        anchor_x, anchor_y, opacity, blend_mode, is_visible, is_locked, common_style
      ]);

      const layer = layerRes.rows[0];

      // Create type-specific data
      switch (type) {
        case 'TEXT':
          if (text) {
            await client.query(`
              INSERT INTO layer_text (
                layer_id, content, font_id, font_size, line_height, letter_spacing,
                align, baseline, fill_hex, fill_alpha, stroke_hex, stroke_alpha,
                stroke_width, stroke_align, gradient
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
            `, [
              layer.id, text.content, text.font_id, text.font_size, text.line_height,
              text.letter_spacing, text.align, text.baseline, text.fill_hex, text.fill_alpha,
              text.stroke_hex, text.stroke_alpha, text.stroke_width, text.stroke_align, text.gradient
            ]);
          }
          break;

        case 'SHAPE':
          if (shape) {
            await client.query(`
              INSERT INTO layer_shape (
                layer_id, shape_kind, svg_path, points, rx, ry, fill_hex, fill_alpha,
                gradient, stroke_hex, stroke_alpha, stroke_width, stroke_dash,
                line_cap, line_join, meta
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
            `, [
              layer.id, shape.shape_kind, shape.svg_path, shape.points, shape.rx, shape.ry,
              shape.fill_hex, shape.fill_alpha, shape.gradient, shape.stroke_hex,
              shape.stroke_alpha, shape.stroke_width, shape.stroke_dash, shape.line_cap,
              shape.line_join, shape.meta
            ]);
          }
          break;

        case 'ICON':
          if (icon && icon.asset_id) {
            await client.query(`
              INSERT INTO layer_icon (layer_id, asset_id, tint_hex, tint_alpha, allow_recolor)
              VALUES ($1, $2, $3, $4, $5)
            `, [layer.id, icon.asset_id, icon.tint_hex, icon.tint_alpha, icon.allow_recolor]);
          }
          break;

        case 'IMAGE':
          if (image && image.asset_id) {
            await client.query(`
              INSERT INTO layer_image (layer_id, asset_id, crop, fit, rounding, blur, brightness, contrast)
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            `, [
              layer.id, image.asset_id, image.crop, image.fit, image.rounding,
              image.blur, image.brightness, image.contrast
            ]);
          }
          break;

        case 'BACKGROUND':
          if (background) {
            await client.query(`
              INSERT INTO layer_background (
                layer_id, mode, fill_hex, fill_alpha, gradient, asset_id, repeat, position, size
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            `, [
              layer.id, background.mode, background.fill_hex, background.fill_alpha,
              background.gradient, background.asset_id, background.repeat,
              background.position, background.size
            ]);
          }
          break;
      }

      createdLayers.push(layer);
    }

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      data: {
        ...logo,
        layers: createdLayers
      }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating logo:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to create logo' });
  } finally {
    client.release();
  }
});

// PATCH /api/logo/:id - Update logo
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Build dynamic update query
    const setClause = [];
    const values = [];
    let paramCount = 0;

    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined && key !== 'layers') {
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
      UPDATE logos 
      SET ${setClause.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount}
      RETURNING *
    `, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Logo not found' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error updating logo:', error);
    res.status(500).json({ success: false, message: 'Failed to update logo' });
  }
});

// DELETE /api/logo/:id - Delete logo
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM logos WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Logo not found' });
    }

    res.json({ 
      success: true, 
      message: 'Logo deleted successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error deleting logo:', error);
    res.status(500).json({ success: false, message: 'Failed to delete logo' });
  }
});

// POST /api/logo/:id/version - Create version snapshot
router.post('/:id/version', async (req, res) => {
  try {
    const { id } = req.params;
    const { note } = req.body;

    // Get current logo with all layers
    const logoResult = await query('SELECT get_logo_with_layers($1) as snapshot', [id]);
    
    if (!logoResult.rows[0].snapshot) {
      return res.status(404).json({ success: false, message: 'Logo not found' });
    }

    // Create version
    const versionResult = await query(`
      INSERT INTO logo_versions (logo_id, snapshot, note)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [id, logoResult.rows[0].snapshot, note]);

    res.status(201).json({
      success: true,
      data: versionResult.rows[0]
    });
  } catch (error) {
    console.error('Error creating version:', error);
    res.status(500).json({ success: false, message: 'Failed to create version' });
  }
});

// GET /api/logo/:id/versions - Get logo versions
router.get('/:id/versions', async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const result = await query(`
      SELECT id, logo_id, snapshot, note, created_at
      FROM logo_versions
      WHERE logo_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `, [id, limit, offset]);

    const countResult = await query(`
      SELECT COUNT(*) as total FROM logo_versions WHERE logo_id = $1
    `, [id]);

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
    console.error('Error fetching versions:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch versions' });
  }
});

module.exports = router;


