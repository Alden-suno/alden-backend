require('dotenv').config();
const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const FLW_SECRET = process.env.FLW_SECRET || '';
const PUBLIC_KEY = process.env.FLW_PUBLIC_KEY || '';
const THANK_YOU = process.env.THANK_YOU_PAGE_URL || '/thankyou';

const businesses = {};
const paymentsLog = [];

app.get('/', (req, res) => res.send('Alden Backend — running'));

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

app.post('/webhook', (req, res) => {
    const signature = req.headers['verif-hash'] || '';
    if (!signature || signature !== FLW_SECRET) {
        console.warn('Webhook signature mismatch', { signature });
        return res.status(401).send('Invalid signature');
    }
    const event = req.body;
    console.log('Webhook event:', event.event, event);
    return res.status(200).send('OK');
});

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Alden backend listening on port', PORT));
