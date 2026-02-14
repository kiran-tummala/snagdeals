-- SnagDeals database schema for Render Postgres

CREATE TABLE IF NOT EXISTS deals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'retail',
  store TEXT,
  store_color TEXT DEFAULT '#333333',
  emoji TEXT DEFAULT '🏷️',
  price NUMERIC DEFAULT 0,
  original_price NUMERIC,
  discount_percent INTEGER DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  coupon_code TEXT,
  deal_url TEXT,
  affiliate_url TEXT,
  image_url TEXT,
  location TEXT,
  destination TEXT,
  votes INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  source TEXT DEFAULT 'manual',
  source_deal_id TEXT,
  shipping_info TEXT DEFAULT 'Free Ship',
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  country TEXT DEFAULT 'US',
  asin TEXT,
  auto_expire_hours INTEGER DEFAULT 48,
  expires_at TIMESTAMPTZ,
  scraped_at TIMESTAMPTZ,
  deactivated_at TIMESTAMPTZ,
  time_ago TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(source, source_deal_id)
);

CREATE TABLE IF NOT EXISTS deal_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  user_fingerprint TEXT NOT NULL,
  vote_type TEXT DEFAULT 'up',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(deal_id, user_fingerprint)
);

CREATE TABLE IF NOT EXISTS deal_clicks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  user_fingerprint TEXT,
  country TEXT,
  city TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS deal_sources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  url TEXT,
  last_scraped_at TIMESTAMPTZ,
  last_deal_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_deals_active_country ON deals (is_active, country);
CREATE INDEX IF NOT EXISTS idx_deals_category ON deals (category) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_deals_store ON deals (store) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_deals_source ON deals (source, source_deal_id);
CREATE INDEX IF NOT EXISTS idx_deals_created ON deals (created_at DESC) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_deals_votes ON deals (votes DESC) WHERE is_active = true;
