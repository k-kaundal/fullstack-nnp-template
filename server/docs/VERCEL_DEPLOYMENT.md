# Vercel Deployment Guide

This guide explains how to deploy the NestJS backend to Vercel.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Vercel CLI** (optional but recommended):
   ```bash
   npm install -g vercel
   ```
3. **PostgreSQL Database**: Use a cloud PostgreSQL service like:
   - [Neon](https://neon.tech)
   - [Supabase](https://supabase.com)
   - [Railway](https://railway.app)
   - [ElephantSQL](https://www.elephantsql.com)

## Configuration Files

The following files have been added for Vercel deployment:

- **vercel.json**: Vercel configuration
- **api/index.ts**: Serverless function handler
- **.vercelignore**: Files to exclude from deployment

## Deployment Steps

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Push your code to GitHub/GitLab/Bitbucket**

2. **Go to [Vercel Dashboard](https://vercel.com/dashboard)**

3. **Import your repository**
   - Click "Add New" → "Project"
   - Select your Git provider
   - Import your repository

4. **Configure the project**
   - **Root Directory**: Select `server` (important!)
   - **Framework Preset**: Other
   - **Build Command**: `yarn build`
   - **Output Directory**: `dist`
   - **Install Command**: `yarn install`

5. **Add Environment Variables**
   Go to "Settings" → "Environment Variables" and add:

   ```
   NODE_ENV=production
   PORT=3001
   DATABASE_HOST=your-db-host.com
   DATABASE_PORT=5432
   DATABASE_USERNAME=your-username
   DATABASE_PASSWORD=your-password
   DATABASE_NAME=your-database
   JWT_SECRET=your-super-secret-jwt-key-change-this
   CORS_ORIGIN=https://your-frontend-domain.com
   CACHE_TTL=60000
   CACHE_MAX_ITEMS=100
   MAIL_HOST=smtp.gmail.com
   MAIL_PORT=587
   MAIL_USER=your-email@gmail.com
   MAIL_PASSWORD=your-app-password
   MAIL_FROM=noreply@yourapp.com
   ```

6. **Deploy**
   - Click "Deploy"
   - Wait for the build to complete
   - Your API will be available at: `https://your-project.vercel.app`

### Option 2: Deploy via Vercel CLI

1. **Login to Vercel**
   ```bash
   vercel login
   ```

2. **Navigate to server directory**
   ```bash
   cd server
   ```

3. **Deploy to preview**
   ```bash
   vercel
   ```

4. **Deploy to production**
   ```bash
   vercel --prod
   ```

5. **Set environment variables**
   ```bash
   vercel env add NODE_ENV production
   vercel env add DATABASE_HOST production
   vercel env add DATABASE_PORT production
   vercel env add DATABASE_USERNAME production
   vercel env add DATABASE_PASSWORD production
   vercel env add DATABASE_NAME production
   vercel env add JWT_SECRET production
   vercel env add CORS_ORIGIN production
   ```

## Database Setup

### Using Neon (Recommended for Vercel)

1. **Create account at [neon.tech](https://neon.tech)**

2. **Create a new project**

3. **Get connection string**
   ```
   postgresql://username:password@host/database?sslmode=require
   ```

4. **Set environment variables in Vercel**
   - Extract host, port, username, password, database from connection string
   - Add as individual environment variables

### Database Migrations

**Important**: Run migrations before deploying:

```bash
# Local database (development)
yarn migration:run

# Production database (before first deployment)
NODE_ENV=production DATABASE_URL=your-production-db-url yarn migration:run
```

## Vercel Configuration

### vercel.json

```json
{
  "version": 2,
  "name": "fullstack-nnp-api",
  "builds": [
    {
      "src": "dist/main.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "dist/main.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  },
  "regions": ["iad1"]
}
```

**Configuration Options**:
- `version`: Vercel platform version
- `builds`: Specifies which files to build
- `routes`: Routes all requests to the main handler
- `regions`: Deployment regions (iad1 = US East)

### Serverless Function Handler (api/index.ts)

This file creates a NestJS application instance optimized for serverless:

```typescript
export default async (req, res) => {
  await createApp();
  server(req, res);
};
```

## Environment Variables Reference

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `NODE_ENV` | Environment | Yes | `production` |
| `PORT` | Server port | No | `3001` |
| `DATABASE_HOST` | PostgreSQL host | Yes | `db.example.com` |
| `DATABASE_PORT` | PostgreSQL port | Yes | `5432` |
| `DATABASE_USERNAME` | Database user | Yes | `myuser` |
| `DATABASE_PASSWORD` | Database password | Yes | `mypassword` |
| `DATABASE_NAME` | Database name | Yes | `mydb` |
| `JWT_SECRET` | JWT signing key | Yes | `super-secret-key` |
| `CORS_ORIGIN` | Allowed origins | Yes | `https://app.com` |
| `CACHE_TTL` | Cache TTL (ms) | No | `60000` |
| `CACHE_MAX_ITEMS` | Max cache items | No | `100` |
| `MAIL_HOST` | SMTP host | No | `smtp.gmail.com` |
| `MAIL_PORT` | SMTP port | No | `587` |
| `MAIL_USER` | SMTP user | No | `user@gmail.com` |
| `MAIL_PASSWORD` | SMTP password | No | `app-password` |
| `MAIL_FROM` | From address | No | `noreply@app.com` |

## Testing Your Deployment

1. **Check deployment status**
   - Go to Vercel Dashboard → Your Project → Deployments
   - Check build logs for errors

2. **Test API endpoints**
   ```bash
   # Health check
   curl https://your-project.vercel.app/

   # API endpoint
   curl https://your-project.vercel.app/api/v1/users
   ```

3. **Check Swagger documentation**
   - Visit: `https://your-project.vercel.app/api/docs`

## Common Issues & Solutions

### 1. Build Failures

**Issue**: `Cannot find module '@nestjs/core'`

**Solution**: Ensure all dependencies are in `dependencies`, not `devDependencies`:
```bash
yarn add @nestjs/core @nestjs/common @nestjs/platform-express
```

### 2. Database Connection Errors

**Issue**: `Connection refused` or `Timeout`

**Solution**:
- Ensure database allows connections from Vercel IPs
- Check firewall rules
- Verify connection string
- Use SSL connection (`sslmode=require`)

### 3. Environment Variables Not Working

**Issue**: App can't read environment variables

**Solution**:
- Verify variables are set in Vercel Dashboard
- Redeploy after adding variables
- Check variable names match exactly (case-sensitive)

### 4. CORS Errors

**Issue**: Frontend can't connect to API

**Solution**:
- Set `CORS_ORIGIN` to your frontend URL
- Use wildcard `*` for testing (not recommended for production)
- Check that frontend uses correct API URL

### 5. Cold Starts

**Issue**: First request is slow

**Solution**:
- This is normal for serverless functions
- Consider upgrading to Vercel Pro for better performance
- Implement database connection pooling
- Use edge functions for faster response

## Performance Optimization

### 1. Database Connection Pooling

```typescript
// typeorm.config.ts
extra: {
  max: 10, // Maximum connections
  idleTimeoutMillis: 30000,
}
```

### 2. Caching

Enable caching to reduce database queries:
```typescript
// Already configured in cache.config.ts
ttl: 60000, // 1 minute
max: 100,   // 100 items
```

### 3. Response Compression

```typescript
// main.ts (already configured)
app.use(compression());
```

## Monitoring & Logging

### 1. Vercel Logs

- Go to Vercel Dashboard → Your Project → Deployments
- Click on a deployment → "Functions" tab
- View real-time logs

### 2. Custom Logging

```typescript
// Use NestJS Logger
private readonly logger = new Logger(UsersService.name);
this.logger.log('Operation completed');
this.logger.error('Error occurred', error.stack);
```

### 3. Error Tracking

Consider integrating:
- [Sentry](https://sentry.io)
- [LogRocket](https://logrocket.com)
- [DataDog](https://www.datadoghq.com)

## CI/CD with GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]
    paths:
      - 'server/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: ./server
```

## Scaling & Limits

### Vercel Free Plan Limits
- 100 GB bandwidth/month
- 100 hours serverless function execution/month
- 6,000 function invocations/day
- 10 second function timeout

### Vercel Pro Plan
- 1 TB bandwidth/month
- 1,000 hours serverless function execution/month
- No daily invocation limit
- 60 second function timeout

## Best Practices

1. **Environment Variables**: Never commit `.env` files
2. **Database**: Use connection pooling
3. **Caching**: Enable caching for frequently accessed data
4. **Error Handling**: Use global exception filters
5. **Validation**: Validate all inputs
6. **Security**: Use HTTPS, set CORS properly, sanitize inputs
7. **Monitoring**: Set up logging and error tracking
8. **Testing**: Test locally before deploying

## Resources

- [Vercel Documentation](https://vercel.com/docs)
- [NestJS Documentation](https://docs.nestjs.com)
- [TypeORM Documentation](https://typeorm.io)
- [Neon PostgreSQL](https://neon.tech/docs)

## Support

If you encounter issues:
1. Check Vercel build logs
2. Review environment variables
3. Test database connection
4. Check CORS configuration
5. Open an issue on GitHub
