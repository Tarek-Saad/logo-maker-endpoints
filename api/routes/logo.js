const express = require('express');
const router = express.Router();
const { query } = require('../config/database');

// GET /api/logo/:id - Get logo by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('SELECT * FROM logos WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Logo not found' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching logo:', error);
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


