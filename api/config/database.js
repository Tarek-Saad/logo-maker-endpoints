const { Pool } = require('pg');
require('dotenv').config();

// Database connection configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Test database connection
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Database connected successfully');
    client.release();
    return true;
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    return false;
  }
};

// Initialize database tables
const initializeDatabase = async () => {
  try {
    const client = await pool.connect();
    
    // Enable uuid extension for UUID generation
    await client.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    `);

    // Check if we need to migrate to the new schema
    const checkSchema = await client.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'layers' AND table_schema = 'public'
      );
    `);

    if (!checkSchema.rows[0].exists) {
      console.log('🔄 Migrating to Logo Maker schema...');
      try {
        const { simpleMigrate } = require('./simple-migrate');
        await simpleMigrate();
        console.log('✅ Logo Maker schema migration completed');
        client.release();
        return;
      } catch (error) {
        console.error('❌ Migration failed:', error.message);
        client.release();
        throw error;
      }
    } else {
      console.log('✅ Logo Maker schema already exists');
    }

    // Logo Maker schema is already set up, no legacy initialization needed

    client.release();
    console.log('✅ Database tables initialized successfully');
  } catch (err) {
    console.error('❌ Database initialization failed:', err.message);
    throw err;
  }
};

// Query helper function
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (err) {
    console.error('Query error', { text, error: err.message });
    throw err;
  }
};

// Get client for transactions
const getClient = async () => {
  return await pool.connect();
};

module.exports = {
  pool,
  query,
  getClient,
  testConnection,
  initializeDatabase
};
