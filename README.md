# Charan's Wealth Tracker

A comprehensive, self-hosted personal finance tracker with dashboards, goal planning, broker integrations, and an AI assistant.

## ✨ Features

- 📊 **Comprehensive Dashboard** - Track income, expenses, investments, and net worth
- 💰 **Transaction Management** - Categorize and track all your financial transactions
- 🎯 **Goal Planning** - Set and monitor financial goals
- 📈 **Investment Tracking** - Manage investment wishlist and portfolio
- 🏦 **Broker Integration** - Sync holdings from Upstox, AngelOne, and Fyers
- 💳 **Debt Management** - Track and manage your debts
- 🤖 **AI Assistant** - Powered by Google Gemini for financial advice
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- 🌙 **Dark Mode** - Easy on the eyes
- 🔒 **Secure** - PIN protection with local data storage
- 💾 **Flexible Storage** - Works with both local storage and cloud database (Neon.tech)
- ☁️ **Cloud Ready** - Deploy to Netlify, Vercel, or any cloud platform

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) (version 20 or newer)
- [Docker](https://www.docker.com/products/docker-desktop/) (optional, for containerized deployment)

### Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/charan-happy/finance-management-app.git
   cd finance-management-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your settings (default uses local storage)
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

## 🔧 Configuration

The app supports multiple operation modes:

### Data Storage Modes

- **`local`** - Uses browser localStorage only (default, no database needed)
- **`db`** - Uses Neon.tech PostgreSQL database only
- **`hybrid`** - Uses both database and localStorage (recommended for production)

Set mode in `.env`:
```env
VITE_DATA_MODE=hybrid
VITE_DATABASE_URL=postgresql://user:password@host.neon.tech/dbname?sslmode=require
```

### Broker Integration

The app supports three major Indian brokers:

1. **Upstox**
2. **AngelOne** 
3. **Fyers**

#### Development Mode (Mock Data)
```env
VITE_USE_MOCK_BROKER=true
```

#### Production Mode (Real Broker APIs)
```env
VITE_USE_MOCK_BROKER=false
VITE_UPSTOX_CLIENT_ID=your-api-key
VITE_UPSTOX_CLIENT_SECRET=your-api-secret
# Add credentials for other brokers similarly
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed setup instructions.

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│         React Frontend (Vite)           │
│  ┌──────────┐ ┌──────────┐ ┌─────────┐ │
│  │Dashboard │ │Investment│ │Settings │ │
│  │  Pages   │ │  Pages   │ │  Pages  │ │
│  └──────────┘ └──────────┘ └─────────┘ │
└──────────────┬──────────────────────────┘
               │
    ┌──────────┴──────────┐
    │                     │
┌───▼────────────┐  ┌────▼──────────────┐
│ Data Provider  │  │ Broker Service    │
│ - Local        │  │ - Upstox          │
│ - Neon DB      │  │ - AngelOne        │
│ - Hybrid       │  │ - Fyers           │
└───┬────────────┘  └───────────────────┘
    │
┌───▼─────────────────────┐
│  Neon.tech PostgreSQL   │
│  (Optional Cloud DB)    │
└─────────────────────────┘
```

## 📦 Deployment

### Netlify (Recommended)

```bash
netlify deploy --prod
```

### Vercel

```bash
vercel --prod
```

### Docker

```bash
docker build -t wealth-tracker .
docker run -p 8080:80 wealth-tracker
```

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

## 🗄️ Database Setup

### Using Neon.tech (PostgreSQL)

1. Sign up at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string
4. Add to `.env`:
   ```env
   VITE_DATABASE_URL=postgresql://...
   VITE_DATA_MODE=hybrid
   ```

The app automatically creates required tables on first run.

## 🔌 Broker API Setup

### Upstox
1. Visit [Upstox Developer Portal](https://upstox.com/developer/)
2. Create an app
3. Get API Key and Secret

### AngelOne
1. Register at [AngelOne SmartAPI](https://smartapi.angelbroking.com/)
2. Create app and get credentials

### Fyers
1. Login to [Fyers API Dashboard](https://myapi.fyers.in/)
2. Create app and get Client ID and Secret

Add credentials to `.env` or configure in Settings page within the app.
