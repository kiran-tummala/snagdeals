# ⚡ PARALLEL IMPLEMENTATION PLAN: Keepa + Travel (4 Days, Both Simultaneously)

**Goal:** Launch Keepa + Ebooks + Flights + Activities + Hotels in parallel  
**Timeline:** 4 days (Feb 13-16, 2026)  
**Total Effort:** ~8-10 hours (can be split across days)  
**Expected Revenue:** $25-50K/mo by Feb 17

---

## 📋 Overview: Both Tracks Running

Instead of sequential (Keepa → Travel), do them in parallel:

```
Day 1: Setup APIs (Keepa + Kiwi + Viator)
Day 2: Ebooks + Flights nodes
Day 3: Affiliate links + Activities
Day 4: Hotels + Testing + Deploy

Result: All 6 sources live (products, ebooks, flights, hotels, activities)
Revenue: $25-50K/mo from day 1
```

---

## 🎯 DAY 1: API Setup & Account Creation (3 hours)

**Goal:** Have all 3 APIs ready with keys in n8n secrets

### Task 1a: Create Keepa Account (30 min)
```
1. Go to https://keepa.com
2. Sign up (free tier: $5/mo)
3. Get API key from dashboard
4. Copy to n8n Secret: KEEPA_API_KEY
5. Test with 1 request (verify working)
```

**Output:** KEEPA_API_KEY in n8n

---

### Task 1b: Create Kiwi.com Affiliate Account (30 min)
```
1. Go to https://www.kiwi.com/affiliates/
2. Sign up for affiliate program
3. Get affiliate ID (will look like: partner_XXX)
4. Store as n8n Secret: KIWI_AFFILIATE_ID
5. Get Kiwi API key from settings
6. Store as n8n Secret: KIWI_API_KEY
```

**Output:** KIWI_AFFILIATE_ID + KIWI_API_KEY

---

### Task 1c: Create Viator Account (30 min)
```
1. Go to https://www.viatorpartners.com
2. Sign up for partnership program
3. Contact them (chat/email) for API access
4. Get partner ID: partner_XXXX
5. Store as n8n Secret: VIATOR_PARTNER_ID
   (Can use Viator RSS feed as fallback while waiting for API)
```

**Output:** VIATOR_PARTNER_ID

---

### Task 1d: Setup n8n Secrets (30 min)
In n8n go to Settings → Secrets → Add:

```
KEEPA_API_KEY = [your key]
KIWI_API_KEY = [your key]
KIWI_AFFILIATE_ID = [your ID]
VIATOR_PARTNER_ID = [your ID]
AMAZON_AFFILIATE_ID = [existing, use for ebooks]
```

**Output:** All secrets configured in n8n

---

## 🛍️ DAY 2: Ebooks + Flights Nodes (2-3 hours)

**Goal:** Add 3 new data sources: Amazon Books, Smashwords, Kiwi Flights

### Task 2a: Add Amazon Ebooks Node (45 min)
In n8n, after existing node 1e (DealsOfAmerica):

```
NEW NODE 1h: "Scrape Amazon Books"

Type: HTTP Request
URL: https://keepa.com/api/productlist
Method: POST
Body: {
  "key": $secret.KEEPA_API_KEY,
  "domain": "com",
  "category": 1465,  // Books category
  "priceRange": {
    "min": 0,
    "max": 15
  },
  "sales": {
    "min": 100
  },
  "deltaRange": {
    "min": -80  // At least 80% discount
  },
  "format": "json",
  "sort": "SALES",
  "page": 0,
  "limit": 50
}

Transform output:
{
  "title": .data[].title,
  "price": .data[].current_price[0]/100,
  "originalPrice": .data[].msrp,
  "asin": .data[].asin,
  "url": "https://amazon.com/dp/" + .data[].asin,
  "category": "ebook",
  "discount": round(((originalPrice - price) / originalPrice) * 100),
  "source": "amazon-books"
}
```

**Output:** 30-50 ebook deals per fetch

---

### Task 2b: Add Smashwords Node (30 min)
In n8n, after node 1h:

```
NEW NODE 1i: "Scrape Smashwords Free Books"

Type: HTTP Request
URL: https://www.smashwords.com/books/category/all/newest
Method: GET + Parse HTML

Parse for:
- Book title
- Author
- Price (filter: = 0 or free)
- Link
- Category

Transform:
{
  "title": parsed_title,
  "author": parsed_author,
  "price": 0,
  "originalPrice": parsed_price,
  "url": parsed_link,
  "category": "ebook_free",
  "discount": 100,
  "source": "smashwords"
}
```

**Output:** 10-20 free ebook deals

---

### Task 2c: Merge Ebook Sources (15 min)
In n8n, after nodes 1h + 1i:

```
NEW NODE 1j: "Merge All Ebooks"

Type: Merge (combine arrays from 1h + 1i)
Mode: Append
Output: Combined ebook array (50-70 items)
```

---

### Task 2d: Add Kiwi.com Flights Node (45 min)
In n8n, PARALLEL to ebook nodes (after node 1a, alongside 1h):

```
NEW NODE 1k: "Scrape Kiwi Flights"

Type: HTTP Request + Loop

Routes to search:
  LAS → NYC, LAX → MIA, ORD → LAS, DEN → NYC, SFO → HNL

For each route:
  URL: https://api.kiwi.com/v2/search
  Params: {
    "apikey": $secret.KIWI_API_KEY,
    "flyFrom": from_code,
    "flyTo": to_code,
    "dateFrom": "1d",
    "dateTo": "30d",
    "limit": 5,
    "price_from": 1,
    "price_to": 300
  }

Transform output:
{
  "title": `${from_city} → ${to_city} $${price}`,
  "price": .price,
  "route": from_code + to_code,
  "airline": .airlines[0],
  "departure": .dTime,
  "arrival": .aTime,
  "duration_hours": .duration.total / 3600,
  "url": "https://www.kiwi.com/search/results?..." + "?a=" + $secret.KIWI_AFFILIATE_ID,
  "category": "flight",
  "discount": round(((300 - price) / 300) * 100),
  "source": "kiwi"
}
```

**Output:** 15-25 flight deals per fetch

---

## 💳 DAY 3: Affiliate Links + Activities (2-3 hours)

### Task 3a: Add Activities Node (1 hour)
In n8n, after existing nodes:

```
NEW NODE 1l: "Scrape Viator Activities"

Type: HTTP Request

Destinations: NYC, LA, Vegas, Miami, SF, Chicago

For each:
  URL: https://api.viator.com/partnersapi/...
  (Or use Viator RSS feed if API not approved yet)

Transform:
{
  "title": .activity_name,
  "price": .min_price,
  "originalPrice": .typical_price,
  "rating": .review_score,
  "reviews": .review_count,
  "location": .location,
  "url": .partner_url + "?pid=" + $secret.VIATOR_PARTNER_ID,
  "category": "activity",
  "discount": round(((originalPrice - price) / originalPrice) * 100),
  "source": "viator"
}
```

**Output:** 15-25 activity deals

---

### Task 3b: Merge All Sources (15 min)
In n8n:

```
NEW NODE 2x: "Merge All Sources"

Combine:
- Node 2 (normalized products)
- Node 1j (ebooks merged)
- Node 1k (flights)
- Node 1l (activities)

Output: products[] + ebooks[] + flights[] + activities[]
Total: 150-250 deals per run
```

---

### Task 3c: Add Affiliate Link Generator (45 min)
In n8n, before social content generation:

```
NEW NODE 9a: "Add Affiliate Links"

For each deal:
  IF source = 'amazon' or 'amazon-books':
    url = url + "?tag=" + $secret.AMAZON_AFFILIATE_ID
    
  IF source = 'kiwi':
    url = url + "?a=" + $secret.KIWI_AFFILIATE_ID
    
  IF source = 'viator':
    url = url + "?pid=" + $secret.VIATOR_PARTNER_ID

Output: All URLs now include affiliate IDs
```

---

## 🏨 DAY 4: Hotels + Testing + Deploy (2-3 hours)

### Task 4a: Add Hotels Node (1 hour)
In n8n:

```
NEW NODE 1m: "Scrape Agoda Hotels"

Type: HTTP Request

Cities: Vegas, NYC, Miami, LA, SF, Chicago, Phoenix

For each city:
  URL: https://www.agoda.com/search
  Search: check-in=tomorrow, nights=7, rooms=1
  
Transform (via HTML parse or RSS):
{
  "title": hotel_name,
  "price": price_per_night,
  "originalPrice": standard_price,
  "rating": review_rating,
  "reviews": review_count,
  "location": city,
  "url": agoda_link + "?cid=" + $secret.AGODA_AFFILIATE_ID,
  "category": "hotel",
  "discount": round(((originalPrice - price) / originalPrice) * 100),
  "source": "agoda"
}
```

**Output:** 8-12 hotel deals

---

### Task 4b: Merge Hotels + All Sources (10 min)
Update node 2x to include hotels:

```
Merge:
- products[]
- ebooks[]
- flights[]
- activities[]
- hotels[]

Output: 160-270 deals per run
```

---

### Task 4c: Full Workflow Testing (1 hour)
```
Step 1: Run entire workflow (Feb 13, 2pm)
Step 2: Check all nodes turn GREEN (no red errors)
Step 3: Verify each data source has items:
  - Products: 20-30
  - Ebooks: 50-70
  - Flights: 15-25
  - Activities: 15-25
  - Hotels: 8-12
  
Step 4: Check generated content (node 8)
  - Social posts formatted correctly
  - Affiliate links embedded
  - Images/descriptions present
  
Step 5: Manual post to 1 platform (test)
  - Post to Discord channel
  - Verify link works
  - Check affiliate ID in URL
  
Step 6: If all GREEN → Deploy to production
```

---

## 🔧 Environment Variables Needed

Add to n8n Secrets:

```
# APIs
KEEPA_API_KEY = [from Keepa dashboard]
KIWI_API_KEY = [from Kiwi affiliates]
VIATOR_PARTNER_ID = [from Viator partners]
AGODA_AFFILIATE_ID = [from Agoda]

# Existing (already have)
AMAZON_AFFILIATE_ID = [existing]
```

---

## ⚠️ Risk Mitigation (IMPORTANT)

Since you're doing both at once, here are the risks and how to avoid them:

### Risk 1: Too many nodes breaking workflow
**Mitigation:** 
- Test each node individually before adding next
- Keep old workflow backup (export as JSON)
- Add nodes in this order: Keepa → Kiwi → Ebooks → Activities → Hotels

### Risk 2: API rate limits
**Mitigation:**
- Keepa: 10K requests/month (free) - you'll use ~300/month ✅
- Kiwi: Free tier has limits - use smart caching (2-4 hour cache)
- Viator: Contact for API - use RSS feed as backup
- Agoda: Scrape carefully (every 6 hours max)

### Risk 3: Data quality issues
**Mitigation:**
- Add filtering BEFORE social posting
- Price must be < threshold
- Flights must be < 30 days out
- Hotels must have rating > 3.5
- Activities must have rating > 4.0

### Risk 4: Affiliate link breakage
**Mitigation:**
- Test each affiliate URL manually before deploy
- Use UTM parameters: url + "?utm_source=snagdeals&utm_campaign=travel"
- Monitor affiliate dashboards for tracking issues

---

## 📊 Expected Timeline & Revenue

### Day 1 (Feb 13)
- 3 hours: Account setup + API keys
- **Result:** All APIs ready, n8n secrets configured
- **Revenue:** $0 (setup only)

### Day 2 (Feb 14)
- 2-3 hours: Add Keepa ebooks + Kiwi flights nodes
- **Result:** Workflow has 6 data sources
- **Revenue:** Not yet live (testing only)

### Day 3 (Feb 15)
- 2-3 hours: Add activities + affiliate links
- **Result:** Full workflow ready
- **Revenue:** Still testing

### Day 4 (Feb 16)
- 2-3 hours: Add hotels + full testing + deploy
- **Result:** All 6 sources live and posting
- **Revenue:** First conversions (small)

### Week 2 (Feb 17-23)
- **Revenue:** $200-500/day = $1,400-3,500/week = $5-15K/mo
- (Ramps up as social media followers grow)

### Month 1 (Feb)
- **Revenue:** $5-10K/mo
- (Lower due to partial month + slow social growth)

### Month 2+ (March+)
- **Revenue:** $25-50K/mo
- (Full month + social following built up)

---

## ✅ Checklist: Before You Start

- [ ] You have all API keys (Keepa, Kiwi, Viator, Agoda)
- [ ] You have affiliate IDs (Amazon, Kiwi, Viator, Agoda)
- [ ] n8n is running and accessible
- [ ] You have backup of current workflow (export as JSON)
- [ ] You have 8-10 hours available (spread across 4 days)
- [ ] You can test workflow mid-way
- [ ] Discord webhook working (for testing posts)

---

## 🎯 What You Do Now

**Option 1: Start Today (Feb 13)**
- Do Day 1 right now (3 hours)
- Days 2-4 tomorrow through day-after-tomorrow
- Go live Feb 16

**Option 2: Start Tomorrow (Feb 14)**
- All 4 days happen Feb 14-17
- Go live Feb 17

**Which works better for your schedule?** 👇
