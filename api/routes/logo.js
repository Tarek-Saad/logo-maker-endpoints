const express = require('express');
const router = express.Router();
const { query } = require('../config/database');

// GET /api/logo/:id - Get logo by ID with layers and elements
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch logo
    const logoRes = await query('SELECT * FROM logos WHERE id = $1', [id]);
    if (logoRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Logo not found' });
    }
    const logo = logoRes.rows[0];

    // Fetch layers for the logo
    const layersRes = await query(
      'SELECT * FROM logo_layers WHERE logo_id = $1 ORDER BY position ASC, created_at ASC',
      [id]
    );
    const layers = layersRes.rows;

    if (layers.length === 0) {
      return res.json({ success: true, data: { ...logo, layers: [] } });
    }

    // Fetch all elements for these layers in one query
    const layerIds = layers.map(l => l.id);
    const placeholders = layerIds.map((_, idx) => `$${idx + 1}`).join(',');
    const elementsRes = await query(
      `SELECT * FROM logo_layer_elements WHERE layer_id IN (${placeholders}) ORDER BY position ASC, created_at ASC`,
      layerIds
    );

    // Group elements by layer_id
    const layerIdToElements = elementsRes.rows.reduce((acc, el) => {
      if (!acc[el.layer_id]) acc[el.layer_id] = [];
      acc[el.layer_id].push(el);
      return acc;
    }, {});

    // Attach elements to layers
    const layersWithElements = layers.map(layer => ({
      ...layer,
      elements: layerIdToElements[layer.id] || []
    }));

    res.json({ success: true, data: { ...logo, layers: layersWithElements } });
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


