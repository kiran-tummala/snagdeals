// ================================================================
// SnagDeals API Server — Express.js + PostgreSQL (Render)
// ================================================================
// Serves live deals to website & mobile app
// Handles: deal listing, filtering, voting, click tracking, expiry
// ================================================================

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();

// Basic in-memory rate limiter
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

// CORS
const ALLOWED_ORIGINS = (process.env.CORS_ORIGINS || '*').split(',').map(s => s.trim());
app.use(cors({
  origin: ALLOWED_ORIGINS[0] === '*' ? true : ALLOWED_ORIGINS,
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'x-api-key'],
}));
app.use(express.json());
app.use(rateLimit(60000, 100));

// ================================================================
// CONFIG
// ================================================================
const DATABASE_URL = process.env.DATABASE_URL;
const PORT = process.env.PORT || 3001;
const API_SECRET = process.env.API_SECRET;

if (!DATABASE_URL) {
  console.error('Missing required env var: DATABASE_URL');
  process.exit(1);
}
if (!API_SECRET) {
  console.error('Missing required env var: API_SECRET');
  process.exit(1);
}

// Postgres connection pool
const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 10,
});

// ================================================================
// MIDDLEWARE
// ================================================================

function requireApiKey(req, res, next) {
  const key = req.headers['x-api-key'];
  if (!key || key !== API_SECRET) {
    return res.status(401).json({ error: 'Invalid API key' });
  }
  next();
}

// ================================================================
// ROUTES: PUBLIC
// ================================================================

// GET /api/deals — Fetch active deals with filtering & sorting
app.get('/api/deals', async (req, res) => {
  try {
    const {
      country = 'US',
      category,
      store,
      tag,
      search,
      sort = 'popular',
      limit = 50,
      offset = 0,
      featured_only = false,
    } = req.query;

    const conditions = ['is_active = true'];
    const params = [];
    let paramIdx = 1;

    if (country) {
      conditions.push(`country = $${paramIdx++}`);
      params.push(country.toUpperCase());
    }
    if (category && category !== 'all') {
      if (category === 'hot') {
        conditions.push(`'hot' = ANY(tags)`);
      } else {
        conditions.push(`category = $${paramIdx++}`);
        params.push(category);
      }
    }
    if (store) {
      conditions.push(`store = $${paramIdx++}`);
      params.push(store);
    }
    if (tag) {
      conditions.push(`$${paramIdx++} = ANY(tags)`);
      params.push(tag);
    }
    if (featured_only === 'true') {
      conditions.push('is_featured = true');
    }
    if (search) {
      const clean = search.replace(/[%_\\.,()]/g, '').substring(0, 200);
      conditions.push(`(title ILIKE $${paramIdx} OR store ILIKE $${paramIdx} OR description ILIKE $${paramIdx})`);
      params.push(`%${clean}%`);
      paramIdx++;
    }

    let orderBy;
    switch (sort) {
      case 'popular': orderBy = 'votes DESC'; break;
      case 'newest': orderBy = 'created_at DESC'; break;
      case 'savings': orderBy = 'discount_percent DESC'; break;
      case 'price_low': orderBy = 'price ASC'; break;
      case 'price_high': orderBy = 'price DESC'; break;
      default: orderBy = 'created_at DESC';
    }

    const lim = Math.min(parseInt(limit) || 50, 200);
    const off = parseInt(offset) || 0;

    const sql = `SELECT * FROM deals WHERE ${conditions.join(' AND ')} ORDER BY ${orderBy} LIMIT $${paramIdx++} OFFSET $${paramIdx++}`;
    params.push(lim, off);

    let { rows } = await pool.query(sql, params);

    // Fall back to US deals if no deals found for the requested country
    if (rows.length === 0 && country && country.toUpperCase() !== 'US') {
      const fallbackParams = params.slice();
      // Replace the country param (always first param) with 'US'
      fallbackParams[0] = 'US';
      const fallbackResult = await pool.query(sql, fallbackParams);
      rows = fallbackResult.rows;
    }

    const deals = rows.map(d => ({
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
      createdAt: d.created_at,
    }));

    res.json({ success: true, deals, total: deals.length, offset: off, limit: lim });
  } catch (err) {
    console.error('GET /api/deals error:', err);
    res.status(500).json({ error: 'Failed to fetch deals' });
  }
});

// GET /api/stats — Dashboard stats
app.get('/api/stats', async (req, res) => {
  try {
    const [activeRes, allRes, countryRes, catRes, storeRes] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM deals WHERE is_active = true'),
      pool.query('SELECT COUNT(*) FROM deals'),
      pool.query('SELECT country, COUNT(*) as cnt FROM deals WHERE is_active = true GROUP BY country'),
      pool.query('SELECT category, COUNT(*) as cnt FROM deals WHERE is_active = true GROUP BY category'),
      pool.query('SELECT store, COUNT(*) as cnt FROM deals WHERE is_active = true GROUP BY store'),
    ]);

    const byCountry = {};
    countryRes.rows.forEach(r => { byCountry[r.country] = parseInt(r.cnt); });
    const byCategory = {};
    catRes.rows.forEach(r => { byCategory[r.category] = parseInt(r.cnt); });
    const byStore = {};
    storeRes.rows.forEach(r => { byStore[r.store] = parseInt(r.cnt); });

    res.json({
      success: true,
      stats: {
        totalActive: parseInt(activeRes.rows[0].count),
        totalAll: parseInt(allRes.rows[0].count),
        byCountry,
        byCategory,
        byStore,
      },
    });
  } catch (err) {
    console.error('GET /api/stats error:', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// GET /api/deals/:id — Single deal
app.get('/api/deals/:id', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM deals WHERE id = $1 AND is_active = true', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Deal not found' });
    res.json({ success: true, deal: rows[0] });
  } catch (err) {
    console.error('GET /api/deals/:id error:', err);
    res.status(500).json({ error: 'Failed to fetch deal' });
  }
});

// POST /api/deals/:id/vote
app.post('/api/deals/:id/vote', async (req, res) => {
  try {
    const { fingerprint, vote_type = 'up' } = req.body;
    if (!fingerprint) return res.status(400).json({ error: 'fingerprint required' });
    await pool.query(
      `INSERT INTO deal_votes (deal_id, user_fingerprint, vote_type)
       VALUES ($1, $2, $3)
       ON CONFLICT (deal_id, user_fingerprint) DO UPDATE SET vote_type = $3`,
      [req.params.id, fingerprint, vote_type]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('POST /api/deals/:id/vote error:', err);
    res.status(500).json({ error: 'Failed to record vote' });
  }
});

// POST /api/deals/:id/click
app.post('/api/deals/:id/click', async (req, res) => {
  try {
    const { fingerprint, country, city } = req.body;
    await pool.query(
      'INSERT INTO deal_clicks (deal_id, user_fingerprint, country, city) VALUES ($1, $2, $3, $4)',
      [req.params.id, fingerprint, country, city]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('POST /api/deals/:id/click error:', err);
    res.status(500).json({ error: 'Failed to record click' });
  }
});

// GET /api/categories
app.get('/api/categories', async (req, res) => {
  try {
    const country = req.query.country || 'US';
    const { rows } = await pool.query(
      'SELECT category, tags FROM deals WHERE is_active = true AND country = $1',
      [country]
    );
    const counts = { all: 0, hot: 0 };
    rows.forEach(d => {
      counts.all++;
      if (d.tags?.includes('hot')) counts.hot++;
      counts[d.category] = (counts[d.category] || 0) + 1;
    });
    res.json({ success: true, counts });
  } catch (err) {
    console.error('GET /api/categories error:', err);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// ================================================================
// ROUTES: PROTECTED — API key required (for n8n / admin)
// ================================================================

// POST /api/deals — Create or update deals (upsert)
app.post('/api/deals', requireApiKey, async (req, res) => {
  try {
    const deals = Array.isArray(req.body) ? req.body : [req.body];
    let upserted = 0;

    for (const d of deals) {
      const { rows } = await pool.query(
        `INSERT INTO deals (title, description, category, store, store_color, emoji,
          price, original_price, discount_percent, currency, coupon_code,
          deal_url, affiliate_url, image_url, location, destination,
          votes, comments_count, tags, source, source_deal_id,
          shipping_info, is_active, is_verified, is_featured, country,
          asin, auto_expire_hours, expires_at, scraped_at)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,NOW())
        ON CONFLICT (source, source_deal_id) DO UPDATE SET
          title=EXCLUDED.title, price=EXCLUDED.price, original_price=EXCLUDED.original_price,
          discount_percent=EXCLUDED.discount_percent, votes=EXCLUDED.votes,
          comments_count=EXCLUDED.comments_count, tags=EXCLUDED.tags,
          is_active=true, scraped_at=NOW(), updated_at=NOW()
        RETURNING id`,
        [
          d.title,
          d.description || null,
          d.category || d.cat || 'retail',
          d.store,
          d.store_color || d.sc || '#333333',
          d.emoji || d.em || '🏷️',
          parseFloat(d.price) || 0,
          parseFloat(d.original_price || d.orig) || null,
          parseInt(d.discount_percent || d.off) || 0,
          d.currency || 'USD',
          d.coupon_code || d.coupon || null,
          d.deal_url || d.url || null,
          d.affiliate_url || null,
          d.image_url || d.img || null,
          d.location || d.loc || null,
          d.destination || d.dest || null,
          parseInt(d.votes) || 0,
          parseInt(d.comments_count || d.comments) || 0,
          d.tags || [],
          d.source || 'n8n',
          d.source_deal_id || d.source_id || null,
          d.shipping_info || d.ship || 'Free Ship',
          true,
          d.is_verified || false,
          d.is_featured || d.featured || false,
          d.country || 'US',
          d.asin || null,
          parseInt(d.auto_expire_hours) || 48,
          d.expires_at || null,
        ]
      );
      upserted += rows.length;
    }

    // Update source health
    if (deals.length > 0) {
      const src = deals[0].source || 'n8n';
      await pool.query(
        `UPDATE deal_sources SET last_scraped_at = NOW(), last_deal_count = $1 WHERE name = $2`,
        [deals.length, src]
      );
    }

    res.json({ success: true, created: upserted, message: `Upserted ${upserted} deals` });
  } catch (err) {
    console.error('POST /api/deals error:', err);
    res.status(500).json({ error: 'Failed to upsert deals' });
  }
});

// PATCH /api/deals/:id
const ALLOWED_PATCH_FIELDS = [
  'title', 'description', 'category', 'store', 'store_color', 'emoji',
  'price', 'original_price', 'discount_percent', 'currency', 'coupon_code',
  'deal_url', 'affiliate_url', 'image_url', 'location', 'destination',
  'votes', 'comments_count', 'tags', 'shipping_info', 'is_active',
  'is_verified', 'is_featured', 'country', 'asin', 'auto_expire_hours',
  'expires_at',
];
app.patch('/api/deals/:id', requireApiKey, async (req, res) => {
  try {
    const setClauses = [];
    const params = [];
    let paramIdx = 1;

    for (const key of Object.keys(req.body)) {
      if (ALLOWED_PATCH_FIELDS.includes(key)) {
        setClauses.push(`${key} = $${paramIdx++}`);
        params.push(req.body[key]);
      }
    }
    if (!setClauses.length) return res.status(400).json({ error: 'No valid fields to update' });

    setClauses.push(`updated_at = NOW()`);
    params.push(req.params.id);

    const { rows } = await pool.query(
      `UPDATE deals SET ${setClauses.join(', ')} WHERE id = $${paramIdx} RETURNING *`,
      params
    );
    res.json({ success: true, deal: rows[0] });
  } catch (err) {
    console.error('PATCH /api/deals/:id error:', err);
    res.status(500).json({ error: 'Failed to update deal' });
  }
});

// DELETE /api/deals/:id — Soft-delete
app.delete('/api/deals/:id', requireApiKey, async (req, res) => {
  try {
    await pool.query(
      'UPDATE deals SET is_active = false, deactivated_at = NOW() WHERE id = $1',
      [req.params.id]
    );
    res.json({ success: true, message: 'Deal deactivated' });
  } catch (err) {
    console.error('DELETE /api/deals/:id error:', err);
    res.status(500).json({ error: 'Failed to deactivate deal' });
  }
});

// POST /api/expire — Auto-expiry
app.post('/api/expire', requireApiKey, async (req, res) => {
  try {
    const { rowCount } = await pool.query(
      `UPDATE deals SET is_active = false, deactivated_at = NOW()
       WHERE is_active = true AND auto_expire_hours IS NOT NULL
       AND created_at < NOW() - (auto_expire_hours || ' hours')::interval`
    );
    res.json({ success: true, expired: rowCount, message: `Expired ${rowCount} deals` });
  } catch (err) {
    console.error('POST /api/expire error:', err);
    res.status(500).json({ error: 'Failed to expire deals' });
  }
});

// POST /api/deals/bulk-deactivate
app.post('/api/deals/bulk-deactivate', requireApiKey, async (req, res) => {
  try {
    const { source, older_than_hours = 48 } = req.body;
    const cutoff = new Date(Date.now() - older_than_hours * 3600 * 1000).toISOString();
    const params = [cutoff];
    let sql = 'UPDATE deals SET is_active = false, deactivated_at = NOW() WHERE is_active = true AND created_at < $1';
    if (source) {
      sql += ' AND source = $2';
      params.push(source);
    }
    const { rowCount } = await pool.query(sql, params);
    res.json({ success: true, deactivated: rowCount });
  } catch (err) {
    console.error('POST /api/deals/bulk-deactivate error:', err);
    res.status(500).json({ error: 'Failed to bulk deactivate deals' });
  }
});

// GET /api/sources
app.get('/api/sources', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM deal_sources ORDER BY last_scraped_at DESC NULLS LAST');
    res.json({ success: true, sources: rows });
  } catch (err) {
    console.error('GET /api/sources error:', err);
    res.status(500).json({ error: 'Failed to fetch sources' });
  }
});

// ================================================================
// SCRAPE — Server-side deal scraping (called by n8n or cron)
// ================================================================
app.post('/api/scrape', requireApiKey, async (req, res) => {
  const results = { sources: {}, totalDeals: 0, upserted: 0 };

  // Store colors for known stores
  const SC = { Amazon: '#ff9900', Walmart: '#0071dc', Target: '#cc0000', Costco: '#e31837', 'Best Buy': '#0046be', 'Home Depot': '#f96302', Newegg: '#c11f1f', eBay: '#e43137' };

  function detectStore(title) {
    const t = title.toLowerCase();
    if (t.includes('walmart')) return 'Walmart';
    if (t.includes('best buy') || t.includes('bestbuy')) return 'Best Buy';
    if (t.includes('target')) return 'Target';
    if (t.includes('costco')) return 'Costco';
    if (t.includes('home depot')) return 'Home Depot';
    if (t.includes('newegg')) return 'Newegg';
    if (t.includes('ebay')) return 'eBay';
    if (t.includes("lowe's") || t.includes('lowes')) return "Lowe's";
    return 'Amazon';
  }

  function parsePrice(text) {
    const m = text.match(/\$(\d+(?:\.\d{2})?)/);
    return m ? parseFloat(m[1]) : 0;
  }

  // --- 1. SlickDeals RSS ---
  try {
    const sdResp = await fetch('https://slickdeals.net/newsearch.php?rss=1&forumchoice%5B%5D=9&sort=newest');
    const sdText = await sdResp.text();
    // Split into individual <item> blocks to extract per-item data
    const sdBlocks = sdText.split(/<item>/g).slice(1);
    let sdCount = 0;
    for (const block of sdBlocks) {
      const tMatch = block.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/) || block.match(/<title>(.*?)<\/title>/);
      if (!tMatch) continue;
      const title = tMatch[1].trim();
      if (title.length < 10 || title === 'SlickDeals') continue;
      const lMatch = block.match(/<link>(https:\/\/slickdeals[^<]+)<\/link>/);
      // Extract image from content:encoded
      const imgMatch = block.match(/src="(https:\/\/static\.slickdealscdn\.com\/attachment[^"]+)"/) ||
                       block.match(/<enclosure[^>]+url="([^"]+)"/) ||
                       block.match(/<media:content[^>]+url="([^"]+)"/) ||
                       block.match(/<img[^>]+src="(https?:\/\/[^"]+(?:\.jpg|\.jpeg|\.png|\.webp|\.gif)[^"]*)"/i);
      // Extract actual store link: ASIN for Amazon, or store website URL
      const asinMatch = block.match(/data-aps-asin="([A-Z0-9]{10})"/);
      const storeUrlMatch = block.match(/data-product-exitWebsite="([^"]+)"/);
      let dealUrl = lMatch ? lMatch[1] : null;
      let asin = null;
      if (asinMatch) {
        asin = asinMatch[1];
        dealUrl = `https://www.amazon.com/dp/${asin}`;
      } else if (storeUrlMatch && storeUrlMatch[1] !== 'slickdeals.net') {
        // Try to find a direct URL to the store in the description
        const directUrl = block.match(/href="[^"]*"[^>]*data-product-exitWebsite="[^"]*"[^>]*>/);
        if (!directUrl) dealUrl = `https://${storeUrlMatch[1]}`;
      }
      const store = detectStore(title);
      const price = parsePrice(title);
      const origPrice = price > 0 ? Math.round(price * 1.35) : 0;
      const discount = origPrice > 0 ? Math.round((1 - price / origPrice) * 100) : 20;
      const sid = 'sd-' + title.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 40);
      try {
        await pool.query(
          `INSERT INTO deals (title, category, store, store_color, price, original_price, discount_percent, source, source_deal_id, deal_url, image_url, asin, votes, tags, shipping_info, country, is_active, scraped_at)
           VALUES ($1, 'retail', $2, $3, $4, $5, $6, 'slickdeals', $7, $8, $9, $10, $11, $12, $13, 'US', true, NOW())
           ON CONFLICT (source, source_deal_id) DO UPDATE SET price=EXCLUDED.price, image_url=COALESCE(EXCLUDED.image_url, deals.image_url), deal_url=EXCLUDED.deal_url, asin=COALESCE(EXCLUDED.asin, deals.asin), scraped_at=NOW(), is_active=true`,
          [title.substring(0, 200), store, SC[store] || '#86868b', price, origPrice, discount, sid, dealUrl, imgMatch ? imgMatch[1] : null, asin, Math.floor(Math.random() * 400) + 50, discount >= 35 ? '{hot}' : '{}', store === 'Amazon' ? 'Free Prime' : 'Free Ship']
        );
        results.upserted++;
        sdCount++;
      } catch (e) { /* skip duplicate */ }
    }
    results.sources.slickdeals = sdCount;
    results.totalDeals += sdCount;
  } catch (err) {
    console.error('SlickDeals scrape error:', err.message);
    results.sources.slickdeals = 'error: ' + err.message;
  }

  // --- 2. DealNews RSS ---
  try {
    const dnResp = await fetch('https://www.dealnews.com/rss/');
    const dnText = await dnResp.text();
    const dnBlocks = dnText.split(/<item>/g).slice(1);
    let dnCount = 0;
    for (const block of dnBlocks) {
      // DealNews may use plain <title> or CDATA
      const tMatch = block.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/) || block.match(/<title>(.*?)<\/title>/);
      if (!tMatch) continue;
      const title = tMatch[1].trim();
      if (title.length < 10 || title === 'DealNews' || title === 'dealnews.com') continue;
      const lMatch = block.match(/<link>(https?:\/\/[^<]+)<\/link>/);
      const imgMatch = block.match(/<enclosure[^>]+url="([^"]+)"/) ||
                       block.match(/<media:content[^>]+url="([^"]+)"/) ||
                       block.match(/src="(https?:\/\/[^"]+(?:\.jpg|\.jpeg|\.png|\.webp|\.gif|\.thumb)[^"]*)"/i);
      const store = detectStore(title);
      const price = parsePrice(title);
      const origPrice = price > 0 ? Math.round(price * 1.4) : 0;
      const discount = origPrice > 0 ? Math.round((1 - price / origPrice) * 100) : 20;
      const sid = 'dn-' + title.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 40);
      try {
        await pool.query(
          `INSERT INTO deals (title, category, store, store_color, price, original_price, discount_percent, source, source_deal_id, deal_url, image_url, votes, tags, shipping_info, country, is_active, scraped_at)
           VALUES ($1, 'retail', $2, $3, $4, $5, $6, 'dealnews', $7, $8, $9, $10, $11, $12, 'US', true, NOW())
           ON CONFLICT (source, source_deal_id) DO UPDATE SET price=EXCLUDED.price, image_url=COALESCE(EXCLUDED.image_url, deals.image_url), scraped_at=NOW(), is_active=true`,
          [title.substring(0, 200), store, SC[store] || '#86868b', price, origPrice, discount, sid, lMatch ? lMatch[1] : null, imgMatch ? imgMatch[1] : null, Math.floor(Math.random() * 300) + 30, discount >= 35 ? '{hot}' : '{}', store === 'Amazon' ? 'Free Prime' : 'Free Ship']
        );
        results.upserted++;
        dnCount++;
      } catch (e) { /* skip */ }
    }
    results.sources.dealnews = dnCount;
    results.totalDeals += dnCount;
  } catch (err) {
    console.error('DealNews scrape error:', err.message);
    results.sources.dealnews = 'error: ' + err.message;
  }

  // --- 3. DealsOfAmerica ---
  try {
    const doaResp = await fetch('https://www.dealsofamerica.com');
    const doaHtml = await doaResp.text();
    const doaRegex = /<a[^>]*>([^<]{15,200})<\/a>/gi;
    let doaMatch;
    let doaCount = 0;
    while ((doaMatch = doaRegex.exec(doaHtml)) !== null && doaCount < 40) {
      const title = doaMatch[1].trim();
      if (title.length < 15) continue;
      if (!/\$|%|off|deal|save|sale|free/i.test(title)) continue;
      const store = detectStore(title);
      const price = parsePrice(title);
      const origPrice = price > 0 ? Math.round(price * 1.3) : 0;
      const discount = origPrice > 0 ? Math.round((1 - price / origPrice) * 100) : 15;
      const sid = 'doa-' + title.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 40);
      try {
        await pool.query(
          `INSERT INTO deals (title, category, store, store_color, price, original_price, discount_percent, source, source_deal_id, votes, tags, shipping_info, country, is_active, scraped_at)
           VALUES ($1, 'retail', $2, $3, $4, $5, $6, 'dealsofamerica', $7, $8, $9, $10, 'US', true, NOW())
           ON CONFLICT (source, source_deal_id) DO UPDATE SET price=EXCLUDED.price, scraped_at=NOW(), is_active=true`,
          [title.substring(0, 200), store, SC[store] || '#86868b', price, origPrice, discount, sid, Math.floor(Math.random() * 200) + 20, discount >= 35 ? '{hot}' : '{}', 'Free Ship']
        );
        results.upserted++;
        doaCount++;
      } catch (e) { /* skip */ }
    }
    results.sources.dealsofamerica = doaCount;
    results.totalDeals += doaCount;
  } catch (err) {
    console.error('DOA scrape error:', err.message);
    results.sources.dealsofamerica = 'error: ' + err.message;
  }

  results.timestamp = new Date().toISOString();
  console.log('Scrape complete:', JSON.stringify(results));
  res.json({ success: true, ...results });
});

// ================================================================
// HEALTH CHECK
// ================================================================
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', service: 'SnagDeals API', version: '2.0.0', timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(503).json({ status: 'error', message: 'Database unreachable' });
  }
});

// ================================================================
// START SERVER
// ================================================================
app.listen(PORT, () => {
  console.log(`SnagDeals API running on port ${PORT}`);
  console.log(`  Health: http://localhost:${PORT}/api/health`);
  console.log(`  Deals:  http://localhost:${PORT}/api/deals?country=US&sort=popular`);
});

module.exports = app;
