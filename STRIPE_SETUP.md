# Stripe Payment Setup Guide

## Step 1: Get Stripe Account
1. Go to https://stripe.com
2. Sign up for account
3. Complete verification

## Step 2: Get API Keys
1. Go to Dashboard → Developers → API Keys
2. Copy **Publishable key** (starts with `pk_test_`)
3. Copy **Secret key** (starts with `sk_test_`)

## Step 3: Update App
Replace in `app/VIPSubscription.js`:
```javascript
const STRIPE_PUBLISHABLE_KEY = 'pk_test_YOUR_KEY_HERE';
```

Replace in `backend/server.js`:
```javascript
const stripe = require('stripe')('sk_test_YOUR_SECRET_KEY_HERE');
```

## Step 4: Install Dependencies

### Frontend
```bash
cd football-coach-mobile
npx expo install @stripe/stripe-react-native
```

### Backend
```bash
cd backend
npm install
```

## Step 5: Start Backend Server
```bash
cd backend
npm start
```
Server runs on http://localhost:3000

## Step 6: Update Backend URL
In `app/VIPSubscription.js`, replace:
```javascript
const response = await fetch('YOUR_BACKEND_URL/create-payment-intent', {
```

With:
```javascript
const response = await fetch('http://YOUR_IP:3000/create-payment-intent', {
```

For local testing, use your computer's IP address (not localhost).

## Step 7: Test Payment

### Test Cards
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Requires Auth: `4000 0025 0000 3155`

Any future expiry date and any 3-digit CVC.

## Step 8: Production Setup

### Create Products in Stripe
1. Dashboard → Products → Add Product
2. Create "VIP Monthly" - $4.99/month
3. Create "VIP Yearly" - $39.99/year
4. Copy Price IDs (starts with `price_`)

### Deploy Backend
Options:
- Heroku: `heroku create && git push heroku main`
- Railway: Connect GitHub repo
- Vercel: Deploy serverless functions
- AWS Lambda: Use serverless framework

### Update to Live Keys
1. Get live keys from Stripe Dashboard
2. Replace `pk_test_` with `pk_live_`
3. Replace `sk_test_` with `sk_live_`

## Step 9: Webhooks (Optional but Recommended)

1. Dashboard → Developers → Webhooks
2. Add endpoint: `https://your-backend.com/webhook`
3. Select events:
   - `payment_intent.succeeded`
   - `customer.subscription.deleted`
4. Copy webhook secret
5. Add to backend

## Security Checklist
- [ ] Never commit secret keys to Git
- [ ] Use environment variables
- [ ] Enable HTTPS in production
- [ ] Validate amounts on backend
- [ ] Log all transactions
- [ ] Handle errors gracefully

## Troubleshooting

**"Network request failed"**
- Check backend is running
- Use IP address, not localhost
- Check firewall settings

**"Invalid API key"**
- Verify key is correct
- Check for extra spaces
- Ensure using test keys for testing

**Payment succeeds but VIP not activated**
- Check AsyncStorage is saving
- Verify navigation logic
- Check console logs

## Support
- Stripe Docs: https://stripe.com/docs
- Stripe Support: https://support.stripe.com
