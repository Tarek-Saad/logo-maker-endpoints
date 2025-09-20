# 🛠️ Complete Setup Guide

This guide will walk you through setting up this Express.js starter template from scratch.

## 📋 Prerequisites

Before you begin, make sure you have:

- [Node.js 18+](https://nodejs.org/) installed
- [Git](https://git-scm.com/) installed
- A code editor (VS Code recommended)
- A PostgreSQL database (we'll use Neon)
- A Cloudinary account for image storage

## 🚀 Step-by-Step Setup

### Step 1: Clone the Repository

```bash
# Clone the repository
git clone https://github.com/yourusername/express-starter-db-storage.git

# Navigate to the project directory
cd express-starter-db-storage

# Install dependencies
npm install
```

### Step 2: Set Up Database (Neon)

1. **Create a Neon Account:**
   - Go to [console.neon.tech](https://console.neon.tech/)
   - Sign up or log in
   - Create a new project

2. **Get Your Connection String:**
   - In your Neon dashboard, go to "Connection Details"
   - Copy the connection string (it looks like this):
   ```
   postgresql://username:password@ep-xxx-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```

3. **Test Your Connection:**
   - You can test the connection in the Neon dashboard
   - Make sure the database is accessible

### Step 3: Set Up Cloudinary

1. **Create a Cloudinary Account:**
   - Go to [cloudinary.com](https://cloudinary.com/)
   - Sign up for a free account
   - Verify your email

2. **Get Your Cloudinary URL:**
   - In your Cloudinary dashboard, go to "Dashboard"
   - Copy the "Cloudinary URL" (it looks like this):
   ```
   cloudinary://api_key:api_secret@cloud_name
   ```

3. **Test Your Account:**
   - You can test uploads in the Cloudinary dashboard
   - Check your account limits and settings

### Step 4: Configure Environment Variables

1. **Copy the Environment Template:**
   ```bash
   cp env.example .env
   ```

2. **Edit the `.env` file:**
   ```env
   # Environment Configuration
   NODE_ENV=development
   PORT=3000

   # Database Configuration (Replace with your Neon URL)
   DATABASE_URL="postgresql://username:password@ep-xxx-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require"

   # Cloudinary Configuration (Replace with your Cloudinary URL)
   CLOUDINARY_URL="cloudinary://api_key:api_secret@cloud_name"

   # Asset Configuration (Optional - for CDN)
   ASSET_BASE_URL="https://your-cdn-url.com/"

   # API Configuration (Optional - for JWT)
   # JWT_SECRET=your_jwt_secret_here

   # CORS Configuration (Optional)
   # CORS_ORIGIN=http://localhost:3000
   ```

### Step 5: Initialize the Database

```bash
# Run the database initialization script
npm run init-db
```

This will:
- Test your database connection
- Create the necessary tables (users, posts)
- Set up indexes and triggers
- Verify everything is working

**Expected Output:**
```
🚀 Starting database initialization...

Testing database connection...
✅ Database connected successfully

Initializing database tables...
✅ Database tables initialized successfully

✅ Database initialization completed successfully!

You can now start your application with: npm run dev
```

### Step 6: Start the Development Server

```bash
# Start the development server
npm run dev
```

**Expected Output:**
```
🚀 Server running on port 3000
Environment: development
📊 Database: Connected
☁️  Cloudinary: Configured
```

### Step 7: Test Your API

Open a new terminal and test the endpoints:

```bash
# Test the main endpoint
curl http://localhost:3000/

# Test the health endpoint
curl http://localhost:3000/health

# Test the users endpoint
curl http://localhost:3000/api/users

# Test the posts endpoint
curl http://localhost:3000/api/posts
```

## 🧪 Testing Your Setup

### Test Database Connection

```bash
# Create a test user
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com"
  }'

# Get all users
curl http://localhost:3000/api/users
```

### Test File Upload

```bash
# Upload a test image (replace with actual image path)
curl -X POST http://localhost:3000/api/upload/image \
  -F "image=@/path/to/your/test-image.jpg"
```

## 🚀 Deployment Setup

### Deploy to Vercel

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel --prod
   ```

4. **Set Environment Variables:**
   ```bash
   vercel env add DATABASE_URL
   vercel env add CLOUDINARY_URL
   vercel env add ASSET_BASE_URL
   vercel env add NODE_ENV
   ```

5. **Redeploy:**
   ```bash
   vercel --prod
   ```

### Deploy to Other Platforms

#### Railway
1. Connect your GitHub repository
2. Add environment variables in Railway dashboard
3. Deploy automatically

#### Heroku
1. Create a new Heroku app
2. Add PostgreSQL addon
3. Set environment variables
4. Deploy with Git

#### DigitalOcean App Platform
1. Connect your GitHub repository
2. Configure build settings
3. Add environment variables
4. Deploy

## 🔧 Customization

### Change Database Provider

If you want to use a different database provider:

1. **Update the connection string** in your `.env` file
2. **Modify the connection settings** in `api/config/database.js` if needed
3. **Test the connection** with `npm run init-db`

### Change Storage Provider

If you want to use a different storage provider:

1. **Install the new provider's SDK**
2. **Update the configuration** in `api/config/cloudinary.js`
3. **Modify the upload routes** in `api/routes/upload.js`
4. **Update environment variables**

### Add New Features

1. **New Models**: Create in `api/models/`
2. **New Routes**: Create in `api/routes/` and import in `api/index.js`
3. **New Config**: Add to `api/config/`

## 🐛 Troubleshooting

### Common Issues

#### Database Connection Failed
```
❌ Database connection failed: connect ECONNREFUSED
```

**Solutions:**
- Check your `DATABASE_URL` format
- Ensure the database is accessible
- Verify SSL settings
- Check if the database is running

#### Cloudinary Upload Failed
```
❌ Failed to upload image
```

**Solutions:**
- Check your `CLOUDINARY_URL` format
- Verify API credentials
- Check file size limits (10MB max)
- Ensure the file is a valid image

#### Vercel Deployment Failed
```
FUNCTION_INVOCATION_FAILED
```

**Solutions:**
- Check environment variables are set
- Verify all dependencies are in `package.json`
- Check build logs in Vercel dashboard
- Ensure database is accessible from Vercel

### Getting Help

1. **Check the logs:**
   ```bash
   # Local development
   npm run dev

   # Vercel logs
   vercel logs
   ```

2. **Verify environment variables:**
   ```bash
   # Check if .env file exists
   ls -la .env

   # Check environment variables
   cat .env
   ```

3. **Test database connection:**
   ```bash
   npm run init-db
   ```

4. **Check Vercel environment variables:**
   ```bash
   vercel env ls
   ```

## 📚 Next Steps

Once your setup is complete:

1. **Read the API Documentation** in `README.md`
2. **Explore the code structure** in the `api/` directory
3. **Add your own features** and endpoints
4. **Set up authentication** if needed
5. **Add validation** for your endpoints
6. **Write tests** for your code
7. **Deploy to production**

## 🎉 Congratulations!

You now have a fully functional Express.js API with:
- ✅ Database integration
- ✅ File upload capabilities
- ✅ Production-ready deployment
- ✅ Comprehensive documentation

Happy coding! 🚀
