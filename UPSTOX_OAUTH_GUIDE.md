# Upstox OAuth2 Integration Guide

## Quick Steps to Get Real Upstox Data

### Method 1: Manual OAuth Flow (Recommended for Testing)

#### Step 1: Get Authorization Code

1. **Open this URL** in your browser (replace with your actual Client ID):
   ```
   https://api.upstox.com/v2/login/authorization/dialog?client_id=0c217921-ab99-4760-8a61-65cf56912da0&redirect_uri=http://localhost:5180&response_type=code
   ```

2. **Log into Upstox** with your trading account credentials

3. **Authorize the app** when prompted

4. **You'll be redirected** to a URL like:
   ```
   http://localhost:5180/?code=abc123xyz...
   ```

5. **Copy the authorization code** (everything after `code=`)

#### Step 2: Exchange Code for Access Token

Run this command in your terminal (replace YOUR_CODE with the code from Step 1):

```bash
curl -X POST "https://api.upstox.com/v2/login/authorization/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "code=YOUR_CODE" \
  -d "client_id=0c217921-ab99-4760-8a61-65cf56912da0" \
  -d "client_secret=t5gm5dxvv3" \
  -d "redirect_uri=http://localhost:5180" \
  -d "grant_type=authorization_code"
```

You'll get a response like:
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJ...",
  "token_type": "Bearer",
  "expires_in": 86400,
  "refresh_token": "abc123..."
}
```

#### Step 3: Use Access Token in App

1. Go to **Settings** → **Broker Integration**
2. Click **Connect** on Upstox
3. **Client ID**: `0c217921-ab99-4760-8a61-65cf56912da0`
4. **Client Secret**: Paste the **entire access_token** from Step 2
   (It's a long JWT string starting with `eyJ...`)
5. Click **Connect**
6. Click **Sync Holdings**

---

### Method 2: Use Upstox API Console

1. Go to [Upstox API Console](https://api.upstox.com/developer/docs/)
2. Use their built-in OAuth flow
3. Get the access token
4. Paste it in the app as shown in Method 1, Step 3

---

### Method 3: Automate OAuth in App (Production)

For a production setup, you'd implement a proper OAuth flow in the app. Here's what needs to be added:

1. **Add OAuth redirect handler** in the app
2. **Capture authorization code** from URL
3. **Automatically exchange for token**
4. **Store and refresh tokens**

This requires backend changes and is more complex.

---

## Important Notes

### Access Token Expiry
- Upstox access tokens expire in **24 hours**
- You'll need to get a new token daily OR implement refresh token logic

### Refresh Tokens
To avoid daily re-authorization, you can:
1. Save the `refresh_token` from the OAuth response
2. Use it to get new access tokens without re-login
3. The app already has `refreshAccessToken` method in `brokerService.ts`

### Security
- **Never commit** your access tokens to git
- Access tokens give **full access** to your trading account
- Store them securely
- Revoke tokens you're not using anymore

---

## Quick Test Checklist

✅ Step 1: Get authorization URL with your Client ID
✅ Step 2: Login to Upstox and authorize
✅ Step 3: Copy the authorization code from redirect URL
✅ Step 4: Exchange code for access token via cURL/Postman
✅ Step 5: Copy the access token (long JWT string)
✅ Step 6: In app Settings, paste access token as "Client Secret"
✅ Step 7: Click Connect
✅ Step 8: Click Sync Holdings
✅ Step 9: See your real holdings appear! 🎉

---

## Troubleshooting

### "Invalid authorization code"
- Authorization codes expire quickly (5-10 minutes)
- Get a new code and try again immediately

### "Access token expired"
- Upstox tokens last 24 hours
- Get a new access token using the process above

### "Invalid redirect URI"
- Ensure the redirect_uri in your Upstox app settings matches exactly
- Currently set to: `http://localhost:5180`

### "Insufficient permissions"
- Your Upstox app needs "Portfolio" read permissions
- Check app settings in Upstox Developer Console

---

## Alternative: Stay in Mock Mode

If OAuth is too complex for now, you can:
1. Keep `VITE_USE_MOCK_BROKER=true` in `.env`
2. Use the app with sample data
3. Test all features without real broker integration
4. Implement full OAuth later when needed

Mock mode gives you the full experience without OAuth complexity!
