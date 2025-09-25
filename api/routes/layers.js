const express = require('express');
const router = express.Router();
const { query, getClient } = require('../config/database');

// ==============================================
// LAYER MANAGEMENT ENDPOINTS
// ==============================================

// GET /api/layers/:id - Get layer by ID with type-specific data
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(`
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
        
        -- Asset data
        ai.id as asset_id, ai.kind as asset_kind, ai.name as asset_name,
        ai.url as asset_url, ai.width as asset_width, ai.height as asset_height,
        ai.has_alpha as asset_has_alpha, ai.vector_svg, ai.meta as asset_meta,
        
        -- Font data
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
      WHERE lay.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Layer not found' });
    }

    const row = result.rows[0];
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
    let layerData = { ...baseLayer };

    switch (row.type) {
      case 'TEXT':
        layerData.text = {
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
        };
        break;

      case 'SHAPE':
        layerData.shape = {
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
        };
        break;

      case 'ICON':
        layerData.icon = {
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
        };
        break;

      case 'IMAGE':
        layerData.image = {
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
        };
        break;

      case 'BACKGROUND':
        layerData.background = {
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
        };
        break;
    }

    res.json({ success: true, data: layerData });
  } catch (error) {
    console.error('Error fetching layer:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch layer' });
  }
});

// PATCH /api/layers/:id - Update layer common properties
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Build dynamic update query for common layer properties
    const setClause = [];
    const values = [];
    let paramCount = 0;

    const allowedFields = [
      'name', 'z_index', 'x_norm', 'y_norm', 'scale', 'rotation_deg',
      'anchor_x', 'anchor_y', 'opacity', 'blend_mode', 'is_visible',
      'is_locked', 'common_style'
    ];

    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key) && updates[key] !== undefined) {
        paramCount++;
        setClause.push(`${key} = $${paramCount}`);
        values.push(updates[key]);
      }
    });

    if (setClause.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid updates provided' });
    }

    paramCount++;
    values.push(id);

    const result = await query(`
      UPDATE layers 
      SET ${setClause.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount}
      RETURNING *
    `, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Layer not found' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error updating layer:', error);
    res.status(500).json({ success: false, message: 'Failed to update layer' });
  }
});

// DELETE /api/layers/:id - Delete layer
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM layers WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Layer not found' });
    }

    res.json({ 
      success: true, 
      message: 'Layer deleted successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error deleting layer:', error);
    res.status(500).json({ success: false, message: 'Failed to delete layer' });
  }
});

// ==============================================
// LAYER-SPECIFIC ENDPOINTS
// ==============================================

// PATCH /api/layers/:id/text - Update text layer properties
router.patch('/:id/text', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Check if layer exists and is text type
    const layerCheck = await query('SELECT type FROM layers WHERE id = $1', [id]);
    if (layerCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Layer not found' });
    }
    if (layerCheck.rows[0].type !== 'TEXT') {
      return res.status(400).json({ success: false, message: 'Layer is not a text layer' });
    }

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
      UPDATE layer_text 
      SET ${setClause.join(', ')}
      WHERE layer_id = $${paramCount}
      RETURNING *
    `, values);

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error updating text layer:', error);
    res.status(500).json({ success: false, message: 'Failed to update text layer' });
  }
});

// PATCH /api/layers/:id/shape - Update shape layer properties
router.patch('/:id/shape', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Check if layer exists and is shape type
    const layerCheck = await query('SELECT type FROM layers WHERE id = $1', [id]);
    if (layerCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Layer not found' });
    }
    if (layerCheck.rows[0].type !== 'SHAPE') {
      return res.status(400).json({ success: false, message: 'Layer is not a shape layer' });
    }

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
      UPDATE layer_shape 
      SET ${setClause.join(', ')}
      WHERE layer_id = $${paramCount}
      RETURNING *
    `, values);

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error updating shape layer:', error);
    res.status(500).json({ success: false, message: 'Failed to update shape layer' });
  }
});

// PATCH /api/layers/:id/icon - Update icon layer properties
router.patch('/:id/icon', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Check if layer exists and is icon type
    const layerCheck = await query('SELECT type FROM layers WHERE id = $1', [id]);
    if (layerCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Layer not found' });
    }
    if (layerCheck.rows[0].type !== 'ICON') {
      return res.status(400).json({ success: false, message: 'Layer is not an icon layer' });
    }

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
      UPDATE layer_icon 
      SET ${setClause.join(', ')}
      WHERE layer_id = $${paramCount}
      RETURNING *
    `, values);

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error updating icon layer:', error);
    res.status(500).json({ success: false, message: 'Failed to update icon layer' });
  }
});

// PATCH /api/layers/:id/image - Update image layer properties
router.patch('/:id/image', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Check if layer exists and is image type
    const layerCheck = await query('SELECT type FROM layers WHERE id = $1', [id]);
    if (layerCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Layer not found' });
    }
    if (layerCheck.rows[0].type !== 'IMAGE') {
      return res.status(400).json({ success: false, message: 'Layer is not an image layer' });
    }

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
      UPDATE layer_image 
      SET ${setClause.join(', ')}
      WHERE layer_id = $${paramCount}
      RETURNING *
    `, values);

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error updating image layer:', error);
    res.status(500).json({ success: false, message: 'Failed to update image layer' });
  }
});

// PATCH /api/layers/:id/background - Update background layer properties
router.patch('/:id/background', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Check if layer exists and is background type
    const layerCheck = await query('SELECT type FROM layers WHERE id = $1', [id]);
    if (layerCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Layer not found' });
    }
    if (layerCheck.rows[0].type !== 'BACKGROUND') {
      return res.status(400).json({ success: false, message: 'Layer is not a background layer' });
    }

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
      UPDATE layer_background 
      SET ${setClause.join(', ')}
      WHERE layer_id = $${paramCount}
      RETURNING *
    `, values);

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error updating background layer:', error);
    res.status(500).json({ success: false, message: 'Failed to update background layer' });
  }
});

// ==============================================
// LAYER REORDERING
// ==============================================

// POST /api/layers/:id/reorder - Reorder layer z_index
router.post('/:id/reorder', async (req, res) => {
  const client = await getClient();
  try {
    const { id } = req.params;
    const { z_index } = req.body;

    if (typeof z_index !== 'number') {
      return res.status(400).json({ success: false, message: 'z_index must be a number' });
    }

    await client.query('BEGIN');

    // Get current layer info
    const layerResult = await client.query('SELECT logo_id, z_index FROM layers WHERE id = $1', [id]);
    if (layerResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Layer not found' });
    }

    const { logo_id, z_index: current_z_index } = layerResult.rows[0];

    // Update the layer's z_index
    await client.query('UPDATE layers SET z_index = $1 WHERE id = $2', [z_index, id]);

    // Adjust other layers' z_index if needed
    if (z_index > current_z_index) {
      // Moving down: decrease z_index of layers between old and new position
      await client.query(`
        UPDATE layers 
        SET z_index = z_index - 1 
        WHERE logo_id = $1 AND z_index > $2 AND z_index <= $3 AND id != $4
      `, [logo_id, current_z_index, z_index, id]);
    } else if (z_index < current_z_index) {
      // Moving up: increase z_index of layers between new and old position
      await client.query(`
        UPDATE layers 
        SET z_index = z_index + 1 
        WHERE logo_id = $1 AND z_index >= $2 AND z_index < $3 AND id != $4
      `, [logo_id, z_index, current_z_index, id]);
    }

    await client.query('COMMIT');

    res.json({ 
      success: true, 
      message: 'Layer reordered successfully',
      data: { id, z_index }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error reordering layer:', error);
    res.status(500).json({ success: false, message: 'Failed to reorder layer' });
  } finally {
    client.release();
  }
});

module.exports = router;
