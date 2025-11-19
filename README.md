# Alden Backend (Payment + Webhook)

This is a small demo backend for **Alden** that receives Flutterwave webhooks and processes payments.

> ⚠️ This is a demo starter. For production, replace the in-memory store with a real database (Postgres, MySQL), implement robust webhook signature verification per Flutterwave docs, and secure environment variables.

## Files
- `server.js` — main Express server with `/webhook`, `/verify/:txId`, and `/thankyou`.
- `package.json` — dependencies.
- `.env.example` — environment variable template.

## Quick start (local)
1. Copy `.env.example` to `.env` and fill values.
2. Install dependencies:
```bash
npm install
```
3. Run the server:
```bash
npm start
```
4. Expose local server for testing using `ngrok`:
```bash
ngrok http 3000
# then set Flutterwave webhook to https://xxxxxx.ngrok.io/webhook
```

## Deployment (Railway)
1. Push this repo to GitHub.
2. Create a Railway project and connect the repo.
3. Add environment variables (FLW_SECRET, FLW_PUBLIC_KEY, THANK_YOU_PAGE_URL).
4. Deploy and copy the produced `https://...railway.app/webhook` into Flutterwave dashboard → Webhooks.

## Notes
- Replace the demo in-memory `businesses` store with a real DB and proper models.
- Implement complete signature verification and webhook security as described in Flutterwave docs.
