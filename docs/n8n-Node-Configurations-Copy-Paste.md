# 📋 n8n Workflow Node Configurations (Copy-Paste Ready)

**Use these exact configurations to add the missing nodes to your n8n workflow**

---

## NODE 1: Video Generation (Creatomate)

**Name:** `11j-video. Generate Video (Creatomate)`  
**Type:** HTTP Request  
**Position:** Between "10. Prepare Social Posts" and social posting nodes

### Configuration

```json
{
  "name": "11j-video. Generate Video (Creatomate)",
  "type": "n8n-nodes-base.httpRequest",
  "position": [1700, 350],
  "parameters": {
    "method": "POST",
    "url": "https://api.creatomate.com/v1/renders",
    "authentication": "none",
    "sendHeaders": true,
    "headerParameters": {
      "parameters": [
        {
          "name": "Authorization",
          "value": "Bearer YOUR_CREATOMATE_API_KEY"
        },
        {
          "name": "Content-Type",
          "value": "application/json"
        }
      ]
    },
    "sendBody": true,
    "bodyParameters": {
      "parameters": [
        {
          "name": "template_id",
          "value": "YOUR_CREATOMATE_TEMPLATE_ID"
        },
        {
          "name": "template_data",
          "value": {
            "discount": "={{$json.discount}}",
            "title": "={{$json.dealTitle}}",
            "imageUrl": "={{$json.imageUrl}}",
            "price": "={{$json.price}}",
            "originalPrice": "={{$json.originalPrice}}",
            "store": "={{$json.store}}"
          }
        }
      ]
    },
    "responseFormat": "json"
  },
  "notes": "Generates 15-second video using Creatomate API. Returns render object with output_url for video file."
}
```

### How to Configure in n8n UI

1. **Method:** Select `POST`
2. **URL:** Paste: `https://api.creatomate.com/v1/renders`
3. **Headers Tab:**
   - Add header: `Authorization` = `Bearer YOUR_CREATOMATE_API_KEY`
   - Add header: `Content-Type` = `application/json`
4. **Body Tab (JSON mode):**
   ```json
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
   ```
5. **Response Format:** JSON
6. **Click Save**

---

## NODE 2: Instagram Reels

**Name:** `11o. Post to Instagram Reels`  
**Type:** HTTP Request  

### Configuration

```json
{
  "name": "11o. Post to Instagram Reels",
  "type": "n8n-nodes-base.httpRequest",
  "position": [1900, 400],
  "parameters": {
    "method": "POST",
    "url": "https://graph.instagram.com/v18.0/YOUR_IG_BUSINESS_ACCOUNT_ID/media",
    "authentication": "none",
    "sendHeaders": true,
    "headerParameters": {
      "parameters": [
        {
          "name": "Authorization",
          "value": "Bearer YOUR_IG_ACCESS_TOKEN"
        },
        {
          "name": "Content-Type",
          "value": "application/json"
        }
      ]
    },
    "sendBody": true,
    "bodyParameters": {
      "parameters": [
        {
          "name": "media_type",
          "value": "REELS"
        },
        {
          "name": "video_url",
          "value": "={{$json.render.output_url}}"
        },
        {
          "name": "caption",
          "value": "={{$json.instagram}}"
        }
      ]
    },
    "responseFormat": "json"
  },
  "notes": "Creates Instagram Reel container. Returns creation_id for next step (publish)."
}
```

### Publish Node

**Name:** `11o-pub. Publish Instagram Reels`  
**Type:** HTTP Request

```json
{
  "name": "11o-pub. Publish Instagram Reels",
  "type": "n8n-nodes-base.httpRequest",
  "position": [2100, 400],
  "parameters": {
    "method": "POST",
    "url": "https://graph.instagram.com/v18.0/YOUR_IG_BUSINESS_ACCOUNT_ID/media_publish",
    "authentication": "none",
    "sendHeaders": true,
    "headerParameters": {
      "parameters": [
        {
          "name": "Authorization",
          "value": "Bearer YOUR_IG_ACCESS_TOKEN"
        }
      ]
    },
    "sendBody": true,
    "bodyParameters": {
      "parameters": [
        {
          "name": "creation_id",
          "value": "={{$json.id}}"
        }
      ]
    },
    "responseFormat": "json"
  },
  "notes": "Publishes the Reel container created in previous step."
}
```

---

## NODE 3: YouTube Shorts

**Name:** `11q. Post to YouTube Shorts`  
**Type:** HTTP Request

### Configuration

```json
{
  "name": "11q. Post to YouTube Shorts",
  "type": "n8n-nodes-base.httpRequest",
  "position": [1900, 550],
  "parameters": {
    "method": "POST",
    "url": "https://www.googleapis.com/youtube/v3/videos?part=snippet,status",
    "authentication": "none",
    "sendHeaders": true,
    "headerParameters": {
      "parameters": [
        {
          "name": "Authorization",
          "value": "Bearer YOUR_YOUTUBE_ACCESS_TOKEN"
        },
        {
          "name": "Content-Type",
          "value": "application/json"
        }
      ]
    },
    "sendBody": true,
    "bodyParameters": {
      "parameters": [
        {
          "name": "snippet",
          "value": {
            "title": "={{$json.discount}}% OFF {{$json.dealTitle}} #shorts",
            "description": "🔥 {{$json.discount}}% OFF {{$json.dealTitle}}\n\n💰 Price: ${{$json.price}} (was ${{$json.originalPrice}})\n🏪 Store: {{$json.store}}\n\n💾 Save ${{Math.round($json.originalPrice - $json.price)}}!\n\n🔗 Full deal: {{$json.link}}\n\n#SnagDeals #deals #shopping #savings #budgetfriendly #pricedrop #deals #shorts",
            "tags": ["deals", "shopping", "savings", "{{$json.store}}", "pricedrop"],
            "categoryId": "28",
            "defaultLanguage": "en"
          }
        },
        {
          "name": "status",
          "value": {
            "privacyStatus": "PUBLIC",
            "selfDeclaredMadeForKids": false
          }
        }
      ]
    },
    "responseFormat": "json"
  },
  "notes": "Posts video to YouTube Shorts. Requires video_url in snippet (use media field for upload)."
}
```

---

## NODE 4: Discord Webhook

**Name:** `11r. Post to Discord`  
**Type:** HTTP Request

### Configuration

```json
{
  "name": "11r. Post to Discord",
  "type": "n8n-nodes-base.httpRequest",
  "position": [1900, 700],
  "parameters": {
    "method": "POST",
    "url": "YOUR_DISCORD_WEBHOOK_URL",
    "authentication": "none",
    "sendHeaders": true,
    "headerParameters": {
      "parameters": [
        {
          "name": "Content-Type",
          "value": "application/json"
        }
      ]
    },
    "sendBody": true,
    "bodyParameters": {
      "parameters": [
        {
          "name": "content",
          "value": "🔥 **{{$json.discount}}% OFF!** 🔥"
        },
        {
          "name": "embeds",
          "value": [
            {
              "title": "{{$json.dealTitle}}",
              "description": "**Price:** ${{$json.price}} (was ${{$json.originalPrice}})\n**Store:** {{$json.store}}\n**Savings:** ${{Math.round($json.originalPrice - $json.price)}}\n\n[View Deal]({{$json.link}})",
              "url": "={{$json.link}}",
              "color": 16711680,
              "image": {
                "url": "={{$json.imageUrl}}"
              },
              "footer": {
                "text": "SnagDeals - Deal Aggregator | {{$json.discount}}% OFF"
              }
            }
          ]
        }
      ]
    },
    "responseFormat": "json"
  },
  "notes": "Posts rich embed to Discord channel. Color code: 16711680 = red (fire emoji color)."
}
```

---

## UPDATED NODE: TikTok (Video Mode)

**Name:** `11k. Post to TikTok` (UPDATE EXISTING)  
**Type:** HTTP Request

### Original (Photo Only) - DEPRECATED

```javascript
// OLD - Photo carousel only
{
  "post_info": {
    "title": d.tiktok,
    "media_type": "PHOTO",
    "photo_images": [d.imageUrl]
  }
}
```

### New (Video) - USE THIS

```json
{
  "name": "11k. Post to TikTok",
  "type": "n8n-nodes-base.httpRequest",
  "position": [2000, 300],
  "parameters": {
    "method": "POST",
    "url": "https://open.tiktokapis.com/v2/post/publish/content/init/",
    "authentication": "none",
    "sendHeaders": true,
    "headerParameters": {
      "parameters": [
        {
          "name": "Authorization",
          "value": "Bearer YOUR_TIKTOK_TOKEN"
        },
        {
          "name": "Content-Type",
          "value": "application/json"
        }
      ]
    },
    "sendBody": true,
    "bodyParameters": {
      "parameters": [
        {
          "name": "post_info",
          "value": {
            "title": "={{$json.tiktok}}",
            "privacy_level": "PUBLIC_TO_EVERYONE",
            "disable_comment": false,
            "auto_add_music": false
          }
        },
        {
          "name": "source_info",
          "value": {
            "source": "PULL_FROM_URL",
            "video_url": "={{$json.render.output_url}}",
            "publish_type": "DIRECT_POST"
          }
        }
      ]
    },
    "responseFormat": "json"
  },
  "notes": "Now uses video from Creatomate instead of photo carousel. Change media_type from PHOTO to VIDEO."
}
```

---

## NODE CONNECTIONS (Update These)

Add these connections to your workflow's `connections` object:

```json
{
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
        {"node": "11r. Post to Discord"},
        {"node": "11a. Post to Facebook Page"},
        {"node": "11b. Post to Facebook Group"},
        {"node": "11c. Post to Twitter / X"},
        {"node": "11d. Post to X with Image"},
        {"node": "11e. Post to Instagram"},
        {"node": "11g. Post to Telegram Channel"},
        {"node": "11h. Post to WhatsApp Channel"},
        {"node": "11i. Post to Pinterest"},
        {"node": "11j-pre. Reddit OAuth Refresh"},
        {"node": "11l. Post to LinkedIn"},
        {"node": "11m. Post to Threads"}
      ]
    ]
  },
  
  "11o. Post to Instagram Reels": {
    "main": [
      [
        {
          "node": "11o-pub. Publish Instagram Reels"
        }
      ]
    ]
  },
  
  "11o-pub. Publish Instagram Reels": {
    "main": [
      [
        {
          "node": "12. Log Social Posts"
        }
      ]
    ]
  },
  
  "11q. Post to YouTube Shorts": {
    "main": [
      [
        {
          "node": "12. Log Social Posts"
        }
      ]
    ]
  },
  
  "11r. Post to Discord": {
    "main": [
      [
        {
          "node": "12. Log Social Posts"
        }
      ]
    ]
  }
}
```

---

## ENVIRONMENT VARIABLES TO SET

In n8n Settings → Variables, add:

```
CREATOMATE_API_KEY = YOUR_CREATOMATE_API_KEY
CREATOMATE_TEMPLATE_ID = YOUR_CREATOMATE_TEMPLATE_ID
IG_ACCESS_TOKEN = YOUR_IG_ACCESS_TOKEN
IG_BUSINESS_ACCOUNT_ID = YOUR_IG_BUSINESS_ACCOUNT_ID
YOUTUBE_ACCESS_TOKEN = YOUR_YOUTUBE_ACCESS_TOKEN
TIKTOK_API_TOKEN = YOUR_TIKTOK_TOKEN
DISCORD_WEBHOOK_URL = YOUR_DISCORD_WEBHOOK_URL
```

Then reference in nodes:
```
{{$env.CREATOMATE_API_KEY}}
{{$env.CREATOMATE_TEMPLATE_ID}}
etc.
```

---

## REPLACEMENT VALUES YOU NEED

| Variable | Where to Get | Format |
|----------|-------------|--------|
| `YOUR_CREATOMATE_API_KEY` | creatomate.com/settings/api | `ck_live_abc123...` |
| `YOUR_CREATOMATE_TEMPLATE_ID` | creatomate.com/templates → click template | `uuid` |
| `YOUR_IG_ACCESS_TOKEN` | Meta Developer Portal → Instagram | Long string |
| `YOUR_IG_BUSINESS_ACCOUNT_ID` | Meta Business Suite → IG Settings | `123456789` |
| `YOUR_YOUTUBE_ACCESS_TOKEN` | Google OAuth flow | `ya29.abc123...` |
| `YOUR_TIKTOK_TOKEN` | developers.tiktok.com → OAuth | Long string |
| `YOUR_DISCORD_WEBHOOK_URL` | Discord Server → Webhooks | `https://discord.com/api/webhooks/...` |

---

## QUICK TEST CODE

After adding nodes, test with this code node to verify:

```javascript
// Test node: "Test Social Video Flow"
const response = {
  deals_processed: $input.all().length,
  video_generated: $json.render?.output_url ? true : false,
  video_url: $json.render?.output_url,
  discord_ready: true,
  instagram_reels_ready: true,
  youtube_ready: true,
  tiktok_video_ready: true
};

return [{ json: response }];
```

---

## IMPORT WORKFLOW (Alternative Method)

If you prefer to import the entire updated workflow JSON:

1. Copy the complete workflow JSON with all new nodes
2. In n8n: **Ctrl+I** (or Cmd+I)
3. Paste JSON
4. Click Import
5. Replace all `YOUR_*` placeholders

---

## VERIFICATION CHECKLIST

After adding all nodes, verify:

- [ ] Video generation node has Creatomate API key
- [ ] Instagram Reels node connected to publish node
- [ ] YouTube Shorts node has proper JSON structure
- [ ] Discord webhook URL is complete (https://...)
- [ ] TikTok node using video_url, not image
- [ ] All nodes connected to "12. Log Social Posts"
- [ ] No red error indicators in workflow
- [ ] Test execution completes without errors

---

## ERROR CODES & SOLUTIONS

| Error | Cause | Solution |
|-------|-------|----------|
| 401 Unauthorized | Invalid API key | Check API key spelling |
| 400 Bad Request | Invalid JSON | Check parameter names |
| 404 Not Found | Wrong URL/ID | Verify template ID exists |
| 429 Too Many Requests | Rate limit exceeded | Wait or upgrade plan |
| 500 Server Error | API downtime | Retry in 1 minute |

---

**Ready to deploy? → Copy the node configurations → Paste into your n8n workflow → Replace YOUR_* values → Test! 🚀**
