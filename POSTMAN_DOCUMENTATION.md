# 🚀 Logo Maker API - Complete Postman Documentation

## 📋 Overview

This comprehensive Postman collection contains **all 50+ endpoints** for the Logo Maker API, including detailed documentation, examples, and automated testing scripts.

## 🎯 Features Covered

- **✅ Multi-layer Logo Creation** - Background, Text, Shape, Icon, Image layers
- **✅ Template System** - Categories, templates, and inheritance
- **✅ Asset Management** - Cloudinary integration for all file types
- **✅ Version Control** - Snapshot-based undo/redo system
- **✅ Export Options** - PNG and SVG export with customizable dimensions
- **✅ Advanced Layer Properties** - Position, scale, rotation, opacity, blend modes, shadows

## 📁 Collection Structure

### 🏥 Health Check
- **Health Check** - Verify API server status

### 🎨 Logo Management
- **Create Logo** - Create new logo with layers
- **Get Logo** - Retrieve logo with all layers
- **Update Logo** - Update logo properties
- **Delete Logo** - Remove logo permanently

### 🔧 Layer Management
- **Get Layer** - Get layer by ID
- **Update Layer Common Properties** - Position, scale, rotation, opacity
- **Update Text Layer** - Text content, fonts, colors, alignment
- **Update Shape Layer** - Shape type, fill, stroke, corners
- **Update Icon Layer** - Asset reference, tint, recoloring
- **Update Image Layer** - Asset reference, crop, filters
- **Update Background Layer** - Mode, colors, gradients
- **Reorder Layer** - Change z-index (layer order)
- **Delete Layer** - Remove layer permanently

### 📁 Asset Management
- **Get Assets** - List assets with filtering
- **Get Asset by ID** - Retrieve specific asset
- **Upload Asset** - Upload file to Cloudinary
- **Create Asset Record** - Create asset metadata
- **Update Asset** - Update asset properties
- **Delete Asset** - Remove asset
- **Get Asset Download URL** - Get signed download URL

### 📋 Template Management
- **Get Templates** - List templates with filtering
- **Get Template by ID** - Retrieve specific template
- **Create Template** - Create template from logo
- **Use Template** - Create logo from template
- **Update Template** - Update template properties
- **Delete Template** - Remove template

### 📂 Categories
- **Get Categories** - List template categories
- **Create Category** - Create new category
- **Update Category** - Update category properties
- **Delete Category** - Remove category

### 📤 Export & Rendering
- **Export as PNG** - Export logo as PNG
- **Export as SVG** - Export logo as SVG
- **Generate Thumbnail** - Create thumbnail image

### 📚 Version Control
- **Create Version** - Create version snapshot
- **Get Versions** - List logo versions

### 🔧 Legacy Endpoints
- **Legacy Logo Endpoints** - Backward compatibility

## 🚀 Quick Start

### 1. Import Collection
1. Open Postman
2. Click **Import**
3. Select `logo-maker-complete-api.postman_collection.json`
4. Click **Import**

### 2. Set Environment Variables
The collection includes these variables:
- `{{baseUrl}}` - API base URL (default: `http://localhost:3000/api`)
- `{{logoId}}` - Logo ID (auto-set after creating logo)
- `{{layerId}}` - Layer ID (auto-set after creating layer)
- `{{assetId}}` - Asset ID (auto-set after uploading asset)
- `{{templateId}}` - Template ID (auto-set after creating template)
- `{{userId}}` - User ID (default: `550e8400-e29b-41d4-a716-446655440000`)

### 3. Start Testing
1. **Health Check** - Verify server is running
2. **Create Logo** - Create your first logo
3. **Upload Assets** - Add images, icons, fonts
4. **Add Layers** - Build your logo with different layer types
5. **Export** - Generate PNG/SVG output

## 📝 Example Workflows

### 🎨 Create a Gaming Logo
1. **Create Logo** - Start with canvas dimensions
2. **Upload Assets** - Add gaming icons and fonts
3. **Add Background Layer** - Set gradient background
4. **Add Text Layer** - Add gaming title with custom font
5. **Add Icon Layer** - Add gaming icon
6. **Export as PNG** - Generate final logo

### 📋 Create a Template
1. **Create Logo** - Design your template
2. **Add All Layers** - Complete the design
3. **Create Template** - Save as reusable template
4. **Use Template** - Create new logos from template

### 🔄 Version Control
1. **Create Logo** - Start with basic design
2. **Create Version** - Save initial state
3. **Make Changes** - Modify layers
4. **Create Version** - Save updated state
5. **Get Versions** - View version history

## 🧪 Automated Testing

The collection includes automated tests for:
- **Response Time** - Ensures API responds within 5 seconds
- **Success Field** - Verifies response structure
- **Auto Variable Setting** - Automatically sets IDs after creation

## 📊 API Response Examples

### ✅ Success Response
```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "title": "My Gaming Logo",
    "canvas_w": 1080,
    "canvas_h": 1080,
    "layers": [...]
  }
}
```

### ❌ Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid layer type",
    "details": "Layer type must be one of: BACKGROUND, TEXT, SHAPE, ICON, IMAGE"
  }
}
```

## 🔧 Advanced Features

### Layer Types
- **BACKGROUND** - Solid colors, gradients, images, patterns
- **TEXT** - Rich text with fonts, stroke, shadows, gradients
- **SHAPE** - Rectangles, circles, custom SVG paths
- **ICON** - SVG icons with dynamic coloring
- **IMAGE** - Raster images with crop, filters, transformations

### Coordinate System
All coordinates are normalized (0-1) relative to canvas:
- `x_norm`, `y_norm` - Position (0,0 = top-left, 1,1 = bottom-right)
- `anchor_x`, `anchor_y` - Anchor point (0.5,0.5 = center)
- `scale` - Scale factor (1.0 = original size)
- `rotation_deg` - Rotation in degrees
- `opacity` - Opacity (0-1)

### Blend Modes
normal, multiply, screen, overlay, darken, lighten, color-burn, color-dodge, difference, exclusion, hue, saturation, color, luminosity, soft-light, hard-light

### Asset Kinds
- **raster** - PNG, JPEG, WebP images
- **vector** - SVG files
- **font** - Font files (TTF, WOFF2)
- **pattern** - Pattern/texture images

## 🛠️ Troubleshooting

### Common Issues
1. **Server Not Running** - Check if `npm run dev` is running
2. **Database Connection** - Verify `.env` file has correct `DATABASE_URL`
3. **Asset Upload Fails** - Check Cloudinary configuration
4. **Layer Creation Fails** - Verify layer type and properties

### Debug Steps
1. **Health Check** - Verify server status
2. **Check Logs** - Look at server console output
3. **Test Database** - Verify database connection
4. **Check Environment** - Ensure all variables are set

## 📚 Additional Resources

- **API Documentation** - `LOGO_MAKER_API.md`
- **Database Schema** - `api/config/schema.sql`
- **Setup Guide** - `SETUP_WINDOWS.md`
- **Troubleshooting** - `TROUBLESHOOTING.md`

## 🎉 Success!

Your Logo Maker API is now fully documented and ready for testing! Use this Postman collection to explore all features and build amazing logos programmatically.

---

**Happy Logo Making! 🎨✨**
