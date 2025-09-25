# Logo Maker API - Complete Implementation

A comprehensive Logo Maker API built with Express.js and PostgreSQL, featuring advanced layer management, template system, asset management, and export functionality.

## 🚀 Features

### Core Functionality
- **Multi-layer Logo Creation**: Support for Background, Text, Shape, Icon, and Image layers
- **Advanced Layer Properties**: Position, scale, rotation, opacity, blend modes, shadows, filters
- **Template System**: Reusable logo templates with categories
- **Asset Management**: Cloudinary integration for images, SVGs, and fonts
- **Version Control**: Snapshot-based undo/redo system
- **Export Options**: PNG and SVG export with customizable dimensions and quality

### Layer Types
- **Background**: Solid colors, gradients, images, patterns
- **Text**: Rich text with fonts, stroke, shadows, gradients
- **Shape**: Rectangles, circles, custom SVG paths with advanced styling
- **Icon**: SVG icons with dynamic coloring and effects
- **Image**: Raster images with crop, filters, and transformations

### Advanced Features
- **Normalized Coordinates**: All positions relative to canvas (0-1)
- **Blend Modes**: 16 different compositing modes
- **Gradient Support**: Linear and radial gradients with multiple stops
- **Shadow Effects**: Drop shadows with customizable properties
- **Asset Optimization**: Automatic image optimization and format conversion
- **Template Inheritance**: Copy and modify existing designs

## 📋 Prerequisites

- Node.js 18+
- PostgreSQL 12+
- Cloudinary account (for asset storage)
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd logo-maker-endpoints
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/logo_maker
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   NODE_ENV=development
   PORT=3000
   ```

4. **Set up the database**
   ```bash
   # Create PostgreSQL database
   createdb logo_maker
   
   # Run migration to set up the new schema
   npm run migrate
   ```

5. **Start the server**
   ```bash
   npm run dev
   ```

## 🗄️ Database Schema

The API uses a comprehensive PostgreSQL schema with the following main entities:

### Core Tables
- **users**: User accounts and profiles
- **assets**: File metadata (images, SVGs, fonts) with Cloudinary integration
- **fonts**: Font family management with CDN links
- **logos**: Logo projects with canvas dimensions and metadata
- **categories**: Template and asset categorization

### Layer System
- **layers**: Common layer properties (position, scale, rotation, opacity, blend modes)
- **layer_text**: Text-specific properties (content, font, styling, stroke)
- **layer_shape**: Shape properties (type, SVG path, fill, stroke, corners)
- **layer_icon**: Icon properties (asset reference, tinting, recoloring)
- **layer_image**: Image properties (asset reference, crop, filters)
- **layer_background**: Background properties (solid, gradient, image, pattern)

### Template System
- **templates**: Reusable logo templates
- **logo_versions**: Version history with JSON snapshots

### Key Features
- **Normalized Coordinates**: All positions stored as 0-1 relative values
- **JSONB Support**: Flexible metadata and styling storage
- **Cascade Deletes**: Proper cleanup when deleting logos/layers
- **Unique Constraints**: Prevents duplicate z-index values per logo
- **Indexes**: Optimized for common query patterns

## 🔧 API Endpoints

### Logo Management
- `POST /api/logo` - Create logo with layers
- `GET /api/logo/:id` - Get logo with all layer data
- `PATCH /api/logo/:id` - Update logo properties
- `DELETE /api/logo/:id` - Delete logo

### Layer Management
- `GET /api/layers/:id` - Get layer with type-specific data
- `PATCH /api/layers/:id` - Update common layer properties
- `PATCH /api/layers/:id/text` - Update text layer
- `PATCH /api/layers/:id/shape` - Update shape layer
- `PATCH /api/layers/:id/icon` - Update icon layer
- `PATCH /api/layers/:id/image` - Update image layer
- `PATCH /api/layers/:id/background` - Update background layer
- `POST /api/layers/:id/reorder` - Reorder layer z-index
- `DELETE /api/layers/:id` - Delete layer

### Asset Management
- `GET /api/assets` - List assets with filtering
- `POST /api/assets/upload` - Upload file to Cloudinary
- `POST /api/assets` - Create asset record
- `GET /api/assets/:id` - Get asset details
- `PATCH /api/assets/:id` - Update asset metadata
- `DELETE /api/assets/:id` - Delete asset
- `GET /api/assets/:id/download` - Get download URL

### Template System
- `GET /api/templates` - List templates with filtering
- `POST /api/templates` - Create template
- `GET /api/templates/:id` - Get template details
- `POST /api/templates/:id/use` - Create logo from template
- `PATCH /api/templates/:id` - Update template
- `DELETE /api/templates/:id` - Delete template

### Categories
- `GET /api/templates/categories` - List categories
- `POST /api/templates/categories` - Create category
- `PATCH /api/templates/categories/:id` - Update category
- `DELETE /api/templates/categories/:id` - Delete category

### Export & Rendering
- `GET /api/logo/:id/export.png` - Export as PNG
- `GET /api/logo/:id/export.svg` - Export as SVG
- `GET /api/logo/:id/thumbnail` - Generate thumbnail

### Version Control
- `POST /api/logo/:id/version` - Create version snapshot
- `GET /api/logo/:id/versions` - List versions

## 📖 Usage Examples

### Creating a Gaming Logo

```javascript
// 1. Upload icon asset
const iconResponse = await fetch('/api/assets/upload', {
  method: 'POST',
  body: formData // with icon file
});
const iconAsset = await iconResponse.json();

// 2. Create logo with layers
const logoResponse = await fetch('/api/logo', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    owner_id: 'user-uuid',
    title: 'Gaming Hunter Logo',
    canvas_w: 1080,
    canvas_h: 1080,
    layers: [
      {
        type: 'BACKGROUND',
        name: 'Background',
        z_index: 0,
        x_norm: 0, y_norm: 0,
        background: {
          mode: 'gradient',
          gradient: {
            type: 'linear',
            angle: 45,
            stops: [
              { offset: 0, hex: '#FF6B6B', alpha: 1 },
              { offset: 1, hex: '#4ECDC4', alpha: 1 }
            ]
          }
        }
      },
      {
        type: 'ICON',
        name: 'Samurai Icon',
        z_index: 10,
        x_norm: 0.5, y_norm: 0.4,
        icon: {
          asset_id: iconAsset.data.id,
          tint_hex: '#E21F26',
          tint_alpha: 1
        },
        common_style: {
          shadow: {
            dx: 0, dy: 8, blur: 16,
            hex: '#000000', alpha: 0.35
          }
        }
      },
      {
        type: 'TEXT',
        name: 'Title',
        z_index: 20,
        x_norm: 0.5, y_norm: 0.7,
        text: {
          content: 'HUNTER',
          font_size: 64,
          fill_hex: '#FFFFFF',
          stroke_hex: '#000000',
          stroke_width: 4,
          align: 'center'
        }
      }
    ]
  })
});

const logo = await logoResponse.json();

// 3. Export as PNG
const exportUrl = `/api/logo/${logo.data.id}/export.png?width=1920&height=1080&dpi=300`;
```

### Using Templates

```javascript
// 1. Create template from existing logo
const templateResponse = await fetch('/api/templates', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Gaming Logo Template',
    description: 'Template for gaming logos',
    base_logo_id: logo.data.id,
    preview_url: 'https://...'
  })
});

// 2. Use template to create new logo
const newLogoResponse = await fetch(`/api/templates/${templateId}/use`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    owner_id: 'user-uuid',
    title: 'My Gaming Logo'
  })
});
```

## 🎨 Layer Properties

### Common Properties (All Layers)
- `x_norm`, `y_norm`: Position (0-1 relative to canvas)
- `scale`: Scale factor (1.0 = original size)
- `rotation_deg`: Rotation in degrees
- `anchor_x`, `anchor_y`: Anchor point (0.5,0.5 = center)
- `opacity`: Opacity (0-1)
- `blend_mode`: Compositing mode
- `is_visible`: Show/hide layer
- `is_locked`: Prevent editing
- `common_style`: Shadows, filters, masks

### Text Layer Properties
- `content`: Text content
- `font_id`: Font reference
- `font_size`: Size in pixels
- `line_height`: Line spacing
- `letter_spacing`: Character spacing
- `align`: Text alignment
- `baseline`: Text baseline
- `fill_hex`, `fill_alpha`: Fill color
- `stroke_hex`, `stroke_alpha`, `stroke_width`: Stroke properties
- `gradient`: Color gradients

### Shape Layer Properties
- `shape_kind`: Type (rect, circle, polygon, path)
- `svg_path`: Custom SVG path
- `points`: Polygon points
- `rx`, `ry`: Corner radius
- `fill_hex`, `fill_alpha`: Fill properties
- `stroke_hex`, `stroke_alpha`, `stroke_width`: Stroke properties
- `stroke_dash`: Dash pattern
- `line_cap`, `line_join`: Line styling
- `meta`: Advanced properties (edge-by-edge control)

### Icon Layer Properties
- `asset_id`: SVG asset reference
- `tint_hex`, `tint_alpha`: Color tinting
- `allow_recolor`: Enable/disable recoloring

### Image Layer Properties
- `asset_id`: Image asset reference
- `crop`: Crop rectangle (0-1 relative)
- `fit`: Fit mode (contain, cover, fill, none)
- `rounding`: Corner radius
- `blur`: Blur amount
- `brightness`, `contrast`: Color adjustments

### Background Layer Properties
- `mode`: Type (solid, gradient, image, pattern)
- `fill_hex`, `fill_alpha`: Solid color
- `gradient`: Gradient definition
- `asset_id`: Image/pattern asset
- `repeat`: Repeat mode
- `position`: Background position
- `size`: Background size

## 🔄 Version Control

The API includes a comprehensive version control system:

```javascript
// Create version snapshot
const versionResponse = await fetch(`/api/logo/${logoId}/version`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    note: 'Added new text layer'
  })
});

// Get version history
const versionsResponse = await fetch(`/api/logo/${logoId}/versions`);
const versions = await versionsResponse.json();
```

## 📤 Export Options

### PNG Export
```javascript
const pngUrl = `/api/logo/${logoId}/export.png?width=1920&height=1080&dpi=300&quality=95`;
```

### SVG Export
```javascript
const svgUrl = `/api/logo/${logoId}/export.svg?width=1920&height=1080`;
```

### Thumbnail Generation
```javascript
const thumbnailUrl = `/api/logo/${logoId}/thumbnail?width=300&height=300`;
```

## 🧪 Testing

The project includes a comprehensive Postman collection with all endpoints:

1. Import `logo-maker-api.postman_collection.json` into Postman
2. Set the `baseUrl` variable to your API endpoint
3. Run the collection to test all functionality

## 📚 Documentation

- **API Documentation**: `LOGO_MAKER_API.md`
- **Database Schema**: `api/config/schema.sql`
- **Migration Script**: `api/config/migrate-to-logo-maker.js`
- **Postman Collection**: `logo-maker-api.postman_collection.json`

## 🚀 Deployment

### Environment Variables
```env
DATABASE_URL=postgresql://user:password@host:port/database
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
NODE_ENV=production
PORT=3000
```

### Database Migration
```bash
npm run migrate
```

### Production Start
```bash
npm start
```

## 🔧 Development

### Database Migration
To migrate from the old schema to the new Logo Maker schema:

```bash
npm run migrate
```

### Development Server
```bash
npm run dev
```

### Database Initialization
```bash
npm run init-db
```

## 📊 Performance Considerations

- **Indexes**: Optimized for common query patterns
- **JSONB**: Efficient storage for flexible metadata
- **Cloudinary**: CDN-optimized asset delivery
- **Snapshots**: Fast version restoration
- **Pagination**: Efficient large dataset handling

## 🔒 Security Considerations

- **Input Validation**: Comprehensive validation for all endpoints
- **SQL Injection**: Parameterized queries throughout
- **File Upload**: Secure file handling with Cloudinary
- **Rate Limiting**: Consider implementing for production
- **Authentication**: Add JWT/session auth for production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues and questions:
1. Check the documentation
2. Review the Postman collection
3. Test with the provided examples
4. Create an issue with detailed information

---

This Logo Maker API provides everything needed to build a professional logo creation application with advanced features, comprehensive layer management, and seamless export capabilities.
