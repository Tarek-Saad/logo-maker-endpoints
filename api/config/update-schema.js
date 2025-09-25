const { query } = require('./database');

async function updateDatabaseSchema() {
  console.log('🔧 Updating database schema...');
  
  try {
    // 1. Check and create missing enums
    console.log('📝 Checking enums...');
    
    const enums = [
      {
        name: 'asset_kind',
        values: ['raster', 'vector', 'font', 'pattern']
      },
      {
        name: 'layer_type', 
        values: ['BACKGROUND', 'TEXT', 'SHAPE', 'ICON', 'IMAGE']
      },
      {
        name: 'blend_mode',
        values: ['normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten', 'color-burn', 'color-dodge', 'difference', 'exclusion', 'hue', 'saturation', 'color', 'luminosity', 'soft-light', 'hard-light']
      },
      {
        name: 'text_align',
        values: ['left', 'center', 'right', 'justify']
      },
      {
        name: 'text_baseline',
        values: ['top', 'hanging', 'middle', 'alphabetic', 'ideographic', 'bottom']
      },
      {
        name: 'stroke_align',
        values: ['inside', 'outside', 'center']
      },
      {
        name: 'line_cap',
        values: ['butt', 'round', 'square']
      },
      {
        name: 'line_join',
        values: ['miter', 'round', 'bevel']
      }
    ];

    for (const enumDef of enums) {
      try {
        await query(`CREATE TYPE ${enumDef.name} AS ENUM (${enumDef.values.map(v => `'${v}'`).join(', ')})`);
        console.log(`✅ Created enum: ${enumDef.name}`);
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`✅ Enum already exists: ${enumDef.name}`);
        } else {
          console.warn(`⚠️  Warning creating enum ${enumDef.name}: ${error.message}`);
        }
      }
    }

    // 2. Update users table
    console.log('👤 Updating users table...');
    try {
      await query(`
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        ADD COLUMN IF NOT EXISTS name VARCHAR(255) NOT NULL,
        ADD COLUMN IF NOT EXISTS email VARCHAR(255) UNIQUE NOT NULL,
        ADD COLUMN IF NOT EXISTS avatar_url TEXT,
        ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      `);
      console.log('✅ Users table updated');
    } catch (error) {
      console.warn(`⚠️  Warning updating users: ${error.message}`);
    }

    // 3. Update logos table
    console.log('🎨 Updating logos table...');
    try {
      await query(`
        ALTER TABLE logos 
        ADD COLUMN IF NOT EXISTS id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES users(id),
        ADD COLUMN IF NOT EXISTS title VARCHAR(255) NOT NULL,
        ADD COLUMN IF NOT EXISTS canvas_w INTEGER NOT NULL DEFAULT 1080,
        ADD COLUMN IF NOT EXISTS canvas_h INTEGER NOT NULL DEFAULT 1080,
        ADD COLUMN IF NOT EXISTS dpi INTEGER NOT NULL DEFAULT 300,
        ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
        ADD COLUMN IF NOT EXISTS is_template BOOLEAN NOT NULL DEFAULT false,
        ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(id),
        ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      `);
      console.log('✅ Logos table updated');
    } catch (error) {
      console.warn(`⚠️  Warning updating logos: ${error.message}`);
    }

    // 4. Update layers table
    console.log('🔧 Updating layers table...');
    try {
      await query(`
        ALTER TABLE layers 
        ADD COLUMN IF NOT EXISTS id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        ADD COLUMN IF NOT EXISTS logo_id UUID NOT NULL REFERENCES logos(id) ON DELETE CASCADE,
        ADD COLUMN IF NOT EXISTS type layer_type NOT NULL,
        ADD COLUMN IF NOT EXISTS name VARCHAR(255) NOT NULL,
        ADD COLUMN IF NOT EXISTS z_index INTEGER NOT NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS x_norm DECIMAL(10,8) NOT NULL DEFAULT 0.5,
        ADD COLUMN IF NOT EXISTS y_norm DECIMAL(10,8) NOT NULL DEFAULT 0.5,
        ADD COLUMN IF NOT EXISTS scale DECIMAL(10,4) NOT NULL DEFAULT 1.0,
        ADD COLUMN IF NOT EXISTS rotation_deg DECIMAL(8,2) NOT NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS anchor_x DECIMAL(10,8) NOT NULL DEFAULT 0.5,
        ADD COLUMN IF NOT EXISTS anchor_y DECIMAL(10,8) NOT NULL DEFAULT 0.5,
        ADD COLUMN IF NOT EXISTS opacity DECIMAL(3,2) NOT NULL DEFAULT 1.0,
        ADD COLUMN IF NOT EXISTS blend_mode blend_mode NOT NULL DEFAULT 'normal',
        ADD COLUMN IF NOT EXISTS is_visible BOOLEAN NOT NULL DEFAULT true,
        ADD COLUMN IF NOT EXISTS is_locked BOOLEAN NOT NULL DEFAULT false,
        ADD COLUMN IF NOT EXISTS common_style JSONB,
        ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      `);
      console.log('✅ Layers table updated');
    } catch (error) {
      console.warn(`⚠️  Warning updating layers: ${error.message}`);
    }

    // 5. Update assets table (already done, but ensure all columns)
    console.log('📁 Updating assets table...');
    try {
      await query(`
        ALTER TABLE assets 
        ADD COLUMN IF NOT EXISTS id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        ADD COLUMN IF NOT EXISTS kind asset_kind,
        ADD COLUMN IF NOT EXISTS name TEXT,
        ADD COLUMN IF NOT EXISTS storage TEXT,
        ADD COLUMN IF NOT EXISTS url TEXT,
        ADD COLUMN IF NOT EXISTS provider_id TEXT,
        ADD COLUMN IF NOT EXISTS mime_type TEXT,
        ADD COLUMN IF NOT EXISTS width INTEGER,
        ADD COLUMN IF NOT EXISTS height INTEGER,
        ADD COLUMN IF NOT EXISTS has_alpha BOOLEAN,
        ADD COLUMN IF NOT EXISTS dominant_hex TEXT,
        ADD COLUMN IF NOT EXISTS palette JSONB,
        ADD COLUMN IF NOT EXISTS vector_svg TEXT,
        ADD COLUMN IF NOT EXISTS checksum_sha256 TEXT,
        ADD COLUMN IF NOT EXISTS meta JSONB,
        ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id),
        ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      `);
      console.log('✅ Assets table updated');
    } catch (error) {
      console.warn(`⚠️  Warning updating assets: ${error.message}`);
    }

    // 6. Update fonts table
    console.log('🔤 Updating fonts table...');
    try {
      await query(`
        ALTER TABLE fonts 
        ADD COLUMN IF NOT EXISTS id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        ADD COLUMN IF NOT EXISTS family TEXT NOT NULL,
        ADD COLUMN IF NOT EXISTS style TEXT NOT NULL,
        ADD COLUMN IF NOT EXISTS weight INTEGER NOT NULL,
        ADD COLUMN IF NOT EXISTS url TEXT NOT NULL,
        ADD COLUMN IF NOT EXISTS fallbacks TEXT[],
        ADD COLUMN IF NOT EXISTS meta JSONB,
        ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      `);
      console.log('✅ Fonts table updated');
    } catch (error) {
      console.warn(`⚠️  Warning updating fonts: ${error.message}`);
    }

    // 7. Update templates table
    console.log('📋 Updating templates table...');
    try {
      await query(`
        ALTER TABLE templates 
        ADD COLUMN IF NOT EXISTS id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        ADD COLUMN IF NOT EXISTS title VARCHAR(255) NOT NULL,
        ADD COLUMN IF NOT EXISTS description TEXT,
        ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(id),
        ADD COLUMN IF NOT EXISTS preview_url TEXT,
        ADD COLUMN IF NOT EXISTS base_logo_id UUID REFERENCES logos(id),
        ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      `);
      console.log('✅ Templates table updated');
    } catch (error) {
      console.warn(`⚠️  Warning updating templates: ${error.message}`);
    }

    // 8. Update categories table
    console.log('📂 Updating categories table...');
    try {
      await query(`
        ALTER TABLE categories 
        ADD COLUMN IF NOT EXISTS id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        ADD COLUMN IF NOT EXISTS name TEXT NOT NULL UNIQUE,
        ADD COLUMN IF NOT EXISTS description TEXT,
        ADD COLUMN IF NOT EXISTS icon_asset_id UUID REFERENCES assets(id),
        ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      `);
      console.log('✅ Categories table updated');
    } catch (error) {
      console.warn(`⚠️  Warning updating categories: ${error.message}`);
    }

    // 9. Update layer-specific tables
    console.log('📝 Updating layer-specific tables...');
    
    // Layer text
    try {
      await query(`
        ALTER TABLE layer_text 
        ADD COLUMN IF NOT EXISTS layer_id UUID PRIMARY KEY REFERENCES layers(id) ON DELETE CASCADE,
        ADD COLUMN IF NOT EXISTS content TEXT NOT NULL,
        ADD COLUMN IF NOT EXISTS font_id UUID REFERENCES fonts(id),
        ADD COLUMN IF NOT EXISTS font_size DECIMAL(8,2) NOT NULL DEFAULT 16,
        ADD COLUMN IF NOT EXISTS line_height DECIMAL(4,2) NOT NULL DEFAULT 1.2,
        ADD COLUMN IF NOT EXISTS letter_spacing DECIMAL(6,2) NOT NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS align text_align NOT NULL DEFAULT 'left',
        ADD COLUMN IF NOT EXISTS baseline text_baseline NOT NULL DEFAULT 'alphabetic',
        ADD COLUMN IF NOT EXISTS fill_hex TEXT NOT NULL DEFAULT '#000000',
        ADD COLUMN IF NOT EXISTS fill_alpha DECIMAL(3,2) NOT NULL DEFAULT 1.0,
        ADD COLUMN IF NOT EXISTS stroke_hex TEXT,
        ADD COLUMN IF NOT EXISTS stroke_alpha DECIMAL(3,2) DEFAULT 1.0,
        ADD COLUMN IF NOT EXISTS stroke_width DECIMAL(8,2) DEFAULT 0,
        ADD COLUMN IF NOT EXISTS stroke_align stroke_align DEFAULT 'outside',
        ADD COLUMN IF NOT EXISTS gradient JSONB
      `);
      console.log('✅ Layer_text table updated');
    } catch (error) {
      console.warn(`⚠️  Warning updating layer_text: ${error.message}`);
    }

    // Layer shape
    try {
      await query(`
        ALTER TABLE layer_shape 
        ADD COLUMN IF NOT EXISTS layer_id UUID PRIMARY KEY REFERENCES layers(id) ON DELETE CASCADE,
        ADD COLUMN IF NOT EXISTS shape_kind TEXT NOT NULL DEFAULT 'rect',
        ADD COLUMN IF NOT EXISTS svg_path TEXT,
        ADD COLUMN IF NOT EXISTS points JSONB,
        ADD COLUMN IF NOT EXISTS rx DECIMAL(8,2) DEFAULT 0,
        ADD COLUMN IF NOT EXISTS ry DECIMAL(8,2) DEFAULT 0,
        ADD COLUMN IF NOT EXISTS fill_hex TEXT NOT NULL DEFAULT '#000000',
        ADD COLUMN IF NOT EXISTS fill_alpha DECIMAL(3,2) NOT NULL DEFAULT 1.0,
        ADD COLUMN IF NOT EXISTS gradient JSONB,
        ADD COLUMN IF NOT EXISTS stroke_hex TEXT,
        ADD COLUMN IF NOT EXISTS stroke_alpha DECIMAL(3,2) DEFAULT 1.0,
        ADD COLUMN IF NOT EXISTS stroke_width DECIMAL(8,2) DEFAULT 0,
        ADD COLUMN IF NOT EXISTS stroke_dash JSONB,
        ADD COLUMN IF NOT EXISTS line_cap line_cap DEFAULT 'butt',
        ADD COLUMN IF NOT EXISTS line_join line_join DEFAULT 'miter',
        ADD COLUMN IF NOT EXISTS meta JSONB
      `);
      console.log('✅ Layer_shape table updated');
    } catch (error) {
      console.warn(`⚠️  Warning updating layer_shape: ${error.message}`);
    }

    // Layer icon
    try {
      await query(`
        ALTER TABLE layer_icon 
        ADD COLUMN IF NOT EXISTS layer_id UUID PRIMARY KEY REFERENCES layers(id) ON DELETE CASCADE,
        ADD COLUMN IF NOT EXISTS asset_id UUID NOT NULL REFERENCES assets(id),
        ADD COLUMN IF NOT EXISTS tint_hex TEXT,
        ADD COLUMN IF NOT EXISTS tint_alpha DECIMAL(3,2) DEFAULT 1.0,
        ADD COLUMN IF NOT EXISTS allow_recolor BOOLEAN NOT NULL DEFAULT true
      `);
      console.log('✅ Layer_icon table updated');
    } catch (error) {
      console.warn(`⚠️  Warning updating layer_icon: ${error.message}`);
    }

    // Layer image
    try {
      await query(`
        ALTER TABLE layer_image 
        ADD COLUMN IF NOT EXISTS layer_id UUID PRIMARY KEY REFERENCES layers(id) ON DELETE CASCADE,
        ADD COLUMN IF NOT EXISTS asset_id UUID NOT NULL REFERENCES assets(id),
        ADD COLUMN IF NOT EXISTS crop JSONB,
        ADD COLUMN IF NOT EXISTS fit TEXT NOT NULL DEFAULT 'contain',
        ADD COLUMN IF NOT EXISTS rounding DECIMAL(8,2) DEFAULT 0,
        ADD COLUMN IF NOT EXISTS blur DECIMAL(8,2) DEFAULT 0,
        ADD COLUMN IF NOT EXISTS brightness DECIMAL(4,2) DEFAULT 1.0,
        ADD COLUMN IF NOT EXISTS contrast DECIMAL(4,2) DEFAULT 1.0
      `);
      console.log('✅ Layer_image table updated');
    } catch (error) {
      console.warn(`⚠️  Warning updating layer_image: ${error.message}`);
    }

    // Layer background
    try {
      await query(`
        ALTER TABLE layer_background 
        ADD COLUMN IF NOT EXISTS layer_id UUID PRIMARY KEY REFERENCES layers(id) ON DELETE CASCADE,
        ADD COLUMN IF NOT EXISTS mode TEXT NOT NULL DEFAULT 'solid',
        ADD COLUMN IF NOT EXISTS fill_hex TEXT NOT NULL DEFAULT '#FFFFFF',
        ADD COLUMN IF NOT EXISTS fill_alpha DECIMAL(3,2) NOT NULL DEFAULT 1.0,
        ADD COLUMN IF NOT EXISTS gradient JSONB,
        ADD COLUMN IF NOT EXISTS asset_id UUID REFERENCES assets(id),
        ADD COLUMN IF NOT EXISTS repeat TEXT NOT NULL DEFAULT 'no-repeat',
        ADD COLUMN IF NOT EXISTS position TEXT NOT NULL DEFAULT 'center',
        ADD COLUMN IF NOT EXISTS size TEXT NOT NULL DEFAULT 'cover'
      `);
      console.log('✅ Layer_background table updated');
    } catch (error) {
      console.warn(`⚠️  Warning updating layer_background: ${error.message}`);
    }

    // 10. Create logo_versions table
    console.log('📚 Creating logo_versions table...');
    try {
      await query(`
        CREATE TABLE IF NOT EXISTS logo_versions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          logo_id UUID NOT NULL REFERENCES logos(id) ON DELETE CASCADE,
          version_number INTEGER NOT NULL,
          note TEXT,
          snapshot JSONB NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          UNIQUE(logo_id, version_number)
        )
      `);
      console.log('✅ Logo_versions table created');
    } catch (error) {
      console.warn(`⚠️  Warning creating logo_versions: ${error.message}`);
    }

    // 11. Create indexes
    console.log('📊 Creating indexes...');
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
        await query(indexQuery);
      } catch (error) {
        console.warn(`⚠️  Warning creating index: ${error.message}`);
      }
    }

    console.log('🎉 Database schema update completed successfully!');
    return true;

  } catch (error) {
    console.error('❌ Database schema update failed:', error.message);
    throw error;
  }
}

module.exports = { updateDatabaseSchema };

// Run if called directly
if (require.main === module) {
  updateDatabaseSchema()
    .then(() => {
      console.log('✅ Schema update completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Schema update failed:', error.message);
      process.exit(1);
    });
}
