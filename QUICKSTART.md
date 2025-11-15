# Quick Start Guide

Get started with Charan's Wealth Tracker in 5 minutes!

## 🚀 Fastest Path (Local Development)

```bash
# 1. Install dependencies
npm install

# 2. Start the app
npm run dev

# 3. Open browser
# http://localhost:5173
```

That's it! The app runs in **local mode** by default (no database needed).

---

## 🌐 Adding Database Support (Optional)

### Step 1: Get Neon.tech Database (Free)

1. Visit https://neon.tech
2. Sign up (free)
3. Create new project
4. Copy connection string (looks like `postgresql://...`)

### Step 2: Configure App

Edit `.env` file:
```env
VITE_DATA_MODE=hybrid
VITE_DATABASE_URL=postgresql://user:pass@host.neon.tech/dbname?sslmode=require
```

### Step 3: Restart

```bash
npm run dev
```

Your data now syncs to the cloud! ☁️

---

## 📈 Adding Broker Integration (Optional)

### For Testing (Mock Data)

Default `.env` already has:
```env
VITE_USE_MOCK_BROKER=true
```

**Try it now:**
1. Open app → **Settings** → **Broker Integration**
2. Click **Connect** on any broker
3. Enter any values (e.g., "test123")
4. Click **Connect**
5. Go to **Investments** page
6. Click **🔄 Sync Brokers**
7. See sample holdings appear!

### For Production (Real APIs)

1. **Get API credentials from broker:**
   - Upstox: https://upstox.com/developer/
   - AngelOne: https://smartapi.angelbroking.com/
   - Fyers: https://myapi.fyers.in/

2. **Update `.env`:**
   ```env
   VITE_USE_MOCK_BROKER=false
   VITE_UPSTOX_CLIENT_ID=your-real-api-key
   VITE_UPSTOX_CLIENT_SECRET=your-real-secret
   ```

3. **Restart and sync:**
   ```bash
   npm run dev
   ```

---

## 🚢 Deploy to Production

### Option 1: Netlify (Easiest)

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify init
netlify deploy --prod
```

### Option 2: Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

### Option 3: Docker (Any Cloud)

```bash
# Build
docker build -t wealth-tracker .

# Run
docker run -p 8080:80 wealth-tracker

# Visit http://localhost:8080
```

---

## 📱 First Time Using the App?

1. **Create PIN** - Set a 4-6 digit PIN on first launch
2. **Optional: Add Age** - Helps AI give better advice
3. **Add Gemini API Key** - Get free key at https://makersuite.google.com/
4. **Start Tracking** - Add transactions, goals, investments!

---

## 🎯 Common Tasks

### Add Transaction
Dashboard → **+ New Transaction** → Fill form → Save

### Set Financial Goal
Goals → **+ New Goal** → Enter details → Track progress

### Track Investments
Investments → **+ Add to Wishlist** → Or sync from broker

### Get AI Advice
Assistant → Ask anything like:
- "How can I save more money?"
- "Should I focus on debt or savings?"
- "Help me plan for retirement"

### Export/Backup Data
Settings → **Backup Data (Download)** → Save JSON file

---

## 💡 Pro Tips

1. **Use hybrid mode** for best reliability (saves locally + cloud)
2. **Enable mock broker** first to test the sync flow
3. **Set recurring transactions** for regular expenses/income
4. **Check dashboard daily** to stay on track
5. **Export backups monthly** to save in GitHub or Dropbox

---

## 🆘 Need Help?

- **Detailed guide**: See [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Integration details**: See [INTEGRATION_SUMMARY.md](./INTEGRATION_SUMMARY.md)
- **Full README**: See [README.md](./README.md)

---

**You're all set! Start tracking your wealth today! 💰**
