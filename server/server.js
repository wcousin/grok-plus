const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });


// Debug logging
console.log('Environment variables:', {
  FIREBASE_DATABASE_URL: process.env.FIREBASE_DATABASE_URL,
  PORT: process.env.PORT,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ? 'set' : 'not set',
  STRIPE_PRICE_ID: process.env.STRIPE_PRICE_ID,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET ? 'set' : 'not set',
  EXTENSION_URL: process.env.EXTENSION_URL
});
const express = require('express');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const admin = require('firebase-admin');
const { v4: uuidv4 } = require('uuid');

const app = express();
const port = process.env.PORT || 3000;

// Initialize Firebase Admin
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL
});

const db = admin.database();

// This must come before any other middleware to properly handle Stripe webhooks
app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  console.log('[Debug] Received webhook request');
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    console.log('[Debug] Validating webhook signature...');
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    console.log('[Debug] Webhook signature valid');
  } catch (err) {
    console.error('[Error] Webhook signature validation failed:', err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log('[Debug] Received webhook event:', event.type, 'with data:', JSON.stringify(event.data.object, null, 2));

  if (event.type === 'checkout.session.completed') {
    try {
      const session = event.data.object;
      const customerId = session.customer;
      const installationId = session.metadata.installationId;
      const licenseKey = generateLicenseKey();

      console.log('[Debug] Processing checkout completion:', {
        customerId,
        installationId,
        licenseKey,
        sessionId: session.id
      });

      if (!installationId) {
        throw new Error('No installation ID found in session metadata');
      }

      console.log('[Debug] Attempting to write to Firebase at path:', `users/${installationId}`);

      // Store user data in Firebase with installation ID as key
      await db.ref('users').child(installationId).update({
        subscriptionStatus: 'premium',
        customerId: customerId,
        licenseKey,
        updatedAt: admin.database.ServerValue.TIMESTAMP,
        createdAt: admin.database.ServerValue.TIMESTAMP
      });

      console.log('[Debug] Successfully created premium account with license:', licenseKey);

      // Verify the data was written
      const snapshot = await db.ref('users').child(installationId).once('value');
      console.log('[Debug] Verified Firebase data:', snapshot.val());
    } catch (error) {
      console.error('[Error] Failed to process checkout completion:', error);
      // Don't throw the error, as we want to send a 200 response to Stripe
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object;
    const customerId = subscription.customer;
    
    // Find the installation ID by querying Firebase
    const snapshot = await db.ref('users')
      .orderByChild('customerId')
      .equalTo(customerId)
      .once('value');
    
    const userData = snapshot.val();
    if (userData) {
      const installationId = Object.keys(userData)[0];
      console.log('[Debug] Subscription canceled for installation:', installationId);
      
      // Update user status using installation ID
      await db.ref('users').child(installationId).update({
        subscriptionStatus: 'free',
        customerId: null,
        licenseKey: null,
        updatedAt: admin.database.ServerValue.TIMESTAMP
      });

      console.log('[Debug] Account downgraded to free plan');
    }
  }

  res.json({ received: true });
});

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Success page handler
app.get('/success', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Payment Successful!</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          margin: 0;
          background-color: #f8f9fa;
        }
        .success-card {
          background: white;
          padding: 2rem;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          text-align: center;
          max-width: 400px;
        }
        h1 { color: #28a745; margin-bottom: 1rem; }
        p { color: #6c757d; line-height: 1.5; }
      </style>
    </head>
    <body>
      <div class="success-card">
        <h1>🎉 Payment Successful!</h1>
        <p>Your premium features are now being activated...</p>
        <p>You can close this window and return to using the extension.</p>
      </div>
      <script>
        // Notify extension of successful payment
        window.addEventListener('load', function() {
          const urlParams = new URLSearchParams(window.location.search);
          const sessionId = urlParams.get('session_id');
          if (sessionId) {
            console.log('Payment completed, notifying extension...');
            // The background script will detect this URL and handle the upgrade
          }
        });
      </script>
    </body>
    </html>
  `);
});

// Create a checkout session
app.post('/create-checkout-session', async (req, res) => {
  const { installationId } = req.body;
  
  try {
    console.log('Creating checkout session with:', {
      priceId: process.env.STRIPE_PRICE_ID,
      extensionUrl: process.env.EXTENSION_URL,
      installationId
    });

    const baseUrl = 'https://db5f-64-191-7-8.ngrok-free.app';
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/cancel`,
      metadata: {
        installationId,
      },
    });

    console.log('Checkout session created:', session.id);
    res.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: error.message });
  }
});

// Webhook handler for Stripe events
app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  console.log('[Debug] Received webhook request');
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    console.log('[Debug] Validating webhook signature...');
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    console.log('[Debug] Webhook signature valid');
  } catch (err) {
    console.error('[Error] Webhook signature validation failed:', err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log('[Debug] Received webhook event:', event.type, 'with data:', JSON.stringify(event.data.object, null, 2));

  if (event.type === 'checkout.session.completed') {
    try {
      const session = event.data.object;
      const customerId = session.customer;
      const installationId = session.metadata.installationId;
      const licenseKey = generateLicenseKey();

      console.log('[Debug] Processing checkout completion:', {
        customerId,
        installationId,
        licenseKey,
        sessionId: session.id
      });

      if (!installationId) {
        throw new Error('No installation ID found in session metadata');
      }

      console.log('[Debug] Attempting to write to Firebase at path:', `users/${installationId}`);

      // Store user data in Firebase with installation ID as key
      await db.ref('users').child(installationId).update({
      subscriptionStatus: 'premium',
      customerId: customerId,
      licenseKey,
        updatedAt: admin.database.ServerValue.TIMESTAMP,
        createdAt: admin.database.ServerValue.TIMESTAMP
      });

      console.log('[Debug] Successfully created premium account with license:', licenseKey);

      // Verify the data was written
      const snapshot = await db.ref('users').child(installationId).once('value');
      console.log('[Debug] Verified Firebase data:', snapshot.val());
    } catch (error) {
      console.error('[Error] Failed to process checkout completion:', error);
      // Don't throw the error, as we want to send a 200 response to Stripe
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object;
    const customerId = subscription.customer;
    
    // Find the installation ID by querying Firebase
    const snapshot = await db.ref('users')
      .orderByChild('customerId')
      .equalTo(customerId)
      .once('value');
    
    const userData = snapshot.val();
    if (userData) {
      const installationId = Object.keys(userData)[0];
      console.log('[Debug] Subscription canceled for installation:', installationId);
      
      // Update user status using installation ID
      await db.ref('users').child(installationId).update({
        subscriptionStatus: 'free',
        customerId: null,
        licenseKey: null,
        updatedAt: admin.database.ServerValue.TIMESTAMP
      });

      console.log('[Debug] Account downgraded to free plan');
    }
  }

  res.json({ received: true });
});

// Generate a unique license key
function generateLicenseKey() {
  return `grok-${uuidv4()}`;
}

// Verify license key
app.post('/verify-license', async (req, res) => {
  const { licenseKey } = req.body;
  console.log('[Debug] Verifying license:', licenseKey);

  try {
    if (!licenseKey) {
      console.log('[Debug] No license key provided');
      return res.json({ status: 'free' });
    }

    // Query Firebase to find user with this license key
    const snapshot = await db.ref('users')
      .orderByChild('licenseKey')
      .equalTo(licenseKey)
      .once('value');
    
    const userData = snapshot.val();
    console.log('[Debug] Found user data:', userData);

    if (userData) {
      const userId = Object.keys(userData)[0];
      const user = userData[userId];
      
      if (user.subscriptionStatus === 'premium') {
        console.log('[Debug] Valid premium subscription found');
        return res.json({ status: 'premium' });
      }
    }

    console.log('[Debug] No valid subscription found');
    res.json({ status: 'free' });
  } catch (error) {
    console.error('Error verifying license:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/get-license', async (req, res) => {
  const { sessionId } = req.body;
  console.log('[Debug] Getting license for session:', sessionId);

  try {
    // Retrieve the session to get customer ID
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const customerId = session.customer;
    console.log('[Debug] Found customer:', customerId);

    // Get user data from Firebase
    const snapshot = await db.ref('users').child(customerId).once('value');
    const userData = snapshot.val();
    console.log('[Debug] Found user data:', userData);

    if (userData && userData.licenseKey) {
      console.log('[Debug] Returning existing license key');
      res.json({ licenseKey: userData.licenseKey });
    } else {
      console.log('[Debug] No license key found, creating new one');
      const licenseKey = generateLicenseKey();
      
      // Store the license key and update status
      await db.ref('users').child(customerId).update({
        licenseKey,
        subscriptionStatus: 'premium',
        customerId: customerId,
        updatedAt: admin.database.ServerValue.TIMESTAMP
      });

      console.log('[Debug] Created new license key:', licenseKey);
      res.json({ licenseKey });
    }
  } catch (error) {
    console.error('Error getting/creating license:', error);
    res.status(500).json({ error: error.message });
  }
});

// Success route handler
app.get('/success', (req, res) => {
  const { session_id } = req.query;
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Payment Successful</title>
        <script>
          // Send message to extension and close window
          if (session_id) {
            window.opener.postMessage({ type: 'PAYMENT_SUCCESS', sessionId: '${session_id}' }, '*');
          }
          window.close();
        </script>
      </head>
      <body>
        <h1>Payment Successful!</h1>
        <p>You can close this window now.</p>
      </body>
    </html>
  `);
});

// Cancel route handler
app.get('/cancel', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Payment Cancelled</title>
        <script>
          // Send message to extension and close window
          window.opener.postMessage({ type: 'PAYMENT_CANCELLED' }, '*');
          window.close();
        </script>
      </head>
      <body>
        <h1>Payment Cancelled</h1>
        <p>You can close this window now.</p>
      </body>
    </html>
  `);
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
