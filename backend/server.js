// backend/server.js
require('dotenv').config(); // Load .env variables
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); // ✅ Use env variable
const cors = require('cors');

const app = express();

// Middleware
app.use(cors({ origin: process.env.ALLOWED_ORIGINS?.split(',') || '*' })); // Restrict origins in prod
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// 🔹 One-time Payment Intent
app.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount, plan, currency = 'usd' } = req.body;

    // Validate input
    if (!amount || typeof amount !== 'number' || amount < 50) {
      return res.status(400).json({ error: 'Amount must be at least 50 cents (in cents)' });
    }
    if (!plan) {
      return res.status(400).json({ error: 'Plan name is required' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount), // Ensure integer cents
      currency: currency.toLowerCase(),
      metadata: { plan, app: 'football-coach-mobile' },
      automatic_payment_methods: { enabled: true },
    });

    res.json({ 
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id 
    });
  } catch (error) {
    console.error('[Stripe PaymentIntent Error]', error);
    res.status(500).json({ 
      error: 'Payment setup failed', 
      details: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
});

// 🔹 Subscription Creation
app.post('/create-subscription', async (req, res) => {
  try {
    const { email, paymentMethodId, priceId } = req.body;

    // Validate required fields
    if (!email || !paymentMethodId || !priceId) {
      return res.status(400).json({ error: 'Email, paymentMethodId, and priceId are required' });
    }

    // Create customer
    const customer = await stripe.customers.create({
      email,
      payment_method: paymentMethodId,
      invoice_settings: { default_payment_method: paymentMethodId },
      metadata: { app: 'football-coach-mobile' },
    });

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
    });

    res.json({
      subscriptionId: subscription.id,
      clientSecret: subscription.latest_invoice?.payment_intent?.client_secret,
      status: subscription.status,
    });
  } catch (error) {
    console.error('[Stripe Subscription Error]', error);
    
    // Handle common Stripe errors
    if (error.type === 'StripeCardError') {
      return res.status(400).json({ error: error.message });
    }
    
    res.status(500).json({ 
      error: 'Subscription setup failed',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
});

// 🔹 Webhook Endpoint (Critical for subscription events)
app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('[Webhook Signature Error]', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle events
  switch (event.type) {
    case 'invoice.payment_succeeded':
      console.log('✅ Subscription payment succeeded:', event.data.object.id);
      // TODO: Update user's subscription status in your database
      break;
    case 'invoice.payment_failed':
      console.log('❌ Subscription payment failed:', event.data.object.id);
      // TODO: Notify user, downgrade access, etc.
      break;
    case 'customer.subscription.deleted':
      console.log('🗑️ Subscription cancelled:', event.data.object.id);
      // TODO: Revoke premium access
      break;
    default:
      console.log(`ℹ️ Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});