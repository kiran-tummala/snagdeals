// ================================================================
// SnagDeals API Server — Express.js + Supabase
// ================================================================
// Serves live deals to website & mobile app
// Handles: deal listing, filtering, voting, click tracking, expiry
// Deploy to: Vercel, Railway, Render, or any Node.js host
// ================================================================

const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();

// Basic in-memory rate limiter (use redis in production)
const rateLimits = new Map();
function rateLimit(windowMs = 60000, maxReqs = 60) {
  return (req, res, next) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    const now = Date.now();
    const record = rateLimits.get(ip) || { count: 0, resetAt: now + windowMs };
    if (now > record.resetAt) { record.count = 0; record.resetAt = now + windowMs; }
    record.count++;
    rateLimits.set(ip, record);
    if (record.count > maxReqs) {
      return res.status(429).json({ error: 'Too many requests. Try again later.' });
    }
    next();
  };
}

// CORS: In production, restrict to your domain(s)
const ALLOWED_ORIGINS = (process.env.CORS_ORIGINS || '*').split(',').map(s => s.trim());
app.use(cors({
  origin: ALLOWED_ORIGINS[0] === '*' ? true : ALLOWED_ORIGINS,
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'x-api-key'],
}));
app.use(express.json());
app.use(rateLimit(60000, 100)); // 100 requests per minute per IP

// ================================================================
// CONFIG — Set these as environment variables
// ================================================================
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://YOUR_PROJECT.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'YOUR_SERVICE_ROLE_KEY';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'YOUR_ANON_KEY';
const PORT = process.env.PORT || 3001;
const API_SECRET = process.env.API_SECRET || 'snagdeals-n8n-secret-2026';

// Two clients: service (for writes from n8n) and anon (for public reads)
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const supabasePublic = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ================================================================
// MIDDLEWARE
// ================================================================

// API key check for write operations (n8n, admin)
function requireApiKey(req, res, next) {
  const key = req.headers['x-api-key'];
  if (!key || key !== API_SECRET) {
    return res.status(401).json({ error: 'Invalid API key' });
  }
  next();
}

// Sanitize search input to prevent injection
function sanitizeSearch(input) {
  if (!input) return '';
  return input.replace(/[%_\\]/g, '\\$&').substring(0, 200); // escape wildcards, limit length
}

// ================================================================
// ROUTES: PUBLIC — No auth needed
// ================================================================

// GET /api/deals — Fetch active deals with filtering & sorting
app.get('/api/deals', async (req, res) => {
  try {
    const {
      country = 'US',
      category,        // 'retail', 'grocery', 'fashion', etc.
      store,           // 'Newegg', 'Amazon', etc.
      tag,             // 'hot', 'frontpage'
      search,          // search query
      sort = 'popular', // 'popular', 'newest', 'savings', 'price_low', 'price_high'
      limit = 50,
      offset = 0,
      featured_only = false,
    } = req.query;

    let query = supabaseAdmin
      .from('deals')
      .select('*')
      .eq('is_active', true);

    // Filters
    if (country) query = query.eq('country', country.toUpperCase());
    if (category && category !== 'all') {
      if (category === 'hot') {
        query = query.contains('tags', ['hot']);
      } else {
        query = query.eq('category', category);
      }
    }
    if (store) query = query.eq('store', store);
    if (tag) query = query.contains('tags', [tag]);
    if (featured_only === 'true') query = query.eq('is_featured', true);
    if (search) {
      const clean = sanitizeSearch(search);
      query = query.or(`title.ilike.%${clean}%,store.ilike.%${clean}%,description.ilike.%${clean}%`);
    }

    // Sorting
    switch (sort) {
      case 'popular':
        query = query.order('votes', { ascending: false });
        break;
      case 'newest':
        query = query.order('created_at', { ascending: false });
        break;
      case 'savings':
        query = query.order('discount_percent', { ascending: false });
        break;
      case 'price_low':
        query = query.order('price', { ascending: true });
        break;
      case 'price_high':
        query = query.order('price', { ascending: false });
        break;
      default:
        query = query.order('created_at', { ascending: false });
    }

    // Pagination
    query = query.range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    // Transform for frontend compatibility
    const deals = (data || []).map(d => ({
      id: d.id,
      cat: d.category,
      store: d.store,
      sc: d.store_color,
      em: d.emoji,
      title: d.title,
      price: parseFloat(d.price),
      orig: parseFloat(d.original_price || d.price),
      off: d.discount_percent || 0,
      votes: d.votes || 0,
      time: d.time_ago || 'just now',
      comments: d.comments_count || 0,
      tags: d.tags || [],
      ship: d.shipping_info || 'Free Ship',
      img: d.image_url,
      url: d.affiliate_url || d.deal_url,
      loc: d.location,
      dest: d.destination,
      asin: d.asin,
      coupon: d.coupon_code,
      verified: d.is_verified,
      featured: d.is_featured,
      country: d.country,
      hoursRemaining: d.hours_remaining ? Math.round(d.hours_remaining) : null,
      createdAt: d.created_at,
    }));

    res.json({
      success: true,
      deals,
      total: deals.length,
      offset: parseInt(offset),
      limit: parseInt(limit),
    });
  } catch (err) {
    console.error('GET /api/deals error:', err);
    res.status(500).json({ error: 'Failed to fetch deals', details: err.message });
  }
});

// GET /api/stats — Dashboard stats (MUST be before /api/deals/:id)
app.get('/api/stats', async (req, res) => {
  try {
    const [
      { count: totalActive },
      { count: totalAll },
    ] = await Promise.all([
      supabaseAdmin.from('deals').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabaseAdmin.from('deals').select('*', { count: 'exact', head: true }),
    ]);

    // Deals by country
    const { data: byCountry } = await supabaseAdmin
      .from('deals')
      .select('country')
      .eq('is_active', true);

    const countryCounts = {};
    (byCountry || []).forEach(d => {
      countryCounts[d.country] = (countryCounts[d.country] || 0) + 1;
    });

    // Deals by category
    const { data: byCat } = await supabaseAdmin
      .from('deals')
      .select('category')
      .eq('is_active', true);

    const catCounts = {};
    (byCat || []).forEach(d => {
      catCounts[d.category] = (catCounts[d.category] || 0) + 1;
    });

    // Deals by store
    const { data: byStore } = await supabaseAdmin
      .from('deals')
      .select('store')
      .eq('is_active', true);

    const storeCounts = {};
    (byStore || []).forEach(d => {
      storeCounts[d.store] = (storeCounts[d.store] || 0) + 1;
    });

    res.json({
      success: true,
      stats: {
        totalActive: totalActive || 0,
        totalAll: totalAll || 0,
        byCountry: countryCounts,
        byCategory: catCounts,
        byStore: storeCounts,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/deals/:id — Single deal
app.get('/api/deals/:id', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('deals')
      .select('*')
      .eq('id', req.params.id)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Deal not found' });
    }

    res.json({ success: true, deal: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/deals/:id/vote — Vote on a deal
app.post('/api/deals/:id/vote', async (req, res) => {
  try {
    const { fingerprint, vote_type = 'up' } = req.body;
    if (!fingerprint) return res.status(400).json({ error: 'fingerprint required' });

    const { data, error } = await supabaseAdmin
      .from('deal_votes')
      .upsert({
        deal_id: req.params.id,
        user_fingerprint: fingerprint,
        vote_type,
      }, { onConflict: 'deal_id,user_fingerprint' });

    if (error) throw error;

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/deals/:id/click — Track affiliate click
app.post('/api/deals/:id/click', async (req, res) => {
  try {
    const { fingerprint, country, city } = req.body;

    await supabaseAdmin.from('deal_clicks').insert({
      deal_id: req.params.id,
      user_fingerprint: fingerprint,
      country,
      city,
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/categories — Category counts for tab badges
app.get('/api/categories', async (req, res) => {
  try {
    const country = req.query.country || 'US';

    const { data } = await supabaseAdmin
      .from('deals')
      .select('category, tags')
      .eq('is_active', true)
      .eq('country', country);

    const counts = { all: 0, hot: 0 };
    (data || []).forEach(d => {
      counts.all++;
      if (d.tags?.includes('hot')) counts.hot++;
      counts[d.category] = (counts[d.category] || 0) + 1;
    });

    res.json({ success: true, counts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================================================================
// ROUTES: PROTECTED — API key required (for n8n / admin)
// ================================================================

// POST /api/deals — Create or update deals (upsert)
// n8n calls this to push scraped deals into the database
app.post('/api/deals', requireApiKey, async (req, res) => {
  try {
    const deals = Array.isArray(req.body) ? req.body : [req.body];

    const prepared = deals.map(d => ({
      title: d.title,
      description: d.description || null,
      category: d.category || d.cat || 'retail',
      store: d.store,
      store_color: d.store_color || d.sc || '#333333',
      emoji: d.emoji || d.em || '🏷️',
      price: parseFloat(d.price) || 0,
      original_price: parseFloat(d.original_price || d.orig) || null,
      discount_percent: parseInt(d.discount_percent || d.off) || 0,
      currency: d.currency || 'USD',
      coupon_code: d.coupon_code || d.coupon || null,
      deal_url: d.deal_url || d.url || null,
      affiliate_url: d.affiliate_url || null,
      image_url: d.image_url || d.img || null,
      location: d.location || d.loc || null,
      destination: d.destination || d.dest || null,
      votes: parseInt(d.votes) || 0,
      comments_count: parseInt(d.comments_count || d.comments) || 0,
      tags: d.tags || [],
      source: d.source || 'n8n',
      source_deal_id: d.source_deal_id || d.source_id || null,
      shipping_info: d.shipping_info || d.ship || 'Free Ship',
      is_active: true,
      is_verified: d.is_verified || false,
      is_featured: d.is_featured || d.featured || false,
      country: d.country || 'US',
      asin: d.asin || null,
      auto_expire_hours: parseInt(d.auto_expire_hours) || 48,
      expires_at: d.expires_at || null,
      scraped_at: new Date().toISOString(),
    }));

    // Upsert: if source + source_deal_id already exists, update price & votes
    const { data, error } = await supabaseAdmin
      .from('deals')
      .upsert(prepared, {
        onConflict: 'source,source_deal_id',
        ignoreDuplicates: false,
      })
      .select();

    if (error) throw error;

    // Update source health
    if (prepared.length > 0 && prepared[0].source) {
      await supabaseAdmin
        .from('deal_sources')
        .update({
          last_scraped_at: new Date().toISOString(),
          last_deal_count: prepared.length,
        })
        .eq('name', prepared[0].source);
    }

    res.json({
      success: true,
      created: data?.length || 0,
      message: `Upserted ${data?.length || 0} deals`,
    });
  } catch (err) {
    console.error('POST /api/deals error:', err);
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/deals/:id — Update a single deal
app.patch('/api/deals/:id', requireApiKey, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('deals')
      .update(req.body)
      .eq('id', req.params.id)
      .select();

    if (error) throw error;
    res.json({ success: true, deal: data?.[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/deals/:id — Soft-delete (deactivate)
app.delete('/api/deals/:id', requireApiKey, async (req, res) => {
  try {
    const { error } = await supabaseAdmin
      .from('deals')
      .update({ is_active: false, deactivated_at: new Date().toISOString() })
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ success: true, message: 'Deal deactivated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/expire — Run auto-expiry manually (also called by n8n cron)
app.post('/api/expire', requireApiKey, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.rpc('expire_old_deals');
    if (error) throw error;
    res.json({ success: true, expired: data, message: `Expired ${data} deals` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/deals/bulk-deactivate — Deactivate deals by source
app.post('/api/deals/bulk-deactivate', requireApiKey, async (req, res) => {
  try {
    const { source, older_than_hours = 48 } = req.body;
    const cutoff = new Date(Date.now() - older_than_hours * 3600 * 1000).toISOString();

    let query = supabaseAdmin
      .from('deals')
      .update({ is_active: false, deactivated_at: new Date().toISOString() })
      .eq('is_active', true)
      .lt('created_at', cutoff);

    if (source) query = query.eq('source', source);

    const { error, count } = await query;
    if (error) throw error;

    res.json({ success: true, deactivated: count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/sources — Scraper health dashboard
app.get('/api/sources', async (req, res) => {
  try {
    const { data, error } = await supabasePublic
      .from('deal_sources')
      .select('*')
      .order('last_scraped_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, sources: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================================================================
// HEALTH CHECK
// ================================================================
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'SnagDeals API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// ================================================================
// START SERVER
// ================================================================
app.listen(PORT, () => {
  console.log(`🏷️ SnagDeals API running on port ${PORT}`);
  console.log(`   Supabase: ${SUPABASE_URL}`);
  console.log(`   Health: http://localhost:${PORT}/api/health`);
  console.log(`   Deals:  http://localhost:${PORT}/api/deals?country=US&sort=popular`);
});

module.exports = app;
