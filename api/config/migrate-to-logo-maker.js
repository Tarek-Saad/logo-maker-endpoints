const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const migrateToLogoMaker = async () => {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Starting migration to Logo Maker schema...');
    
    await client.query('BEGIN');
    
    // 1. Create all enums
    console.log('📝 Creating enums...');
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE layer_type AS ENUM (
          'BACKGROUND', 'IMAGE', 'TEXT', 'ICON', 'SHAPE'
        );
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
    
    // 2. Update users table to use UUID and add display_name
    console.log('👤 Updating users table...');
    await client.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS display_name TEXT,
      ADD COLUMN IF NOT EXISTS id_uuid UUID DEFAULT gen_random_uuid();
    `);
    
    // 3. Create assets table
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
        created_by      UUID REFERENCES users(id),
        created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);
    
    // 4. Create fonts table
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
    
    // 5. Create categories table
    console.log('📂 Creating categories table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        icon_asset_id UUID REFERENCES assets(id),
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);
    
    // 6. Update logos table with new structure
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
      ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(id);
    `);
    
    // 7. Create logo_versions table
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
    
    // 8. Create templates table
    console.log('📋 Creating templates table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS templates (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL,
        description TEXT,
        category_id UUID REFERENCES categories(id),
        preview_url TEXT,
        base_logo_id UUID NOT NULL REFERENCES logos(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);
    
    // 9. Create new layers table (replacing logo_layers)
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
        updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
        UNIQUE (logo_id, z_index)
      );
    `);
    
    // 10. Create layer-specific tables
    console.log('📝 Creating layer-specific tables...');
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS layer_text (
        layer_id        UUID PRIMARY KEY REFERENCES layers(id) ON DELETE CASCADE,
        content         TEXT NOT NULL,
        font_id         UUID REFERENCES fonts(id),
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
    
    // 11. Create indexes
    console.log('📊 Creating indexes...');
    
    // Create indexes one by one to handle potential column issues
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)',
      'CREATE INDEX IF NOT EXISTS idx_assets_kind ON assets(kind)',
      'CREATE INDEX IF NOT EXISTS idx_assets_created_by ON assets(created_by)',
      'CREATE INDEX IF NOT EXISTS idx_assets_meta_gin ON assets USING GIN (meta)',
      'CREATE INDEX IF NOT EXISTS idx_fonts_family ON fonts(family)',
      'CREATE INDEX IF NOT EXISTS idx_logos_owner_id ON logos(owner_id)',
      'CREATE INDEX IF NOT EXISTS idx_logos_category_id ON logos(category_id)',
      'CREATE INDEX IF NOT EXISTS idx_logos_is_template ON logos(is_template)',
      'CREATE INDEX IF NOT EXISTS idx_logo_versions_logo_id ON logo_versions(logo_id, created_at DESC)',
      'CREATE INDEX IF NOT EXISTS idx_layers_logo_id ON layers(logo_id)',
      'CREATE INDEX IF NOT EXISTS idx_layers_type ON layers(type)',
      'CREATE INDEX IF NOT EXISTS idx_layers_z_index ON layers(logo_id, z_index)',
      'CREATE INDEX IF NOT EXISTS idx_layers_common_style_gin ON layers USING GIN (common_style)',
      'CREATE INDEX IF NOT EXISTS idx_templates_category_id ON templates(category_id)',
      'CREATE INDEX IF NOT EXISTS idx_templates_base_logo_id ON templates(base_logo_id)'
    ];
    
    for (const indexQuery of indexes) {
      try {
        await client.query(indexQuery);
      } catch (error) {
        console.warn(`⚠️  Warning: Could not create index: ${error.message}`);
        // Continue with other indexes
      }
    }
    
    // 12. Create triggers for updated_at
    console.log('⚡ Creating triggers...');
    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);
    
    // Create triggers for all tables
    const tables = ['users', 'assets', 'fonts', 'categories', 'logos', 'templates', 'layers'];
    for (const table of tables) {
      await client.query(`
        DROP TRIGGER IF EXISTS update_${table}_updated_at ON ${table};
        CREATE TRIGGER update_${table}_updated_at
          BEFORE UPDATE ON ${table}
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
      `);
    }
    
    // 13. Create helper functions
    console.log('🔧 Creating helper functions...');
    await client.query(`
      CREATE OR REPLACE FUNCTION create_logo_with_layers(
        p_owner_id UUID,
        p_title TEXT,
        p_canvas_w INTEGER,
        p_canvas_h INTEGER,
        p_layers JSONB
      ) RETURNS UUID AS $$
      DECLARE
        logo_id UUID;
        layer_data JSONB;
        layer_id UUID;
        layer_z_index INTEGER;
      BEGIN
        INSERT INTO logos (owner_id, title, canvas_w, canvas_h)
        VALUES (p_owner_id, p_title, p_canvas_w, p_canvas_h)
        RETURNING id INTO logo_id;

        FOR layer_data IN SELECT * FROM jsonb_array_elements(p_layers)
        LOOP
          layer_z_index := COALESCE((layer_data->>'z_index')::INTEGER, 0);
          
          INSERT INTO layers (
            logo_id, type, name, z_index, x_norm, y_norm, scale, 
            rotation_deg, opacity, blend_mode, is_visible, is_locked
          ) VALUES (
            logo_id,
            (layer_data->>'type')::layer_type,
            layer_data->>'name',
            layer_z_index,
            COALESCE((layer_data->>'x_norm')::NUMERIC, 0.5),
            COALESCE((layer_data->>'y_norm')::NUMERIC, 0.5),
            COALESCE((layer_data->>'scale')::NUMERIC, 1.0),
            COALESCE((layer_data->>'rotation_deg')::NUMERIC, 0),
            COALESCE((layer_data->>'opacity')::NUMERIC, 1.0),
            COALESCE((layer_data->>'blend_mode')::blend_mode, 'normal'),
            COALESCE((layer_data->>'is_visible')::BOOLEAN, true),
            COALESCE((layer_data->>'is_locked')::BOOLEAN, false)
          ) RETURNING id INTO layer_id;

          CASE (layer_data->>'type')
            WHEN 'TEXT' THEN
              INSERT INTO layer_text (layer_id, content, font_size, fill_hex)
              VALUES (
                layer_id,
                layer_data->>'content',
                COALESCE((layer_data->>'font_size')::NUMERIC, 16),
                COALESCE(layer_data->>'fill_hex', '#000000')
              );
            WHEN 'BACKGROUND' THEN
              INSERT INTO layer_background (layer_id, mode, fill_hex)
              VALUES (
                layer_id,
                COALESCE(layer_data->>'mode', 'solid'),
                layer_data->>'fill_hex'
              );
          END CASE;
        END LOOP;

        RETURN logo_id;
      END;
      $$ LANGUAGE plpgsql;
    `);
    
    await client.query(`
      CREATE OR REPLACE FUNCTION get_logo_with_layers(p_logo_id UUID)
      RETURNS JSONB AS $$
      DECLARE
        result JSONB;
      BEGIN
        SELECT jsonb_build_object(
          'id', l.id,
          'title', l.title,
          'canvas_w', l.canvas_w,
          'canvas_h', l.canvas_h,
          'thumbnail_url', l.thumbnail_url,
          'created_at', l.created_at,
          'updated_at', l.updated_at,
          'layers', COALESCE(
            (SELECT jsonb_agg(
              jsonb_build_object(
                'id', lay.id,
                'type', lay.type,
                'name', lay.name,
                'z_index', lay.z_index,
                'x_norm', lay.x_norm,
                'y_norm', lay.y_norm,
                'scale', lay.scale,
                'rotation_deg', lay.rotation_deg,
                'opacity', lay.opacity,
                'blend_mode', lay.blend_mode,
                'is_visible', lay.is_visible,
                'is_locked', lay.is_locked,
                'common_style', lay.common_style
              ) ORDER BY lay.z_index
            )
            FROM layers lay WHERE lay.logo_id = l.id),
            '[]'::jsonb
          )
        )
        INTO result
        FROM logos l
        WHERE l.id = p_logo_id;
        
        RETURN result;
      END;
      $$ LANGUAGE plpgsql;
    `);
    
    await client.query('COMMIT');
    console.log('✅ Migration completed successfully!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', error.message);
    throw error;
  } finally {
    client.release();
  }
};

// Run migration if called directly
if (require.main === module) {
  migrateToLogoMaker()
    .then(() => {
      console.log('🎉 Logo Maker database migration completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { migrateToLogoMaker };
