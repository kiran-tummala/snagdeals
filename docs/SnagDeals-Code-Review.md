# 🏷️ SnagDeals — Complete Code Review & Audit

## ✅ Overall Verdict: Solid Foundation, Needs API Key Setup

Your SnagDeals project is well-architected with good separation of concerns. The code is functional and well-structured. Below are the issues found, grouped by severity.

---

## 🔴 Critical Issues (Must Fix Before Launch)

### 1. Frontend ↔ API Field Name Mismatch

**File:** `snagdeals.jsx` (line 851)

When the frontend fetches live deals from the API, it maps to **wrong field names** that don't match what the API actually returns.

| Frontend expects (line 851) | API actually returns (02-api-server.js) |
|---|---|
| `d.store_name` | `d.store` |
| `d.current_price` | `d.price` |
| `d.discount_pct` | `d.off` |
| `d.vote_score` | `d.votes` |
| `d.time_ago` | `d.time` |
| `d.comment_count` | `d.comments` |
| `d.shipping_text` | `d.ship` |
| `d.alt_prices` | *(not returned)* |

**Impact:** When you connect to the live API, **all deal data will show as defaults/zeros** — "$0", "Store", "0 votes", etc. The hardcoded fallback works fine, but live mode is broken.

**Fix needed in snagdeals.jsx line 851** — update the field mapping to match the API response:
```javascript
// Change from:
store: d.store_name || 'Store'
// Change to:
store: d.store || 'Store'

// And similarly for all mismatched fields
```

### 2. Reddit OAuth Token Will Expire

**File:** `n8n-social-posting-v5.json` → node "11j. Post to Reddit"

The Reddit node uses a static `Bearer YOUR_REDDIT_TOKEN` in the header. Reddit OAuth tokens expire after **1 hour**. You need a token refresh workflow.

**Fix:** Add an n8n node before the Reddit post that:
1. Uses your `client_id` + `client_secret` to request a new token
2. Passes the fresh token to the Reddit post node

### 3. All 22 Placeholder API Keys Need Replacing

These `YOUR_*` placeholders across the n8n workflow **must be replaced** with real credentials:

| Platform | Placeholders | How to Get |
|---|---|---|
| **Telegram** | `YOUR_TELEGRAM_CHANNEL_ID` | Message @BotFather → /newbot → create channel → add bot as admin |
| **Reddit** | `YOUR_REDDIT_TOKEN` | reddit.com/prefs/apps → create "script" app |
| **Facebook Page** | `YOUR_PAGE_ID`, `YOUR_FB_PAGE_ACCESS_TOKEN` | Meta Business Suite → Page Settings |
| **Facebook Group** | `YOUR_GROUP_ID`, `YOUR_FB_GROUP_ACCESS_TOKEN` | Meta Developer Portal |
| **Twitter/X** | `YOUR_TWITTER_BEARER_TOKEN` | developer.twitter.com → App Settings |
| **Instagram** | `YOUR_IG_BUSINESS_ACCOUNT_ID`, `YOUR_IG_ACCESS_TOKEN` | Meta Developer → Instagram Graph API |
| **WhatsApp** | `YOUR_WHATSAPP_TOKEN`, `YOUR_WHATSAPP_PHONE_ID`, `YOUR_CHANNEL_ID` | Meta Business → WhatsApp API |
| **Pinterest** | `YOUR_PINTEREST_TOKEN`, `YOUR_BOARD_ID` | developers.pinterest.com |
| **TikTok** | `YOUR_TIKTOK_TOKEN` | developers.tiktok.com |
| **LinkedIn** | `YOUR_LINKEDIN_TOKEN`, `YOUR_PERSON_ID` | linkedin.com/developers |
| **Threads** | `YOUR_THREADS_TOKEN`, `YOUR_THREADS_USER_ID` | Meta Developer Portal |
| **Vercel** | `YOUR_DEPLOY_HOOK_ID` | Vercel Dashboard → Settings → Git → Deploy Hooks |

---

## 🟡 Medium Issues (Fix Soon)

### 4. Reddit Posts as "Link" but Body Contains Self-Text

**File:** `n8n-social-posting-v5.json` → node "11j"

The Reddit node sends `kind=link` but the content generator also creates `redditBody` (self-text markdown). The body field is **never sent** in the API call — only the title and URL are posted. The `redditBody` content is wasted.

**Fix:** Either:
- Change to `kind=self` and include `text={{$json.redditBody}}` in the body (for self-posts with discussion)
- Or keep as `kind=link` (which is fine for deal links) and just know that `redditBody` is unused

### 5. Reddit Hardcoded to Only r/deals

The Reddit node only posts to `sr=deals`. Your growth strategy mentions r/DealsReddit, r/frugal, r/buildapcsales, r/AmazonDeals.

**Fix:** Add multiple Reddit post nodes targeting different subreddits, OR use a Code node to iterate through subreddits. Be careful of Reddit's rate limits (~10 posts/day).

### 6. No Error Handling on Social Media Nodes

If any social platform returns an error (rate limit, expired token, etc.), the entire workflow could fail. Only Facebook, Twitter, and Telegram are connected to the "12. Log Social Posts" node. Reddit, Pinterest, TikTok, LinkedIn, WhatsApp, and Threads results are **not logged**.

**Fix:** Connect all social posting nodes (11j through 11n) to the "12. Log Social Posts" node.

### 7. SQL Injection Risk in API Search

**File:** `02-api-server.js` (line 80)

```javascript
query = query.or(`title.ilike.%${search}%,store.ilike.%${search}%`);
```

The `search` parameter is interpolated directly into the Supabase filter string. While Supabase's client library provides some protection, it's safer to sanitize the input.

**Fix:** Sanitize the search input:
```javascript
const cleanSearch = search.replace(/[%_\\]/g, '\\$&'); // escape wildcards
```

### 8. CORS is Wide Open

**File:** `02-api-server.js` (line 14)

```javascript
app.use(cors());
```

This allows ANY domain to access your API. Fine for development, but in production you should restrict it.

**Fix:**
```javascript
app.use(cors({ origin: ['https://snagdeals.com', 'http://localhost:3000'] }));
```

### 9. API Key Passed in Query String

**File:** `02-api-server.js` (line 36)

```javascript
const key = req.headers['x-api-key'] || req.query.api_key;
```

Accepting API keys via query string means they'll appear in server logs and browser history. Headers-only is more secure.

---

## 🟢 Minor Issues (Nice to Fix)

### 10. Hardcoded Deals Have Static Timestamps

All 199 deals show times like "2h ago", "30m ago" — these never update. When users first visit, deals that say "30m ago" could actually be days old.

### 11. Price Alerts Only Saved in React State

Alerts created by users are stored in `useState` — they vanish on page refresh. There's no backend endpoint to persist alerts, and the email field isn't connected to any notification service.

### 12. Vote Functionality Requires Fingerprint but No Library Included

The vote endpoint requires a `fingerprint` field, but the frontend `DealCard` component doesn't generate or send a fingerprint when voting. The vote buttons appear to be missing entirely from the deal card click handler.

### 13. `loading` State Set But Never Displayed

The `loading` state is set to `true` during API fetches (line 851) but there's no loading spinner or skeleton UI shown to the user.

### 14. DealsOfAmerica Scraper Missing Connection

In `n8n-social-posting-v5.json`, the "1f. Scrape DealsOfAmerica" → "1g. Parse DOA HTML" connection exists and feeds into "2. Normalize All Deals", which is correct. However, there's no RetailMeNot parser node — the raw HTML goes directly to normalize.

---

## ✅ Does n8n Post to Reddit & Telegram?

### Telegram: ✅ YES — Well Configured

| Detail | Status |
|---|---|
| **Node** | `11g. Post to Telegram Channel` |
| **Type** | Native n8n Telegram node |
| **Method** | `sendPhoto` (image + caption) |
| **Content** | Formatted with Markdown: price, store, discount, deal link |
| **Connected** | ✅ Connected to "10. Prepare Social Posts" and logs to "12. Log Social Posts" |
| **Needs** | `YOUR_TELEGRAM_CHANNEL_ID` + Telegram Bot credentials in n8n |

**Setup Steps:**
1. Message @BotFather on Telegram → `/newbot` → get bot token
2. Create a Telegram channel (e.g., @SnagDealsDeals)
3. Add your bot as channel admin
4. Get channel ID using @getidsbot
5. Configure n8n Telegram credential with bot token
6. Replace `YOUR_TELEGRAM_CHANNEL_ID` in the workflow

### Reddit: ✅ YES — Needs OAuth Fix

| Detail | Status |
|---|---|
| **Node** | `11j. Post to Reddit` |
| **Type** | HTTP Request (not native Reddit node) |
| **Method** | POST to `https://oauth.reddit.com/api/submit` |
| **Content** | Link post with title: `[Store] Title — $Price (X% off)` |
| **Target** | `sr=deals` (r/deals subreddit) |
| **Connected** | ✅ Connected to "10. Prepare Social Posts" |
| **⚠️ Not Connected** | NOT connected to "12. Log Social Posts" |
| **Needs** | `YOUR_REDDIT_TOKEN` + OAuth refresh mechanism |

**Setup Steps:**
1. Go to reddit.com/prefs/apps → create "script" type app
2. Note your `client_id` and `client_secret`
3. Get OAuth token via Reddit API
4. Replace `YOUR_REDDIT_TOKEN`
5. **Important:** Add a token refresh node (tokens expire in 1 hour)

---

## 📊 Summary Scorecard

| Area | Score | Notes |
|---|---|---|
| **Frontend (snagdeals.jsx)** | 8/10 | Beautiful UI, rich features; field mapping bug in live mode |
| **API Server** | 9/10 | Clean Express + Supabase setup; minor security hardening needed |
| **Database Schema** | 10/10 | Excellent — auto-expiry, vote sync, RLS policies, proper indexing |
| **n8n Deal Scraping** | 9/10 | 5 sources, good normalization pipeline |
| **n8n Social Posting** | 7/10 | Posts to 11 platforms! But needs API keys & error handling |
| **Reddit Integration** | 6/10 | Works but needs OAuth refresh, only 1 subreddit, not logged |
| **Telegram Integration** | 8/10 | Well done, native node with image support |
| **Mobile App** | 8/10 | Expo/React Native, geo-aware, push notifications ready |

---

## 🚀 Priority Action Plan

1. **[5 min]** Fix the frontend field mapping (Critical Issue #1)
2. **[30 min]** Set up Telegram bot + channel (free, instant traffic)
3. **[30 min]** Set up Reddit app + OAuth (free, high-traffic potential)
4. **[1 hr]** Sign up for affiliate programs (Amazon Associates + Travelpayouts)
5. **[15 min]** Replace affiliate IDs in code
6. **[15 min]** Deploy to Vercel (free)
7. **[30 min]** Set up remaining social media API keys
8. **[15 min]** Restrict CORS and harden API security
