# 🚀 Complete Keepa + Ebook Integration Implementation

**Timeline:** 4.5 hours total  
**Expected Revenue:** +$1,500-3,000/mo  
**Start Date:** February 13, 2026  
**Completion:** February 15, 2026

---

## 📋 Overview

This guide walks you through adding:
1. **Keepa API** for Amazon price tracking (2 hours)
2. **Ebook scraper** for book deals (1.5 hours)
3. **Affiliate integration** for revenue (1 hour)

---

# PHASE 1: Keepa Setup (2 Hours)

## Step 1: Create Keepa Account (10 min)

```
1. Go to: https://keepa.com/register
2. Email: [your email]
3. Password: [strong password]
4. Verify email
5. Login
```

## Step 2: Get API Key (5 min)

```
1. Login to keepa.com
2. Click your username → Settings
3. Left sidebar → API
4. Click "Generate new API key"
5. Copy the key (looks like: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6)
6. Save to secure note: KEEPA_API_KEY = [your key]
```

## Step 3: Verify API Works (10 min)

```bash
# Test in terminal to confirm API key works

curl "https://api.keepa.com/product" \
  -G \
  --data-urlencode "key=YOUR_KEEPA_API_KEY" \
  --data-urlencode "asin=B0BGZS7GGX" \
  --data-urlencode "domain=1" \
  --data-urlencode "stats=90"

# Should return JSON with product data
```

**Save this ASIN for testing later:** B0BGZS7GGX (popular Amazon product)

## Step 4: Add to n8n (5 min)

```
1. Open n8n
2. Settings → Environment Variables
3. Add:
   KEEPA_API_KEY = [your key from Step 2]
   KEEPA_DOMAIN = 1 (Amazon.com)
4. Save
```

---

## Step 5: Add Keepa Node to SnagDeals Workflow (30 min)

### Position in workflow:
```
Existing flow:
  Scrape deals (nodes 1a-1e)
    ↓
  Normalize deals (node 2)
    ↓
  [NEW] Keepa lookup ← ADD HERE
    ↓
  Dedup + expiry filter (node 3)
    ↓
  Rest of workflow
```

### Create "1f. Keepa Price Lookup" Node

**In n8n Workflow:**

```
1. After node "2. Normalize Deals"
2. Click Add Node
3. Search: "HTTP Request"
4. Name: "1f. Keepa Price Lookup"
5. Configuration:

┌─────────────────────────────────────────┐
│ HTTP Request                             │
├─────────────────────────────────────────┤
│ Method: GET                              │
│ URL: https://api.keepa.com/product      │
│                                          │
│ Query Parameters:                        │
│  key    = ${{ env.KEEPA_API_KEY }}      │
│  asin   = ={{$json.asin}}               │
│  domain = 1                              │
│  stats  = 90                             │
│  history = SALES                         │
│                                          │
│ Response Processing:                    │
│  Use Code: ON                            │
│  Code mode: JavaScript                  │
└─────────────────────────────────────────┘
```

### Response Processing Code

**In the HTTP node, Code section:**

```javascript
// Extract Keepa response into useful format
const product = data[0]; // Keepa returns array

if (!product || product.error) {
  return {
    error: true,
    message: "Product not found or API error"
  };
}

// Parse price history
const priceHistory = product.data.csv[0] || []; // Price timeline
const currentPrice = product.current ? product.current[0] : 0;
const listPrice = product.data.csv[2] ? Math.max(...product.data.csv[2].filter(p => p)) : 0;

// Calculate stats
const validPrices = priceHistory.filter(p => p > 0);
const minPrice90d = Math.min(...validPrices);
const maxPrice90d = Math.max(...validPrices);
const avgPrice90d = validPrices.reduce((a,b) => a+b) / validPrices.length;

const priceDropPercent = ((maxPrice90d - currentPrice) / maxPrice90d) * 100;
const priceVsAvg = ((avgPrice90d - currentPrice) / avgPrice90d) * 100;

return {
  asin: product.asin,
  title: product.title,
  category: product.categoryTree ? product.categoryTree[0] : "unknown",
  currentPrice: currentPrice,
  listPrice: listPrice,
  minPrice90d: minPrice90d,
  maxPrice90d: maxPrice90d,
  avgPrice90d: Math.round(avgPrice90d * 100) / 100,
  priceDropPercent: Math.round(priceDropPercent * 10) / 10,
  priceVsAvg: Math.round(priceVsAvg * 10) / 10,
  isGoodDeal: priceDropPercent > 30, // >30% below 90-day max
  salesRank: product.salesRanks ? product.salesRanks[0] : 999999,
  reviews: product.reviews || 0,
  rating: product.rating || 0,
  keepaUrl: `https://www.keepa.com/#!product/1-${product.asin}`,
  amazonUrl: `https://amazon.com/dp/${product.asin}`,
  trackingId: product.asin
};
```

---

## Step 6: Add Filter Node (10 min)

**After Keepa node, filter only good deals:**

```
1. Add Node → Filter
2. Name: "1g. Filter Good Deals (Keepa)"
3. Configuration:

Keep items where:
  - isGoodDeal = true (>30% off)
  - currentPrice > 5 (avoid penny items)
  - currentPrice < 500 (reasonable price)
  - reviews > 50 (established products)

This ensures quality deals
```

---

## Step 7: Update Social Content (15 min)

**Find node: "8. Generate Social Content"**

Add this to the deal text generation:

```javascript
// Add Keepa deal info to caption

const deal = $json;
let caption = deal.caption || "";

// Add price drop info
if (deal.isGoodDeal && deal.priceDropPercent > 0) {
  caption += `\n🏷️ PRICE DROP: ${deal.priceDropPercent}% OFF!`;
  caption += `\n💰 Now: $${deal.currentPrice}`;
  caption += `\n❌ Was: $${deal.maxPrice90d}`;
  caption += `\n📊 90-day low: $${deal.minPrice90d}`;
}

// Add product rating
if (deal.rating > 0) {
  caption += `\n⭐ ${deal.rating}/5 (${deal.reviews} reviews)`;
}

// Add urgency
if (deal.priceDropPercent > 50) {
  caption += `\n🔥 HOTTEST DEAL - Grab now!`;
}

return {
  ...deal,
  caption: caption,
  amazonUrl: deal.amazonUrl // For affiliate link
};
```

---

## Step 8: Test Keepa Integration (15 min)

**In SnagDeals workflow:**

```
1. Open workflow: "SnagDeals v5.1"
2. Find node "1f. Keepa Price Lookup"
3. Click "Test step"
4. Provide test input with ASIN: B0BGZS7GGX
5. Should see:
   - currentPrice
   - minPrice90d
   - priceDropPercent
   - amazonUrl
   - All filled in ✓

6. If error, check:
   - API key correct?
   - ASIN valid?
   - API quota (free tier = 100/day)
```

**Example test output:**
```json
{
  "asin": "B0BGZS7GGX",
  "title": "Echo Dot (5th Gen) with Alexa",
  "currentPrice": 24.99,
  "minPrice90d": 24.99,
  "maxPrice90d": 49.99,
  "priceDropPercent": 50,
  "isGoodDeal": true,
  "amazonUrl": "https://amazon.com/dp/B0BGZS7GGX",
  "reviews": 12000,
  "rating": 4.7
}
```

---

# PHASE 2: Ebook Integration (1.5 Hours)

## Step 1: Add Amazon Books Scraper (30 min)

**Create new node: "1h. Scrape Amazon Books Bestsellers"**

```
1. After node "1f. Keepa"
2. Add Node → HTTP Request
3. Name: "1h. Scrape Amazon Books"
4. Configuration:

Method: GET
URL: https://www.amazon.com/gp/bestsellers/books/

Response Processing:
  Use Code: ON
  Code mode: JavaScript
```

### Scraper Code

```javascript
// Scrape Amazon bestseller books page

const html = data.body;

// Parse bestseller rows
const bookPattern = /<a href="\/dp\/([A-Z0-9]+)"[^>]*>\s*<img[^>]*alt="([^"]+)"[^>]*>/g;
const pricePattern = /\$(\d+\.\d{2})/g;

const books = [];
let match;
const matches = Array.from(html.matchAll(bookPattern));

matches.forEach((m, idx) => {
  const asin = m[1];
  const title = m[2];
  
  // Try to extract price (may not always be available)
  const priceMatch = html.slice(m.index, m.index + 500).match(/\$(\d+\.\d{2})/);
  const price = priceMatch ? parseFloat(priceMatch[1]) : null;
  
  books.push({
    asin: asin,
    title: title,
    price: price,
    category: "ebook", // Tag as ebook
    format: "kindle",
    store: "Amazon",
    source: "amazon-books-bestsellers",
    rank: idx + 1,
    link: `https://amazon.com/dp/${asin}`,
    imageUrl: `https://images-na.ssl-images-amazon.com/images/P/${asin}._SL500_.jpg`,
    discount: 0, // Will be calculated by Keepa
    scrapedAt: new Date().toISOString()
  });
});

// Return books to be processed by Keepa
return books.map(book => ({json: book}));
```

---

## Step 2: Add Smashwords Integration (20 min)

**Create node: "1i. Get Smashwords Free Books"**

```
1. After Amazon Books node
2. Add Node → HTTP Request
3. Name: "1i. Smashwords Free Books"
4. Configuration:

Method: GET
URL: https://www.smashwords.com/books/category/free

Response Processing:
  Use Code: ON
```

### Smashwords Parser Code

```javascript
// Parse Smashwords free books

const html = data.body;

// Extract book links and info
const bookPattern = /<a href="(\/books\/view\/\d+)"[^>]*>([^<]+)<\/a>/g;
const books = [];

let match;
while ((match = bookPattern.exec(html)) !== null) {
  const url = match[1];
  const title = match[2].trim();
  
  // Extract Smashwords ID
  const idMatch = url.match(/view\/(\d+)/);
  const swId = idMatch ? idMatch[1] : null;
  
  books.push({
    title: title,
    url: `https://www.smashwords.com${url}`,
    swId: swId,
    price: 0, // Free on Smashwords
    category: "ebook",
    format: "digital",
    store: "Smashwords",
    source: "smashwords-free",
    imageUrl: `https://images.smashwords.com/images/books/${swId}_300w.jpg`,
    discount: 100, // 100% off = free
    scrapedAt: new Date().toISOString()
  });
}

// Return only first 10 (avoid overwhelming)
return books.slice(0, 10).map(book => ({json: book}));
```

---

## Step 3: Combine Ebook Sources (10 min)

**Add node: "1j. Merge All Books"**

```
1. After Smashwords node
2. Add Node → Merge (n8n built-in)
3. Configuration:

Merge mode: Merge each input
  - Amazon Books (from node 1h)
  - Smashwords (from node 1i)

Output: Combined list of all ebooks
```

---

## Step 4: Update Normalization (10 min)

**Find node: "2. Normalize Deals"**

Add ebook category detection:

```javascript
// Add to normalize function

function categorizeEbook(title) {
  const t = title.toLowerCase();
  
  // Detect ebook categories
  if (/romance|love|dating|relationship/.test(t)) return "romance";
  if (/fantasy|wizard|magic|dragon|scifi|sci-fi|space/.test(t)) return "fantasy";
  if (/mystery|thriller|crime|detective/.test(t)) return "mystery";
  if (/business|marketing|finance|crypto|stock/.test(t)) return "business";
  if (/self-help|psychology|motivation|success/.test(t)) return "self-help";
  if (/horror|scary|paranormal/.test(t)) return "horror";
  if (/education|learning|tutorial|programming/.test(t)) return "education";
  
  return "ebook";
}

// Update each ebook
if (deal.category === "ebook") {
  deal.ebookCategory = categorizeEbook(deal.title);
  deal.tags.push("ebook", deal.ebookCategory);
}

return deal;
```

---

# PHASE 3: Affiliate Integration (1 Hour)

## Step 1: Create Amazon Affiliate Account (15 min)

```
1. Go to: https://affiliate-program.amazon.com
2. Sign up (need Amazon account first)
3. Create Associates account
4. Get your "Tracking ID" (looks like: kirantummala-20)
5. Save: AMAZON_AFFILIATE_ID = [your id]
```

## Step 2: Generate Affiliate Links (10 min)

**Add node: "9-new. Add Affiliate Links"**

```
1. After social content generation
2. Add Node → Function
3. Name: "9a. Generate Affiliate Links"
4. Code:

function buildAffiliateUrl(asin, affiliateId) {
  // Standard format: amazon.com/dp/ASIN?tag=AFFILIATE_ID
  return `https://amazon.com/dp/${asin}?tag=${affiliateId}`;
}

const affiliateId = $secret.AMAZON_AFFILIATE_ID;

// Update deal link
return {
  ...this.json,
  amazonUrl: buildAffiliateUrl(this.json.asin, affiliateId),
  affiliateLink: buildAffiliateUrl(this.json.asin, affiliateId)
};
```

---

## Step 3: Update Social Posts with Affiliate Link (15 min)

**Find node: "10. Prepare Social Posts"**

Update each platform's posting code:

### For TikTok:
```javascript
// In TikTok post body
const caption = `
${deal.discount}% OFF! 🎁

${deal.title}

💰 Price: $${deal.currentPrice}
⭐ Rating: ${deal.rating}/5
🔗 Link in bio

#deals #shopping #AmazonDeals
`;

// Add affiliate URL to bio or description
const bioUrl = deal.affiliateLink; // Points to amazon.com/dp/ASIN?tag=YOUR_ID
```

### For Instagram:
```javascript
const caption = `
🏷️ ${deal.discount}% OFF! 🏷️

${deal.title}

💰 Price: $${deal.currentPrice}
⭐ ${deal.rating}/5 stars (${deal.reviews} reviews)

Link in bio @[your account] 🔗

#deals #shopping #AmazonDeals #AffiliateLinks
`;

// Store affiliate link
const linkUrl = deal.affiliateLink;
```

### For Discord:
```javascript
const embed = {
  title: deal.title,
  description: `${deal.discount}% OFF!`,
  fields: [
    {name: "Current Price", value: `$${deal.currentPrice}`, inline: true},
    {name: "Regular Price", value: `$${deal.maxPrice90d}`, inline: true},
    {name: "Rating", value: `${deal.rating}/5 ⭐`, inline: true},
    {name: "Reviews", value: `${deal.reviews}`, inline: true},
    {name: "Get Deal", value: `[Click Here](${deal.affiliateLink})`}
  ],
  color: 3447003,
  timestamp: new Date()
};
```

### For Twitter/X:
```javascript
const tweet = `
🔥 HOT DEAL: ${deal.title}

💰 $${deal.currentPrice} (was $${deal.maxPrice90d})
📉 ${deal.priceDropPercent}% OFF!
⭐ ${deal.rating}/5 (${deal.reviews} reviews)

Get it: ${deal.affiliateLink}

#DealsOfTheDay #Shopping
`;
```

---

## Step 4: Add Conversion Tracking (20 min)

**Create new node: "12b. Log Affiliate Metrics"**

```
1. After social posts are published
2. Add Node → Supabase
3. Name: "12b. Log Affiliate Clicks"
4. Configuration:

Table: affiliate_links
Columns:
  - id (auto)
  - asin (text)
  - product_title (text)
  - affiliate_url (text)
  - posted_at (timestamp)
  - platforms (array) [tiktok, instagram, discord, etc]
  - expected_reach (number)
  - created_at (timestamp)

Insert code:

INSERT INTO affiliate_links 
  (asin, product_title, affiliate_url, platforms, posted_at)
VALUES 
  ($1, $2, $3, $4, $5);

Parameters:
  $1 = ={{$json.asin}}
  $2 = ={{$json.title}}
  $3 = ={{$json.affiliateLink}}
  $4 = ['tiktok','instagram','discord','twitter'] // platforms posted to
  $5 = NOW()
```

---

# Step 5: Test Full Integration (15 min)

**Run complete SnagDeals workflow:**

```
1. Open "SnagDeals v5.1" workflow
2. Click "Execute Workflow"
3. Wait for completion
4. Check each node:

   ✓ 1f. Keepa - Shows price drops
   ✓ 1h. Amazon Books - Shows ebooks
   ✓ 1i. Smashwords - Shows free books
   ✓ 1j. Merge - Combined list
   ✓ 9a. Generate Affiliate Links - URLs created
   ✓ 10. Social Posts - Include affiliate URLs
   ✓ 12b. Log Metrics - Entries created in DB

5. Verify:
   - Check TikTok @SnagDeals - new deals posted ✓
   - Check Instagram - includes affiliate links ✓
   - Check Discord - embeds working ✓
   - Check one affiliate URL - goes to amazon.com ✓
```

---

# Complete n8n Node Configuration Summary

## Nodes to Add (In Order)

```
After "1e. Scrape RetailMeNot":
├── 1f. Keepa Price Lookup (HTTP Request)
├── 1g. Filter Good Deals (Filter)
├── 1h. Scrape Amazon Books (HTTP Request)
├── 1i. Smashwords Free Books (HTTP Request)
└── 1j. Merge All Books (Merge)

After "8. Generate Social Content":
├── 9a. Generate Affiliate Links (Function)
└── 9b. Add Affiliate Disclosure (Function)

After "11n. Post to Threads":
└── 12b. Log Affiliate Metrics (Supabase)
```

---

# Environment Variables to Add

**In n8n Settings → Environment Variables:**

```
# Keepa
KEEPA_API_KEY = [your key from keepa.com]
KEEPA_DOMAIN = 1

# Amazon Affiliate
AMAZON_AFFILIATE_ID = [your tracking id, e.g., kirantummala-20]

# Existing (already have)
CREATOMATE_API_KEY = [existing]
SUPABASE_KEY = [existing]
SUPABASE_URL = [existing]
```

---

# Expected Results

## Immediate (Day 1-2)
- ✅ Keepa tracking Amazon price drops
- ✅ Ebook deals showing on all platforms
- ✅ Affiliate links embedded in posts
- ✅ 20-30 deals/day with affiliate URLs

## Short Term (Week 1)
- ✅ 100-200 affiliate link clicks
- ✅ 10-30 conversions ($15-90 revenue)
- ✅ Data accumulating in affiliate_links table
- ✅ Analytics showing best performing deals

## Medium Term (Month 1)
- ✅ 1,000+ affiliate link clicks
- ✅ 100-300 conversions ($500-2,000)
- ✅ Clear patterns: best categories, best times
- ✅ A/B testing different deal formats

## Long Term (Quarter 1)
- ✅ $1,500-3,000/mo affiliate revenue
- ✅ Optimized posting times per platform
- ✅ Top performing ebook categories identified
- ✅ 12x engagement from video + affiliate combo

---

# 📊 Revenue Tracking Dashboard (Optional)

**Create Supabase table: affiliate_analytics**

```
Columns:
- date (date)
- platform (text) [tiktok, instagram, discord, twitter, etc]
- links_posted (number)
- estimated_impressions (number)
- actual_clicks (number) - can track with UTM
- conversions (number)
- revenue (decimal)
- cpc (decimal) - cost per click (for Facebook/Google)
- roi (percent)

Query by:
- Date range
- Platform performance
- Product category
- Deal type (books vs electronics)
```

---

# Quick Reference Checklist

### Day 1: Keepa Setup
- [ ] Create Keepa account (10 min)
- [ ] Get API key (5 min)
- [ ] Test API with curl (10 min)
- [ ] Add to n8n environment (5 min)
- [ ] Create Keepa HTTP node (30 min)
- [ ] Add filter node (10 min)
- [ ] Update social content (15 min)
- [ ] Test integration (15 min)
**Total: 2 hours** ✓

### Day 2: Ebook Setup
- [ ] Create Amazon Books scraper (30 min)
- [ ] Add Smashwords scraper (20 min)
- [ ] Merge nodes (10 min)
- [ ] Update categorization (10 min)
**Total: 1.5 hours** ✓

### Day 3: Affiliate Setup
- [ ] Create Amazon affiliate account (15 min)
- [ ] Add affiliate link generator (10 min)
- [ ] Update social posts (15 min)
- [ ] Add conversion tracking (20 min)
- [ ] Full workflow test (15 min)
**Total: 1.5 hours** ✓

---

# Troubleshooting

## Common Issues

**"Keepa API returns 403 error"**
- Check API key is correct
- Free tier: 100 requests/day limit
- Wait until tomorrow or upgrade plan

**"Amazon Books scraper returns empty"**
- Website structure changed (Amazon updates often)
- Try alternate URL
- Fall back to Smashwords feed

**"Affiliate links not working"**
- Check tracking ID format (ends with -20)
- Verify link is amazon.com/dp/ASIN?tag=ID
- Test link in browser

**"No ebook deals showing"**
- Check Smashwords RSS is loading
- Verify Amazon Books page is scraping
- Manual test individual nodes

---

# Next Steps After Integration

1. **Monitor affiliate links** - Check conversions daily
2. **Optimize deals** - Post highest-converting deals first
3. **A/B test categories** - Books vs electronics vs combo
4. **Track by platform** - See which platform converts best
5. **Expand to viral-poster** - Add deal recommendations to Viral project
6. **Create alerts** - Notify when hot deals drop

---

**You're all set! Start with Day 1 today and follow the checklist. 🚀**

Questions on any step? Let me know!
