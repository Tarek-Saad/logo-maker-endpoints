# 🚀 Deployment Guide

Complete guide for deploying your Express.js starter to various platforms.

## 📋 Prerequisites

Before deploying, ensure you have:

- ✅ Working local application
- ✅ Database connection string
- ✅ Cloudinary credentials
- ✅ Git repository (for most platforms)
- ✅ Platform account (Vercel, Railway, Heroku, etc.)

## 🌟 Vercel (Recommended)

Vercel is the easiest platform for deploying this Express.js starter.

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

### Step 3: Deploy

```bash
# Deploy to production
vercel --prod

# Or deploy to preview
vercel
```

### Step 4: Set Environment Variables

```bash
# Add database URL
vercel env add DATABASE_URL

# Add Cloudinary URL
vercel env add CLOUDINARY_URL

# Add asset base URL
vercel env add ASSET_BASE_URL

# Add Node environment
vercel env add NODE_ENV
```

### Step 5: Redeploy

```bash
vercel --prod
```

### Vercel Configuration

The project includes a `vercel.json` file:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "api/index.js"
    }
  ]
}
```

### Vercel Environment Variables

Set these in your Vercel dashboard:

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:port/db` |
| `CLOUDINARY_URL` | Cloudinary connection string | `cloudinary://key:secret@cloud` |
| `ASSET_BASE_URL` | CDN base URL | `https://your-cdn.com/` |
| `NODE_ENV` | Environment | `production` |

---

## 🚂 Railway

Railway provides easy deployment with automatic database provisioning.

### Step 1: Connect Repository

1. Go to [Railway](https://railway.app/)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository

### Step 2: Add Database

1. Click "New" → "Database" → "PostgreSQL"
2. Railway will automatically provision a PostgreSQL database
3. Copy the connection string from the database service

### Step 3: Set Environment Variables

In your project settings, add:

```
DATABASE_URL=postgresql://postgres:password@host:port/railway
CLOUDINARY_URL=cloudinary://key:secret@cloud
ASSET_BASE_URL=https://your-cdn.com/
NODE_ENV=production
```

### Step 4: Deploy

Railway will automatically deploy when you push to your main branch.

---

## 🟣 Heroku

Heroku is a popular platform for Node.js applications.

### Step 1: Install Heroku CLI

```bash
# macOS
brew install heroku/brew/heroku

# Windows
# Download from https://devcenter.heroku.com/articles/heroku-cli
```

### Step 2: Login to Heroku

```bash
heroku login
```

### Step 3: Create Heroku App

```bash
heroku create your-app-name
```

### Step 4: Add PostgreSQL Addon

```bash
heroku addons:create heroku-postgresql:hobby-dev
```

### Step 5: Set Environment Variables

```bash
heroku config:set CLOUDINARY_URL="cloudinary://key:secret@cloud"
heroku config:set ASSET_BASE_URL="https://your-cdn.com/"
heroku config:set NODE_ENV="production"
```

### Step 6: Deploy

```bash
git add .
git commit -m "Deploy to Heroku"
git push heroku main
```

### Step 7: Initialize Database

```bash
heroku run npm run init-db
```

---

## 🌊 DigitalOcean App Platform

DigitalOcean App Platform provides managed hosting with automatic scaling.

### Step 1: Create App

1. Go to [DigitalOcean App Platform](https://cloud.digitalocean.com/apps)
2. Click "Create App"
3. Connect your GitHub repository

### Step 2: Configure App

```yaml
# .do/app.yaml
name: express-starter
services:
- name: api
  source_dir: /
  github:
    repo: yourusername/express-starter-db-storage
    branch: main
  run_command: npm start
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  envs:
  - key: NODE_ENV
    value: production
  - key: DATABASE_URL
    value: ${db.DATABASE_URL}
  - key: CLOUDINARY_URL
    value: your-cloudinary-url
databases:
- name: db
  engine: PG
  version: "13"
```

### Step 3: Deploy

DigitalOcean will automatically deploy your app.

---

## ☁️ AWS (Lambda + RDS)

Deploy to AWS using Serverless Framework.

### Step 1: Install Serverless Framework

```bash
npm install -g serverless
```

### Step 2: Install AWS Plugin

```bash
npm install serverless-http
```

### Step 3: Create serverless.yml

```yaml
service: express-starter

provider:
  name: aws
  runtime: nodejs18.x
  region: us-east-1
  environment:
    DATABASE_URL: ${env:DATABASE_URL}
    CLOUDINARY_URL: ${env:CLOUDINARY_URL}
    NODE_ENV: production

functions:
  api:
    handler: api/index.handler
    events:
      - http:
          path: /{proxy+}
          method: ANY
      - http:
          path: /
          method: ANY

plugins:
  - serverless-http
```

### Step 4: Deploy

```bash
serverless deploy
```

---

## 🐳 Docker Deployment

Deploy using Docker containers.

### Step 1: Create Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

### Step 2: Create docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/mydb
      - CLOUDINARY_URL=cloudinary://key:secret@cloud
      - NODE_ENV=production
    depends_on:
      - db

  db:
    image: postgres:13
    environment:
      - POSTGRES_DB=mydb
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### Step 3: Deploy

```bash
docker-compose up -d
```

---

## 🔧 Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:port/db?sslmode=require` |
| `CLOUDINARY_URL` | Cloudinary connection string | `cloudinary://api_key:api_secret@cloud_name` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Server port | `3000` |
| `ASSET_BASE_URL` | CDN base URL | `https://your-cdn.com/` |
| `JWT_SECRET` | JWT signing secret | - |
| `CORS_ORIGIN` | CORS allowed origins | `*` |

---

## 🧪 Testing Deployment

### Health Check

```bash
curl https://your-app.vercel.app/health
```

### API Test

```bash
curl https://your-app.vercel.app/api/users
```

### Database Test

```bash
curl -X POST https://your-app.vercel.app/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Test User", "email": "test@example.com"}'
```

---

## 🔍 Troubleshooting

### Common Issues

#### Database Connection Failed

**Symptoms:**
- `FUNCTION_INVOCATION_FAILED`
- `connect ECONNREFUSED`

**Solutions:**
1. Check `DATABASE_URL` format
2. Ensure database is accessible from deployment platform
3. Verify SSL settings
4. Check firewall rules

#### Environment Variables Not Loading

**Symptoms:**
- `undefined` values
- Default values being used

**Solutions:**
1. Verify environment variables are set in platform dashboard
2. Check variable names (case-sensitive)
3. Redeploy after setting variables
4. Check platform-specific documentation

#### File Upload Issues

**Symptoms:**
- Upload fails
- Images not accessible

**Solutions:**
1. Check `CLOUDINARY_URL` format
2. Verify Cloudinary account limits
3. Check file size limits
4. Ensure proper CORS settings

### Platform-Specific Issues

#### Vercel

- **Cold starts**: Normal for serverless functions
- **Function timeout**: Check function execution time
- **Memory limits**: Upgrade plan if needed

#### Railway

- **Database connection**: Check if database is running
- **Build failures**: Check build logs
- **Environment variables**: Verify in dashboard

#### Heroku

- **Dyno sleeping**: Upgrade to paid plan
- **Database limits**: Check addon limits
- **Buildpack issues**: Use Node.js buildpack

---

## 📊 Monitoring

### Health Monitoring

Set up monitoring for your deployed application:

1. **Uptime monitoring**: UptimeRobot, Pingdom
2. **Error tracking**: Sentry, Bugsnag
3. **Performance monitoring**: New Relic, DataDog
4. **Log aggregation**: LogRocket, Papertrail

### Database Monitoring

Monitor your database:

1. **Connection pool**: Monitor active connections
2. **Query performance**: Track slow queries
3. **Storage usage**: Monitor disk space
4. **Backup status**: Ensure regular backups

---

## 🔄 CI/CD

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

### GitLab CI

Create `.gitlab-ci.yml`:

```yaml
stages:
  - deploy

deploy:
  stage: deploy
  script:
    - npm ci
    - npm run build
    - vercel --prod --token $VERCEL_TOKEN
  only:
    - main
```

---

## 🎉 Success!

Your Express.js starter is now deployed and ready for production use!

### Next Steps

1. **Set up monitoring** and alerting
2. **Configure custom domain** (if needed)
3. **Set up SSL certificates** (usually automatic)
4. **Configure backups** for your database
5. **Set up staging environment** for testing
6. **Implement CI/CD pipeline** for automated deployments

### Support

If you encounter issues:

1. Check the platform's documentation
2. Review the troubleshooting section
3. Check the [Issues](https://github.com/yourusername/express-starter-db-storage/issues) page
4. Create a new issue with detailed information

Happy deploying! 🚀
