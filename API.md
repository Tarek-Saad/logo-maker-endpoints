# 📚 API Documentation

Complete API reference for the Express.js Starter with Database & Storage.

## Base URL

- **Local Development**: `http://localhost:3000`
- **Production**: `https://your-app.vercel.app`

## Authentication

Currently, no authentication is required. All endpoints are publicly accessible. Add JWT or OAuth authentication as needed for your use case.

## Response Format

All API responses follow this consistent format:

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "data": null
}
```

### Paginated Response
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## Endpoints

### 🏥 Health & Info

#### GET /
Get API information and status.

**Response:**
```json
{
  "message": "Welcome to Express Starter API",
  "version": "1.0.0",
  "status": "running",
  "timestamp": "2024-01-20T10:30:00.000Z"
}
```

#### GET /health
Health check endpoint for monitoring.

**Response:**
```json
{
  "status": "healthy",
  "uptime": 123.456,
  "timestamp": "2024-01-20T10:30:00.000Z"
}
```

---

### 👥 Users API

Base URL: `/api/users`

#### GET /api/users
Get all users with pagination and search.

**Query Parameters:**
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 10)
- `search` (string, optional): Search by name or email

**Example Request:**
```bash
GET /api/users?page=1&limit=5&search=john
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "avatar_url": "https://example.com/avatar.jpg",
      "created_at": "2024-01-20T10:30:00.000Z",
      "updated_at": "2024-01-20T10:30:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 2,
    "totalUsers": 10,
    "hasNext": true,
    "hasPrev": false
  }
}
```

#### GET /api/users/:id
Get a specific user by ID.

**Path Parameters:**
- `id` (number, required): User ID

**Example Request:**
```bash
GET /api/users/1
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "avatar_url": "https://example.com/avatar.jpg",
    "created_at": "2024-01-20T10:30:00.000Z",
    "updated_at": "2024-01-20T10:30:00.000Z"
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "User not found"
}
```

#### POST /api/users
Create a new user.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "avatar_url": "https://example.com/avatar.jpg"
}
```

**Required Fields:**
- `name` (string): User's full name
- `email` (string): User's email address

**Optional Fields:**
- `avatar_url` (string): URL to user's avatar image

**Example Request:**
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "avatar_url": "https://example.com/avatar.jpg"
  }'
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "avatar_url": "https://example.com/avatar.jpg",
    "created_at": "2024-01-20T10:30:00.000Z",
    "updated_at": "2024-01-20T10:30:00.000Z"
  },
  "message": "User created successfully"
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Name and email are required"
}
```

**Error Response (409):**
```json
{
  "success": false,
  "message": "User with this email already exists"
}
```

#### PUT /api/users/:id
Update an existing user.

**Path Parameters:**
- `id` (number, required): User ID

**Request Body:**
```json
{
  "name": "John Smith",
  "email": "johnsmith@example.com",
  "avatar_url": "https://example.com/new-avatar.jpg"
}
```

**Example Request:**
```bash
curl -X PUT http://localhost:3000/api/users/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Smith",
    "email": "johnsmith@example.com"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "John Smith",
    "email": "johnsmith@example.com",
    "avatar_url": "https://example.com/new-avatar.jpg",
    "created_at": "2024-01-20T10:30:00.000Z",
    "updated_at": "2024-01-20T10:35:00.000Z"
  },
  "message": "User updated successfully"
}
```

#### DELETE /api/users/:id
Delete a user.

**Path Parameters:**
- `id` (number, required): User ID

**Example Request:**
```bash
curl -X DELETE http://localhost:3000/api/users/1
```

**Response:**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

---

### 📝 Posts API

Base URL: `/api/posts`

#### GET /api/posts
Get all posts with pagination, search, and author filtering.

**Query Parameters:**
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 10)
- `search` (string, optional): Search by title or content
- `author` (string, optional): Filter by author name

**Example Request:**
```bash
GET /api/posts?page=1&limit=5&search=javascript&author=john
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Getting Started with JavaScript",
      "content": "JavaScript is a powerful programming language...",
      "author_id": 1,
      "image_url": "https://example.com/post-image.jpg",
      "created_at": "2024-01-20T10:30:00.000Z",
      "updated_at": "2024-01-20T10:30:00.000Z",
      "author": {
        "name": "John Doe",
        "email": "john@example.com",
        "avatar_url": "https://example.com/avatar.jpg"
      }
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalPosts": 25,
    "hasNext": true,
    "hasPrev": false
  }
}
```

#### GET /api/posts/:id
Get a specific post by ID.

**Path Parameters:**
- `id` (number, required): Post ID

**Example Request:**
```bash
GET /api/posts/1
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Getting Started with JavaScript",
    "content": "JavaScript is a powerful programming language...",
    "author_id": 1,
    "image_url": "https://example.com/post-image.jpg",
    "created_at": "2024-01-20T10:30:00.000Z",
    "updated_at": "2024-01-20T10:30:00.000Z",
    "author": {
      "name": "John Doe",
      "email": "john@example.com",
      "avatar_url": "https://example.com/avatar.jpg"
    }
  }
}
```

#### POST /api/posts
Create a new post.

**Request Body:**
```json
{
  "title": "My First Post",
  "content": "This is the content of my post...",
  "author_id": 1,
  "image_url": "https://example.com/post-image.jpg"
}
```

**Required Fields:**
- `title` (string): Post title
- `content` (string): Post content
- `author_id` (number): ID of the author (must exist in users table)

**Optional Fields:**
- `image_url` (string): URL to post image

**Example Request:**
```bash
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My First Post",
    "content": "This is the content of my post...",
    "author_id": 1,
    "image_url": "https://example.com/post-image.jpg"
  }'
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "My First Post",
    "content": "This is the content of my post...",
    "author_id": 1,
    "image_url": "https://example.com/post-image.jpg",
    "created_at": "2024-01-20T10:30:00.000Z",
    "updated_at": "2024-01-20T10:30:00.000Z"
  },
  "message": "Post created successfully"
}
```

#### PUT /api/posts/:id
Update an existing post.

**Path Parameters:**
- `id` (number, required): Post ID

**Request Body:**
```json
{
  "title": "Updated Post Title",
  "content": "Updated post content...",
  "image_url": "https://example.com/new-image.jpg"
}
```

**Example Request:**
```bash
curl -X PUT http://localhost:3000/api/posts/1 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Post Title",
    "content": "Updated post content..."
  }'
```

#### DELETE /api/posts/:id
Delete a post.

**Path Parameters:**
- `id` (number, required): Post ID

**Example Request:**
```bash
curl -X DELETE http://localhost:3000/api/posts/1
```

---

### 📁 File Upload API

Base URL: `/api/upload`

#### POST /api/upload/image
Upload a single image file.

**Request:**
- Content-Type: `multipart/form-data`
- Field name: `image`
- File types: jpg, jpeg, png, gif, webp
- Max file size: 10MB

**Example Request:**
```bash
curl -X POST http://localhost:3000/api/upload/image \
  -F "image=@/path/to/your/image.jpg"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "public_id": "starter-project/abc123def456",
    "secure_url": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/starter-project/abc123def456.jpg",
    "original_name": "image.jpg",
    "size": 1024000,
    "format": "jpg"
  },
  "message": "Image uploaded successfully"
}
```

#### POST /api/upload/images
Upload multiple image files (max 5).

**Request:**
- Content-Type: `multipart/form-data`
- Field name: `images`
- Max files: 5
- Max file size per file: 10MB

**Example Request:**
```bash
curl -X POST http://localhost:3000/api/upload/images \
  -F "images=@/path/to/image1.jpg" \
  -F "images=@/path/to/image2.jpg"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "public_id": "starter-project/abc123def456",
      "secure_url": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/starter-project/abc123def456.jpg",
      "original_name": "image1.jpg",
      "size": 1024000,
      "format": "jpg"
    },
    {
      "public_id": "starter-project/xyz789ghi012",
      "secure_url": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/starter-project/xyz789ghi012.jpg",
      "original_name": "image2.jpg",
      "size": 2048000,
      "format": "jpg"
    }
  ],
  "count": 2,
  "message": "Images uploaded successfully"
}
```

#### DELETE /api/upload/image/:publicId
Delete an image by its public ID.

**Path Parameters:**
- `publicId` (string, required): Cloudinary public ID

**Example Request:**
```bash
curl -X DELETE http://localhost:3000/api/upload/image/starter-project/abc123def456
```

**Response:**
```json
{
  "success": true,
  "message": "Image deleted successfully"
}
```

#### GET /api/upload/image/:publicId/url
Get image URL with transformations.

**Path Parameters:**
- `publicId` (string, required): Cloudinary public ID

**Query Parameters:**
- `width` (number, optional): Image width
- `height` (number, optional): Image height
- `crop` (string, optional): Crop mode (fill, fit, scale, etc.)
- `quality` (string, optional): Image quality (auto, 80, 90, etc.)
- `format` (string, optional): Image format (jpg, png, webp, etc.)

**Example Request:**
```bash
GET /api/upload/image/starter-project/abc123def456/url?width=300&height=200&crop=fill&quality=auto
```

**Response:**
```json
{
  "success": true,
  "data": {
    "public_id": "starter-project/abc123def456",
    "url": "https://res.cloudinary.com/your-cloud/image/upload/w_300,h_200,c_fill,q_auto/starter-project/abc123def456.jpg",
    "transformations": {
      "width": 300,
      "height": 200,
      "crop": "fill",
      "quality": "auto"
    }
  }
}
```

## Error Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - Invalid input |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Resource already exists |
| 500 | Internal Server Error |

## Rate Limiting

Currently, no rate limiting is implemented. Consider adding rate limiting for production use:

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

## CORS

CORS is enabled for all origins. For production, restrict to specific domains:

```javascript
app.use(cors({
  origin: ['https://yourdomain.com', 'https://www.yourdomain.com']
}));
```

## Security Headers

The API includes security headers via Helmet.js:
- Content Security Policy
- X-Frame-Options
- X-Content-Type-Options
- Referrer-Policy
- And more...

## Examples

### Complete Workflow Example

1. **Create a user:**
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "email": "john@example.com"}'
```

2. **Upload an image:**
```bash
curl -X POST http://localhost:3000/api/upload/image \
  -F "image=@/path/to/image.jpg"
```

3. **Create a post with the image:**
```bash
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Post",
    "content": "Post content...",
    "author_id": 1,
    "image_url": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/starter-project/abc123def456.jpg"
  }'
```

4. **Get all posts:**
```bash
curl http://localhost:3000/api/posts
```

## Testing

Use tools like Postman, Insomnia, or curl to test the API endpoints. Make sure to:

1. Test all CRUD operations
2. Test file uploads
3. Test error scenarios
4. Test pagination and search
5. Verify response formats

## Support

For API support and questions:
- Check the [Issues](https://github.com/yourusername/express-starter-db-storage/issues) page
- Create a new issue with detailed information
- Include request/response examples when reporting bugs
