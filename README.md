# 🚀 Express.js Starter with Database & Storage

> **The Ultimate Backend Starter Template** - Ready-to-deploy Express.js API with PostgreSQL database and Cloudinary storage integration.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/express-starter-db-storage)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.18.2-000000)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192-blue)](https://postgresql.org/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-3448FF-orange)](https://cloudinary.com/)

## 🎯 What You Get

This starter template provides everything you need to build a production-ready backend API:

- ✅ **Express.js** server with security middleware
- ✅ **PostgreSQL Database** with Neon integration
- ✅ **Cloudinary Storage** for image uploads
- ✅ **Database Models** with full CRUD operations
- ✅ **File Upload** endpoints with image processing
- ✅ **Pagination & Search** functionality
- ✅ **Vercel Deployment** ready
- ✅ **Environment Configuration**
- ✅ **Comprehensive Documentation**

## 🚀 Quick Start (5 Minutes)

### 1. Clone & Install
```bash
git clone https://github.com/yourusername/express-starter-db-storage.git
cd express-starter-db-storage
npm install
```

### 2. Set Up Your Database
1. Go to [Neon Console](https://console.neon.tech/)
2. Create a new project
3. Copy your connection string

### 3. Set Up Cloudinary
1. Go to [Cloudinary Console](https://console.cloudinary.com/)
2. Copy your Cloudinary URL

### 4. Configure Environment
```bash
cp env.example .env
```

Edit `.env` with your credentials:
```env
# Database Configuration
DATABASE_URL="postgresql://username:password@host:port/database?sslmode=require"

# Cloudinary Configuration  
CLOUDINARY_URL="cloudinary://api_key:api_secret@cloud_name"

# Optional
ASSET_BASE_URL="https://your-cdn-url.com/"
NODE_ENV=development
PORT=3000
```

### 5. Initialize Database
```bash
npm run init-db
```

### 6. Start Development
```bash
npm run dev
```

🎉 **Your API is running at `http://localhost:3000`**

## 📚 API Documentation

### Base URL
- **Local**: `http://localhost:3000`
- **Production**: `https://your-app.vercel.app`

### Authentication
Currently no authentication required. Add JWT or OAuth as needed.

### Endpoints

#### 🏥 Health Check
```http
GET /
GET /health
```

#### 👥 Users API
```http
GET    /api/users              # Get all users (paginated)
GET    /api/users/:id          # Get user by ID
POST   /api/users              # Create new user
PUT    /api/users/:id          # Update user
DELETE /api/users/:id          # Delete user
```

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `search` - Search by name or email

#### 📝 Posts API
```http
GET    /api/posts              # Get all posts (paginated)
GET    /api/posts/:id          # Get post by ID
POST   /api/posts              # Create new post
PUT    /api/posts/:id          # Update post
DELETE /api/posts/:id          # Delete post
```

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `search` - Search by title or content
- `author` - Filter by author name

#### 📁 File Upload API
```http
POST   /api/upload/image       # Upload single image
POST   /api/upload/images      # Upload multiple images (max 5)
DELETE /api/upload/image/:id   # Delete image
GET    /api/upload/image/:id/url # Get image URL with transformations
```

## 🔧 Usage Examples

### Create a User
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "avatar_url": "https://example.com/avatar.jpg"
  }'
```

### Create a Post
```bash
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My First Post",
    "content": "This is the content of my post",
    "author_id": 1,
    "image_url": "https://example.com/image.jpg"
  }'
```

### Upload an Image
```bash
curl -X POST http://localhost:3000/api/upload/image \
  -F "image=@/path/to/your/image.jpg"
```

### Search Posts
```bash
curl "http://localhost:3000/api/posts?search=express&page=1&limit=10"
```

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Posts Table
```sql
CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  author_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
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

### Deploy to Other Platforms

- **Railway**: Connect GitHub repo
- **Heroku**: Add buildpacks and environment variables
- **DigitalOcean**: Use App Platform
- **AWS**: Use Lambda or EC2

## 📁 Project Structure

```
├── api/
│   ├── config/
│   │   ├── database.js      # Database configuration
│   │   └── cloudinary.js    # Cloudinary configuration
│   ├── models/
│   │   ├── User.js          # User model with CRUD operations
│   │   └── Post.js          # Post model with CRUD operations
│   ├── routes/
│   │   ├── users.js         # User API endpoints
│   │   ├── posts.js         # Post API endpoints
│   │   └── upload.js        # File upload endpoints
│   └── index.js             # Main Express application
├── scripts/
│   └── init-db.js           # Database initialization script
├── .env.example             # Environment variables template
├── package.json             # Dependencies and scripts
├── vercel.json             # Vercel deployment configuration
└── README.md               # This file
```

## 🛠️ Development

### Available Scripts

```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm run init-db    # Initialize database tables
```

### Adding New Features

1. **New Model**: Create in `api/models/`
2. **New Routes**: Create in `api/routes/` and import in `api/index.js`
3. **New Config**: Add to `api/config/`

### Database Management

- **Initialize**: `npm run init-db`
- **Reset**: Drop tables and run init again
- **Migrations**: Add SQL files in `scripts/migrations/`

## 🔍 Advanced Features

### Pagination
All list endpoints support pagination:
```bash
GET /api/users?page=2&limit=5
```

### Search
Search across multiple fields:
```bash
GET /api/posts?search=javascript
GET /api/users?search=john
```

### Image Transformations
Get optimized image URLs:
```bash
GET /api/upload/image/:id/url?width=300&height=200&crop=fill&quality=auto
```

### Error Handling
Consistent error responses:
```json
{
  "success": false,
  "message": "Error description",
  "data": null
}
```

## 🔧 Customization

### Change Database Provider
1. Update `DATABASE_URL` in `.env`
2. Modify connection settings in `api/config/database.js`

### Change Storage Provider
1. Update `CLOUDINARY_URL` in `.env`
2. Modify storage settings in `api/config/cloudinary.js`
3. Update upload routes in `api/routes/upload.js`

### Add Authentication
1. Install JWT: `npm install jsonwebtoken`
2. Create auth middleware
3. Protect routes as needed

### Add Validation
1. Install Joi: `npm install joi`
2. Create validation schemas
3. Add to route handlers

## 🐛 Troubleshooting

### Common Issues

**Database Connection Failed:**
- Check `DATABASE_URL` format
- Ensure database is accessible
- Verify SSL settings

**Cloudinary Upload Failed:**
- Check `CLOUDINARY_URL` format
- Verify API credentials
- Check file size limits

**Vercel Deployment Failed:**
- Check environment variables
- Verify build logs
- Ensure all dependencies are in `package.json`

### Getting Help

1. Check the [Issues](https://github.com/yourusername/express-starter-db-storage/issues) page
2. Create a new issue with:
   - Error message
   - Steps to reproduce
   - Environment details

## 🤝 Contributing

We welcome contributions! Here's how:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'Add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

### Development Guidelines

- Follow existing code style
- Add tests for new features
- Update documentation
- Ensure all tests pass

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Express.js](https://expressjs.com/) - Web framework
- [PostgreSQL](https://postgresql.org/) - Database
- [Cloudinary](https://cloudinary.com/) - Image storage
- [Vercel](https://vercel.com/) - Deployment platform
- [Neon](https://neon.tech/) - Database hosting

## 📞 Support

- 📧 **Email**: support@yourdomain.com
- 💬 **Discord**: [Join our community](https://discord.gg/your-server)
- 🐛 **Issues**: [GitHub Issues](https://github.com/yourusername/express-starter-db-storage/issues)
- 📖 **Docs**: [Full Documentation](https://docs.yourdomain.com)

---

<div align="center">

**⭐ Star this repo if you found it helpful!**

Made with ❤️ by [Your Name](https://github.com/yourusername)

[⬆ Back to Top](#-expressjs-starter-with-database--storage)

</div>