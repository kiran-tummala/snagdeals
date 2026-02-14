# 📚 Ebooks + Amazon Price Tracking Integration Guide

## Your Current Setup

**3 Projects:**
- SnagDeals (deals aggregation - Amazon, Walmart, retail)
- Viral-Poster (social content generation)
- Stock-Crypto-Analyzer (financial data)

**Current SnagDeals sources:**
- SlickDeals RSS
- SmartSaversUnite (HTML scrape)
- DealNews RSS
- RetailMeNot
- DealsOfAmerica

---

## 🎯 Integration Opportunities

### Which Projects Benefit?

| Project | Opportunity | Benefit | Revenue Impact |
|---------|-------------|---------|-----------------|
| **SnagDeals** | Amazon + CamelCamelCamel | Price drop alerts | $500-2K/mo (affiliate) |
| **SnagDeals** | Ebook deals (Amazon Books, Smashwords, BookBaby) | Free/discount books | $200-500/mo (affiliate) |
| **Viral-Poster** | Trending ebooks (bestseller lists) | Viral book recommendations | $100-300/mo (affiliate) |
| **Stock-Crypto** | Ebook bundles (finance/trading books) | Cross-promotion | $50-150/mo (affiliate) |

---

## 1️⃣ AMAZON PRICE TRACKING (CamelCamelCamel Integration)

### What is CamelCamelCamel?
- **Free service:** Tracks Amazon price history
- **API:** NOT officially available, but we have options:
  - Camel Camel Camel RSS feeds
  - Keepa API ($5-20/mo, better)
  - CamelCamelCamel HTML scraping (free, unstable)
  - Jungle Scout API (expensive)

### Best Option: **Keepa API** ($5-20/mo)

**Why Keepa:**
- Official API (most reliable)
- Price history tracking
- Deal detection
- ASIN lookup
- Works with n8n easily

**Keepa Pricing:**
- Free tier: 100 requests/day
- Starter: $5/mo (500 req/day)
- Pro: $15/mo (3000 req/day) ← Good for you

**Setup:**

```
1. https://keepa.com → Register account
2. Settings → API Keys → Generate key
3. Save: KEEPA_API_KEY = [your key]
```

### Keepa Integration in SnagDeals

**Flow:**
```
SnagDeals Deals (with ASIN)
    ↓
Keepa API (lookup price history)
    ↓
Detect price drops (>30% discount)
    ↓
Post to: TikTok, Instagram, Discord
    ↓
Affiliate link: amazon.com/?tag=YOUR_AFFILIATE
    ↓
Revenue: $0.50-2.00 per click conversion
```

**n8n Node Code:**

```javascript
// NEW NODE: "Lookup Keepa Price History"

// Input: ASIN from deal
const asin = $json.asin; // e.g., "B0123456789"
const apiKey = $secret.KEEPA_API_KEY;

// Call Keepa API
const response = await fetch(`https://api.keepa.com/product`, {
  params: {
    key: apiKey,
    asin: asin,
    domain: 1, // 1 = Amazon.com
    stats: 90, // Last 90 days
    history: 'SALES,OFFERS'
  }
});

const product = response.json();

// Extract useful data
return {
  asin: asin,
  title: product.title,
  currentPrice: product.current[0],
  minPrice: Math.min(...product.data.csv[0]), // 90-day low
  maxPrice: Math.max(...product.data.csv[0]), // 90-day high
  priceDropPercent: ((currentPrice - minPrice) / maxPrice * 100),
  trackingUrl: `https://www.keepa.com/#!product/1-${asin}`,
  amazonUrl: `https://amazon.com/dp/${asin}?tag=YOUR_AFFILIATE`,
  isGoodDeal: priceDropPercent > 30, // More than 30% below average
  dealScore: priceDropPercent * product.reviews_count // Quality metric
};
```

**Expected Data per product:**
- Current price vs 90-day average
- Price trend (rising/falling)
- Sales rank change
- Buy box competitor count
- Reviews + rating

### SnagDeals + Keepa Combined Workflow

**New nodes to add:**

```
Node 1a: Scrape Amazon bestsellers (existing)
    ↓
Node 1e-new: Keepa lookup for each product
    ↓
Node 2-new: Filter only price drops >30%
    ↓
Node 3-new: Calculate deal score (quality metric)
    ↓
[Existing nodes: normalization, dedup, social posting]
    ↓
Post to all 16 platforms with:
  - Current price
  - 90-day low/high
  - Affiliate link
  - "Best price in 90 days!" label
```

### Amazon Affiliate Program Integration

**Setup:**
```
1. Join: https://affiliate-program.amazon.com
2. Get your Affiliate ID (tracking ID)
3. Create affiliate links:
   https://amazon.com/dp/B0123456789?tag=YOUR_AFFILIATE_ID

Example:
   Normal: amazon.com/dp/B0123456789
   Affiliate: amazon.com/dp/B0123456789?tag=kirantummala-20
```

**Revenue Model:**
- Electronics: 3-7% commission
- Books: 3% commission
- Whole Foods: 5% commission
- **Average: $0.50-2.00 per conversion**
- Need 1-5 conversions/day to make money

**Monthly projection with SnagDeals:**
```
Deals posted/day: 20
Click-through rate: 5-10% (1-2 clicks per deal)
Conversion rate: 10-20% (of clickers)
Avg commission: $1.50

Daily: 20 × 7.5% × 15% × $1.50 = $34/day
Monthly: $1,020/mo
With 4 projects: $4,000+/mo
```

---

## 2️⃣ EBOOK DEALS INTEGRATION

### Ebook Deal Sources

| Source | Type | API | Cost | Best For |
|--------|------|-----|------|----------|
| **Amazon Books API** | Official | Rate limited | FREE | Primary ebook source |
| **Smashwords** | Indie books | RSS feed | FREE | Indie/self-published |
| **BookBaby** | Indie books | RSS feed | FREE | Print + digital |
| **Project Gutenberg** | Free classics | HTML scrape | FREE | Evergreen content |
| **BookRabbit** | Deal alerts | RSS | FREE | Curated book deals |
| **Freebooksy** | Free ebooks | RSS | FREE | Daily free ebooks |
| **Fussy Librarian** | Newsletter API | Manual | FREE | Trending books |

### Best Strategy: Multi-Source Ebook Scraper

**Recommended setup:**

```
PRIMARY (Amazon Books):
- Monitor Amazon bestseller lists
- Track books with >30% discount
- Get book metadata (cover, description, reviews)

SECONDARY (Smashwords + BookBaby):
- Free/discounted indie ebooks
- Self-published deals
- Niches (sci-fi, romance, fantasy)

TERTIARY (Free sources):
- Project Gutenberg classics
- Open Library
- Scribd free previews
```

### n8n Implementation

**Add to SnagDeals workflow:**

```javascript
// NEW NODE: "1f. Scrape Amazon Books Bestsellers"

const amazonBooksUrl = "https://www.amazon.com/Amazon-Best-Sellers-Books/zgbs/books";

// Scrape bestseller page
const html = await fetch(amazonBooksUrl).then(r => r.text());

// Parse bestsellers
const deals = [];
const rows = html.matchAll(/<span class="aok-inline-block">([^<]+)<\/span>/g);

for (const [_, title] of rows) {
  const priceMatch = title.match(/\$(\d+\.\d{2})/);
  const price = priceMatch ? parseFloat(priceMatch[1]) : 0;
  
  deals.push({
    title: title,
    price: price,
    category: 'ebook',
    format: 'kindle', // or 'paperback', 'hardcover'
    store: 'Amazon',
    source: 'amazon-bestsellers',
    link: `https://amazon.com/...`,
    imageUrl: `...`,
    discount: calculateDiscount(price),
    scrapedAt: new Date().toISOString()
  });
}

return deals.map(d => ({json: d}));
```

### Ebook-Specific Social Media Content

**TikTok ideas:**
- "Top 10 Books this week" 2-min videos
- "Best discounted ebooks" carousel
- Book review clips (AI narrator)
- "What should I read?" polls

**Discord ideas:**
- Daily book deals in #book-deals channel
- Genre-specific (sci-fi, romance, business)
- Trending books discussion
- Free ebook alerts

**Instagram ideas:**
- Book aesthetic images
- "Ebook of the day" carousel
- Trending bookish quotes
- Author recommendations

**Revenue from ebooks:**
- Amazon affiliate: $0.30-1.00 per book
- Smashwords affiliate: 0-25% commission
- **Expected: $100-500/mo with SnagDeals reach**

---

## 3️⃣ COMBINED: Price Tracker + Ebook Project

**Suggested new project: "DealBooks"**

```
Combines SnagDeals + Viral-Poster + Ebooks

Daily content:
- Amazon price drops (electronics, books, etc)
- Trending ebook deals
- Free book alerts
- Best-selling books this week

Posting schedule:
- Every 1 hour to TikTok, Instagram
- Every 2 hours to Twitter, Reddit
- Daily digest to Discord, Telegram

Revenue streams:
1. Amazon affiliate (products + books)
2. Smashwords affiliate (indie ebooks)
3. Audible referral (audiobooks)
4. Sponsored book promotions

Monthly revenue target: $2,000-5,000
```

---

## 🔧 Implementation Plan (Quick)

### PHASE 1: Amazon Price Tracking (2 hours)

**Step 1: Get Keepa API Key (5 min)**
```
1. https://keepa.com/register
2. Create account
3. Settings → API
4. Generate key
5. Save: KEEPA_API_KEY = [key]
```

**Step 2: Add Keepa node to n8n (30 min)**
```
In SnagDeals workflow:
1. Add node after "Normalize deals"
2. Name: "1e-keepa. Lookup Amazon price history"
3. Type: HTTP Request
4. Method: GET
5. URL: https://api.keepa.com/product
6. Params:
   - key: ${{ env.KEEPA_API_KEY }}
   - asin: ${{ $json.asin }}
   - domain: 1
7. Parse response
8. Filter deals >30% discount
```

**Step 3: Update social posts (15 min)**
```
Add to caption:
- "Best price in 90 days! 🏷️"
- Current price vs average
- Link with affiliate tag
```

**Step 4: Test (10 min)**
```
Execute workflow
Check Keepa node
Verify affiliate links
Check one social platform
```

**Result:** Amazon price tracking + affiliate revenue

---

### PHASE 2: Ebook Integration (1.5 hours)

**Step 1: Add ebook sources (20 min)**
```
Add new node: "1f. Scrape Amazon Books Bestsellers"
Type: HTTP Request
URL: https://www.amazon.com/Amazon-Best-Sellers-Books/zgbs/books

Add connections:
- Parse bestseller rankings
- Extract prices
- Filter discounted books
```

**Step 2: Create "ebook" category (10 min)**
```
In normalization node:
Add: if title.includes('kindle') → category = 'ebook'
```

**Step 3: Ebook-specific posts (15 min)**
```
Update social content for books:
- "New ebook alert! 📚"
- Title + author + price
- Category (romance, sci-fi, business, etc)
- Affiliate link
```

**Step 4: Test (15 min)**
```
Execute
Check ebook posts
Verify book metadata displays correctly
Test affiliate links
```

**Result:** Ebook deals to all 16 platforms

---

### PHASE 3: Optimize (1 hour)

**Deal scoring (30 min):**
```
Score = (discount% × popularity × reviews) / price
Only post "hot deals" (score >50)
Prevents spam, increases engagement
```

**Template update (15 min):**
```
Update Creatomate videos:
- Add book cover images for ebooks
- Green price badges for price drops
- "Best price!" label for price lows
```

**Testing (15 min):**
```
Run full workflow
Check 5+ deals posting
Verify affiliate links
Test video generation with books
```

---

## 💰 Revenue Breakdown

### Current (Without Keepa + Ebooks)
```
SnagDeals: $300-500/mo
No affiliate revenue
```

### With Keepa (Price tracking)
```
SnagDeals: $300-500/mo (existing)
+ Amazon affiliate: $500-2,000/mo
TOTAL: $800-2,500/mo
```

### With Ebooks (Keepa + Books)
```
SnagDeals: $500-800/mo (books + deals)
+ Amazon affiliate: $1,000-2,500/mo (both)
+ Smashwords: $100-300/mo (indie)
TOTAL: $1,600-3,600/mo
```

### With All 3 Projects + Ebooks
```
SnagDeals: $1,200/mo (deals + books + affiliate)
Viral-Poster: $400/mo (book trends + recommendations)
Stock-Crypto: $200/mo (finance book deals)
TOTAL: $1,800+/mo
```

---

## 🚀 Implementation Timeline

**Day 1 (Feb 13):** Phase 1 - Keepa integration
- 2 hours work
- +$500/mo revenue potential

**Day 2 (Feb 14):** Phase 2 - Ebook integration  
- 1.5 hours work
- +$800/mo revenue potential

**Day 3 (Feb 15):** Phase 3 - Optimization
- 1 hour work
- +$200/mo improvement

**Total investment: 4.5 hours → $1,500+/mo additional revenue**

**ROI: $1,500 ÷ 4.5 hours = $333/hour** ✅

---

## 📋 Complete Integration Checklist

### Pre-Integration
- [ ] SnagDeals workflow running with videos ✓ (from 4-DAY-PLAN)
- [ ] All products have ASIN codes
- [ ] Amazon affiliate account created

### Keepa Setup
- [ ] Register at keepa.com
- [ ] Get API key
- [ ] Test API with sample ASIN
- [ ] Add to n8n environment variables
- [ ] Create HTTP Request node
- [ ] Test with 5 products
- [ ] Integrate with SnagDeals workflow
- [ ] Verify affiliate links working

### Ebook Integration
- [ ] Set up Amazon Books scraper
- [ ] Add Smashwords RSS feed
- [ ] Create ebook category in normalization
- [ ] Update social templates for books
- [ ] Test with 5 book deals
- [ ] Deploy to all 16 platforms
- [ ] Monitor engagement on book posts

### Optimization
- [ ] Calculate deal scoring algorithm
- [ ] Set quality thresholds
- [ ] Update Creatomate templates
- [ ] A/B test book post formats
- [ ] Track affiliate conversions
- [ ] Adjust posting frequency

---

## ⚠️ Important Notes

**CamelCamelCamel Limitation:**
- CamelCamelCamel doesn't have official API
- HTML scraping is unreliable (site changes break it)
- Keepa is better investment ($5/mo)
- Alternative: Jungle Scout, but $100/mo (too expensive)

**Amazon Affiliate:**
- Need to generate $3+ in revenue first 180 days
- Links must be in disclosure (FTC rule)
- Can't post to own sites (only to customers)
- Commission varies by category (books = 3%)

**Ebook Affiliate:**
- Amazon Books: 3% commission
- Smashwords: 0-25% (via affiliate program)
- Audible: $5 sign-up bonus
- Higher margins on indie books

---

## 🎯 Recommended Path Forward

### Option A: Quick Win (Keepa only)
- 2 hours setup
- +$500-1,000/mo revenue
- Works with existing SnagDeals

### Option B: Complete (Keepa + Ebooks)
- 4.5 hours total setup
- +$1,500-3,000/mo revenue
- New revenue stream
- **RECOMMENDED** ✅

### Option C: Advanced (Create "DealBooks" project)
- Separate project just for ebook/book deals
- 6 hours setup + 2x daily posting
- $2,000-5,000/mo potential
- More work to maintain

---

**Which would you like to implement?**

A) Just add Keepa to SnagDeals (quick money)  
B) Full ebook integration (best ROI)  
C) Create separate "DealBooks" project (ambitious)  

Let me know and I'll create the exact n8n code! 🚀
