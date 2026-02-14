# 🚀 DAY 1: API Setup & Account Creation (Feb 13, 2026)

**Time Estimate:** 2-3 hours  
**Goal:** Have all APIs ready (FREE TIER) with keys in n8n secrets  
**Status:** ⏰ IN PROGRESS

**Using Free Alternatives:**
- ✅ Amazon Product API (free tier)
- ✅ Smashwords RSS (free)
- ✅ Kiwi.com (free affiliate)
- ✅ Viator (free partner)
- ❌ Keepa ($29/mo - skipped for now)

---

## Task 1a: Get Amazon Product API Key (30 min) ✅

### Step 1: Go to Amazon Associates
Open browser → https://affiliate-program.amazon.com/

### Step 2: Log In or Sign Up
1. Sign in with Amazon account (or create one)
2. Email: [your email]
3. Password: [create strong password]

### Step 3: Complete Associates Profile
1. Store name: `SnagDeals`
2. Website URL: [your website or social media]
3. Traffic source: `Social Media`
4. Preferred categories: `Books, Electronics, Travel`
5. Accept agreement → Submit

### Step 4: Get API Credentials
1. Go to **"Settings"** → **"Advertise Your Products"**
2. Click **"API Keys"** or **"Access Keys"**
3. Find your **Access Key ID** and **Secret Access Key**
4. Copy both (we'll add to n8n)

### Step 5: Store API Keys
**COPY BOTH** → We'll add to n8n in Task 1d

```
AMAZON_API_KEY_ID = [PASTE ACCESS KEY ID HERE]
AMAZON_API_SECRET = [PASTE SECRET KEY HERE]
```

⏳ **CHECKPOINT:** Amazon API keys copied? Continue →

---

## Task 1b: Create Kiwi.com Affiliate Account (30 min) ✅

### Step 1: Go to Kiwi Affiliates
Open browser → https://www.kiwi.com/affiliates/

### Step 2: Sign Up
1. Click **"Sign Up Now"** or **"Become an Affiliate"**
2. Email: [your email]
3. Password: [create strong password]
4. Country: [your country]
5. Commission level: **5% (standard)**
   - They offer 5-15% based on volume
   - Start at 5%, can negotiate higher later

### Step 3: Complete Profile
1. Business name: `SnagDeals`
2. Website: [your website or social media URL]
3. Traffic source: `Social Media`
4. Monthly clicks expected: `100,000+`
5. Agree to terms → Submit

### Step 4: Wait for Approval (Usually 24-48 hours)
Check email for approval notification

### Step 5: Get Affiliate ID (After Approval)
1. Log into Kiwi affiliate dashboard
2. Dashboard → **"Promotional Links"** or **"Tracking Settings"**
3. Find your **Affiliate ID** (looks like: `partner_12345`)

### Step 6: Get API Key (Separate from Affiliate ID)
1. Go to Settings → **"API Documentation"** or **"API Keys"**
2. Request API access (may need to email support@kiwi.com)
3. They'll provide API key (looks like: `xxxxx.xxxxx.xxxxx`)

### Step 7: Store Both
**COPY BOTH** → We'll add to n8n in Task 1d

```
KIWI_API_KEY = [PASTE API KEY HERE]
KIWI_AFFILIATE_ID = [PASTE AFFILIATE ID HERE]
```

⏳ **CHECKPOINT:** Have you received Kiwi approval email? If not yet, check back in 2 hours. Continue with Viator while waiting →

---

## Task 1c: Create Viator Account (30 min) ✅

### Step 1: Go to Viator Partners
Open browser → https://www.viatorpartners.com

### Step 2: Sign Up
1. Click **"Sign Up"** or **"Join Our Partner Program"**
2. Email: [your email]
3. Password: [create strong password]
4. Business type: `Affiliate/Marketing`
5. Commission preference: `Highest available`

### Step 3: Complete Profile
1. Business name: `SnagDeals`
2. Website: [your website]
3. Marketing channels: `Social Media (TikTok, Instagram)`
4. Monthly traffic: `100,000+`
5. Submit

### Step 4: Wait for Approval (Usually 24-48 hours)
Check email for approval

### Step 5: Get Partner ID (After Approval)
1. Log into Viator partner dashboard
2. **"Account Settings"** → **"Publisher Details"**
3. Find **Partner ID** (looks like: `partner_123456`)

### Step 6: API Access (Optional - Can Use RSS Feed First)
1. Go to **"API Documentation"**
2. If API is listed, request access
3. If not available, Viator provides RSS feed (backup option)

### Step 7: Store Partner ID
**COPY THIS** → We'll add to n8n in Task 1d

```
VIATOR_PARTNER_ID = [PASTE PARTNER ID HERE]
```

⏳ **CHECKPOINT:** Viator approval in progress? That's OK, we can use RSS feed as fallback →

---

## Task 1c-BONUS: Save Smashwords & CamelCamelCamel URLs (5 min) ✅

These are free RSS feeds we'll use in Day 2 (no signup needed):

```
SMASHWORDS_RSS = https://www.smashwords.com/books/category/all/newest?smashwords_rss=1
CAMELCAMELCAMEL_URL = https://camelcamelcamel.com/
PROJECT_GUTENBERG_API = https://gutendex.com/books/
```

These are bookmarked - we'll use them in the workflow.

---

## Task 1d: Setup n8n Secrets (30 min) ✅

### Prerequisites
- n8n is running and accessible
- You know the URL (usually http://localhost:5678 or your n8n domain)

### Step 1: Log into n8n
Open browser → Your n8n URL → Log in

### Step 2: Go to Settings
1. Bottom left → Click your profile icon
2. Select **"Settings"**
3. Left sidebar → Click **"Secrets"**

### Step 3: Add AMAZON_API_KEY_ID
1. Click **"+ New Secret"** or **"Add"**
2. **Name:** `AMAZON_API_KEY_ID`
3. **Value:** [Paste Amazon Access Key ID from Task 1a]
4. Click **"Save"**

✅ Result: `AMAZON_API_KEY_ID` is now available in workflows

### Step 4: Add AMAZON_API_SECRET
1. Click **"+ New Secret"**
2. **Name:** `AMAZON_API_SECRET`
3. **Value:** [Paste Amazon Secret Key from Task 1a]
4. Click **"Save"**

✅ Result: `AMAZON_API_SECRET` is now available

### Step 5: Add KIWI_API_KEY
1. Click **"+ New Secret"**
2. **Name:** `KIWI_API_KEY`
3. **Value:** [Paste Kiwi API key from Task 1b]
4. Click **"Save"**

✅ Result: `KIWI_API_KEY` is now available

### Step 6: Add KIWI_AFFILIATE_ID
1. Click **"+ New Secret"**
2. **Name:** `KIWI_AFFILIATE_ID`
3. **Value:** [Paste Kiwi Affiliate ID from Task 1b]
4. Click **"Save"**

✅ Result: `KIWI_AFFILIATE_ID` is now available

### Step 7: Add VIATOR_PARTNER_ID (If Approved)
1. Click **"+ New Secret"**
2. **Name:** `VIATOR_PARTNER_ID`
3. **Value:** [Paste Viator Partner ID from Task 1c]
4. Click **"Save"**

✅ Result: `VIATOR_PARTNER_ID` is now available

### Step 8: Verify All Secrets Are Added
Go back to Secrets list. You should see:
- ✅ `AMAZON_API_KEY_ID`
- ✅ `AMAZON_API_SECRET`
- ✅ `KIWI_API_KEY`
- ✅ `KIWI_AFFILIATE_ID`
- ✅ `VIATOR_PARTNER_ID` (if available)
- ✅ `AMAZON_AFFILIATE_ID` (existing)

---

## ✅ Day 1 Completion Checklist (FREE VERSION)

Before moving to Day 2, verify:

- [ ] **Amazon Product API**
  - [ ] Signed up for Amazon Associates
  - [ ] Got API credentials
  - [ ] Have these keys copied:
    - [ ] Access Key ID: `AMAZON_API_KEY_ID = _______________`
    - [ ] Secret Key: `AMAZON_API_SECRET = _______________`

- [ ] **Kiwi.com Affiliate Created**
  - [ ] Signed up for affiliate program
  - [ ] Awaiting approval (check email)
  - [ ] Once approved, have these ready:
    - [ ] API key: `KIWI_API_KEY = _______________`
    - [ ] Affiliate ID: `KIWI_AFFILIATE_ID = _______________`

- [ ] **Viator Account Created**
  - [ ] Signed up for partner program
  - [ ] Awaiting approval (check email)
  - [ ] Once approved: `VIATOR_PARTNER_ID = _______________`

- [ ] **Free URLs Bookmarked**
  - [ ] Smashwords RSS: https://www.smashwords.com/books/category/all/newest?smashwords_rss=1
  - [ ] CamelCamelCamel: https://camelcamelcamel.com/
  - [ ] Project Gutenberg API: https://gutendex.com/books/

- [ ] **n8n Secrets Configured**
  - [ ] `AMAZON_API_KEY_ID` added ✅
  - [ ] `AMAZON_API_SECRET` added ✅
  - [ ] `KIWI_API_KEY` added ✅
  - [ ] `KIWI_AFFILIATE_ID` added ✅
  - [ ] `VIATOR_PARTNER_ID` added ✅
  - [ ] All visible in n8n Settings → Secrets

---

## 🚨 Troubleshooting

### Problem: Amazon API Setup Failed
**Solution:**
- Make sure you have Amazon Associates account
- Go to: https://affiliate-program.amazon.com/
- Click "Settings" → Look for "Advertise Your Products" section
- If not visible, you may need to wait 24 hours for account approval

### Problem: Kiwi.com Approval Taking Long (>24 hours)
**Solution:**
- Email: support@kiwi.com
- Reference: Your Kiwi username + application date
- Message: "Requesting expedited approval for affiliate account"

### Problem: Viator Not Approving
**Solution:**
- Email: partnerships@viator.com
- Include: Your website, marketing channels, expected traffic
- **Backup:** Use Viator RSS feed (parsing HTML works fine)

### Problem: n8n Secrets Not Appearing
**Solution:**
1. Refresh n8n page (Cmd+R or Ctrl+R)
2. Log out and log back in
3. Check if you're in correct workspace (if using multi-workspace)
4. Verify you have Admin permissions

---

## 📞 Support Resources

If you get stuck:

**Amazon Associates:**
- Sign up: https://affiliate-program.amazon.com/
- Email: affiliates-support@amazon.com
- Docs: https://amazon.com/gp/associates/help/t5/en_US/

**Kiwi.com:**
- Email: support@kiwi.com
- Affiliate FAQ: https://www.kiwi.com/affiliates/faq
- API Docs: https://docs.kiwi.com/

**Viator:**
- Email: partnerships@viator.com
- Partner docs: https://www.viatorpartners.com/faq
- Support: https://www.viatorpartners.com/support

**n8n:**
- Docs: https://docs.n8n.io
- Community: https://community.n8n.io
- Support: support@n8n.io

---

## ⏭️ Next Steps (Day 2)

Once you've completed all of Day 1:

1. **Check emails for approvals** (Kiwi + Viator)
2. **Verify all n8n secrets are added**
3. **Tomorrow (Feb 14):** Start Day 2
   - Add Amazon Ebook node (using Product API)
   - Add Smashwords RSS node (free ebooks)
   - Add Kiwi Flight node
   - Test all data sources

**Estimated Day 2 time:** 2-3 hours

---

## 💬 Next: Let me know when...

Post here when:
- [ ] You have all Amazon API keys
- [ ] You've added all secrets to n8n
- [ ] Kiwi.com approval arrives (check email)
- [ ] Viator approval arrives (check email)
- [ ] You're ready to start Day 2

I'll help you test everything before adding the workflow nodes. 👇
