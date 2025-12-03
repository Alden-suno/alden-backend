require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');
const axios = require('axios');
const app = express();
app.use(cors()); app.use(bodyParser.json());
const pool = new Pool({ connectionString: process.env.DATABASE_URL || 'postgres://localhost/alden_demo' });
app.get('/', (req,res)=>res.send('Alden backend OK'));

// simple endpoints (businesses, jobs, rate)
app.get('/api/businesses', async (req,res) => {
  try { const r = await pool.query('SELECT id,name,description,tier,latitude,longitude,address,logo_url,is_verified,avg_rating,total_reviews,views FROM businesses LIMIT 200'); res.json({ok:true,data:r.rows}); } catch(e){ res.status(500).json({ok:false,error:e.message}); }
});
app.get('/api/jobs', async (req,res)=>{ try{ const r = await pool.query('SELECT * FROM jobs WHERE is_active = true ORDER BY created_at DESC LIMIT 50'); res.json({ok:true,data:r.rows}); }catch(e){ res.status(500).json({ok:false}); } });
app.post('/api/rate', async (req,res)=>{ const {business_id,user_name,rating,comment} = req.body; if(!business_id||!rating) return res.status(400).json({ok:false}); try{ await pool.query('INSERT INTO reviews(business_id,user_name,rating,comment) VALUES($1,$2,$3,$4)',[business_id,user_name,rating,comment]); await pool.query('UPDATE businesses SET total_reviews = total_reviews + 1, avg_rating = (SELECT ROUND(COALESCE(AVG(rating),0)::numeric,2) FROM reviews WHERE business_id = $1) WHERE id = $1',[business_id]); res.json({ok:true}); }catch(e){ res.status(500).json({ok:false,error:e.message}); } });
// webhook
app.post('/api/flutterwave/webhook', (req,res)=>{ const sig = req.headers['verif-hash']||''; if(!sig || sig !== process.env.FLW_SECRET) return res.status(401).send('Invalid signature'); console.log('webhook',req.body); res.json({ok:true}); });
const PORT = process.env.PORT||3000; app.listen(PORT,()=>console.log('Alden listening',PORT));