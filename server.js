require('dotenv').config();
const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Load environment variables
const FLW_SECRET = process.env.FLW_SECRET || '';
const PUBLIC_KEY = process.env.FLW_PUBLIC_KEY || '';
const THANK_YOU = process.env.THANK_YOU_PAGE_URL || '/thankyou';

// Simple in-memory store (for demo). Replace with a real DB in production.
const businesses = {}; // keyed by email -> { email, tier, is_verified }
const paymentsLog = [];

// ---------- ROOT ----------
app.get('/', (req, res) => {
  res.send('Alden Backend — running');
});

// ---------- VERIFY TRANSACTION (helper) ----------
app.get('/verify/:txId', async (req, res) => {
  const { txId } = req.params;
  try {
    const r = await axios.get(`https://api.flutterwave.com/v3/transactions/${txId}/verify`, {
      headers: { Authorization: `Bearer ${FLW_SECRET}` }
    });
    return res.json({ success: true, data: r.data });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message || err.toString() });
  }
});

// ---------- WEBHOOK ----------
app.post('/webhook', async (req, res) => {
  try {
    const signature = req.headers['verif-hash'] || '';
    // SIMPLE VERIFICATION (demo): some setups use verif-hash equal to secret
    // For production, confirm Flutterwave's exact signature verification method and implement accordingly.
    if (!signature || signature !== FLW_SECRET) {
      console.warn('Webhook signature mismatch', { signature });
      return res.status(401).send('Invalid signature');
    }

    const event = req.body;
    console.log('Webhook event:', event.event, event);

    // handle successful charge
    if (event.event === 'charge.completed' || (event.data && event.data.status === 'successful')) {
      const txRef = event.data.tx_ref || event.data.reference || null;
      const amount = Number(event.data.amount || 0);
      const email = (event.data.customer && event.data.customer.email) || (event.data.customer_email) || null;
      const metadata = event.data.meta || {};

      // determine tier by amount (NGN)
      let tier = metadata.tier || 'Unknown';
      if (amount === 1560) tier = 'Regular';
      else if (amount === 3000) tier = 'Pro';
      else if (amount === 5000) tier = 'Premium';

      // update demo store
      if (email) {
        if (!businesses[email]) businesses[email] = { email, tier, is_verified: true, activated_at: new Date().toISOString() };
        else { businesses[email].tier = tier; businesses[email].is_verified = true; }
      }

      // log payment
      paymentsLog.push({
        txRef: txRef,
        email,
        amount,
        tier,
        received_at: new Date().toISOString()
      });

      console.log('Payment recorded:', paymentsLog[paymentsLog.length - 1]);

      // respond
      return res.status(200).send('OK');
    }

    return res.status(200).send('Event ignored');
  } catch (err) {
    console.error('Webhook error', err);
    return res.status(500).send('Server error');
  }
});

// ---------- THANK YOU ----------
app.get('/thankyou', (req, res) => {
  res.send(`
    <html>
      <head><meta charset="utf-8"><title>Thank You — Alden</title></head>
      <body style="font-family: Arial, Helvetica, sans-serif; text-align:center; padding:40px;">
        <h1>🎉 Thank you!</h1>
        <p>Your payment was received and your business subscription is now active.</p>
        <p><a href="/">Go back to Alden</a></p>
      </body>
    </html>
  `);
});

// ---------- DEBUG: view demo data ----------
app.get('/debug/businesses', (req, res) => {
  res.json({ businesses, paymentsLog });
});

// ---------- START SERVER ----------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Alden backend listening on port', PORT));
