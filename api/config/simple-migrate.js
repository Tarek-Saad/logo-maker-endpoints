const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const simpleMigrate = async () => {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Starting simple Logo Maker migration...');
    
    // Test connection first
    await client.query('SELECT 1');
    console.log('✅ Database connection successful');
    
    // Enable uuid extension
    await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    console.log('✅ UUID extension enabled');
    
    // Create enums
    console.log('📝 Creating enums...');
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE layer_type AS ENUM ('BACKGROUND', 'IMAGE', 'TEXT', 'ICON', 'SHAPE');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE blend_mode AS ENUM (
          'normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten',
          'color-burn', 'color-dodge', 'difference', 'exclusion',
          'hue', 'saturation', 'color', 'luminosity', 'soft-light', 'hard-light'
        );
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE text_align AS ENUM ('left', 'center', 'right', 'justify');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE text_baseline AS ENUM ('top', 'middle', 'bottom', 'alphabetic');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE stroke_align AS ENUM ('center', 'inside', 'outside');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE line_cap AS ENUM ('butt', 'round', 'square');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE line_join AS ENUM ('miter', 'round', 'bevel');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE asset_kind AS ENUM ('raster', 'vector', 'font', 'pattern');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    
    console.log('✅ Enums created');
    
    // Create assets table
    console.log('📁 Creating assets table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS assets (
        id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        kind            asset_kind NOT NULL,
        name            TEXT NOT NULL,
        storage         TEXT NOT NULL,
        url             TEXT NOT NULL,
        provider_id     TEXT,
        mime_type       TEXT NOT NULL,
        bytes_size      INTEGER CHECK (bytes_size >= 0),
        width           INTEGER,
        height          INTEGER,
        has_alpha       BOOLEAN,
        dominant_hex    TEXT,
        palette         JSONB,
        vector_svg      TEXT,
        checksum_sha256 TEXT,
        meta            JSONB,
        created_by      UUID,
        created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);
    
    // Create fonts table
    console.log('🔤 Creating fonts table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS fonts (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        family      TEXT NOT NULL,
        style       TEXT NOT NULL,
        weight      INTEGER NOT NULL,
        url         TEXT NOT NULL,
        fallbacks   TEXT[],
        meta        JSONB,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
        UNIQUE (family, weight, style)
      );
    `);
    
    // Create categories table
    console.log('📂 Creating categories table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        icon_asset_id UUID,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);
    
    // Update logos table
    console.log('🎨 Updating logos table...');
    await client.query(`
      ALTER TABLE logos 
      ADD COLUMN IF NOT EXISTS owner_id UUID,
      ADD COLUMN IF NOT EXISTS title TEXT,
      ADD COLUMN IF NOT EXISTS canvas_w INTEGER DEFAULT 1080,
      ADD COLUMN IF NOT EXISTS canvas_h INTEGER DEFAULT 1080,
      ADD COLUMN IF NOT EXISTS dpi INTEGER,
      ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
      ADD COLUMN IF NOT EXISTS is_template BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS category_id UUID;
    `);
    
    // Create logo_versions table
    console.log('📚 Creating logo_versions table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS logo_versions (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        logo_id     UUID NOT NULL REFERENCES logos(id) ON DELETE CASCADE,
        snapshot    JSONB NOT NULL,
        note        TEXT,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);
    
    // Create templates table
    console.log('📋 Creating templates table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS templates (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL,
        description TEXT,
        category_id UUID,
        preview_url TEXT,
        base_logo_id UUID NOT NULL REFERENCES logos(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);
    
    // Create layers table
    console.log('🔧 Creating layers table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS layers (
        id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        logo_id       UUID NOT NULL REFERENCES logos(id) ON DELETE CASCADE,
        type          layer_type NOT NULL,
        name          TEXT,
        z_index       INTEGER NOT NULL,
        x_norm        NUMERIC NOT NULL CHECK (x_norm >= 0 AND x_norm <= 1),
        y_norm        NUMERIC NOT NULL CHECK (y_norm >= 0 AND y_norm <= 1),
        scale         NUMERIC NOT NULL CHECK (scale > 0),
        rotation_deg  NUMERIC NOT NULL DEFAULT 0,
        anchor_x      NUMERIC NOT NULL DEFAULT 0.5 CHECK (anchor_x >= 0 AND anchor_x <= 1),
        anchor_y      NUMERIC NOT NULL DEFAULT 0.5 CHECK (anchor_y >= 0 AND anchor_y <= 1),
        opacity       NUMERIC NOT NULL DEFAULT 1 CHECK (opacity >= 0 AND opacity <= 1),
        blend_mode    blend_mode NOT NULL DEFAULT 'normal',
        is_visible    BOOLEAN NOT NULL DEFAULT TRUE,
        is_locked     BOOLEAN NOT NULL DEFAULT FALSE,
        common_style  JSONB,
        created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);
    
    // Create layer-specific tables
    console.log('📝 Creating layer-specific tables...');
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS layer_text (
        layer_id        UUID PRIMARY KEY REFERENCES layers(id) ON DELETE CASCADE,
        content         TEXT NOT NULL,
        font_id         UUID,
        font_size       NUMERIC NOT NULL,
        line_height     NUMERIC,
        letter_spacing  NUMERIC,
        align           text_align NOT NULL DEFAULT 'center',
        baseline        text_baseline NOT NULL DEFAULT 'alphabetic',
        fill_hex        TEXT NOT NULL DEFAULT '#000000',
        fill_alpha      NUMERIC NOT NULL DEFAULT 1 CHECK (fill_alpha >= 0 AND fill_alpha <= 1),
        stroke_hex      TEXT,
        stroke_alpha    NUMERIC,
        stroke_width    NUMERIC,
        stroke_align    stroke_align,
        gradient        JSONB
      );
    `);
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS layer_shape (
        layer_id       UUID PRIMARY KEY REFERENCES layers(id) ON DELETE CASCADE,
        shape_kind     TEXT NOT NULL,
        svg_path       TEXT,
        points         JSONB,
        rx             NUMERIC,
        ry             NUMERIC,
        fill_hex       TEXT,
        fill_alpha     NUMERIC,
        gradient       JSONB,
        stroke_hex     TEXT,
        stroke_alpha   NUMERIC,
        stroke_width   NUMERIC,
        stroke_dash    JSONB,
        line_cap       line_cap,
        line_join      line_join,
        meta           JSONB
      );
    `);
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS layer_icon (
        layer_id       UUID PRIMARY KEY REFERENCES layers(id) ON DELETE CASCADE,
        asset_id       UUID NOT NULL REFERENCES assets(id),
        tint_hex       TEXT,
        tint_alpha     NUMERIC,
        allow_recolor  BOOLEAN NOT NULL DEFAULT TRUE
      );
    `);
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS layer_image (
        layer_id       UUID PRIMARY KEY REFERENCES layers(id) ON DELETE CASCADE,
        asset_id       UUID NOT NULL REFERENCES assets(id),
        crop           JSONB,
        fit            TEXT,
        rounding       NUMERIC,
        blur           NUMERIC,
        brightness     NUMERIC,
        contrast       NUMERIC
      );
    `);
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS layer_background (
        layer_id      UUID PRIMARY KEY REFERENCES layers(id) ON DELETE CASCADE,
        mode          TEXT NOT NULL,
        fill_hex      TEXT,
        fill_alpha    NUMERIC,
        gradient      JSONB,
        asset_id      UUID REFERENCES assets(id),
        repeat        TEXT,
        position      TEXT,
        size          TEXT
      );
    `);
    
    console.log('✅ Migration completed successfully!');
    console.log('🎉 Your Logo Maker database is ready!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  } finally {
    client.release();
  }
};

// Run migration if called directly
if (require.main === module) {
  simpleMigrate()
    .then(() => {
      console.log('🎉 Simple migration completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { simpleMigrate };
