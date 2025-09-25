-- Logo Maker Database Schema
-- Comprehensive PostgreSQL schema for logo creation and management system

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ==============================================
-- ENUMS AND TYPES
-- ==============================================

-- Layer types
CREATE TYPE layer_type AS ENUM (
  'BACKGROUND', 'IMAGE', 'TEXT', 'ICON', 'SHAPE'
);

-- Blend modes for layer compositing
CREATE TYPE blend_mode AS ENUM (
  'normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten',
  'color-burn', 'color-dodge', 'difference', 'exclusion',
  'hue', 'saturation', 'color', 'luminosity', 'soft-light', 'hard-light'
);

-- Text alignment options
CREATE TYPE text_align AS ENUM (
  'left', 'center', 'right', 'justify'
);

-- Text baseline options
CREATE TYPE text_baseline AS ENUM (
  'top', 'middle', 'bottom', 'alphabetic'
);

-- Stroke alignment options
CREATE TYPE stroke_align AS ENUM (
  'center', 'inside', 'outside'
);

-- Line cap styles
CREATE TYPE line_cap AS ENUM (
  'butt', 'round', 'square'
);

-- Line join styles
CREATE TYPE line_join AS ENUM (
  'miter', 'round', 'bevel'
);

-- Asset types
CREATE TYPE asset_kind AS ENUM (
  'raster', 'vector', 'font', 'pattern'
);

-- ==============================================
-- CORE TABLES
-- ==============================================

-- Users table
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT UNIQUE NOT NULL,
  display_name  TEXT,
  avatar_url    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Assets table (for all uploaded files: images, SVGs, fonts, patterns)
CREATE TABLE assets (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kind            asset_kind NOT NULL,
  name            TEXT NOT NULL,
  storage         TEXT NOT NULL,                    -- 'cloudinary' | 's3' | 'local'
  url             TEXT NOT NULL,
  provider_id     TEXT,                             -- public_id / key from storage provider
  mime_type       TEXT NOT NULL,
  bytes_size      INTEGER CHECK (bytes_size >= 0),
  width           INTEGER,                          -- px (for raster assets)
  height          INTEGER,                          -- px
  has_alpha       BOOLEAN,
  dominant_hex    TEXT,                             -- '#RRGGBB'
  palette         JSONB,                            -- [{hex, ratio}] color palette
  vector_svg      TEXT,                             -- SVG content for vector assets
  checksum_sha256 TEXT,                             -- for integrity verification
  meta            JSONB,                            -- flexible metadata
  created_by      UUID REFERENCES users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Fonts table
CREATE TABLE fonts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family      TEXT NOT NULL,          -- e.g., 'Montserrat'
  style       TEXT NOT NULL,          -- 'Regular', 'Bold', 'Italic'
  weight      INTEGER NOT NULL,       -- 100..900
  url         TEXT NOT NULL,          -- CDN link (ttf/woff2)
  fallbacks   TEXT[],                 -- ['sans-serif', ...]
  meta        JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (family, weight, style)
);

-- Categories for templates
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon_asset_id UUID REFERENCES assets(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Logos table (main project/design)
CREATE TABLE logos (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  canvas_w     INTEGER NOT NULL CHECK (canvas_w > 0),
  canvas_h     INTEGER NOT NULL CHECK (canvas_h > 0),
  dpi          INTEGER,                          -- optional for print
  thumbnail_url TEXT,                            -- preview thumbnail
  is_template  BOOLEAN NOT NULL DEFAULT FALSE,
  category_id  UUID REFERENCES categories(id),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Logo versions for undo/redo functionality
CREATE TABLE logo_versions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  logo_id     UUID NOT NULL REFERENCES logos(id) ON DELETE CASCADE,
  snapshot    JSONB NOT NULL,     -- complete logo tree (layers + props)
  note        TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Templates table
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category_id UUID REFERENCES categories(id),
  preview_url TEXT,
  base_logo_id UUID NOT NULL REFERENCES logos(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================
-- LAYER SYSTEM TABLES
-- ==============================================

-- Common layer properties
CREATE TABLE layers (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  logo_id       UUID NOT NULL REFERENCES logos(id) ON DELETE CASCADE,
  type          layer_type NOT NULL,
  name          TEXT,
  z_index       INTEGER NOT NULL,            -- layer order
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
  common_style  JSONB,         -- shadow/filters/mask in unified format
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (logo_id, z_index)
);

-- Text layer properties
CREATE TABLE layer_text (
  layer_id        UUID PRIMARY KEY REFERENCES layers(id) ON DELETE CASCADE,
  content         TEXT NOT NULL,
  font_id         UUID REFERENCES fonts(id),
  font_size       NUMERIC NOT NULL,                 -- px at canvas scale 1
  line_height     NUMERIC,                          -- 1.0.. (em)
  letter_spacing  NUMERIC,                          -- px
  align           text_align NOT NULL DEFAULT 'center',
  baseline        text_baseline NOT NULL DEFAULT 'alphabetic',
  fill_hex        TEXT NOT NULL DEFAULT '#000000',
  fill_alpha      NUMERIC NOT NULL DEFAULT 1 CHECK (fill_alpha >= 0 AND fill_alpha <= 1),
  stroke_hex      TEXT,                             -- outline color
  stroke_alpha    NUMERIC,
  stroke_width    NUMERIC,
  stroke_align    stroke_align,
  gradient        JSONB                             -- {type, angle, stops:[{offset,hex,alpha}]}
);

-- Shape layer properties
CREATE TABLE layer_shape (
  layer_id       UUID PRIMARY KEY REFERENCES layers(id) ON DELETE CASCADE,
  shape_kind     TEXT NOT NULL,             -- 'rect'|'circle'|'polygon'|'path'
  svg_path       TEXT,                      -- when kind='path' or general
  points         JSONB,                     -- for polygon: [[x,y],...], normalized 0..1
  rx             NUMERIC,                   -- rect corner radius x
  ry             NUMERIC,                   -- rect corner radius y
  fill_hex       TEXT,
  fill_alpha     NUMERIC,
  gradient       JSONB,
  stroke_hex     TEXT,
  stroke_alpha   NUMERIC,
  stroke_width   NUMERIC,
  stroke_dash    JSONB,                     -- [dash, gap, ...]
  line_cap       line_cap,
  line_join      line_join,
  meta           JSONB                      -- for advanced features like edge-by-edge control
);

-- Icon layer properties
CREATE TABLE layer_icon (
  layer_id       UUID PRIMARY KEY REFERENCES layers(id) ON DELETE CASCADE,
  asset_id       UUID NOT NULL REFERENCES assets(id),
  tint_hex       TEXT,                             -- for SVG with currentColor
  tint_alpha     NUMERIC,                          -- 0..1
  allow_recolor  BOOLEAN NOT NULL DEFAULT TRUE
);

-- Image layer properties
CREATE TABLE layer_image (
  layer_id       UUID PRIMARY KEY REFERENCES layers(id) ON DELETE CASCADE,
  asset_id       UUID NOT NULL REFERENCES assets(id),
  crop           JSONB,             -- {x:0..1,y:0..1,w:0..1,h:0..1}
  fit            TEXT,              -- 'contain'|'cover'|'fill'|'none'
  rounding       NUMERIC,           -- corner radius px (mask)
  blur           NUMERIC,
  brightness     NUMERIC,           -- 0..2
  contrast       NUMERIC            -- 0..2
);

-- Background layer properties
CREATE TABLE layer_background (
  layer_id      UUID PRIMARY KEY REFERENCES layers(id) ON DELETE CASCADE,
  mode          TEXT NOT NULL,   -- 'solid'|'gradient'|'image'|'pattern'
  fill_hex      TEXT,
  fill_alpha    NUMERIC,
  gradient      JSONB,           -- {type:'linear'|'radial', angle, stops:[{offset,hex,alpha}]}
  asset_id      UUID REFERENCES assets(id),  -- for image/pattern
  repeat        TEXT,            -- 'no-repeat'|'repeat'|'repeat-x'|'repeat-y'
  position      TEXT,            -- 'center'|'top-left'|...
  size          TEXT             -- 'cover'|'contain'|px
);

-- ==============================================
-- INDEXES FOR PERFORMANCE
-- ==============================================

-- Core table indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_assets_kind ON assets(kind);
CREATE INDEX idx_assets_created_by ON assets(created_by);
CREATE INDEX idx_assets_meta_gin ON assets USING GIN (meta);
CREATE INDEX idx_fonts_family ON fonts(family);
CREATE INDEX idx_logos_owner_id ON logos(owner_id);
CREATE INDEX idx_logos_category_id ON logos(category_id);
CREATE INDEX idx_logos_is_template ON logos(is_template);
CREATE INDEX idx_logo_versions_logo_id ON logo_versions(logo_id, created_at DESC);

-- Layer system indexes
CREATE INDEX idx_layers_logo_id ON layers(logo_id);
CREATE INDEX idx_layers_type ON layers(type);
CREATE INDEX idx_layers_z_index ON layers(logo_id, z_index);
CREATE INDEX idx_layers_common_style_gin ON layers USING GIN (common_style);

-- Template system indexes
CREATE INDEX idx_templates_category_id ON templates(category_id);
CREATE INDEX idx_templates_base_logo_id ON templates(base_logo_id);

-- ==============================================
-- TRIGGERS FOR UPDATED_AT
-- ==============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for all tables with updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assets_updated_at
  BEFORE UPDATE ON assets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fonts_updated_at
  BEFORE UPDATE ON fonts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_logos_updated_at
  BEFORE UPDATE ON logos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_templates_updated_at
  BEFORE UPDATE ON templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_layers_updated_at
  BEFORE UPDATE ON layers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ==============================================
-- CONSTRAINTS AND VALIDATION
-- ==============================================

-- Ensure each layer has exactly one type-specific record
ALTER TABLE layer_text ADD CONSTRAINT layer_text_layer_type_check 
  CHECK (EXISTS (SELECT 1 FROM layers WHERE id = layer_id AND type = 'TEXT'));

ALTER TABLE layer_shape ADD CONSTRAINT layer_shape_layer_type_check 
  CHECK (EXISTS (SELECT 1 FROM layers WHERE id = layer_id AND type = 'SHAPE'));

ALTER TABLE layer_icon ADD CONSTRAINT layer_icon_layer_type_check 
  CHECK (EXISTS (SELECT 1 FROM layers WHERE id = layer_id AND type = 'ICON'));

ALTER TABLE layer_image ADD CONSTRAINT layer_image_layer_type_check 
  CHECK (EXISTS (SELECT 1 FROM layers WHERE id = layer_id AND type = 'IMAGE'));

ALTER TABLE layer_background ADD CONSTRAINT layer_background_layer_type_check 
  CHECK (EXISTS (SELECT 1 FROM layers WHERE id = layer_id AND type = 'BACKGROUND'));

-- Ensure z_index uniqueness within each logo
-- (already handled by UNIQUE constraint on layers table)

-- Color format validation (basic hex check)
ALTER TABLE layer_text ADD CONSTRAINT layer_text_fill_hex_format 
  CHECK (fill_hex IS NULL OR fill_hex ~ '^#[0-9A-Fa-f]{6}$');

ALTER TABLE layer_text ADD CONSTRAINT layer_text_stroke_hex_format 
  CHECK (stroke_hex IS NULL OR stroke_hex ~ '^#[0-9A-Fa-f]{6}$');

-- ==============================================
-- SAMPLE DATA AND FUNCTIONS
-- ==============================================

-- Function to create a new logo with layers
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
  -- Create the logo
  INSERT INTO logos (owner_id, title, canvas_w, canvas_h)
  VALUES (p_owner_id, p_title, p_canvas_w, p_canvas_h)
  RETURNING id INTO logo_id;

  -- Process each layer
  FOR layer_data IN SELECT * FROM jsonb_array_elements(p_layers)
  LOOP
    layer_z_index := COALESCE((layer_data->>'z_index')::INTEGER, 0);
    
    -- Insert layer
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

    -- Insert type-specific data based on layer type
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
      -- Add other layer types as needed
    END CASE;
  END LOOP;

  RETURN logo_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get logo with all layers
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
