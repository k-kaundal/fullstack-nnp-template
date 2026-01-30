# Vercel Quick Start Guide

Deploy your NestJS API to Vercel in under 10 minutes!

## ⚡ Quick Deploy (5 minutes)

### 1. Prepare Database (2 minutes)

**Option A: Neon (Recommended)**
1. Go to [neon.tech](https://neon.tech) → Sign up
2. Create new project → Copy connection string
3. Extract connection details:
   ```
   postgresql://username:password@host:5432/database
   ```

**Option B: Supabase**
1. Go to [supabase.com](https://supabase.com) → Sign up
2. Create project → Database → Connection string
3. Use "Connection pooling" mode for better performance

### 2. Deploy to Vercel (3 minutes)

1. **Push code to GitHub**
   ```bash
   git add .
   git commit -m "feat: add Vercel deployment configuration"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your repository
   - **Important**: Set root directory to `server`

3. **Configure Build Settings**
   - Framework Preset: **Other**
   - Build Command: `yarn build`
   - Output Directory: `dist`
   - Install Command: `yarn install`

4. **Add Environment Variables**
   Click "Environment Variables" and add:

   **Required Variables:**
   ```
   NODE_ENV=production
   DATABASE_HOST=your-host.neon.tech
   DATABASE_PORT=5432
   DATABASE_USERNAME=your-username
   DATABASE_PASSWORD=your-password
   DATABASE_NAME=your-database
   JWT_SECRET=change-this-to-random-secure-string
   CORS_ORIGIN=*
   ```

   **Optional Variables:**
   ```
   PORT=3001
   CACHE_TTL=60000
   CACHE_MAX_ITEMS=100
   ```

5. **Deploy!**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Done! 🎉

## ✅ Verify Deployment

Test your deployed API:

```bash
# Replace with your Vercel URL
curl https://your-project.vercel.app/

# Test users endpoint
curl https://your-project.vercel.app/api/v1/users

# View API documentation
open https://your-project.vercel.app/api/docs
```

## 🔄 Update Deployment

Every push to `main` branch automatically redeploys:

```bash
git add .
git commit -m "feat: your changes"
git push origin main
```

## 🔧 Common Issues

### Build Failed?

**Check build logs** in Vercel Dashboard → Deployments → Click deployment → "Building"

Common fixes:
```bash
# Ensure dependencies are correct
cd server
yarn install
yarn build  # Test locally first

# If successful, commit and push
git add .
git commit -m "fix: dependencies"
git push
```

### Database Connection Error?

1. **Verify environment variables** in Vercel Dashboard → Settings → Environment Variables
2. **Check database allows connections** from Vercel IPs (usually all IPs: `0.0.0.0/0`)
3. **Test connection locally**:
   ```bash
   # Add your production credentials to .env temporarily
   yarn start:dev
   ```

### CORS Error?

Update environment variable:
```
CORS_ORIGIN=https://your-frontend-domain.com
```

Or use wildcard for testing (not recommended for production):
```
CORS_ORIGIN=*
```

Then redeploy:
- Vercel Dashboard → Deployments → Three dots → "Redeploy"

## 📝 Environment Variables Template

Copy this to Vercel Environment Variables:

```bash
# Required
NODE_ENV=production
DATABASE_HOST=ep-example-123456.us-east-2.aws.neon.tech
DATABASE_PORT=5432
DATABASE_USERNAME=neondb_owner
DATABASE_PASSWORD=your-secure-password-here
DATABASE_NAME=neondb
JWT_SECRET=your-super-secret-jwt-key-at-least-32-chars-long
CORS_ORIGIN=*

# Optional
PORT=3001
CACHE_TTL=60000
CACHE_MAX_ITEMS=100
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASSWORD=your-app-specific-password
MAIL_FROM=noreply@yourapp.com
```

## 🎯 Next Steps

1. **Run Migrations** (if you have any):
   ```bash
   # Install Vercel CLI
   npm install -g vercel

   # Set environment variables locally
   vercel env pull .env.production

   # Run migrations
   NODE_ENV=production yarn migration:run
   ```

2. **Set up custom domain** (optional):
   - Vercel Dashboard → Settings → Domains
   - Add your domain
   - Update DNS records

3. **Monitor your API**:
   - Vercel Dashboard → Your Project → Analytics
   - View logs, performance, and errors

4. **Update frontend** to use your API:
   ```bash
   # client/.env.local
   NEXT_PUBLIC_API_URL=https://your-project.vercel.app/api/v1
   ```

## 📚 Resources

- [Full Deployment Guide](./docs/VERCEL_DEPLOYMENT.md)
- [Vercel Documentation](https://vercel.com/docs)
- [Neon Documentation](https://neon.tech/docs)
- [NestJS Documentation](https://docs.nestjs.com)

## 🆘 Need Help?

1. Check [VERCEL_DEPLOYMENT.md](./docs/VERCEL_DEPLOYMENT.md) for detailed guide
2. Review Vercel build logs for specific errors
3. Test deployment locally: `yarn build && yarn start:prod`
4. Open an issue on GitHub

---

**Deployment time**: ~5 minutes
**Status**: ✅ Ready to deploy
