const express = require('express');
const router = express.Router();
const { query } = require('../config/database');

// GET /api/logo/:id - Get logo by ID with layers (including asset data)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch logo (production schema: logos has title, timestamps)
    const logoRes = await query(
      'SELECT id, title, created_at, updated_at FROM logos WHERE id = $1',
      [id]
    );
    if (logoRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Logo not found' });
    }
    const logo = logoRes.rows[0];

    // Fetch layers joined with assets
    const layersRes = await query(
      `SELECT 
         l.id               AS layer_id,
         l.logo_id          AS layer_logo_id,
         l.asset_id         AS layer_asset_id,
         l.x_norm           AS layer_x_norm,
         l.y_norm           AS layer_y_norm,
         l.scale            AS layer_scale,
         l.rotation         AS layer_rotation,
         l.z_index          AS layer_z_index,
         l.created_at       AS layer_created_at,
         l.updated_at       AS layer_updated_at,
         a.id               AS asset_id,
         a.url              AS asset_url,
         a.default_x        AS asset_default_x,
         a.default_y        AS asset_default_y,
         a.default_scale    AS asset_default_scale,
         a.default_rotation AS asset_default_rotation,
         a.created_at       AS asset_created_at,
         a.updated_at       AS asset_updated_at
       FROM logo_layers l
       JOIN assets a ON a.id = l.asset_id
       WHERE l.logo_id = $1
       ORDER BY l.z_index ASC, l.created_at ASC, l.id ASC`,
      [id]
    );

    const layers = layersRes.rows.map(row => ({
      id: row.layer_id,
      logo_id: row.layer_logo_id,
      asset_id: row.layer_asset_id,
      x_norm: row.layer_x_norm,
      y_norm: row.layer_y_norm,
      scale: row.layer_scale,
      rotation: row.layer_rotation,
      z_index: row.layer_z_index,
      created_at: row.layer_created_at,
      updated_at: row.layer_updated_at,
      asset: {
        id: row.asset_id,
        url: row.asset_url,
        default_x: row.asset_default_x,
        default_y: row.asset_default_y,
        default_scale: row.asset_default_scale,
        default_rotation: row.asset_default_rotation,
        created_at: row.asset_created_at,
        updated_at: row.asset_updated_at
      }
    }));

    res.json({ success: true, data: { ...logo, layers } });
  } catch (error) {
    console.error('Error fetching logo with layers:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch logo' });
  }
});

// PUT /api/logo/:id - Update logo by ID
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, url, coordinates } = req.body;

    const result = await query(
      'UPDATE logos SET name=$1, url=$2, coordinates=$3::jsonb WHERE id=$4 RETURNING *',
      [name, url, coordinates ? JSON.stringify(coordinates) : null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Logo not found' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error updating logo:', error);
    res.status(500).json({ success: false, message: 'Failed to update logo' });
  }
});

// DELETE /api/logo/:id - Delete logo by ID
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM logos WHERE id=$1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Logo not found' });
    }

    res.json({ success: true, message: 'Logo deleted' });
  } catch (error) {
    console.error('Error deleting logo:', error);
    res.status(500).json({ success: false, message: 'Failed to delete logo' });
  }
});

module.exports = router;


