# ⚡ Quick Start Guide

Get your Express.js API up and running in 5 minutes!

## 🚀 One-Command Setup

```bash
# Clone, install, and start
git clone https://github.com/yourusername/express-starter-db-storage.git && \
cd express-starter-db-storage && \
npm install && \
cp env.example .env
```

## 🔧 Configure (2 minutes)

### 1. Get Database URL
- Go to [Neon Console](https://console.neon.tech/)
- Create project → Copy connection string

### 2. Get Cloudinary URL  
- Go to [Cloudinary Console](https://console.cloudinary.com/)
- Copy Cloudinary URL

### 3. Update .env
```env
DATABASE_URL="your-neon-connection-string"
CLOUDINARY_URL="your-cloudinary-url"
```

## 🎯 Run (1 minute)

```bash
# Initialize database
npm run init-db

# Start development
npm run dev
```

## ✅ Test

```bash
# Test API
curl http://localhost:3000/

# Test database
curl http://localhost:3000/api/users

# Test file upload
curl -X POST http://localhost:3000/api/upload/image \
  -F "image=@/path/to/image.jpg"
```

## 🚀 Deploy

```bash
# Deploy to Vercel
npx vercel --prod

# Set environment variables
npx vercel env add DATABASE_URL
npx vercel env add CLOUDINARY_URL
```

## 🎉 Done!

Your API is now live and ready for development!

**Next Steps:**
- Read [API Documentation](API.md)
- Check [Setup Guide](SETUP.md) for detailed instructions
- See [Deployment Guide](DEPLOYMENT.md) for production deployment

---

**Need Help?** Check [Troubleshooting Guide](TROUBLESHOOTING.md) or [create an issue](https://github.com/yourusername/express-starter-db-storage/issues).
