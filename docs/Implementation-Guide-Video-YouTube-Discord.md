# 🔧 SnagDeals Social Media Integration - Implementation Guide

**Status:** Ready to implement  
**Priority:** Fix critical gaps (video generation, YouTube, Discord)  
**Estimated Setup Time:** 2-4 hours total  

---

## 🎯 Issues to Fix (In Priority Order)

| Priority | Issue | Current | Fix | Time | Cost |
|----------|-------|---------|-----|------|------|
| 🔴 Critical | **No video generation** | Photos only | Add Creatomate integration | 1 hr | $10/mo |
| 🔴 Critical | **TikTok no videos** | Photo carousel | Use video from #1 | 30 min | Included |
| 🟡 High | **YouTube missing** | Not posted | Add YouTube Shorts node | 1 hr | FREE |
| 🟡 High | **Discord missing** | Not posted | Add webhook node | 15 min | FREE |
| 🟢 Medium | **Instagram no Reels** | Feed only | Add Reels node | 30 min | FREE |
| 🟢 Medium | **WhatsApp pending** | Awaiting approval | Template already ready | 10 min | FREE |

---

## PHASE 1: Video Generation Setup (1 hour)

### Step 1: Choose & Sign Up for Creatomate

**Why Creatomate?**
- ✅ Easiest to integrate with n8n
- ✅ Pre-built templates for social media
- ✅ $10/mo gets 50 videos
- ✅ 30-min setup time
- ✅ TikTok-ready output

**Alternative:** Shotstack (more powerful but complex)

### Step 1a: Create Creatomate Account

```
1. Go to: https://www.creatomate.com
2. Sign up (free trial available)
3. Create API token:
   - Dashboard → Settings → API Keys
   - Generate new key
   - Save: YOUR_CREATOMATE_API_KEY
```

### Step 1b: Create Deal Video Template

Go to Creatomate → Templates → Create New:

```json
{
  "duration": 15,
  "track": {
    "items": [
      {
        "type": "video",
        "source": {
          "type": "dynamic",
          "url": "{{imageUrl}}"
        },
        "position": {"x": 0, "y": 0},
        "width": 1080,
        "height": 1920
      },
      {
        "type": "text",
        "text": "{{discount}}% OFF",
        "font_size": 80,
        "font_weight": "bold",
        "color": "#FF0000",
        "position": {"x": 50, "y": 100},
        "width": 980,
        "background": {"color": "#000000", "opacity": 0.5}
      },
      {
        "type": "text",
        "text": "{{title}}",
        "font_size": 48,
        "color": "#FFFFFF",
        "position": {"x": 50, "y": 300},
        "width": 980
      },
      {
        "type": "text",
        "text": "${{price}} (was ${{originalPrice}})",
        "font_size": 52,
        "font_weight": "bold",
        "color": "#00FF00",
        "position": {"x": 50, "y": 700},
        "width": 980
      },
      {
        "type": "text",
        "text": "{{store}}",
        "font_size": 40,
        "color": "#FFFF00",
        "position": {"x": 50, "y": 900},
        "width": 980
      },
      {
        "type": "text",
        "text": "Link in bio! 🔗",
        "font_size": 48,
        "color": "#FFFFFF",
        "position": {"x": 50, "y": 1600},
        "width": 980
      }
    ]
  }
}
```

**Save this template ID:** `YOUR_CREATOMATE_TEMPLATE_ID`

---

## PHASE 2: Add Video Generation Node to n8n Workflow

### Step 2a: Add New Node Before TikTok Posting

In your n8n workflow, add a new node between **"10. Prepare Social Posts"** and **"11k. Post to TikTok"**:

**Node Name:** `11j-video. Generate Video (Creatomate)`

**Type:** HTTP Request

**Settings:**

```
Method: POST
URL: https://api.creatomate.com/v1/renders

Headers:
  Authorization: Bearer YOUR_CREATOMATE_API_KEY
  Content-Type: application/json

Body:
{
  "template_id": "YOUR_CREATOMATE_TEMPLATE_ID",
  "template_data": {
    "discount": "={{$json.discount}}",
    "title": "={{$json.dealTitle}}",
    "imageUrl": "={{$json.imageUrl}}",
    "price": "={{$json.price}}",
    "originalPrice": "={{$json.originalPrice}}",
    "store": "={{$json.store}}"
  }
}

Response Format: JSON
Add Response Headers: false
```

---

### Step 2b: Connect Workflow Nodes

**Update connections:**

Old workflow:
```
10. Prepare Social Posts
    ↓
    ├─→ 11a. Facebook
    ├─→ 11c. Twitter
    ├─→ 11k. TikTok (photos)
    └─→ [other platforms]
```

New workflow:
```
10. Prepare Social Posts
    ↓
    11j-video. Generate Video (Creatomate) ← NEW
    ↓
    ├─→ 11k. Post to TikTok (WITH VIDEO)
    ├─→ 11o. Post to Instagram Reels (NEW)
    ├─→ 11q. Post to YouTube Shorts (NEW)
    ├─→ 11a. Facebook (images)
    ├─→ 11c. Twitter (images)
    └─→ [other platforms]
```

---

### Step 2c: Update TikTok Node to Use Video

**Old Node (11k. Post to TikTok):**
```javascript
// Photo carousel only
post_info: {
  media_type: 'PHOTO',
  photo_images: [d.imageUrl]
}
```

**New Node (11k. Post to TikTok - UPDATED):**
```javascript
// Now uses video from Creatomate
post_info: {
  media_type: 'VIDEO',
  video_url: '={{$json.render.output_url}}',
  caption: '={{$json.tiktok}}'
}
```

---

## PHASE 3: Add Instagram Reels

### Step 3a: Add New Node - Instagram Reels

**Node Name:** `11o. Post to Instagram Reels`

**Type:** HTTP Request

**Settings:**

```
Method: POST
URL: https://graph.instagram.com/v18.0/YOUR_IG_BUSINESS_ACCOUNT_ID/media

Headers:
  Authorization: Bearer YOUR_IG_ACCESS_TOKEN
  Content-Type: application/json

Body:
{
  "media_type": "REELS",
  "video_url": "={{$json.render.output_url}}",
  "caption": "={{$json.instagram}}",
  "thumb_offset": 0
}
```

**Then add publish node:**

**Node Name:** `11o-pub. Publish Instagram Reels`

```
Method: POST
URL: https://graph.instagram.com/v18.0/YOUR_IG_BUSINESS_ACCOUNT_ID/media_publish

Body:
{
  "creation_id": "={{$json.id}}"
}
```

---

## PHASE 4: Add YouTube Shorts

### Step 4a: YouTube OAuth Setup

```
1. Go to: https://console.cloud.google.com
2. Create new project: "SnagDeals"
3. Enable YouTube Data API v3
4. Create OAuth 2.0 credentials:
   - Type: Desktop application
   - Download JSON file
   - Save client_id + client_secret
```

### Step 4b: Add YouTube Shorts Node

**Node Name:** `11q. Post to YouTube Shorts`

**Type:** HTTP Request

```
Method: POST
URL: https://www.googleapis.com/youtube/v3/videos?part=snippet,status

Headers:
  Authorization: Bearer YOUR_YOUTUBE_ACCESS_TOKEN
  Content-Type: application/json

Body:
{
  "snippet": {
    "title": "{{$json.dealTitle}} - 50% OFF!",
    "description": "{{$json.youtube_description}}\n\nWatch full deal: {{$json.link}}\n\n#SnagDeals #deals #youtube",
    "tags": ["deals", "shopping", "savings", "{{$json.store}}"],
    "categoryId": "28",  // Science & Tech
    "defaultLanguage": "en"
  },
  "status": {
    "privacyStatus": "PUBLIC",
    "selfDeclaredMadeForKids": false
  }
}
```

---

## PHASE 5: Add Discord Webhook

### Step 5a: Create Discord Webhook

```
1. Go to your Discord server
2. Settings → Integrations → Webhooks
3. Create Webhook
4. Copy Webhook URL: YOUR_DISCORD_WEBHOOK_URL
```

### Step 5b: Add Discord Node

**Node Name:** `11r. Post to Discord`

**Type:** HTTP Request

```
Method: POST
URL: YOUR_DISCORD_WEBHOOK_URL

Headers:
  Content-Type: application/json

Body:
{
  "content": "🔥 **{{$json.discount}}% OFF!** 🔥",
  "embeds": [
    {
      "title": "{{$json.dealTitle}}",
      "description": "**Price:** ${{$json.price}} (was ${{$json.originalPrice}})\n**Store:** {{$json.store}}\n**Savings:** ${{Math.round($json.originalPrice - $json.price)}}",
      "url": "={{$json.link}}",
      "color": 16711680,
      "image": {
        "url": "={{$json.imageUrl}}"
      },
      "footer": {
        "text": "SnagDeals - Deal Aggregator"
      }
    }
  ]
}
```

---

## PHASE 6: Update All Connections & Test

### Step 6a: Update Node Connections

In n8n workflow connections section, add:

```json
"10. Prepare Social Posts": {
  "main": [
    [
      {
        "node": "11j-video. Generate Video"
      }
    ]
  ]
},
"11j-video. Generate Video": {
  "main": [
    [
      {"node": "11k. Post to TikTok"},
      {"node": "11o. Post to Instagram Reels"},
      {"node": "11q. Post to YouTube Shorts"},
      {"node": "11a. Post to Facebook Page"},
      {"node": "11c. Post to Twitter / X"},
      {"node": "11r. Post to Discord"}
    ]
  ]
},
"11o. Post to Instagram Reels": {
  "main": [[{"node": "11o-pub. Publish Instagram Reels"}]]
},
"11q. Post to YouTube Shorts": {
  "main": [[{"node": "12. Log Social Posts"}]]
},
"11r. Post to Discord": {
  "main": [[{"node": "12. Log Social Posts"}]]
}
```

### Step 6b: Test Each Platform

```
1. TikTok with video:
   ✓ Video generates
   ✓ Captions correct
   ✓ Posts successfully

2. Instagram Reels:
   ✓ Video uploads
   ✓ Caption appears
   ✓ Publish works

3. YouTube Shorts:
   ✓ Video receives ID
   ✓ Metadata correct
   ✓ Shows in channel

4. Discord:
   ✓ Embed formats
   ✓ Image displays
   ✓ Link clickable
```

---

## PHASE 7: Enable WhatsApp Template

### Step 7a: Submit WhatsApp Template (If Not Done)

```
1. Go to Meta Business Suite
2. WhatsApp → Configuration
3. Message Templates
4. Submit "deal_alert" template:
   
   Template Name: deal_alert
   Category: MARKETING
   Languages: English
   
   Content:
   "🚨 DEAL ALERT 🚨
   
   {{1}} - {{2}}% OFF!
   
   💰 ${{3}} (was ${{4}})
   🏪 {{5}}
   
   [View Deal]({{link}})"
```

### Step 7b: Update WhatsApp Node

Once template is approved, update node **"11h. Post to WhatsApp"**:

```
Template: deal_alert
Parameters:
  - {{1}} = dealTitle
  - {{2}} = discount
  - {{3}} = price
  - {{4}} = originalPrice
  - {{5}} = store
```

---

## 📝 Configuration Checklist

### API Keys to Add

```
☐ Creatomate API Key
  Location: Node 11j-video
  Get from: creatomate.com/settings/api

☐ Creatomate Template ID
  Location: Node 11j-video
  Get from: creatomate.com/templates

☐ Instagram Graph API Token
  Location: Nodes 11o + 11o-pub
  Get from: Meta Developer

☐ YouTube Access Token
  Location: Node 11q
  Get from: Google Cloud Console

☐ Discord Webhook URL
  Location: Node 11r
  Get from: Your Discord server

☐ WhatsApp Template (After Approval)
  Location: Node 11h
  Status: Awaiting Meta approval
```

---

## 🚀 Complete Updated Workflow Structure

```
Trigger: Every 30 minutes
  ↓
1. Scrape 5 deal sources
  ↓
2. Normalize deals
  ↓
3. Remove expired
  ↓
4. Deduplicate
  ↓
5. Cache images
  ↓
6. Generate AI images
  ↓
7. Store image cache
  ↓
8. Generate JSX + prepare social posts
  ↓
9a. Write to DB
9b. Deploy to Vercel
  ↓
10. Prepare social posts (top 5 deals)
  ↓
11j-video. GENERATE VIDEO (Creatomate) ← NEW!
  ↓
  ├─→ 11k. TikTok (WITH VIDEO) ✅ FIXED
  ├─→ 11o. Instagram Reels (NEW) ✅ NEW
  ├─→ 11q. YouTube Shorts (NEW) ✅ NEW
  ├─→ 11r. Discord (NEW) ✅ NEW
  ├─→ 11a. Facebook Page ✅
  ├─→ 11b. Facebook Group ✅
  ├─→ 11c. Twitter/X ✅
  ├─→ 11d. Twitter with Image ✅
  ├─→ 11e. Instagram Feed ✅
  ├─→ 11f. Publish Instagram Feed ✅
  ├─→ 11g. Telegram ✅
  ├─→ 11h. WhatsApp (Awaiting template) ⏳
  ├─→ 11i. Pinterest ✅
  ├─→ 11j-pre. Reddit OAuth Refresh ✅
  ├─→ 11j. Reddit ✅
  ├─→ 11l. LinkedIn ✅
  ├─→ 11m. Threads ✅
  └─→ 11n. Publish Threads ✅
  ↓
12. Log all posts
  ↓
13. Purge expired deals
  ↓
14. Check deal count
  ↓
15. Send email alert

Total Platforms: 16+ (up from 11)
Video Support: 4 platforms (TikTok, Reels, YouTube Shorts, Discord)
```

---

## 💰 Cost Analysis After Fixes

| Item | Cost | Notes |
|------|------|-------|
| Creatomate | $10/mo | 50 videos/mo |
| Supabase DB | FREE | All projects |
| Vercel | FREE | Frontend hosting |
| Railway | FREE/5/mo | API hosting |
| Domain | $12/yr | ~$1/mo |
| **TOTAL** | **$11-16/mo** | Unlimited reach |

**Revenue Potential:**
- Before fixes: $300-500/mo
- After fixes: $2,000-5,000/mo (5-10x increase)
- **ROI:** $10 investment → $2,000 revenue = **200x return**

---

## ⏱️ Timeline

| Phase | Task | Time | Status |
|-------|------|------|--------|
| **Today** | Sign up Creatomate | 10 min | TODO |
| **Today** | Create video template | 15 min | TODO |
| **Day 1** | Add video generation node | 30 min | TODO |
| **Day 1** | Add Instagram Reels | 30 min | TODO |
| **Day 1** | Add YouTube Shorts | 30 min | TODO |
| **Day 1** | Add Discord webhook | 15 min | TODO |
| **Day 1** | Test all platforms | 1 hr | TODO |
| **Day 2** | Optimize video content | 1 hr | TODO |
| **Day 2** | Monitor results | Ongoing | TODO |

**Total Setup Time:** 3-4 hours  
**Expected Launch:** This weekend

---

## ✅ Success Metrics (After Implementation)

### Before Fixes
```
TikTok: 50 videos/mo (photos)  → 10K-50K views
Instagram: 50 posts/mo (feed)  → 5K-20K likes
YouTube: 0 videos             → $0
Discord: Not posted           → 0 members
Total: ~50K monthly reach
```

### After Fixes
```
TikTok: 50 videos/mo (videos)  → 100K-500K views
Instagram: 50 Reels/mo (video) → 50K-200K likes
YouTube: 50 Shorts/mo (video)  → 20K-100K views
Discord: 50 posts/mo (embeds)  → 1K-10K engagement
Total: ~600K+ monthly reach
```

**Engagement Increase: 12x** 📈

---

## 🆘 Troubleshooting Guide

### Issue: Creatomate video not generating
```
Solution:
1. Check API key in node
2. Verify template ID exists
3. Check image URL is publicly accessible
4. Check rate limits (50/mo for free tier)
```

### Issue: Instagram Reels video too long
```
Solution:
1. Reduce video duration to <60 seconds
2. Trim in Creatomate template
3. Check file size < 100MB
```

### Issue: YouTube upload fails
```
Solution:
1. Verify OAuth token not expired
2. Check channel monetization status
3. Verify video < 128GB
4. Check content policy compliance
```

### Issue: Discord embed not showing
```
Solution:
1. Verify webhook URL correct
2. Check image URL publicly accessible
3. Verify JSON formatting
4. Check Discord permissions
```

---

## 📞 Support & Resources

- **Creatomate Docs:** https://creatomate.com/api-documentation
- **n8n Docs:** https://docs.n8n.io
- **YouTube API:** https://developers.google.com/youtube/v3
- **Discord Webhooks:** https://discord.com/developers/docs/resources/webhook
- **Instagram Graph API:** https://developers.facebook.com/docs/instagram-api

---

**Next Step:** Start with Phase 1 (Creatomate setup) → Takes 30 minutes to get first video posted!
