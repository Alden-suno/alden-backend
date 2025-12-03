-- migrations.sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE TABLE IF NOT EXISTS businesses (id SERIAL PRIMARY KEY, name TEXT NOT NULL, slug TEXT UNIQUE, email TEXT, phone TEXT, description TEXT, tier TEXT NOT NULL DEFAULT 'regular', price_paid INTEGER, is_verified BOOLEAN DEFAULT FALSE, is_banned BOOLEAN DEFAULT FALSE, address TEXT, latitude NUMERIC, longitude NUMERIC, logo_url TEXT, images JSONB DEFAULT '[]'::jsonb, avg_rating NUMERIC DEFAULT 0, total_reviews INTEGER DEFAULT 0, views BIGINT DEFAULT 0, clicks BIGINT DEFAULT 0, boost_expires TIMESTAMP NULL, created_at TIMESTAMP DEFAULT now(), updated_at TIMESTAMP DEFAULT now());
CREATE TABLE IF NOT EXISTS jobs (id SERIAL PRIMARY KEY, business_id INTEGER, title TEXT, description TEXT, location TEXT, salary TEXT, is_active BOOLEAN DEFAULT TRUE, created_at TIMESTAMP DEFAULT now());
CREATE TABLE IF NOT EXISTS reviews (id SERIAL PRIMARY KEY, business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE, user_name TEXT, rating SMALLINT CHECK (rating BETWEEN 1 AND 5), comment TEXT, created_at TIMESTAMP DEFAULT now());
CREATE TABLE IF NOT EXISTS payments (id SERIAL PRIMARY KEY, business_id INTEGER, reference TEXT UNIQUE, amount_kobo INTEGER, status TEXT, flutterwave_data JSONB, created_at TIMESTAMP DEFAULT now());
CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value JSONB);
INSERT INTO settings (key,value) VALUES ('pricing','{"tiers":{"regular":1560,"pro":3000,"premium":5000},"first_time_discount_pct":20}') ON CONFLICT DO NOTHING;
