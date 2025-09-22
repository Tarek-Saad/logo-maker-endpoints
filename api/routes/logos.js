const express = require('express');
const router = express.Router();
const { query } = require('../config/database');

// GET /api/logos - Get all logos
router.get('/', async (req, res) => {
  try {
    const result = await query('SELECT * FROM logos ORDER BY created_at DESC');
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching logos:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch logos' });
  }
});

// POST /api/logos - Create new logo
router.post('/', async (req, res) => {
  try {
    const { name, url, coordinates } = req.body;

    if (!name || !url) {
      return res.status(400).json({ success: false, message: 'Name and url are required' });
    }

    const result = await query(
      'INSERT INTO logos (name, url, coordinates) VALUES ($1, $2, $3::jsonb) RETURNING *',
      [name, url, coordinates ? JSON.stringify(coordinates) : null]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error creating logo:', error);
    res.status(500).json({ success: false, message: 'Failed to create logo' });
  }
});

module.exports = router;


