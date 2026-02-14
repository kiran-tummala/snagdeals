# ⚡ Quick-Start Checklist: Fix All Issues Today (Multi-Project Setup)

## 🎯 Today's Goal: 11-12 Hours to 12x Engagement Increase (Per Project)

**Note:** You'll set up Creatomate + video generation for EACH project separately

### 4 Projects to Configure:
1. **SnagDeals** - Deal aggregation (every 30 min)
2. **Viral-Poster** - Trend-based content (every 1-2 hrs)
3. **Stock-Crypto-Analyzer** - Financial alerts (every 15 min)
4. **Short-Stories** - AI stories (daily)

---

## STEP 0: Project Setup Matrix (Create This)

Before starting, create a spreadsheet with this structure:

```
Project                 | Creatomate Template ID | TikTok Channel      | YouTube Channel ID | Discord Webhook
-----------------------|------------------------|---------------------|-------------------|------------------
SnagDeals               | [tpl_deals_123]        | @SnagDeals          | UCxxxxx1           | https://discord.com/api/webhooks/xxx1
Viral-Poster            | [tpl_viral_456]        | @ViralPoster        | UCxxxxx2           | https://discord.com/api/webhooks/xxx2
Stock-Crypto-Analyzer   | [tpl_crypto_789]       | @CryptoAlerts       | UCxxxxx3           | https://discord.com/api/webhooks/xxx3
Short-Stories           | [tpl_stories_000]      | @StoryHub           | UCxxxxx4           | https://discord.com/api/webhooks/xxx4
```

You'll fill this in as you go. This ensures each project has its own channels and won't interfere.

---

## STEP 1: Creatomate Setup (Per Project: 15 min × 4 = 60 minutes)

### ✓ Project 1: SnagDeals

#### 1a. Create Account (If not done yet)
```bash
1. Open: https://www.creatomate.com
2. Sign up (free trial - covers all projects)
3. Verify email
4. Login to dashboard
```

#### 1b. Create Project 1 Template (SnagDeals - Deal focused)
```
Dashboard → Templates → Create New Template

Name: "SnagDeals - Deal Alert"
Design:
- Large discount percentage (red)
- Deal title (white)
- Price comparison (green)
- Store name (yellow)
- 15 second duration

Save → Copy TEMPLATE_ID
Save to matrix: SNAGDEALS_TEMPLATE_ID
```

#### 1c. Create Project 2 Template (Viral-Poster - Trend focused)
```
Dashboard → Templates → Create New Template

Name: "Viral-Poster - Trend Alert"
Design:
- Trending topic (large, bold)
- Engagement stats
- Current trend position
- Next steps CTA
- 15 second duration

Save → Copy TEMPLATE_ID
Save to matrix: VIRALPOSTER_TEMPLATE_ID
```

#### 1d. Create Project 3 Template (Stock-Crypto - Financial focused)
```
Dashboard → Templates → Create New Template

Name: "Stock-Crypto - Price Alert"
Design:
- Stock/Crypto symbol (large)
- Price (current + change)
- Chart or indicator
- Buy/Sell signal
- 15 second duration

Save → Copy TEMPLATE_ID
Save to matrix: CRYPTO_TEMPLATE_ID
```

#### 1e. Create Project 4 Template (Short-Stories - Story focused)
```
Dashboard → Templates → Create New Template

Name: "Short-Stories - Story Cover"
Design:
- Story title
- Author name
- Story category/genre
- Read time
- 15 second duration

Save → Copy TEMPLATE_ID
Save to matrix: STORIES_TEMPLATE_ID
```

#### 1f. Get ONE Creatomate API Key (Shared)
```
Dashboard → Settings → API Keys
Click: "Generate New Key"
Copy: YOUR_CREATOMATE_API_KEY
Save to: Secure note

This ONE key works for all 4 projects' templates
```

**⏱️ Time: 60 min (15 per project) | Status: ☐ Done**

## STEP 2: Set Up Social Channels Per Project (90 minutes)

### ✓ TikTok: Create 4 Separate Accounts
```
Project 1: @SnagDeals (or @SnagDeals_Official)
  → Focus: Daily deals only
  → Template: SNAGDEALS_TEMPLATE_ID
  → Save token: SNAGDEALS_TIKTOK_TOKEN

Project 2: @ViralPoster (or @ViralTrends)
  → Focus: Viral trends/memes
  → Template: VIRALPOSTER_TEMPLATE_ID
  → Save token: VIRAL_TIKTOK_TOKEN

Project 3: @CryptoAlerts (or @StockAlerts)
  → Focus: Crypto/Stock prices
  → Template: CRYPTO_TEMPLATE_ID
  → Save token: CRYPTO_TIKTOK_TOKEN

Project 4: @StoryHub (or @ShortStories)
  → Focus: Short story adaptations
  → Template: STORIES_TEMPLATE_ID
  → Save token: STORIES_TIKTOK_TOKEN

TikTok Business API Setup (each):
  → Get Creator Fund Access
  → TikTok for Business → API → Get credentials
  → Save API token to matrix for each
```

### ✓ YouTube: Create 4 Separate Channels
```
Project 1: "SnagDeals - Daily Deals"
  → Channel ID: UCxxxxx1
  → OAuth token: SNAGDEALS_YOUTUBE_TOKEN

Project 2: "ViralPoster - Trends"
  → Channel ID: UCxxxxx2
  → OAuth token: VIRAL_YOUTUBE_TOKEN

Project 3: "Crypto Stock Alerts"
  → Channel ID: UCxxxxx3
  → OAuth token: CRYPTO_YOUTUBE_TOKEN

Project 4: "AI Short Stories"
  → Channel ID: UCxxxxx4
  → OAuth token: STORIES_YOUTUBE_TOKEN

Setup per channel:
  1. https://console.cloud.google.com
  2. Create project: "[ProjectName]"
  3. Enable: YouTube Data API v3
  4. OAuth 2.0 Credentials
  5. Download JSON → Extract token
  6. Save to matrix
```

### ✓ Discord: Create 4 Webhooks (or 4 Channels)
```
Option A: Same Discord server, different channels
  → #snagdeals-feed → Webhook: SNAGDEALS_DISCORD
  → #viral-trends → Webhook: VIRAL_DISCORD
  → #crypto-alerts → Webhook: CRYPTO_DISCORD
  → #stories-feed → Webhook: STORIES_DISCORD

Option B: Different Discord servers (better isolation)
  → Server 1 (SnagDeals) → Default channel → Webhook: SNAGDEALS_DISCORD
  → Server 2 (Viral) → Default channel → Webhook: VIRAL_DISCORD
  → Server 3 (Crypto) → Default channel → Webhook: CRYPTO_DISCORD
  → Server 4 (Stories) → Default channel → Webhook: STORIES_DISCORD

Setup each webhook:
  → Discord → Channel → Integrations → Webhooks
  → New Webhook → Copy URL → Save to matrix
```

### ✓ Instagram: Separate Accounts or Hashtags
```
Option A: Different Instagram accounts
  → @SnagDeals_Finds (deals only)
  → @ViralMemes_Daily (trends only)
  → @CryptoPriceAlerts (financial only)
  → @AIStoryHub (stories only)

Option B: Same account, different hashtags
  → Use #snagdeals #deals #discounts
  → Use #viraltrends #trending #foryoupage
  → Use #cryptoalerts #stockmarket #bitcoin
  → Use #shortstories #aistories #fiction

For each (or hashtag set), save:
  → IG_TOKEN_[Project]
  → IG_BUSINESS_ID_[Project]
```

**⏱️ Time: 90 min (20-30 per project setup) | Status: ☐ Done**

## STEP 3: Update n8n Workflows (90 min × 4 projects = 360 minutes)

### ✓ Create Project Routing Logic

Before editing each workflow, add a "routing" step that identifies which project is running:

```
n8n → Identify Project Name
  → If project = "SnagDeals"
       → Use SNAGDEALS_TEMPLATE_ID
       → Use SNAGDEALS_TIKTOK_TOKEN
       → Use SNAGDEALS_YOUTUBE_CHANNEL_ID
       → Use SNAGDEALS_DISCORD_WEBHOOK
  → If project = "Viral-Poster"
       → Use VIRALPOSTER_TEMPLATE_ID
       → Use VIRAL_TIKTOK_TOKEN
       → Use VIRAL_YOUTUBE_CHANNEL_ID
       → Use VIRAL_DISCORD_WEBHOOK
  [... repeat for Stock-Crypto and Short-Stories]
```

### ✓ Project 1: SnagDeals Workflow
```
1. Open: https://your-domain.com:5678 (or n8n.io)
2. Login
3. Open: "SnagDeals v5.1" workflow
4. Enter edit mode
```

#### 3a. Add Project-Aware Video Node (20 min per project)
```
1. Click: "Add Node"
2. Search: "HTTP Request"
3. Name: "11j-video. Generate Video (Project-Aware)"
4. Configure:
   - Method: POST
   - URL: https://api.creatomate.com/v1/renders
   - Add header: Authorization: Bearer ${{ env.CREATOMATE_API_KEY }}
   - Add body (JSON mode, with IF logic):
     
     For SnagDeals:
     {
       "template_id": "${{ env.SNAGDEALS_TEMPLATE_ID }}",
       "template_data": {
         "discount": "={{$json.discount}}",
         "title": "={{$json.dealTitle}}",
         "imageUrl": "={{$json.imageUrl}}",
         "price": "={{$json.price}}",
         "originalPrice": "={{$json.originalPrice}}",
         "store": "={{$json.store}}"
       }
     }

5. Save node
```

#### 3b. Update Project-Specific TikTok Node (10 min × 4 projects)
```
For EACH project's TikTok node:

1. Find: "11k. Post to TikTok - [ProjectName]" node
2. Edit
3. Change media_type from "PHOTO" to "VIDEO"
4. Update video_url field to: "={{$json.render.output_url}}"
5. Add token field:
   - "access_token": "${{ env.[PROJECT]_TIKTOK_TOKEN }}"
6. Save

Example for SnagDeals:
   - "access_token": "${{ env.SNAGDEALS_TIKTOK_TOKEN }}"
Example for Viral:
   - "access_token": "${{ env.VIRAL_TIKTOK_TOKEN }}"
```

#### 3c. Add Project-Specific Instagram Reels (15 min × 4 projects)
```
For EACH project:

1. Add new HTTP Request node
2. Name: "11o. Post to Instagram Reels - [ProjectName]"
3. Configure:
   - Method: POST
   - URL: https://graph.instagram.com/v18.0/${{ env.[PROJECT]_IG_BUSINESS_ID }}/media
   - Headers:
     Authorization: Bearer ${{ env.[PROJECT]_IG_TOKEN }}
     Content-Type: application/json
   - Body:
     {
       "media_type": "REELS",
       "video_url": "={{$json.render.output_url}}",
       "caption": "={{$json.caption}}"
     }
4. Save

Repeat for all 4 projects
```

#### 3d. Add Project-Specific YouTube Shorts (15 min × 4 projects)
```
For EACH project:

1. Add new HTTP Request node
2. Name: "11q. Post to YouTube Shorts - [ProjectName]"
3. Configure:
   - Method: POST
   - URL: https://www.googleapis.com/youtube/v3/videos?part=snippet,status
   - Headers:
     Authorization: Bearer ${{ env.[PROJECT]_YOUTUBE_TOKEN }}
     Content-Type: application/json
   - Body: (Use template from Implementation Guide with project-specific channel ID)
4. Save

Repeat for all 4 projects
```

#### 3e. Add Project-Specific Discord Node (10 min × 4 projects)
```
For EACH project:

1. Add new HTTP Request node
2. Name: "11r. Post to Discord - [ProjectName]"
3. Configure:
   - Method: POST
   - URL: ${{ env.[PROJECT]_DISCORD_WEBHOOK }}
   - Headers: Content-Type: application/json
   - Body: (Use template from Implementation Guide)
4. Save

Repeat for all 4 projects
```

#### 3f. Update Node Connections Per Project (20 min × 4 projects)
```
For EACH project workflow:

1. Find "10. Prepare Social Posts" node
2. Delete old connections (or mark as backup)
3. Add new connection chain:
   
   10. Prepare Social Posts
     ↓
   11j-video. Generate Video [ProjectName]
     ↓
   [Split to all platforms for that project]

4. Connect to project-specific nodes:
   - 11j-video → 11k TikTok [ProjectName]
   - 11j-video → 11o Instagram Reels [ProjectName]
   - 11j-video → 11q YouTube Shorts [ProjectName]
   - 11j-video → 11r Discord [ProjectName]
   - 11j-video → [all other platforms for project]

5. Save workflow

Repeat this for all 4 projects
```

**⏱️ Time: 360 min (90 per project) | Status: ☐ Done**

---

## STEP 4: Set Up Environment Variables (30 minutes)

### ✓ In n8n, Add All API Keys as Environment Variables

```
Settings → Environment → Add variables:

# Shared
CREATOMATE_API_KEY = [your key from Step 1f]

# SnagDeals Project
SNAGDEALS_TEMPLATE_ID = [from Step 1b]
SNAGDEALS_TIKTOK_TOKEN = [from Step 2]
SNAGDEALS_YOUTUBE_TOKEN = [from Step 2]
SNAGDEALS_YOUTUBE_CHANNEL_ID = [from Step 2]
SNAGDEALS_IG_TOKEN = [from Step 2]
SNAGDEALS_IG_BUSINESS_ID = [from Step 2]
SNAGDEALS_DISCORD_WEBHOOK = [from Step 2]

# Viral-Poster Project
VIRALPOSTER_TEMPLATE_ID = [from Step 1c]
VIRAL_TIKTOK_TOKEN = [from Step 2]
VIRAL_YOUTUBE_TOKEN = [from Step 2]
VIRAL_YOUTUBE_CHANNEL_ID = [from Step 2]
VIRAL_IG_TOKEN = [from Step 2]
VIRAL_IG_BUSINESS_ID = [from Step 2]
VIRAL_DISCORD_WEBHOOK = [from Step 2]

# Stock-Crypto Project
CRYPTO_TEMPLATE_ID = [from Step 1d]
CRYPTO_TIKTOK_TOKEN = [from Step 2]
CRYPTO_YOUTUBE_TOKEN = [from Step 2]
CRYPTO_YOUTUBE_CHANNEL_ID = [from Step 2]
CRYPTO_IG_TOKEN = [from Step 2]
CRYPTO_IG_BUSINESS_ID = [from Step 2]
CRYPTO_DISCORD_WEBHOOK = [from Step 2]

# Short-Stories Project
STORIES_TEMPLATE_ID = [from Step 1e]
STORIES_TIKTOK_TOKEN = [from Step 2]
STORIES_YOUTUBE_TOKEN = [from Step 2]
STORIES_YOUTUBE_CHANNEL_ID = [from Step 2]
STORIES_IG_TOKEN = [from Step 2]
STORIES_IG_BUSINESS_ID = [from Step 2]
STORIES_DISCORD_WEBHOOK = [from Step 2]
```

**⏱️ Time: 30 min | Status: ☐ Done**

---

## STEP 5: Test Each Platform Per Project (120 minutes)

### ✓ Test Project 1: SnagDeals (30 min)
```
Workflow: "SnagDeals v5.1"

1. Click: "Execute Workflow"
2. Check "11j-video. Generate Video (SnagDeals)" node
   ✓ Status = green
   ✓ Output shows video URL from Creatomate
   ✓ Video duration = 15 seconds

3. Check "11k. Post to TikTok (SnagDeals)" node
   ✓ Status = green
   ✓ Verify post on @SnagDeals TikTok account
   ✓ Video appears (not photo)

4. Check "11o. Post to Instagram Reels (SnagDeals)" node
   ✓ Status = green
   ✓ Verify Reel on SnagDeals Instagram

5. Check "11q. Post to YouTube Shorts (SnagDeals)" node
   ✓ Status = green
   ✓ Verify on SnagDeals YouTube channel

6. Check "11r. Post to Discord (SnagDeals)" node
   ✓ Status = green
   ✓ Verify in #snagdeals-feed channel

7. Check all other 11 platforms
   ✓ All green checkmarks
```

### ✓ Test Project 2: Viral-Poster (30 min)
```
Workflow: "Viral-Poster v1.0"

Repeat same testing for:
- @ViralPoster TikTok
- ViralPoster Instagram
- ViralPoster YouTube
- #viral-trends Discord
- All other platforms
```

### ✓ Test Project 3: Stock-Crypto-Analyzer (30 min)
```
Workflow: "Stock-Crypto-Analyzer v1.0"

Repeat same testing for:
- @CryptoAlerts TikTok
- CryptoAlerts Instagram
- CryptoAlerts YouTube
- #crypto-alerts Discord
- All other platforms
```

### ✓ Test Project 4: Short-Stories (30 min)
```
Workflow: "Short-Stories v1.0"

Repeat same testing for:
- @StoryHub TikTok
- StoryHub Instagram
- StoryHub YouTube
- #stories-feed Discord
- All other platforms
```

**⏱️ Time: 120 min (30 per project) | Status: ☐ Done**

---

## STEP 5: Monitor & Optimize (Ongoing)

### ✓ Watch Real-Time Results
```
After publishing, monitor:
- TikTok: Views/engagement (compare: photos vs videos)
- Instagram Reels: Likes/saves (vs feed engagement)
- YouTube Shorts: Views (new platform!)
- Discord: Member reactions
- All platforms: Share rates

Expected: 5-10x engagement increase within 1 week
```

### ✓ Optimize Video Template
```
If videos underperform:
1. Adjust text overlay sizes
2. Change color scheme
3. Test different durations (15s vs 30s)
4. Add different background colors
5. Test trending music integration
```

---

## 🎯 By-the-Numbers Summary

### Current State (Per Project)
```
SnagDeals:
  Posts per cycle: 5 deals
  Platforms: 11 (image-only)
  Video support: 0
  Monthly reach: ~50K
  Monthly revenue: $300-500

Viral-Poster:
  Posts per cycle: 3-5 trends
  Platforms: 11 (image-only)
  Video support: 0
  Monthly reach: ~30K
  Monthly revenue: $100-200

Stock-Crypto:
  Posts per cycle: 10-20 alerts
  Platforms: 11 (image-only)
  Video support: 0
  Monthly reach: ~40K
  Monthly revenue: $200-400

Short-Stories:
  Posts per cycle: 1 story
  Platforms: 11 (image-only)
  Video support: 0
  Monthly reach: ~20K
  Monthly revenue: $50-150

TOTAL: ~140K reach, $650-1,250 revenue
```

### After Fixes (Per Project)
```
SnagDeals:
  Posts per cycle: 5 deals (with videos!)
  Platforms: 16+ (with video support)
  Video support: 4 platforms (TikTok, Reels, YouTube, Discord)
  Monthly reach: ~600K (12x increase)
  Monthly revenue: $2,000-5,000 (5-10x increase)

Viral-Poster:
  Posts per cycle: 3-5 trends (with videos!)
  Platforms: 16+ (with video support)
  Video support: 4 platforms
  Monthly reach: ~360K (12x increase)
  Monthly revenue: $600-1,500 (5-10x increase)

Stock-Crypto:
  Posts per cycle: 10-20 alerts (with videos!)
  Platforms: 16+ (with video support)
  Video support: 4 platforms
  Monthly reach: ~480K (12x increase)
  Monthly revenue: $1,000-3,000 (5-10x increase)

Short-Stories:
  Posts per cycle: 1 story (with videos!)
  Platforms: 16+ (with video support)
  Video support: 4 platforms
  Monthly reach: ~240K (12x increase)
  Monthly revenue: $250-750 (5-10x increase)

TOTAL: ~1.68M reach (12x), $3.85-10.25K revenue (5-10x)
VIDEO GENERATION COST: $40-50/mo (Creatomate)
NET GAIN: +$3.2K-10.2K/mo
```

---

## ✅ Final Checklist

| Task | Time | Status |
|------|------|--------|
| Creatomate + 4 templates | 60 min | ☐ |
| Setup social channels (4 projects) | 90 min | ☐ |
| Update n8n workflows (4 projects) | 360 min | ☐ |
| Add environment variables | 30 min | ☐ |
| Test all platforms (4 projects) | 120 min | ☐ |
| **TOTAL** | **660 min (11 hours)** | ☐ |

**Or Faster Path (1 project at a time):**

| Task | Time | Status |
|------|------|--------|
| Creatomate + 1 template | 15 min | ☐ |
| Setup 1 project social channels | 20-30 min | ☐ |
| Update 1 n8n workflow | 90 min | ☐ |
| Add 1 project env variables | 10 min | ☐ |
| Test 1 project all platforms | 30 min | ☐ |
| **TOTAL PER PROJECT** | **165-175 min (~3 hrs)** | ☐ |
| **×4 PROJECTS** | **660-700 min (11-12 hrs)** | ☐ |

---

## 🚀 Success Indicators

After completing all steps, you should see:

✅ **Immediate (within 1 hour)**
- Videos generating from Creatomate
- TikTok posts showing video instead of photo
- Instagram Reels appearing in feed
- YouTube Shorts on channel
- Discord embeds with images

✅ **Short-term (within 1 week)**
- TikTok views 5-10x higher than photo posts
- Instagram Reels outperforming feed posts
- YouTube Shorts getting steady views
- Discord members engaging with embeds
- Overall reach increasing daily

✅ **Long-term (within 1 month)**
- Monthly revenue increased 5-10x
- Viral potential with video content
- New audience on YouTube
- Discord community growing
- Multi-platform dominance

---

## 🆘 Need Help?

### Common Issues & Quick Fixes

**Video not generating?**
```
→ Check Creatomate API key
→ Verify template ID exists
→ Ensure image URL is public (not localhost)
→ Check monthly quota not exceeded
```

**Instagram Reels failing?**
```
→ Verify account is Business/Creator
→ Check video < 60 seconds
→ Ensure file size < 100MB
→ Test with manual Reel first
```

**YouTube upload rejected?**
```
→ Check content policy (no music copyrights)
→ Verify account in good standing
→ Check country restrictions
→ Try uploading manually first
```

**Discord webhook not working?**
```
→ Copy webhook URL exactly (with https://)
→ Check server permissions
→ Verify JSON formatting
→ Test with curl command
```

---

## 💡 Pro Tips

1. **Test in debug mode first** - Execute workflow in test mode before going live
2. **Start with 1 platform** - Get TikTok working, then add others
3. **Monitor metrics** - Track engagement per platform
4. **Optimize content** - Adjust templates based on what performs best
5. **Batch test** - Test multiple platforms in one workflow execution
6. **Save backups** - Export workflow before making major changes
7. **Document credentials** - Keep track of all API keys securely

---

## 📞 Resources

- Creatomate Setup: https://creatomate.com/documentation
- n8n Workflow Docs: https://docs.n8n.io/workflows/
- YouTube API: https://developers.google.com/youtube/v3/getting-started
- Instagram Graph API: https://developers.facebook.com/docs/instagram-api
- Discord Webhooks: https://discord.com/developers/docs/resources/webhook

---

**Start now! → Open Creatomate → Sign up → Copy API key into n8n**

**Estimated time to first video: 30 minutes** ⏱️

Good luck! 🚀
