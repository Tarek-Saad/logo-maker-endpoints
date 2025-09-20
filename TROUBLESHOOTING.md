# 🔧 Troubleshooting Guide

Common issues and solutions for the Express.js Starter with Database & Storage.

## 🚨 Quick Fixes

### Database Connection Issues

#### Issue: `connect ECONNREFUSED 127.0.0.1:5432`

**Cause:** Database connection string is not being read properly.

**Solutions:**
1. Check if `.env` file exists and has correct format
2. Verify `DATABASE_URL` is properly set
3. Ensure database is running and accessible
4. Check SSL settings in connection string

```bash
# Check if .env file exists
ls -la .env

# Check environment variables
cat .env

# Test database connection
npm run init-db
```

#### Issue: `FATAL: password authentication failed`

**Cause:** Incorrect database credentials.

**Solutions:**
1. Verify username and password in `DATABASE_URL`
2. Check if user has proper permissions
3. Ensure database exists
4. Try resetting password

#### Issue: `FATAL: database "neondb" does not exist`

**Cause:** Database name is incorrect or database doesn't exist.

**Solutions:**
1. Check database name in connection string
2. Create database if it doesn't exist
3. Verify connection string format

### Cloudinary Upload Issues

#### Issue: `Invalid cloudinary URL`

**Cause:** Malformed Cloudinary URL.

**Solutions:**
1. Check `CLOUDINARY_URL` format:
   ```
   cloudinary://api_key:api_secret@cloud_name
   ```
2. Verify API key and secret
3. Check cloud name

#### Issue: `File too large`

**Cause:** File exceeds 10MB limit.

**Solutions:**
1. Compress image before upload
2. Increase file size limit in `api/config/cloudinary.js`
3. Use image optimization

#### Issue: `Invalid file type`

**Cause:** File is not an image or unsupported format.

**Solutions:**
1. Check file extension
2. Verify file is actually an image
3. Convert to supported format (jpg, png, gif, webp)

### Vercel Deployment Issues

#### Issue: `FUNCTION_INVOCATION_FAILED`

**Cause:** Function execution failed.

**Solutions:**
1. Check function logs: `vercel logs`
2. Verify environment variables are set
3. Check database connectivity
4. Ensure all dependencies are installed

#### Issue: `Module not found`

**Cause:** Missing dependencies.

**Solutions:**
1. Check `package.json` has all dependencies
2. Run `npm install` locally
3. Verify `node_modules` is not in `.gitignore`
4. Check Vercel build logs

#### Issue: `Environment variable not found`

**Cause:** Environment variables not set in Vercel.

**Solutions:**
1. Set variables in Vercel dashboard
2. Use `vercel env add` command
3. Redeploy after setting variables
4. Check variable names (case-sensitive)

### Local Development Issues

#### Issue: `Port 3000 already in use`

**Cause:** Another process is using port 3000.

**Solutions:**
1. Kill the process using port 3000:
   ```bash
   # Find process using port 3000
   lsof -ti:3000
   
   # Kill the process
   kill -9 $(lsof -ti:3000)
   ```
2. Use a different port:
   ```bash
   PORT=3001 npm run dev
   ```

#### Issue: `nodemon not found`

**Cause:** Nodemon not installed.

**Solutions:**
1. Install nodemon globally:
   ```bash
   npm install -g nodemon
   ```
2. Or use npx:
   ```bash
   npx nodemon api/index.js
   ```

#### Issue: `Cannot find module 'pg'`

**Cause:** PostgreSQL driver not installed.

**Solutions:**
1. Install dependencies:
   ```bash
   npm install
   ```
2. Check if `pg` is in `package.json`
3. Clear node_modules and reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

## 🔍 Debugging Steps

### 1. Check Environment Variables

```bash
# Check if .env file exists
ls -la .env

# Check environment variables
cat .env

# Check specific variable
echo $DATABASE_URL
```

### 2. Test Database Connection

```bash
# Run database initialization
npm run init-db

# Check database logs
npm run dev
```

### 3. Check Application Logs

```bash
# Local development
npm run dev

# Vercel logs
vercel logs

# Check specific deployment
vercel logs https://your-app.vercel.app
```

### 4. Verify Dependencies

```bash
# Check installed packages
npm list

# Check for missing dependencies
npm audit

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## 🐛 Common Error Messages

### Database Errors

#### `relation "users" does not exist`

**Cause:** Database tables not initialized.

**Solution:**
```bash
npm run init-db
```

#### `duplicate key value violates unique constraint`

**Cause:** Trying to create duplicate unique values.

**Solution:**
- Check for existing records
- Use different values
- Update existing record instead

#### `foreign key constraint fails`

**Cause:** Referenced record doesn't exist.

**Solution:**
- Ensure referenced record exists
- Check foreign key relationships
- Use valid IDs

### API Errors

#### `Cannot read property 'id' of undefined`

**Cause:** Object is undefined or null.

**Solution:**
- Check if object exists before accessing properties
- Add null checks
- Verify database query results

#### `ValidationError: "email" is required`

**Cause:** Required field missing in request.

**Solution:**
- Check request body
- Verify required fields are included
- Check field names and types

#### `MulterError: Unexpected field`

**Cause:** File upload field name mismatch.

**Solution:**
- Check field name in request
- Ensure it matches expected field name
- Check multipart form data format

### Network Errors

#### `ECONNREFUSED`

**Cause:** Cannot connect to server.

**Solution:**
- Check if service is running
- Verify connection details
- Check firewall settings

#### `ETIMEDOUT`

**Cause:** Connection timeout.

**Solution:**
- Check network connectivity
- Increase timeout values
- Check server response time

## 🔧 Configuration Issues

### Environment Variables

#### Issue: Variables not loading

**Solutions:**
1. Check `.env` file format:
   ```env
   DATABASE_URL="postgresql://user:pass@host:port/db"
   CLOUDINARY_URL="cloudinary://key:secret@cloud"
   ```

2. Ensure no spaces around `=`
3. Use quotes for values with special characters
4. Check file encoding (UTF-8)

#### Issue: Variables undefined in production

**Solutions:**
1. Set variables in deployment platform
2. Check variable names (case-sensitive)
3. Redeploy after setting variables
4. Verify platform-specific documentation

### Database Configuration

#### Issue: SSL connection required

**Solutions:**
1. Add `?sslmode=require` to connection string
2. Check database SSL settings
3. Verify SSL certificates

#### Issue: Connection pool exhausted

**Solutions:**
1. Increase pool size in `api/config/database.js`
2. Check for connection leaks
3. Implement connection pooling properly

### Cloudinary Configuration

#### Issue: Invalid transformation parameters

**Solutions:**
1. Check transformation syntax
2. Verify parameter values
3. Test transformations in Cloudinary dashboard

#### Issue: Upload folder not found

**Solutions:**
1. Check folder name in configuration
2. Ensure folder exists in Cloudinary
3. Verify permissions

## 🚀 Performance Issues

### Slow Database Queries

**Symptoms:**
- Long response times
- Timeout errors
- High CPU usage

**Solutions:**
1. Add database indexes
2. Optimize queries
3. Use connection pooling
4. Consider query caching

### Memory Issues

**Symptoms:**
- Out of memory errors
- Slow performance
- Crashes

**Solutions:**
1. Check for memory leaks
2. Optimize image processing
3. Implement proper cleanup
4. Monitor memory usage

### File Upload Issues

**Symptoms:**
- Upload timeouts
- Large file failures
- Memory errors

**Solutions:**
1. Implement streaming uploads
2. Add file size limits
3. Use image optimization
4. Consider chunked uploads

## 🔒 Security Issues

### CORS Errors

**Symptoms:**
- Cross-origin request blocked
- CORS policy errors

**Solutions:**
1. Configure CORS properly
2. Add allowed origins
3. Check preflight requests

### SQL Injection

**Symptoms:**
- Unexpected database behavior
- Security warnings

**Solutions:**
1. Use parameterized queries
2. Validate input data
3. Implement proper escaping

### File Upload Security

**Symptoms:**
- Malicious file uploads
- Security vulnerabilities

**Solutions:**
1. Validate file types
2. Check file headers
3. Implement virus scanning
4. Use secure file storage

## 📞 Getting Help

### Before Asking for Help

1. **Check this guide** for common solutions
2. **Search existing issues** on GitHub
3. **Check platform documentation**
4. **Review error logs** carefully

### When Reporting Issues

Include the following information:

1. **Error message** (exact text)
2. **Steps to reproduce** the issue
3. **Environment details**:
   - Node.js version
   - Operating system
   - Platform (Vercel, Railway, etc.)
4. **Code snippets** (if relevant)
5. **Logs** (sanitized)

### Useful Commands

```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# Check installed packages
npm list

# Check for vulnerabilities
npm audit

# Check environment variables
env | grep -E "(DATABASE|CLOUDINARY)"

# Test database connection
npm run init-db

# Check application status
curl http://localhost:3000/health
```

### Resources

- [Express.js Documentation](https://expressjs.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Vercel Documentation](https://vercel.com/docs)
- [Node.js Documentation](https://nodejs.org/docs/)

## 🎯 Prevention

### Best Practices

1. **Always test locally** before deploying
2. **Use environment variables** for configuration
3. **Implement proper error handling**
4. **Add logging** for debugging
5. **Monitor application health**
6. **Keep dependencies updated**
7. **Use version control** properly
8. **Document your changes**

### Regular Maintenance

1. **Update dependencies** regularly
2. **Monitor database performance**
3. **Check storage usage**
4. **Review error logs**
5. **Test backup procedures**
6. **Update documentation**

Remember: Most issues can be resolved by carefully reading error messages and checking configuration settings. When in doubt, start with the basics and work your way up! 🚀
