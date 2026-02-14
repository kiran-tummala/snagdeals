# ⚡ Keepa + Ebook: Quick Start (4.5 Hours)

**Your 3-Day Implementation Plan**

---

## DAY 1: Keepa Price Tracking (2 hours)

### 9:00 AM - Keepa Setup (20 min)
```
1. https://keepa.com/register → Sign up
2. Settings → API → Generate key
3. Copy key: KEEPA_API_KEY = [key]
4. Test: curl with sample ASIN B0BGZS7GGX
```

### 9:20 AM - n8n Integration (60 min)
```
1. n8n Settings → Environment Variables
   Add: KEEPA_API_KEY = [your key]
   
2. SnagDeals workflow
   After node "2. Normalize Deals"
   Add HTTP Request node:
   
   Name: 1f. Keepa Price Lookup
   Method: GET
   URL: https://api.keepa.com/product
   
   Query params:
   - key = ${{ env.KEEPA_API_KEY }}
   - asin = ={{$json.asin}}
   - domain = 1
   - stats = 90
   
3. Add Response Code (copy from implementation doc)
4. Add Filter node after Keepa (only good deals)
5. Test with sample ASIN
```

### 10:20 AM - Social Integration (30 min)
```
1. Find "8. Generate Social Content" node
2. Add price drop info to captions:
   - "🏷️ PRICE DROP: 50% OFF!"
   - "💰 Now: $24.99 | Was: $49.99"
   - "📊 90-day low: $24.99"
   - "⭐ 4.7/5 stars (12K reviews)"

3. Test: Execute workflow once
   Check if Keepa node shows green ✓
```

### 11:00 AM - KEEPA LIVE ✅
```
Deals now include:
- Price history (90-day)
- Deal scoring
- Product ratings
- Sales rank
```

---

## DAY 2: Ebook Integration (1.5 hours)

### 9:00 AM - Add Ebook Scrapers (50 min)

#### Amazon Books (30 min)
```
1. Add HTTP Request node
   Name: 1h. Scrape Amazon Books
   Method: GET
   URL: https://www.amazon.com/gp/bestsellers/books/
   
2. Add response code (from implementation doc)
   This extracts bestseller ebooks

3. Test: Check output has books with ASINs
```

#### Smashwords (20 min)
```
1. Add HTTP Request node
   Name: 1i. Smashwords Free Books
   Method: GET
   URL: https://www.smashwords.com/books/category/free
   
2. Add response code (from implementation doc)
   This extracts free ebook deals

3. Test: Check output has 10 free books
```

### 9:50 AM - Merge & Categorize (30 min)
```
1. Add Merge node
   Name: 1j. Merge All Books
   Input: 1h + 1i outputs
   
2. Update "2. Normalize" node
   Add ebook category detection:
   - romance, fantasy, mystery, business, etc
   
3. Test: Execute workflow
   Check merged ebook list with categories
```

### 10:20 AM - EBOOKS LIVE ✅
```
Ebook deals now posting:
- Amazon bestsellers
- Free Smashwords books
- Categorized (romance/fantasy/business/etc)
- Affiliate-ready
```

---

## DAY 3: Affiliate Integration (1 hour)

### 9:00 AM - Affiliate Setup (20 min)
```
1. https://affiliate-program.amazon.com
   Sign up
   Get Tracking ID (e.g., kirantummala-20)
   
2. n8n Environment Variables
   Add: AMAZON_AFFILIATE_ID = [your id]
```

### 9:20 AM - Add Affiliate Links (30 min)
```
1. Add Function node
   Name: 9a. Generate Affiliate Links
   Code: (from implementation doc)
   
   This converts:
   amazon.com/dp/B0123456 
   → amazon.com/dp/B0123456?tag=kirantummala-20

2. Update social posting nodes
   Add affiliate URLs to:
   - TikTok captions
   - Instagram bio link
   - Discord embeds
   - Twitter links
   - Reddit comments
```

### 9:50 AM - Tracking Setup (10 min)
```
1. Add Supabase node
   Name: 12b. Log Affiliate Metrics
   
   This tracks:
   - ASIN posted
   - Affiliate URL
   - Platforms posted to
   - Timestamp
   
2. Test: Execute workflow once
   Check Supabase table for entry
```

### 10:00 AM - AFFILIATE LIVE ✅
```
Revenue streams now active:
- Amazon affiliate (products + books)
- Tracking all conversions
- Revenue visible in dashboard
```

---

## ✅ By Feb 15: Complete Integration

**What's working:**
- ✅ 20-50 deals/day with price tracking
- ✅ 5-10 ebook deals/day
- ✅ All posts include affiliate links
- ✅ Revenue tracking enabled

**Expected revenue by end of week:**
- 500-1000 affiliate link clicks
- 50-200 conversions
- **$75-300 revenue** (can scale to $1.5K/mo)

---

## 🎯 One-Day Quick Reference

### If you only have 1 hour:
**Just do Keepa (highest ROI)**
```
1. Create keepa.com account (10 min)
2. Add to n8n (30 min)
3. Test (20 min)
Result: +$500/mo revenue potential
```

### If you have 3 hours:
**Do Keepa + Ebooks**
```
1. Keepa setup (1 hour)
2. Ebook scrapers (1 hour)
3. Test (1 hour)
Result: +$1.5K/mo revenue potential
```

### If you have 4.5 hours:
**Do everything (FULL)**
```
1. Keepa (2 hours)
2. Ebooks (1.5 hours)
3. Affiliate + tracking (1 hour)
Result: +$3K/mo revenue potential
```

---

## 📋 Copy-Paste Node Checklist

**Keepa Node (HTTP Request):**
```
Method: GET
URL: https://api.keepa.com/product
Params:
  key = ${{ env.KEEPA_API_KEY }}
  asin = ={{$json.asin}}
  domain = 1
  stats = 90
Code: YES (copy from implementation doc)
```

**Amazon Books Node (HTTP Request):**
```
Method: GET
URL: https://www.amazon.com/gp/bestsellers/books/
Code: YES (copy from implementation doc)
```

**Smashwords Node (HTTP Request):**
```
Method: GET
URL: https://www.smashwords.com/books/category/free
Code: YES (copy from implementation doc)
```

**Affiliate Link Node (Function):**
```
Code: YES (copy from implementation doc)
```

---

## 🔑 Environment Variables

Add to n8n Settings → Environment:

```
KEEPA_API_KEY = [from keepa.com]
AMAZON_AFFILIATE_ID = [from affiliate-program.amazon.com]
```

---

## 💰 Revenue Timeline

**Week 1:**
- 100-500 clicks
- $15-150/mo run rate

**Week 2:**
- 500-1000 clicks
- $75-300/mo run rate

**Week 3-4:**
- 2000-5000 clicks
- $300-1500/mo run rate

**Month 2-3:**
- Optimized, ~$1500-3000/mo

---

## ⚠️ Common Mistakes to Avoid

1. ❌ Wrong API key format → Check copy-paste exact
2. ❌ ASIN missing from deals → Scrapers must extract it
3. ❌ Affiliate ID wrong → Double-check format (ends in -20)
4. ❌ Not filtering deals → Too many spam posts
5. ❌ No tracking → Can't measure success

---

## 🆘 If Stuck

**Node not working?**
- Check previous node output (click eye icon)
- Verify all parameters are filled
- Test with manual input

**API key error?**
- Confirm KEEPA_API_KEY environment variable set
- Test in terminal: `echo $KEEPA_API_KEY`
- Free tier may hit 100/day limit

**No ebook deals?**
- Check Amazon Books URL still valid
- Try Smashwords URL in browser
- May need to update selectors if site changed

---

## 📞 Support

- **Keepa Issues:** https://keepa.com/support
- **n8n Help:** https://community.n8n.io
- **Amazon Affiliate:** https://affiliate-program.amazon.com/help
- **Implementation doc:** Keepa-Ebook-Implementation.md (detailed version)

---

**Start Today! Pick a time and let's go 🚀**

Which would you like to tackle first?
- **Keepa only** (1 hour, quick wins)
- **Keepa + Ebooks** (3 hours, best balance)
- **Full integration** (4.5 hours, maximum revenue)

Let me know and I'll guide you step-by-step!
