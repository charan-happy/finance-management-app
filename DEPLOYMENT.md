# Deployment Guide

This application can be deployed to various cloud platforms. Choose one based on your needs.

## Table of Contents
- [Local Development](#local-development)
- [Netlify Deployment](#netlify-deployment)
- [Vercel Deployment](#vercel-deployment)
- [Generic Cloud Deployment](#generic-cloud-deployment)
- [Database Setup (Neon.tech)](#database-setup-neontech)

---

## Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   - Copy `.env.example` to `.env`
   - Update values as needed (default uses local storage)

3. **Run development server:**
   ```bash
   npm run dev
   ```

4. **Access the app:**
   Open http://localhost:5173

---

## Netlify Deployment

### Quick Deploy

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy)

### Manual Deployment

1. **Install Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify:**
   ```bash
   netlify login
   ```

3. **Initialize site:**
   ```bash
   netlify init
   ```

4. **Set environment variables:**
   ```bash
   netlify env:set VITE_DATABASE_URL "your-neon-database-url"
   netlify env:set VITE_DATA_MODE "hybrid"
   netlify env:set VITE_USE_MOCK_BROKER "false"
   # Add broker credentials if needed
   netlify env:set VITE_UPSTOX_CLIENT_ID "your-client-id"
   netlify env:set VITE_UPSTOX_CLIENT_SECRET "your-client-secret"
   ```

5. **Deploy:**
   ```bash
   netlify deploy --prod
   ```

### Configuration

The `netlify.toml` file is already configured with:
- Build command: `npm run build`
- Publish directory: `dist`
- Serverless functions in `netlify/functions`
- SPA routing redirects
- Security headers

---

## Vercel Deployment

### Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone)

### Manual Deployment

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
   vercel
   ```

4. **Set environment variables in Vercel Dashboard:**
   - Go to Project Settings → Environment Variables
   - Add:
     - `VITE_DATABASE_URL`
     - `VITE_DATA_MODE` = `hybrid`
     - `VITE_USE_MOCK_BROKER` = `false`
     - Broker credentials (optional)

5. **Redeploy with production:**
   ```bash
   vercel --prod
   ```

---

## Generic Cloud Deployment

### Docker Deployment

1. **Build Docker image:**
   ```bash
   docker build -t wealth-tracker .
   ```

2. **Run container:**
   ```bash
   docker run -p 8080:80 \
     -e VITE_DATABASE_URL="your-database-url" \
     -e VITE_DATA_MODE="hybrid" \
     wealth-tracker
   ```

### Static Hosting (AWS S3, Azure, GCP)

1. **Build the app:**
   ```bash
   npm run build
   ```

2. **Upload `dist/` folder to your hosting:**
   
   **AWS S3:**
   ```bash
   aws s3 sync dist/ s3://your-bucket-name --delete
   ```
   
   **Azure:**
   ```bash
   az storage blob upload-batch -s dist/ -d '$web' --account-name yourstorageaccount
   ```
   
   **GCP:**
   ```bash
   gsutil -m rsync -r -d dist/ gs://your-bucket-name
   ```

3. **Configure SPA routing:**
   - Set index.html as error page (returns 200)
   - All routes should serve index.html

---

## Database Setup (Neon.tech)

### Create Neon Database

1. **Sign up at [Neon.tech](https://neon.tech)**

2. **Create a new project:**
   - Choose a region close to your users
   - Note the connection string

3. **Get connection string:**
   - Format: `postgresql://user:password@host.neon.tech/dbname?sslmode=require`

4. **Initialize database:**
   The app automatically creates tables on first run, but you can manually run:
   ```sql
   CREATE TABLE IF NOT EXISTS user_data (
       user_id VARCHAR(255) PRIMARY KEY,
       data JSONB NOT NULL,
       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   
   CREATE INDEX IF NOT EXISTS idx_user_data_updated 
   ON user_data(updated_at);
   ```

### Configure App to Use Database

1. **Update `.env` or deployment environment variables:**
   ```env
   VITE_DATABASE_URL=postgresql://user:password@host.neon.tech/dbname?sslmode=require
   VITE_DATA_MODE=hybrid  # or 'db' for database-only
   ```

2. **Modes:**
   - `local`: Uses only localStorage (no database)
   - `db`: Uses only database (requires VITE_DATABASE_URL)
   - `hybrid`: Uses both (saves to both, reads from DB first, falls back to localStorage)

---

## Broker Integration

### Setup Broker API Credentials

1. **Upstox:**
   - Visit [Upstox Developer Portal](https://upstox.com/developer/)
   - Create an app
   - Get API Key and Secret
   - Set redirect URI to your app URL

2. **AngelOne:**
   - Register at [AngelOne SmartAPI](https://smartapi.angelbroking.com/)
   - Create app and get credentials

3. **Fyers:**
   - Login to [Fyers API Dashboard](https://myapi.fyers.in/)
   - Create app and get Client ID and Secret ID

### Configure in App

Add credentials to `.env` or deployment platform:
```env
VITE_UPSTOX_CLIENT_ID=your-client-id
VITE_UPSTOX_CLIENT_SECRET=your-client-secret
VITE_UPSTOX_REDIRECT_URI=https://your-app-url.com

VITE_ANGELONE_CLIENT_ID=your-client-id
VITE_ANGELONE_CLIENT_SECRET=your-client-secret

VITE_FYERS_CLIENT_ID=your-client-id
VITE_FYERS_CLIENT_SECRET=your-client-secret
VITE_FYERS_REDIRECT_URI=https://your-app-url.com
```

### Development Mode (Mock Broker)

For testing without real broker credentials:
```env
VITE_USE_MOCK_BROKER=true
```

---

## Security Considerations

1. **Never commit `.env` file** (it's in `.gitignore`)
2. **Use environment variables** for all sensitive data
3. **Enable HTTPS** on production deployments
4. **Rotate credentials regularly**
5. **Use database encryption** for sensitive data
6. **Implement rate limiting** for API endpoints
7. **Validate and sanitize** all user inputs

---

## Troubleshooting

### Build fails
- Check Node.js version (requires v20+)
- Clear cache: `rm -rf node_modules package-lock.json && npm install`

### Database connection issues
- Verify connection string format
- Check firewall/security group settings
- Ensure SSL is enabled for Neon

### Broker sync not working
- Verify credentials are correct
- Check if access tokens are expired
- Review console logs for API errors
- Try with `VITE_USE_MOCK_BROKER=true` first

---

## Support

For issues or questions:
- Check existing GitHub issues
- Create a new issue with detailed information
- Include error messages and environment details
