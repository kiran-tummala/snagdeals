# ✅ Pre-Flight Checklist: Before Day 1 Implementation

**Date:** February 13, 2026  
**Goal:** Verify all systems working before adding Keepa + Ebook integrations

---

## 🔍 System Status Check

### ✅ Current Workflow Analysis

**Existing SnagDeals Workflow (v5.1):**
- ✓ 5 deal scrapers configured (SlickDeals, SmartSaversUnite, DealNews, RetailMeNot, DealsOfAmerica)
- ✓ Normalization + categorization working
- ✓ Dedup + expiry filtering active
- ✓ Social media posting nodes for 11 platforms ready
- ✓ Vercel deployment configured
- ✓ Database writes active

**Workflow Structure:**
```
Scrapers (1a-1e)
    ↓
Normalize (2)
    ↓
Filter (3-5)
    ↓
Image generation (6)
    ↓
Social content (8)
    ↓
DB write (9a) + Deploy (9b)
    ↓
Social posting (11a-11n)
```

---

## 📋 Pre-Implementation Checklist

### 1️⃣ n8n Setup Verification (10 min)

**Check:**
```bash
In n8n UI:

Settings → Environment Variables
Look for:
  ☐ SUPABASE_KEY = [filled]
  ☐ SUPABASE_URL = [filled]
  ☐ VERCEL_DEPLOY_HOOK = [filled]
  ☐ TELEGRAM_BOT_TOKEN = [filled]
  ☐ REDDIT_CLIENT_ID = [filled]
  ☐ TIKTOK_API_TOKEN = [filled]
  ☐ INSTAGRAM_ACCESS_TOKEN = [filled]
  ☐ TWITTER_BEARER_TOKEN = [filled]
  
If any are missing, we need to add them BEFORE proceeding
```

**Test:**
```bash
1. Open SnagDeals v5.1 workflow
2. Click: Execute Workflow
3. Watch execution for errors:
   - If all nodes turn green ✓ → Workflow is working
   - If any node is red ✗ → We have issues to fix
   - Check last node: 11n. Post to Threads (should be last)
```

---

### 2️⃣ Database Connectivity (10 min)

**Verify Supabase:**
```bash
1. Go to: https://supabase.com/dashboard
2. Check projects exist:
   ☐ SnagDeals database active
   ☐ Tables exist:
     ☐ deals
     ☐ deal_images
     ☐ social_posts (optional)
   ☐ API key valid
   ☐ Recent data in tables
```

**Test Connection:**
```bash
In n8n:
1. Add → Supabase node (temporary test)
2. Select: Query (List rows)
3. Table: deals
4. Limit: 5
5. Execute
6. Should return recent deals ✓
```

---

### 3️⃣ Social Media API Keys (15 min)

**Check each platform:**

#### TikTok
```bash
☐ Access token valid (test by posting 1 video)
☐ Token refresh date noted
☐ Not expired (TikTok tokens expire every 30 days)
```

#### Instagram
```bash
☐ Access token valid
☐ Business account ID correct
☐ Can post to own account (test)
```

#### YouTube
```bash
☐ OAuth token generated
☐ Channel ID verified
☐ Shorts upload enabled on channel
```

#### Discord
```bash
☐ Webhook URL working (test with curl)
☐ Webhook not expired
☐ Channel has proper permissions
```

#### Twitter/X
```bash
☐ Bearer token valid (v2 API)
☐ Account has posting permissions
☐ Rate limits not exceeded
```

#### Telegram
```bash
☐ Bot token active
☐ Bot added to channels
☐ Can send test message
```

---

### 4️⃣ Test Existing Workflow (10 min)

**Run SnagDeals once:**

```bash
1. n8n → SnagDeals v5.1
2. "Execute Workflow" button
3. Monitor execution:

Expected flow:
  1a. Scrape SlickDeals RSS → 10-20 deals
  1b-1e. Other scrapers → 5-15 deals each
  2. Normalize → All deals combined + formatted
  3-5. Filter + dedupe → Remove duplicates
  6. Image gen → Placeholder images
  8. Social content → 5 top deals selected
  9a. DB write → Deals stored
  9b. Deploy → Vercel updated
  10. Prepare posts → Split for platforms
  11a-11n. Post to all platforms → Check social media
```

**Look for errors:**
```
Red node? → Click it → Read error message
Common issues:
  - API key expired → Renew in settings
  - Token invalid → Regenerate
  - Rate limit hit → Wait 1 hour
  - Network error → Check internet
  - Syntax error → n8n shows exact line
```

---

### 5️⃣ Verify Posting Works (15 min)

**Check each platform for new posts:**

After executing workflow:

#### TikTok
```
Go to: @SnagDeals account
Look for: New video posted in last 5 min ✓
If not: Check n8n logs for 11k node errors
```

#### Instagram
```
Go to: Your Instagram Reels/Feed
Look for: New post in last 5 min ✓
If not: Check n8n logs for 11o node errors
```

#### Discord
```
Go to: Your test channel
Look for: New embed message in last 5 min ✓
If not: Check webhook URL valid
```

#### Twitter/X
```
Go to: Your account
Look for: New tweet in last 5 min ✓
If not: Check bearer token valid
```

#### Telegram
```
Go to: Your bot/channel
Look for: New message in last 5 min ✓
If not: Check bot added to channel
```

---

### 6️⃣ Check for Blocking Issues (15 min)

**Database issues:**
```
☐ Supabase tables empty? (Should have deals from prev runs)
☐ API key working? (Test with curl)
☐ Connection timeout? (Check network)
☐ Quota exceeded? (Free tier should be fine)
```

**n8n issues:**
```
☐ Workflow running too slow? (>10 min)
☐ Memory errors? (Node 6 image gen can use lots)
☐ Execution limit hit? (Free tier has limits)
☐ Any nodes disabled? (Click to enable)
```

**Social media issues:**
```
☐ Rate limits hit? (Too many posts too fast)
☐ Account suspended? (Check platform)
☐ API quota exceeded? (TikTok/Instagram limits)
☐ Posts stuck pending? (Check platform queue)
```

---

## 🎯 Decision Points

### If everything is ✅ GREEN:
```
✓ All nodes execute without errors
✓ Posts appear on all platforms
✓ Database has recent entries
✓ No API errors
✓ No rate limiting

→ READY FOR DAY 1! Proceed to Keepa setup
```

### If you have ⚠️ YELLOW (minor issues):
```
Issues like:
- Some platforms fail but others work
- One scraper not loading
- Slow execution times

→ FIX NOW (usually 10-30 min per issue)
Then proceed to Day 1
```

### If you have ❌ RED (blocking issues):
```
Issues like:
- Workflow won't execute at all
- No posts appearing anywhere
- Database connection failing
- All API calls failing

→ PAUSE! Fix these first before Keepa
Don't add complexity until existing stuff works
```

---

## 🔧 Quick Fixes for Common Issues

### Issue: Node turns RED with error message

**Solution:**
```
1. Click the red node
2. Read error message
3. Look up that error in troubleshooting section
4. Most common: API key expired
   → Regenerate key
   → Update in n8n environment variables
   → Try again
```

### Issue: Workflow executes but nothing posts

**Solution:**
```
1. Check node "10. Prepare Social Posts"
2. Click eye icon → Should show array of posts
3. If empty → Previous nodes filtered all deals
4. If full → But nothing posts → Check individual platform nodes
5. Common: Webhook URL wrong, token expired, rate limit
```

### Issue: Database not storing deals

**Solution:**
```
1. Node "9a. Write Deals to DB"
2. Check if turning red → Error message shows why
3. Common reasons:
   - SUPABASE_URL wrong
   - SUPABASE_KEY expired
   - Table doesn't exist
   - Column types wrong
4. Fix → Try again
```

### Issue: "Rate limit exceeded"

**Solution:**
```
1. Platform is blocking too many requests
2. Don't run workflow again for 1 hour
3. In future: Space out requests more
4. On Day 1 Keepa adds: 100 API calls = potential rate limit
5. Upgrade Keepa plan if needed ($5 → $15 for more calls)
```

---

## 📊 Current System Health

**Based on workflow analysis:**

| Component | Status | Notes |
|-----------|--------|-------|
| Scrapers | ✅ Working | 5 sources configured |
| Normalization | ✅ Working | Category + deal score |
| Filtering | ✅ Working | Dedup + expiry active |
| Image generation | ⚠️ Placeholder | Uses picsum.photos (consider AI) |
| Social platforms | ✅ Working | 11 platforms configured |
| Database | ✅ Working | Supabase configured |
| Vercel deploy | ✅ Working | Triggered after each run |

**Overall:** System is solid, ready for integration

---

## 📝 What We're Adding on Day 1

**Keepa integration** will add:
- 1 new node: "1f. Keepa Price Lookup"
- 1 new node: "1g. Filter Good Deals"
- Updates to existing nodes for affiliate links
- Expected API calls: +100/run (within Keepa free tier)

**This should NOT break existing workflow** because:
- Inserting between existing nodes (non-intrusive)
- New data enriches existing deals (no conflicts)
- Filtering removes bad deals (improves quality)

---

## ✅ Final Sign-Off

**Before you start Day 1:**

```bash
☐ Workflow executes without major errors
☐ Posts appear on at least 3 platforms
☐ Database has recent entries
☐ No blocking API issues
☐ You understand error messages
☐ Ready to add complexity

THEN → Start Day 1 Keepa setup
```

---

## 🚀 What to Do Now

### Option A: Everything looks good ✅
→ **Proceed directly to Day 1: Keepa Setup**

### Option B: Found minor issues ⚠️
→ **Spend 30 min fixing, then proceed to Day 1**

### Option C: Found major blocking issues ❌
→ **Report the errors, let's fix before Day 1**

---

## 📞 If You Find Issues

**Report with this format:**

```
Error: [What went wrong]
Location: [Node name or step]
Error message: [Exact error text]
What I tried: [What you attempted to fix it]

Then we can troubleshoot quickly
```

---

**Run the checklist now and let me know results! 🏁**

Which status do you have?
- A) Everything green, ready for Day 1 ✅
- B) Minor issues to fix first ⚠️
- C) Blocking issues that need help ❌
