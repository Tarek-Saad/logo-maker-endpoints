const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// ==============================================
// EXPORT/RENDER ENDPOINTS
// ==============================================

// GET /api/logo/:id/export.png - Export logo as PNG
router.get('/logo/:id/export.png', async (req, res) => {
  try {
    const { id } = req.params;
    const { width, height, dpi = 72, quality = 90 } = req.query;

    // Get logo with all layers
    const logoResult = await query('SELECT get_logo_with_layers($1) as logo_data', [id]);
    
    if (!logoResult.rows[0].logo_data) {
      return res.status(404).json({ success: false, message: 'Logo not found' });
    }

    const logoData = logoResult.rows[0].logo_data;
    const canvasWidth = width ? parseInt(width) : logoData.canvas_w;
    const canvasHeight = height ? parseInt(height) : logoData.canvas_h;

    // Generate SVG from logo data
    const svg = generateSVGFromLogo(logoData, canvasWidth, canvasHeight);

    // Convert SVG to PNG using Cloudinary
    const pngUrl = cloudinary.url('data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64'), {
      format: 'png',
      width: canvasWidth,
      height: canvasHeight,
      quality: quality,
      dpi: dpi,
      flags: 'attachment'
    });

    // Upload to Cloudinary for processing
    const uploadResult = await cloudinary.uploader.upload(pngUrl, {
      resource_type: 'image',
      format: 'png',
      transformation: [
        { width: canvasWidth, height: canvasHeight, crop: 'fit' },
        { quality: quality, dpi: dpi }
      ]
    });

    res.json({
      success: true,
      data: {
        download_url: uploadResult.secure_url,
        format: 'png',
        width: canvasWidth,
        height: canvasHeight,
        dpi: dpi,
        quality: quality,
        file_size: uploadResult.bytes
      }
    });
  } catch (error) {
    console.error('Error exporting PNG:', error);
    res.status(500).json({ success: false, message: 'Failed to export PNG' });
  }
});

// GET /api/logo/:id/export.svg - Export logo as SVG
router.get('/logo/:id/export.svg', async (req, res) => {
  try {
    const { id } = req.params;
    const { width, height } = req.query;

    // Get logo with all layers
    const logoResult = await query('SELECT get_logo_with_layers($1) as logo_data', [id]);
    
    if (!logoResult.rows[0].logo_data) {
      return res.status(404).json({ success: false, message: 'Logo not found' });
    }

    const logoData = logoResult.rows[0].logo_data;
    const canvasWidth = width ? parseInt(width) : logoData.canvas_w;
    const canvasHeight = height ? parseInt(height) : logoData.canvas_h;

    // Generate SVG from logo data
    const svg = generateSVGFromLogo(logoData, canvasWidth, canvasHeight);

    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Content-Disposition', `attachment; filename="logo-${id}.svg"`);
    res.send(svg);
  } catch (error) {
    console.error('Error exporting SVG:', error);
    res.status(500).json({ success: false, message: 'Failed to export SVG' });
  }
});

// GET /api/logo/:id/thumbnail - Generate thumbnail
router.get('/logo/:id/thumbnail', async (req, res) => {
  try {
    const { id } = req.params;
    const { width = 300, height = 300 } = req.query;

    // Get logo with all layers
    const logoResult = await query('SELECT get_logo_with_layers($1) as logo_data', [id]);
    
    if (!logoResult.rows[0].logo_data) {
      return res.status(404).json({ success: false, message: 'Logo not found' });
    }

    const logoData = logoResult.rows[0].logo_data;

    // Generate SVG from logo data
    const svg = generateSVGFromLogo(logoData, parseInt(width), parseInt(height));

    // Convert to thumbnail using Cloudinary
    const thumbnailUrl = cloudinary.url('data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64'), {
      format: 'png',
      width: parseInt(width),
      height: parseInt(height),
      crop: 'fit',
      quality: 80
    });

    // Upload thumbnail to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(thumbnailUrl, {
      resource_type: 'image',
      format: 'png',
      transformation: [
        { width: parseInt(width), height: parseInt(height), crop: 'fit' },
        { quality: 80 }
      ]
    });

    // Update logo with thumbnail URL
    await query('UPDATE logos SET thumbnail_url = $1 WHERE id = $2', [uploadResult.secure_url, id]);

    res.json({
      success: true,
      data: {
        thumbnail_url: uploadResult.secure_url,
        width: parseInt(width),
        height: parseInt(height)
      }
    });
  } catch (error) {
    console.error('Error generating thumbnail:', error);
    res.status(500).json({ success: false, message: 'Failed to generate thumbnail' });
  }
});

// ==============================================
// HELPER FUNCTIONS
// ==============================================

function generateSVGFromLogo(logoData, width, height) {
  const { layers } = logoData;
  
  let svgContent = '';
  
  // Sort layers by z_index
  const sortedLayers = layers.sort((a, b) => a.z_index - b.z_index);
  
  for (const layer of sortedLayers) {
    if (!layer.is_visible) continue;
    
    const x = layer.x_norm * width;
    const y = layer.y_norm * height;
    const scale = layer.scale;
    const rotation = layer.rotation_deg;
    const opacity = layer.opacity;
    
    // Apply common styles
    let style = `opacity: ${opacity};`;
    if (layer.common_style && layer.common_style.shadow) {
      const shadow = layer.common_style.shadow;
      style += `filter: drop-shadow(${shadow.dx}px ${shadow.dy}px ${shadow.blur}px rgba(${hexToRgb(shadow.hex)}, ${shadow.alpha}));`;
    }
    
    switch (layer.type) {
      case 'BACKGROUND':
        svgContent += generateBackgroundSVG(layer, width, height, style);
        break;
      case 'TEXT':
        svgContent += generateTextSVG(layer, x, y, scale, rotation, style);
        break;
      case 'SHAPE':
        svgContent += generateShapeSVG(layer, x, y, scale, rotation, style);
        break;
      case 'ICON':
        svgContent += generateIconSVG(layer, x, y, scale, rotation, style);
        break;
      case 'IMAGE':
        svgContent += generateImageSVG(layer, x, y, scale, rotation, style);
        break;
    }
  }
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  ${svgContent}
</svg>`;
}

function generateBackgroundSVG(layer, width, height, style) {
  const { background } = layer;
  
  if (background.mode === 'solid' && background.fill_hex) {
    return `<rect width="${width}" height="${height}" fill="${background.fill_hex}" style="${style}"/>`;
  } else if (background.mode === 'gradient' && background.gradient) {
    const gradientId = `gradient-${layer.id}`;
    const gradient = background.gradient;
    
    let gradientDef = `<defs><linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="100%">`;
    for (const stop of gradient.stops) {
      gradientDef += `<stop offset="${stop.offset * 100}%" stop-color="${stop.hex}" stop-opacity="${stop.alpha}"/>`;
    }
    gradientDef += `</linearGradient></defs>`;
    
    return gradientDef + `<rect width="${width}" height="${height}" fill="url(#${gradientId})" style="${style}"/>`;
  }
  
  return '';
}

function generateTextSVG(layer, x, y, scale, rotation, style) {
  const { text } = layer;
  if (!text || !text.content) return '';
  
  const fontSize = text.font_size * scale;
  const transform = `translate(${x}, ${y}) scale(${scale}) rotate(${rotation})`;
  
  let textStyle = `font-size: ${fontSize}px; fill: ${text.fill_hex}; opacity: ${text.fill_alpha};`;
  if (text.stroke_hex && text.stroke_width) {
    textStyle += `stroke: ${text.stroke_hex}; stroke-width: ${text.stroke_width};`;
  }
  
  return `<text x="0" y="0" text-anchor="${text.align}" dominant-baseline="${text.baseline}" 
          transform="${transform}" style="${textStyle} ${style}">${text.content}</text>`;
}

function generateShapeSVG(layer, x, y, scale, rotation, style) {
  const { shape } = layer;
  if (!shape) return '';
  
  const transform = `translate(${x}, ${y}) scale(${scale}) rotate(${rotation})`;
  
  let shapeElement = '';
  let shapeStyle = `fill: ${shape.fill_hex || 'none'}; opacity: ${shape.fill_alpha || 1};`;
  
  if (shape.stroke_hex && shape.stroke_width) {
    shapeStyle += `stroke: ${shape.stroke_hex}; stroke-width: ${shape.stroke_width};`;
  }
  
  switch (shape.shape_kind) {
    case 'rect':
      shapeElement = `<rect x="0" y="0" width="100" height="100" rx="${shape.rx || 0}" ry="${shape.ry || 0}" 
                        style="${shapeStyle} ${style}"/>`;
      break;
    case 'circle':
      shapeElement = `<circle cx="50" cy="50" r="50" style="${shapeStyle} ${style}"/>`;
      break;
    case 'path':
      if (shape.svg_path) {
        shapeElement = `<path d="${shape.svg_path}" style="${shapeStyle} ${style}"/>`;
      }
      break;
  }
  
  return `<g transform="${transform}">${shapeElement}</g>`;
}

function generateIconSVG(layer, x, y, scale, rotation, style) {
  const { icon } = layer;
  if (!icon || !icon.asset) return '';
  
  const transform = `translate(${x}, ${y}) scale(${scale}) rotate(${rotation})`;
  const tintColor = icon.tint_hex || '#000000';
  const tintOpacity = icon.tint_alpha || 1;
  
  // If it's an SVG asset, use the vector_svg content
  if (icon.asset.vector_svg) {
    let svgContent = icon.asset.vector_svg;
    // Replace currentColor with the tint color
    svgContent = svgContent.replace(/currentColor/g, tintColor);
    svgContent = svgContent.replace(/fill="[^"]*"/g, `fill="${tintColor}" opacity="${tintOpacity}"`);
    
    return `<g transform="${transform}" style="${style}">${svgContent}</g>`;
  }
  
  // For raster images, use image element
  return `<image href="${icon.asset.url}" x="0" y="0" width="100" height="100" 
            transform="${transform}" style="${style}"/>`;
}

function generateImageSVG(layer, x, y, scale, rotation, style) {
  const { image } = layer;
  if (!image || !image.asset) return '';
  
  const transform = `translate(${x}, ${y}) scale(${scale}) rotate(${rotation})`;
  
  return `<image href="${image.asset.url}" x="0" y="0" width="100" height="100" 
            transform="${transform}" style="${style}"/>`;
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? 
    `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : 
    '0, 0, 0';
}

module.exports = router;
