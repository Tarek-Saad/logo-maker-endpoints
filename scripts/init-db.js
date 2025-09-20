#!/usr/bin/env node

const { testConnection, initializeDatabase } = require('../api/config/database');
require('dotenv').config();

async function initialize() {
  console.log('🚀 Starting database initialization...\n');

  try {
    // Test database connection
    console.log('Testing database connection...');
    const isConnected = await testConnection();
    
    if (!isConnected) {
      console.error('❌ Cannot connect to database. Please check your DATABASE_URL in .env file');
      process.exit(1);
    }

    // Initialize database tables
    console.log('\nInitializing database tables...');
    await initializeDatabase();

    console.log('\n✅ Database initialization completed successfully!');
    console.log('\nYou can now start your application with: npm run dev');
    
  } catch (error) {
    console.error('\n❌ Database initialization failed:', error.message);
    process.exit(1);
  }
}

// Run initialization if this script is executed directly
if (require.main === module) {
  initialize();
}

module.exports = { initialize };
