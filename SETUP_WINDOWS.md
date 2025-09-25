# Windows Setup Guide for Logo Maker API

## 🚨 PowerShell Execution Policy Issue

If you're getting the error:
```
npm : File C:\Program Files\nodejs\npm.ps1 cannot be loaded because running scripts is disabled on this system.
```

Here are **multiple solutions** to fix this:

## 🔧 Solution 1: Change PowerShell Execution Policy (Recommended)

### Option A: Temporary Change (Current Session Only)
```powershell
# Open PowerShell as Administrator and run:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Option B: For Current Session Only
```powershell
# In your current PowerShell session:
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
```

### Option C: Unrestricted (Less Secure)
```powershell
# Open PowerShell as Administrator and run:
Set-ExecutionPolicy -ExecutionPolicy Unrestricted
```

## 🔧 Solution 2: Use Alternative Commands

### Option A: Use Node.js directly
```bash
# Instead of: npm run migrate
# Use this:
node api/config/migrate-to-logo-maker.js
```

### Option B: Use the batch file
```bash
# Double-click or run:
migrate.bat
```

### Option C: Use the PowerShell script
```powershell
# Run the PowerShell script:
.\migrate.ps1
```

## 🔧 Solution 3: Use Command Prompt Instead

1. Open **Command Prompt** (cmd) instead of PowerShell
2. Navigate to your project directory
3. Run:
```bash
npm run migrate
```

## 🔧 Solution 4: Use Git Bash or WSL

### Git Bash
```bash
# Open Git Bash and run:
npm run migrate
```

### WSL (Windows Subsystem for Linux)
```bash
# Open WSL and run:
npm run migrate
```

## 🚀 Quick Setup Steps

### 1. Fix PowerShell (Choose one method above)

### 2. Set up your environment
```bash
# Copy environment file
copy env.example .env

# Edit .env with your database credentials
notepad .env
```

### 3. Install dependencies
```bash
npm install
```

### 4. Run migration (choose one method)
```bash
# Method 1: npm script
npm run migrate

# Method 2: Direct node command
node api/config/migrate-to-logo-maker.js

# Method 3: Batch file
migrate.bat

# Method 4: PowerShell script
.\migrate.ps1
```

### 5. Start the server
```bash
npm run dev
```

## 📋 Available Scripts

After fixing the PowerShell issue, you can use these scripts:

```bash
# Database operations
npm run migrate          # Run database migration
npm run db:migrate       # Alternative migration command
npm run db:init          # Initialize database
npm run init-db          # Legacy init command

# Development
npm run dev              # Start development server
npm start                # Start production server

# Deployment
npm run deploy           # Deploy to Vercel
npm run deploy:preview   # Deploy preview
```

## 🔍 Troubleshooting

### If migration still fails:

1. **Check your .env file**:
   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/logo_maker
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

2. **Check PostgreSQL is running**:
   ```bash
   # Test connection
   psql -h localhost -U username -d logo_maker
   ```

3. **Check Node.js version**:
   ```bash
   node --version
   # Should be 18.0.0 or higher
   ```

4. **Check if database exists**:
   ```sql
   -- Connect to PostgreSQL and run:
   CREATE DATABASE logo_maker;
   ```

## 🎯 Alternative: Use Docker

If you're still having issues, you can use Docker:

```bash
# Create docker-compose.yml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: logo_maker
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

```bash
# Start database
docker-compose up -d

# Run migration
npm run migrate
```

## ✅ Success Indicators

When migration is successful, you should see:
```
🚀 Starting migration to Logo Maker schema...
📝 Creating enums...
👤 Updating users table...
📁 Creating assets table...
🔤 Creating fonts table...
📂 Creating categories table...
🎨 Updating logos table...
📚 Creating logo_versions table...
📋 Creating templates table...
🔧 Creating layers table...
📝 Creating layer-specific tables...
📊 Creating indexes...
⚡ Creating triggers...
🔧 Creating helper functions...
✅ Migration completed successfully!
🎉 Logo Maker database migration completed!
```

## 🆘 Still Having Issues?

1. **Try Command Prompt instead of PowerShell**
2. **Use the batch file**: `migrate.bat`
3. **Check your database connection**
4. **Verify your .env file is correct**
5. **Make sure PostgreSQL is running**

The migration script is robust and will handle the upgrade from your current schema to the new comprehensive Logo Maker schema automatically!
