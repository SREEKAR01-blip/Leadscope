/*
# Create profiles and leads tables (single-tenant, no auth)

## Overview
This migration sets up the database architecture for a lead-generation dashboard.
It introduces two distinct user roles — 'freelancer' and 'business_owner' — stored
in a `profiles` table, and a `leads` table that stores scraped local-business data
displayed on the dashboard map and list.

## 1. New Tables

### profiles
Represents a user of the platform and their role.
- `id` (uuid, primary key)
- `name` (text, not null) — display name of the user
- `email` (text, unique, not null) — contact email
- `role` (text, not null) — one of 'freelancer' or 'business_owner'
- `avatar_url` (text, nullable) — optional avatar image
- `created_at` (timestamptz, default now())

### leads
Stores scraped business data shown on the dashboard.
- `id` (uuid, primary key)
- `name` (text, not null) — business name
- `category` (text, not null) — e.g. "Restaurant", "Plumber"
- `address` (text, not null) — street address
- `city` (text, not null) — city
- `phone` (text, nullable) — contact phone
- `email` (text, nullable) — contact email
- `website` (text, nullable) — business website URL
- `rating` (numeric, nullable) — star rating 0-5
- `review_count` (integer, nullable) — number of reviews
- `digital_score` (integer, not null, default 0) — placeholder score 0-100
- `latitude` (numeric, nullable) — map position
- `longitude` (numeric, nullable) — map position
- `image_url` (text, nullable) — business image
- `created_at` (timestamptz, default now())

## 2. Indexes
- `leads_city_idx` on `leads(city)` — frequent filter by city
- `leads_digital_score_idx` on `leads(digital_score DESC)` — sort by score
- `profiles_role_idx` on `profiles(role)` — filter by role

## 3. Security (RLS)
- Enable RLS on both tables.
- This is a single-tenant app with NO sign-in screen, so the anon-key frontend
  must be able to read and write. Policies use `TO anon, authenticated` with
  `USING (true)` / `WITH CHECK (true)` because the data is intentionally shared
  across the single tenant (documented here, not used as a shortcut).

## 4. Important Notes
1. No `user_id` / `auth.users` foreign key — app has no sign-in flow.
2. `digital_score` defaults to 0 and is meant as a placeholder to be filled by
   a future scoring routine; the UI renders it as "X / 100".
3. All statements are idempotent (`IF NOT EXISTS`, drop-then-create policies)
   so the migration is safe to re-apply after a timeout.
*/

-- ---------- profiles ----------
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  role text NOT NULL CHECK (role IN ('freelancer', 'business_owner')),
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_profiles" ON profiles;
CREATE POLICY "anon_select_profiles" ON profiles FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_profiles" ON profiles;
CREATE POLICY "anon_insert_profiles" ON profiles FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_profiles" ON profiles;
CREATE POLICY "anon_update_profiles" ON profiles FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_profiles" ON profiles;
CREATE POLICY "anon_delete_profiles" ON profiles FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS profiles_role_idx ON profiles(role);

-- ---------- leads ----------
CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  address text NOT NULL,
  city text NOT NULL,
  phone text,
  email text,
  website text,
  rating numeric(2,1),
  review_count integer,
  digital_score integer NOT NULL DEFAULT 0 CHECK (digital_score BETWEEN 0 AND 100),
  latitude numeric(9,6),
  longitude numeric(9,6),
  image_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_leads" ON leads;
CREATE POLICY "anon_select_leads" ON leads FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_leads" ON leads;
CREATE POLICY "anon_insert_leads" ON leads FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_leads" ON leads;
CREATE POLICY "anon_update_leads" ON leads FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_leads" ON leads;
CREATE POLICY "anon_delete_leads" ON leads FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS leads_city_idx ON leads(city);
CREATE INDEX IF NOT EXISTS leads_digital_score_idx ON leads(digital_score DESC);
