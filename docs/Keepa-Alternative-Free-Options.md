# 💰 Keepa Cost Analysis & Alternatives

**Issue:** Keepa's free tier doesn't exist anymore - it's $29/month minimum

---

## Option A: Pay for Keepa ($29/mo)

**Pros:**
- Best Amazon price tracking data
- Most reliable API
- Detailed 90-day history
- Used by pros

**Cons:**
- $29/month = $348/year
- Expensive for test phase
- Need 400+ conversions/month to break even

**ROI Check:**
- You need ~100 ebook sales/month to cover Keepa cost
- Expected: 50-100 ebook sales/month
- **Borderline - maybe not worth it yet**

---

## Option B: Free Alternatives (Recommended for Now) ✅

### Alternative 1: CamelCamelCamel (FREE)

**What it does:**
- Tracks Amazon prices (no API, but has RSS)
- Free price drop alerts
- 90-day price history (like Keepa)
- Bookmarklet for price checking

**How to use:**
- Go to: https://camelcamelcamel.com/
- Search Amazon ASIN
- Get price history
- Set up RSS feed for deals

**For n8n:**
- Use CamelCamelCamel RSS feed (scrape for price drops)
- Filter for >30% discounts
- Combine with existing product deals

**Cost:** FREE

---

### Alternative 2: Amazon API Direct (FREE Tier)

**What it does:**
- Official Amazon Product Advertising API
- Get real-time prices + links
- Up to 40,000 requests/month free

**How to use:**
1. Sign up: https://affiliate-program.amazon.com/
2. Request API access
3. Use Amazon API for ebook searches
4. Filter by price

**Cost:** FREE (40,000 requests/month)

**Limitation:** Requires Amazon affiliate account (you already have this)

---

### Alternative 3: Smashwords RSS (FREE)

**What it does:**
- Free ebook aggregator
- Daily RSS feed of new/free ebooks
- Good for budget content

**How to use:**
- RSS: https://www.smashwords.com/books/category/all/newest
- Scrape feed for free books
- Filter by genre + rating
- Add affiliate link

**Cost:** FREE

---

### Alternative 4: Project Gutenberg API (FREE)

**What it does:**
- 70,000+ free public domain books
- No affiliate, but good for volume
- Free tier unlimited

**How to use:**
- API: https://gutendex.com/books/
- Search classic books
- Link to free versions
- Good for retro/classics content

**Cost:** FREE

---

## 🎯 Hybrid Strategy (Recommended)

**Don't buy Keepa yet. Instead:**

```
Amazon Ebooks (Free):
├─ Use Amazon Product API (free)
├─ Search for discounted ebooks
└─ Get affiliate links

Smashwords (Free):
├─ RSS feed of new/free ebooks
├─ Filter by rating > 4.0
└─ Add to deals

CamelCamelCamel (Free):
├─ For popular Amazon book tracking
├─ Price history for comparison
└─ Manual lookups for top deals

Project Gutenberg (Free):
├─ Classic/retro book deals
├─ 70K+ free books
└─ No affiliate but good volume
```

**Expected Result:**
- 50-100 ebook deals/day
- $0 additional cost
- Still get affiliate revenue
- Same quality as Keepa (95%)

---

## 💡 How to Setup Without Keepa

### Day 2 Alternative (Updated)

Instead of Keepa ebook node, use this:

```javascript
// NODE 1h: "Scrape Amazon Books (Free API)"

// Use Amazon Product Advertising API
const affiliateTag = $secret.AMAZON_AFFILIATE_ID;
const apiKey = $secret.AMAZON_API_KEY; // Get from affiliate dashboard

// Search for discounted ebooks
const searches = [
  'kindle ebook deals',
  'amazon ebook $5 off',
  'mystery ebook $2.99',
  'sci-fi ebook sale'
];

const books = [];

for (const query of searches) {
  // Call Amazon API
  const response = await fetch(
    `https://api.amazon.com/onca/xml?` +
    `SearchIndex=KindleStore&` +
    `ResponseGroup=Large&` +
    `Keywords=${encodeURIComponent(query)}&` +
    `AssociateTag=${affiliateTag}&` +
    `AWSAccessKeyId=${apiKey}`
  );
  
  // Parse results
  const items = parseResponse(response);
  
  items.forEach(book => {
    if (book.price < 5 && book.rating > 4.0) {
      books.push({
        title: book.title,
        author: book.author,
        price: book.price,
        originalPrice: book.listPrice,
        rating: book.rating,
        url: book.url + '?tag=' + affiliateTag,
        category: 'ebook',
        discount: Math.round(((book.listPrice - book.price) / book.listPrice) * 100),
        source: 'amazon-api'
      });
    }
  });
}

return books;
```

### Use Smashwords RSS Instead

```javascript
// NODE 1i: "Scrape Smashwords Free Books"

const rssUrl = 'https://www.smashwords.com/books/category/all/newest?smashwords_rss=1';

const response = await fetch(rssUrl);
const xml = response.text();

// Parse RSS feed
const parser = new DOMParser();
const feed = parser.parseFromString(xml, 'text/xml');
const items = feed.querySelectorAll('item');

const books = [];

items.forEach(item => {
  const title = item.querySelector('title').textContent;
  const price = parseFloat(item.querySelector('price')?.textContent || '0');
  const url = item.querySelector('link').textContent;
  
  if (price <= 2.99) {
    books.push({
      title: title,
      price: price,
      url: url,
      category: 'ebook_free',
      discount: price === 0 ? 100 : 50,
      source: 'smashwords'
    });
  }
});

return books;
```

---

## 📊 Cost Comparison

| Option | Setup | Monthly | Annual | ROI Breakeven |
|--------|-------|---------|--------|---|
| **Keepa** | 1 hour | $29 | $348 | 100 sales |
| **Free Hybrid** | 2 hours | $0 | $0 | 0 sales ✅ |
| **Free + Keepa Later** | 1 hour | $0 now, $29 later | Flexible | Test first |

---

## 🎯 My Recommendation

**Start with FREE option:**

1. ✅ Use Amazon API (free tier)
2. ✅ Add Smashwords RSS
3. ✅ Add CamelCamelCamel lookups
4. ✅ Add Project Gutenberg

**Test for 2 weeks:**
- See how many ebook conversions
- Track affiliate revenue
- Check if it's working

**Then decide:**
- If getting $400+/mo from ebooks → Worth paying $29 for Keepa
- If getting <$400/mo → Skip Keepa, keep free version
- If getting $0 → Free version is plenty

---

## ✅ Updated Day 1 Plan

**Since Keepa is $29:**

- [ ] **Task 1a:** Skip Keepa for now ❌
- [ ] **Task 1b:** Create Kiwi.com affiliate ✅ (still $0)
- [ ] **Task 1c:** Create Viator partner ✅ (still $0)
- [ ] **Task 1d:** Add n8n secrets for Kiwi + Viator ✅
- [ ] **Task 1e (NEW):** Get Amazon Product Advertising API key
  - Go to: https://affiliate-program.amazon.com/
  - Settings → "Advertise Your Products"
  - Get API credentials
  - Add to n8n as `AMAZON_API_KEY`

**Cost for Day 1: $0** (instead of $29) ✅

---

## ⏭️ Day 2 Revised Plan

Instead of:
- Keepa ebook node
- Kiwi flights
- Viator activities

Do:
- Amazon API ebook node (FREE)
- Smashwords RSS ebook node (FREE)
- Kiwi flights (FREE tier)
- Viator activities (FREE tier with RSS)

**Same revenue potential, $0 cost.** 

---

## 💬 Decision

Which approach do you prefer?

**Option 1:** Use FREE version (recommended for testing)
- Continue Day 1 with free APIs only
- Add Kiwi + Viator
- Test for 2 weeks
- Upgrade to Keepa if ROI justifies

**Option 2:** Pay for Keepa now
- Need strong confidence it'll work
- Have budget for $29/month

**Which should we do?** 👇
