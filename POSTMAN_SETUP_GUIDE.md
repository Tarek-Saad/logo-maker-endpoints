# 🚀 Logo Maker API - Complete Postman Setup Guide

## 📋 Overview

This guide will help you set up and use the complete Logo Maker API Postman collection with all documentation, testing, and examples.

## 📁 Files Included

1. **`logo-maker-complete-api.postman_collection.json`** - Complete API collection with all endpoints
2. **`logo-maker-api.postman_environment.json`** - Environment variables for testing
3. **`logo-maker-api.postman_tests.json`** - Comprehensive test suite
4. **`POSTMAN_DOCUMENTATION.md`** - Detailed API documentation
5. **`POSTMAN_SETUP_GUIDE.md`** - This setup guide

## 🚀 Quick Setup

### Step 1: Import Collection
1. Open **Postman**
2. Click **Import** button
3. Select **`logo-maker-complete-api.postman_collection.json`**
4. Click **Import**

### Step 2: Import Environment
1. Click **Import** button again
2. Select **`logo-maker-api.postman_environment.json`**
3. Click **Import**

### Step 3: Import Test Suite
1. Click **Import** button again
2. Select **`logo-maker-api.postman_tests.json`**
3. Click **Import**

### Step 4: Select Environment
1. Click the **Environment** dropdown (top right)
2. Select **"Logo Maker API - Development"**

## 🎯 Collection Structure

### 🏥 Health Check
- **Health Check** - Verify API server status

### 🎨 Logo Management (4 endpoints)
- **Create Logo** - Create new logo with layers
- **Get Logo** - Retrieve logo with all layers
- **Update Logo** - Update logo properties
- **Delete Logo** - Remove logo permanently

### 🔧 Layer Management (9 endpoints)
- **Get Layer** - Get layer by ID
- **Update Layer Common Properties** - Position, scale, rotation, opacity
- **Update Text Layer** - Text content, fonts, colors, alignment
- **Update Shape Layer** - Shape type, fill, stroke, corners
- **Update Icon Layer** - Asset reference, tint, recoloring
- **Update Image Layer** - Asset reference, crop, filters
- **Update Background Layer** - Mode, colors, gradients
- **Reorder Layer** - Change z-index (layer order)
- **Delete Layer** - Remove layer permanently

### 📁 Asset Management (7 endpoints)
- **Get Assets** - List assets with filtering
- **Get Asset by ID** - Retrieve specific asset
- **Upload Asset** - Upload file to Cloudinary
- **Create Asset Record** - Create asset metadata
- **Update Asset** - Update asset properties
- **Delete Asset** - Remove asset
- **Get Asset Download URL** - Get signed download URL

### 📋 Template Management (6 endpoints)
- **Get Templates** - List templates with filtering
- **Get Template by ID** - Retrieve specific template
- **Create Template** - Create template from logo
- **Use Template** - Create logo from template
- **Update Template** - Update template properties
- **Delete Template** - Remove template

### 📂 Categories (4 endpoints)
- **Get Categories** - List template categories
- **Create Category** - Create new category
- **Update Category** - Update category properties
- **Delete Category** - Remove category

### 📤 Export & Rendering (3 endpoints)
- **Export as PNG** - Export logo as PNG
- **Export as SVG** - Export logo as SVG
- **Generate Thumbnail** - Create thumbnail image

### 📚 Version Control (2 endpoints)
- **Create Version** - Create version snapshot
- **Get Versions** - List logo versions

### 🔧 Legacy Endpoints (2 endpoints)
- **Legacy Logo Endpoints** - Backward compatibility

## 🧪 Testing Features

### Automated Tests
- **Response Time** - Ensures API responds within 10 seconds
- **Status Codes** - Verifies correct HTTP status codes
- **Response Structure** - Checks for required fields
- **Data Validation** - Validates response data types
- **Error Handling** - Tests error scenarios

### Test Categories
1. **Health Check Tests** - Server status verification
2. **Logo Management Tests** - CRUD operations
3. **Layer Management Tests** - Layer operations
4. **Asset Management Tests** - File operations
5. **Template Management Tests** - Template operations
6. **Export Tests** - Export functionality
7. **Error Handling Tests** - Error scenarios

## 🔧 Environment Variables

### Core Variables
- **`baseUrl`** - API base URL (`http://localhost:3000/api`)
- **`serverUrl`** - Server URL (`http://localhost:3000`)
- **`userId`** - Default user ID for testing

### Auto-Set Variables
- **`logoId`** - Set after creating logo
- **`layerId`** - Set after creating layer
- **`assetId`** - Set after uploading asset
- **`templateId`** - Set after creating template
- **`categoryId`** - Set after creating category
- **`versionId`** - Set after creating version

### Default Values
- **Canvas**: 1080x1080, 300 DPI
- **Export**: 1920x1080, 95% quality
- **Thumbnail**: 300x300
- **Pagination**: 20 items per page
- **Colors**: White fill, black stroke
- **Position**: Center (0.5, 0.5)
- **Scale**: 1.0, Rotation: 0°
- **Opacity**: 1.0, Blend: normal

## 🎨 Example Workflows

### Workflow 1: Create a Gaming Logo
1. **Health Check** - Verify server is running
2. **Create Logo** - Start with 1080x1080 canvas
3. **Upload Assets** - Add gaming icons and fonts
4. **Create Background Layer** - Set gradient background
5. **Create Text Layer** - Add gaming title
6. **Create Icon Layer** - Add gaming icon
7. **Export as PNG** - Generate final logo

### Workflow 2: Create a Template
1. **Create Logo** - Design your template
2. **Add All Layers** - Complete the design
3. **Create Template** - Save as reusable template
4. **Use Template** - Create new logos from template

### Workflow 3: Version Control
1. **Create Logo** - Start with basic design
2. **Create Version** - Save initial state
3. **Make Changes** - Modify layers
4. **Create Version** - Save updated state
5. **Get Versions** - View version history

## 🚀 Running Tests

### Run All Tests
1. Select **"Logo Maker API - Test Suite"** collection
2. Click **Run** button
3. Click **Run Logo Maker API - Test Suite**
4. Review test results

### Run Individual Tests
1. Select specific test folder
2. Click **Run** button
3. Review results for that category

### Run Collection Tests
1. Select **"Logo Maker API - Complete Documentation"** collection
2. Click **Run** button
3. Run all requests with tests

## 📊 Test Results

### Success Indicators
- ✅ **Green checkmarks** - Tests passed
- ✅ **Response time < 10s** - Performance good
- ✅ **Status codes 200/201** - Requests successful
- ✅ **Valid JSON responses** - Data structure correct

### Failure Indicators
- ❌ **Red X marks** - Tests failed
- ❌ **Status codes 4xx/5xx** - Request errors
- ❌ **Response time > 10s** - Performance issues
- ❌ **Invalid JSON** - Data structure issues

## 🛠️ Troubleshooting

### Common Issues

#### 1. Server Not Running
**Error**: Connection refused
**Solution**: 
```bash
npm run dev
```

#### 2. Database Connection Failed
**Error**: Database connection error
**Solution**: Check `.env` file has correct `DATABASE_URL`

#### 3. Asset Upload Fails
**Error**: Cloudinary upload failed
**Solution**: Check Cloudinary configuration in `.env`

#### 4. Layer Creation Fails
**Error**: Invalid layer type
**Solution**: Use valid layer types: BACKGROUND, TEXT, SHAPE, ICON, IMAGE

### Debug Steps
1. **Health Check** - Verify server status
2. **Check Logs** - Look at server console output
3. **Test Database** - Verify database connection
4. **Check Environment** - Ensure all variables are set

## 📚 Advanced Usage

### Custom Variables
You can add custom variables to the environment:
- **`customLogoId`** - For specific logo testing
- **`customAssetId`** - For specific asset testing
- **`customTemplateId`** - For specific template testing

### Custom Tests
Add custom tests to any request:
```javascript
pm.test('Custom test', function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.customField).to.eql('expectedValue');
});
```

### Pre-request Scripts
Add pre-request scripts for dynamic data:
```javascript
// Generate random ID
pm.collectionVariables.set('randomId', pm.variables.replaceIn('{{$randomUUID}}'));
```

## 🎉 Success!

Your Logo Maker API Postman collection is now fully set up and ready for testing! 

### What You Can Do Now:
1. **Test All Endpoints** - Run the complete test suite
2. **Explore API Features** - Try different layer types and properties
3. **Build Workflows** - Create complex logo creation workflows
4. **Debug Issues** - Use tests to identify and fix problems
5. **Document Usage** - Share collection with team members

### Next Steps:
1. **Run Health Check** - Verify server is running
2. **Create Your First Logo** - Try the create logo endpoint
3. **Add Layers** - Experiment with different layer types
4. **Export Results** - Generate PNG and SVG exports
5. **Share Collection** - Export and share with your team

---

**Happy Testing! 🧪✨**

## 📞 Support

If you encounter any issues:
1. Check the **TROUBLESHOOTING.md** file
2. Review server logs for error messages
3. Verify all environment variables are set correctly
4. Ensure the Logo Maker API server is running

**Your Logo Maker API is now fully documented and ready for comprehensive testing!** 🚀
