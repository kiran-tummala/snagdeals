# 🏷️ SnagDeals — Deployment + Telegram + Reddit Setup Guide

---

## Part 1: Deploy SnagDeals Live (Free)

### Step 1: Deploy the Frontend to Vercel (5 minutes)

**Option A: Via Vercel CLI**

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Create a React app
npx create-react-app snagdeals-web
cd snagdeals-web

# 3. Copy the fixed snagdeals.jsx as App.js
cp ~/Downloads/snagdeals.jsx src/App.js

# 4. Edit src/App.js line 7 — set your API URL (do this AFTER step 2)
# const API_URL = 'https://your-api.railway.app';

# 5. Deploy
vercel

# Follow prompts:
#   - Set up and deploy? Y
#   - Which scope? (select your account)
#   - Link to existing project? N
#   - Project name: snagdeals
#   - Directory: ./
#   - Override settings? N

# 6. For production deployment:
vercel --prod
```

Your site is now live at: `https://snagdeals.vercel.app`

**Option B: Via Vercel Dashboard (No Terminal)**

1. Go to **vercel.com** → Sign up / Log in
2. Click **"Add New" → "Project"**
3. Click **"Upload"** (no Git needed)
4. Drag & drop your `snagdeals-web` folder
5. Vercel auto-detects React → Click **"Deploy"**
6. Done! Your URL: `https://snagdeals-xxxxx.vercel.app`

---

### Step 2: Deploy the API to Railway (5 minutes, free tier)

Railway gives you a Node.js server with a public URL for free.

```bash
# 1. Install Railway CLI
npm i -g @railway/cli

# 2. Login
railway login

# 3. Navigate to your API backend folder
cd api-backend

# 4. Create .env from example
cp .env.example .env
# Edit .env with your Supabase keys (see Step 3)

# 5. Initialize and deploy
railway init
railway up

# 6. Set environment variables on Railway
railway variables set SUPABASE_URL=https://YOUR_ID.supabase.co
railway variables set SUPABASE_ANON_KEY=your_anon_key
railway variables set SUPABASE_SERVICE_KEY=your_service_key
railway variables set API_SECRET=snagdeals-n8n-secret-2026
railway variables set CORS_ORIGINS=https://snagdeals.vercel.app
```

Your API is now live at: `https://snagdeals-api-production.up.railway.app`

**Alternative free hosts:** Render.com, Fly.io, or a $5/mo DigitalOcean droplet.

---

### Step 3: Set Up Supabase Database (5 minutes)

1. Go to **supabase.com** → Create account → **New Project**
2. Name: `snagdeals` | Set a database password | Region: closest to you
3. Wait ~1 minute for provisioning
4. Go to **SQL Editor** → Click **"New Query"**
5. Paste the ENTIRE contents of `01-supabase-schema.sql` → Click **Run**
6. You should see: "Success. No rows returned"
7. Go to **Settings → API** and copy:
   - **Project URL**: `https://xxxx.supabase.co`
   - **anon public key**: `eyJhbGci...`
   - **service_role key**: click to reveal, `eyJhbGci...`

8. Paste these into your `.env` file and Railway variables.

---

### Step 4: Connect Frontend to API

Once your API is deployed, update `snagdeals.jsx` line 7:

```javascript
// Change from:
const API_URL = '';

// Change to:
const API_URL = 'https://your-snagdeals-api.up.railway.app';
```

Then redeploy the frontend:
```bash
cd snagdeals-web
vercel --prod
```

---

### Step 4b: Register a Domain on Namecheap (Optional, ~$12/year)

While `snagdeals.vercel.app` is perfectly fine, a custom domain looks more professional and builds brand credibility.

#### 1. Purchase a Domain (3 minutes)

1. Go to **namecheap.com**
2. Search for your desired domain (e.g., `snagdeals.co`, `snagdeals.deals`, `snagdeals.app`)
3. Click **"Add to Cart"** → **"View Cart"**
4. Proceed to checkout
   - **IMPORTANT:** Disable "Namecheap Premium DNS" (you don't need it — use Vercel's DNS)
   - **IMPORTANT:** Disable "WhoisGuard" (optional, but costs extra)
5. Complete payment
6. You now own the domain! ✅

#### 2. Connect Domain to Vercel (5 minutes)

1. Go to **vercel.com → Your Project (snagdeals)**
2. Click **"Settings" → "Domains"**
3. Under "Add Domain" → Type your domain: `snagdeals.co`
4. Click **"Add"**
5. Vercel shows you **4 nameservers**:
   ```
   ns1.vercel-dns.com
   ns2.vercel-dns.com
   ns3.vercel-dns.com
   ns4.vercel-dns.com
   ```

#### 3. Update Namecheap Nameservers (5 minutes)

1. Go back to **namecheap.com → Account → Manage Domains**
2. Click your domain name → **"Manage"**
3. Scroll down to **"Nameservers"** section
4. Change from **"Namecheap Default"** to **"Custom DNS"**
5. Paste the 4 Vercel nameservers:
   ```
   ns1.vercel-dns.com
   ns2.vercel-dns.com
   ns3.vercel-dns.com
   ns4.vercel-dns.com
   ```
6. Click **"Save"** → DNS propagates in **5-30 minutes**

#### 4. Verify & Test (2 minutes)

1. Back in Vercel, wait ~10 minutes for DNS propagation
2. Your domain should show **"Verified"** with a green checkmark
3. Visit `https://snagdeals.co` — it should load your app! 🎉
4. Update your frontend code if you've hardcoded any URLs:
   ```javascript
   const API_URL = 'https://your-snagdeals-api.up.railway.app';
   const DOMAIN_URL = 'https://snagdeals.co'; // Update this
   ```
5. Redeploy: `vercel --prod`

#### SSL Certificate (Automatic)

- Vercel auto-generates a free SSL certificate for your custom domain
- Your site is immediately **HTTPS-secure** ✅
- No additional setup needed

---

### Step 5: Seed the Database

```bash
cd api-backend
node 04-seed-deals.js
```

You should see: `✅ Seeded 20 deals into Supabase`

Verify: Visit `https://your-api.railway.app/api/deals?country=US`

---

### Step 6: Set Up n8n (Deal Scraping + Social Posting)

**Option A: n8n Cloud (Easiest, €24/mo)**
1. Sign up at **n8n.io**
2. Import `n8n-social-posting-v5-fixed.json`
3. Import `03-n8n-workflow-v6-live.json`
4. Set environment variables (Settings → Variables):
   - `SNAGDEALS_API_URL` = your Railway API URL
   - `SNAGDEALS_API_SECRET` = `snagdeals-n8n-secret-2026`
5. Activate both workflows

**Option B: Self-Hosted (Free, $5/mo VPS)**
```bash
docker run -d --name n8n -p 5678:5678 \
  -e WEBHOOK_URL=https://your-domain.com/ \
  -e N8N_BASIC_AUTH_ACTIVE=true \
  -e N8N_BASIC_AUTH_USER=admin \
  -e N8N_BASIC_AUTH_PASSWORD=your_secure_password \
  -v n8n_data:/home/node/.n8n \
  n8nio/n8n
```

Then open `http://your-server-ip:5678` and import the workflow JSON files.

---

## Part 2: Telegram Bot + Channel Setup (30 minutes)

### Why Telegram First?
- 100% free, no rate limits
- Push notifications = instant engagement
- Deal communities are HUGE (100K+ member channels)
- No algorithm throttling — every subscriber sees every post

### Step-by-Step:

#### 1. Create a Telegram Bot (2 minutes)

1. Open Telegram → Search for **@BotFather** → Start chat
2. Send: `/newbot`
3. BotFather asks: "What name for your bot?"
   - Type: `SnagDeals Deals`
4. BotFather asks: "Choose a username (must end in 'bot')"
   - Type: `SnagDealsBot` (or any available name ending in `bot`)
5. BotFather responds with your **Bot Token**:
   ```
   Use this token to access the HTTP API:
   7123456789:AAF1234567890abcdef-1234567890abcdef
   ```
6. **SAVE THIS TOKEN** — you'll need it for n8n

#### 2. Create a Telegram Channel (3 minutes)

1. In Telegram → tap the **pencil/compose** icon → **New Channel**
2. Channel name: `SnagDeals — Daily Deals & Price Drops`
3. Description: `🏷️ Best deals from Amazon, Walmart, Target & 50+ stores. Updated every 30 minutes. Never miss a price drop!`
4. Choose: **Public Channel**
5. Set link: `t.me/SnagDealsDeals` (or your preferred name)
6. Done!

#### 3. Add Bot as Channel Admin (1 minute)

1. Open your channel → Tap channel name at top → **Administrators**
2. Tap **Add Admin** → Search for your bot: `@SnagDealsBot`
3. Grant these permissions:
   - ✅ Post Messages
   - ✅ Edit Messages
   - ✅ Delete Messages
4. Tap **Done**

#### 4. Get Your Channel ID (2 minutes)

**Method A: Public channel**
If your channel is public (e.g., `t.me/SnagDealsDeals`), your channel ID is simply:
```
@SnagDealsDeals
```

**Method B: Use @getidsbot**
1. Add `@getidsbot` to your channel temporarily
2. Send any message in the channel
3. The bot replies with the channel ID (looks like `-1001234567890`)
4. Remove the bot after

#### 5. Configure n8n Telegram Credential (3 minutes)

1. In n8n → **Settings → Credentials → Add Credential**
2. Search for **"Telegram"**
3. Paste your Bot Token: `7123456789:AAF1234567890abcdef...`
4. Click **Save**

#### 6. Update the Workflow (2 minutes)

1. Open `n8n-social-posting-v5-fixed.json` workflow
2. Click on node **"11g. Post to Telegram Channel"**
3. Replace `YOUR_TELEGRAM_CHANNEL_ID` with your channel ID:
   - Public: `@SnagDealsDeals`
   - Private: `-1001234567890`
4. Select your Telegram credential from the dropdown
5. Click **Save**

#### 7. Test It! (1 minute)

1. Click **"Execute Workflow"** in n8n
2. Check your Telegram channel — you should see a deal posted with:
   - Product image
   - Formatted price + discount
   - Store name
   - "Get This Deal" link
3. If it works → Toggle the workflow to **Active** ✅

#### 8. Grow Your Telegram Channel

**Week 1-2: Seed members**
- Share link in your existing social media bios
- Post invite link on Reddit deal threads (where allowed)
- Add `t.me/SnagDealsDeals` to your website header/footer

**Week 2-4: Cross-promote**
- Find other deal Telegram channels → Ask for shoutout swaps
- Post your best deals to Telegram deal groups (search "deals" in Telegram)
- Add a "Join Telegram" popup on your website

**Month 2+: Automate growth**
- Post 15-20 deals/day (your n8n workflow does this automatically)
- The best deals get shared by members = organic growth
- Target: 1,000 subs in month 1 → 10,000 by month 3

---

## Part 3: Reddit App + OAuth Setup (30 minutes)

### Why Reddit?
- r/deals has 1.3M+ members
- One viral post = 50,000+ visitors in a day
- Free traffic, high-intent buyers
- Deal posts get genuine engagement

### Step-by-Step:

#### 1. Create a Reddit Account for SnagDeals (3 minutes)

1. Go to **reddit.com** → Sign up
2. Username suggestion: `SnagDealsDeals` or `SnagDeals_Official`
3. Verify email
4. **IMPORTANT:** Before posting, manually browse and engage for a few days. New accounts posting links immediately get flagged as spam.

#### 2. Create a Reddit App (5 minutes)

1. Go to: **https://www.reddit.com/prefs/apps**
2. Scroll down → Click **"are you a developer? create an app..."**
3. Fill in:
   - **Name:** `SnagDeals Bot`
   - **App type:** Select **"script"**
   - **Description:** `Automated deal posting bot for SnagDeals`
   - **About URL:** `https://snagdeals.vercel.app`
   - **Redirect URI:** `http://localhost:8080` (required but not used for script apps)
4. Click **"create app"**
5. You'll see:

```
SnagDeals Bot
personal use script

CLIENT_ID:     abc123def456    ← under the app name (short string)
SECRET:        xyz789longSecretStringHere ← labeled "secret"
```

6. **SAVE BOTH** — you need these for OAuth

#### 3. Get Your First OAuth Token (5 minutes)

**Test it in terminal:**

```bash
# Replace with YOUR values
CLIENT_ID="abc123def456"
CLIENT_SECRET="xyz789longSecretStringHere"
REDDIT_USER="SnagDealsDeals"
REDDIT_PASS="your_reddit_password"

curl -X POST https://www.reddit.com/api/v1/access_token \
  -u "$CLIENT_ID:$CLIENT_SECRET" \
  -d "grant_type=password&username=$REDDIT_USER&password=$REDDIT_PASS" \
  -A "SnagDeals/1.0 by $REDDIT_USER"
```

**Expected response:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOi...",
  "token_type": "bearer",
  "expires_in": 86400,
  "scope": "*"
}
```

If you see `access_token`, it works! This token is valid for **24 hours** (Reddit recently extended from 1 hour).

#### 4. Test Posting to Reddit (3 minutes)

```bash
TOKEN="eyJ0eXAiOiJKV1QiLCJhbGciOi..."  # from step 3

curl -X POST https://oauth.reddit.com/api/submit \
  -H "Authorization: Bearer $TOKEN" \
  -H "User-Agent: SnagDeals/1.0 by SnagDealsDeals" \
  -d "sr=test&kind=link&title=[Amazon] Sony WH-1000XM5 — \$248 (38% off)&url=https://snagdeals.vercel.app&sendreplies=false"
```

This posts to r/test (a safe testing subreddit). Check reddit.com/r/test to see your post!

#### 5. Configure n8n Reddit Credentials (5 minutes)

1. In n8n → **Settings → Credentials → Add Credential**
2. Search for **"HTTP Basic Auth"** → Create new
3. Set:
   - **Username:** Your Reddit app `CLIENT_ID`
   - **Password:** Your Reddit app `CLIENT_SECRET`
4. Save as: `Reddit OAuth Credentials`

5. In n8n → **Settings → Variables** → Add:
   - `REDDIT_USERNAME` = `SnagDealsDeals`
   - `REDDIT_PASSWORD` = your Reddit password

#### 6. Update the n8n Workflow (5 minutes)

1. Open the fixed workflow `n8n-social-posting-v5-fixed.json`
2. Click on **"11j-pre. Reddit OAuth Refresh"** node:
   - Select your `Reddit OAuth Credentials` for HTTP Basic Auth
   - The node auto-fills username/password from n8n environment variables
3. Click on **"11j. Post to Reddit"** node:
   - Replace `YOUR_REDDIT_USERNAME` in User-Agent with your Reddit username
   - The `Authorization` header auto-uses the fresh token from the OAuth node

#### 7. Configure Target Subreddits

The default workflow posts to **r/deals**. To add more subreddits:

1. **Duplicate** the "11j. Post to Reddit" node
2. Change `sr=deals` to `sr=DealsReddit` (or another subreddit)
3. Connect: `11j-pre. Reddit OAuth Refresh` → your new node → `12. Log Social Posts`

**Recommended subreddits for deals:**

| Subreddit | Members | Rules |
|---|---|---|
| r/deals | 1.3M | Link posts, must include price |
| r/DealsReddit | 150K | Link posts, less strict |
| r/amazondealshub | 45K | Amazon deals only |
| r/buildapcsales | 800K | PC hardware only, strict format |
| r/frugal | 2.5M | Self-posts only (no direct links) |
| r/GameDeals | 900K | Video game deals only |

**IMPORTANT Reddit rules:**
- Maximum **5-10 posts per day** across ALL subreddits
- Space posts **5-10 minutes apart**
- Follow each subreddit's title format exactly
- Your account needs some karma before posting to certain subs
- Never use URL shorteners (auto-removed by Reddit)

#### 8. Test the Full Flow (5 minutes)

1. In n8n, click **"Execute Workflow"**
2. Watch the execution — you should see:
   - Green checkmark on "11j-pre. Reddit OAuth Refresh" (token obtained)
   - Green checkmark on "11j. Post to Reddit" (deal posted)
3. Check r/deals/new to see your post
4. If it works → Toggle workflow to **Active** ✅

#### 9. Build Reddit Karma (First Week)

Before aggressive posting, build credibility:
- Day 1-3: Manually post 2-3 genuinely good deals
- Comment on other people's deal posts helpfully
- Upvote good deals (contributes to community)
- Day 4-7: Start automated posting, 3-5 deals/day
- Week 2+: Scale to 8-10 deals/day if no issues

---

## Part 4: Post-Deployment Checklist

### Immediate (Day 1)
- [ ] Frontend deployed on Vercel
- [ ] API deployed on Railway
- [ ] Supabase database created with schema
- [ ] Database seeded with initial deals
- [ ] Frontend connected to live API (green LIVE badge showing)
- [ ] Telegram bot created + channel set up
- [ ] n8n workflow posting to Telegram ✅
- [ ] Reddit app created + OAuth working
- [ ] n8n workflow posting to Reddit ✅

### Week 1
- [ ] Sign up for Amazon Associates (affiliate-program.amazon.com)
- [ ] Sign up for Travelpayouts (covers 100+ travel brands)
- [ ] Replace affiliate IDs in the code
- [ ] Set up Google Analytics 4
- [ ] Submit sitemap to Google Search Console
- [ ] Set up email capture (Beehiiv — free up to 2,500 subscribers)
- [ ] Manually post deals to Reddit for karma building
- [ ] Share Telegram channel link on all social profiles

### Week 2
- [ ] Set up Twitter/X API credentials + enable n8n posting
- [ ] Set up Facebook Page + enable n8n posting
- [ ] Create Pinterest Business account + enable n8n posting
- [ ] Apply for Booking.com affiliate program
- [ ] Apply for Viator affiliate program
- [ ] Start posting daily TikTok/Reels "deal of the day" content

### Month 1
- [ ] Apply for Google AdSense (once you have some traffic)
- [ ] Set up web push notifications (OneSignal — free)
- [ ] Start email newsletter (weekly deal digest)
- [ ] Build up to 10+ Reddit posts/day
- [ ] Target: 1,000 Telegram subscribers

### Month 2-3
- [ ] Production CORS lockdown (restrict to your domain only)
- [ ] Set up Cloudflare for CDN + DDoS protection
- [ ] Apply for Mediavine ads (need 50K sessions/month)
- [ ] Target: 5,000 Telegram subscribers
- [ ] Target: 5,000 daily website visitors

---

## Part 5: Multi-Project n8n Setup (4 Workflows)

If you're deploying **4 separate deal projects** with n8n automation, use this guide to set them up efficiently.

### Option A: n8n Cloud (Easiest but €96/mo for 4 projects)

#### Setup for Each Project:

**Project 1: SnagDeals (Deals Aggregation)**
```
n8n Account: project1@email.com
Organization: SnagDeals
Workflows:
  - n8n-social-posting-v5-fixed.json (Telegram + Reddit posting)
  - 03-n8n-workflow-v6-live.json (Deal scraping)
```

**Project 2: TravelDeals (Travel-specific)**
```
n8n Account: project2@email.com
Organization: TravelDeals
Workflows:
  - Travel deal scraping + hotel price drops
  - Multi-channel posting (Telegram, Reddit r/travel, Twitter)
```

**Project 3: TechDeals (Electronics/Tech)**
```
n8n Account: project3@email.com
Organization: TechDeals
Workflows:
  - Tech product deals + price tracking
  - Multi-channel posting (Telegram, Reddit r/buildapcsales, YouTube)
```

**Project 4: FlightDeals (Flight aggregation)**
```
n8n Account: project4@email.com
Organization: FlightDeals
Workflows:
  - Flight price alerts + deal notifications
  - Multi-channel posting (Telegram, Discord, Email)
```

#### Setup Steps (Repeat for each project):

1. **Create n8n Cloud Workspace**
   - Go to **n8n.io** → Click **"Sign up for cloud"**
   - Use separate email for each project (or use sub-emails: project1@gmail.com, project1+2@gmail.com, etc.)
   - Create organization for each project

2. **Import Workflows**
   - Click **"Add → Import from File"**
   - Upload your `.json` workflow files
   - **Don't activate yet** — need to configure credentials first

3. **Add Credentials (Settings → Credentials)**
   - **Telegram:**
     - Search "Telegram"
     - Paste bot token: `7123456789:AAF...`
     - Name: `Telegram_[ProjectName]`
   - **Reddit:**
     - Search "HTTP Basic Auth"
     - Username: Your Reddit app CLIENT_ID
     - Password: Your Reddit app SECRET
     - Name: `Reddit_OAuth_[ProjectName]`
   - **Any other APIs** (Twitter, Facebook, etc.)

4. **Set Environment Variables (Settings → Variables)**
   ```
   SNAGDEALS_API_URL=https://your-api.railway.app
   SNAGDEALS_API_SECRET=snagdeals-n8n-secret-2026
   REDDIT_USERNAME=YourRedditUsername
   REDDIT_PASSWORD=YourRedditPassword
   ```

5. **Update Workflow Nodes**
   - Open each workflow
   - Replace placeholder channel IDs/usernames with actual values
   - Test execute workflow
   - Enable scheduling (e.g., "Every 30 minutes")

6. **Activate All Workflows** ✅
   - Toggle each workflow to **"Active"**
   - Monitor first 24 hours for errors

---

### Option B: Self-Hosted n8n (RECOMMENDED - €0 + $5/mo VPS for 4 projects)

This is **much cheaper** and recommended for managing 4 projects.

#### 1. Choose a VPS Provider

| Provider | Cost | Setup Time | Best For |
|----------|------|-----------|----------|
| **DigitalOcean** | $5/mo | 5 min | Beginners, simple setup |
| **Linode** | $5/mo | 5 min | Good uptime, support |
| **Hetzner** | $4/mo | 10 min | Best value, EU-based |
| **Vultr** | $2.50/mo | 5 min | Very cheap, global |

**Specs needed (for 4 projects):**
- 2GB RAM minimum (1GB per large project)
- 20GB SSD storage
- Ubuntu 22.04 LTS

#### 2. Deploy n8n on Your VPS

**Step 1: SSH into your VPS**
```bash
ssh root@your.vps.ip.address
```

**Step 2: Install Docker**
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

**Step 3: Create n8n Docker setup**
```bash
mkdir -p ~/n8n-data
cd ~/n8n-data

# Create docker-compose.yml
cat > docker-compose.yml << 'EOF'
version: '3.8'
services:
  n8n:
    image: n8nio/n8n:latest
    container_name: n8n
    ports:
      - "5678:5678"
    environment:
      - N8N_HOST=your.vps.ip.address
      - N8N_PORT=5678
      - N8N_PROTOCOL=http
      - WEBHOOK_URL=http://your.vps.ip.address:5678/
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=your_secure_password_here
      - N8N_ENCRYPTION_KEY=your-32-char-encryption-key-here
      - TZ=America/New_York
    volumes:
      - ./n8n_data:/home/node/.n8n
    restart: unless-stopped
    networks:
      - n8n-network

networks:
  n8n-network:
    driver: bridge
EOF
```

**Step 4: Start n8n**
```bash
docker-compose up -d
```

**Step 5: Access n8n**
- Open `http://your.vps.ip.address:5678`
- Login with admin credentials from Step 3
- You're now running n8n! ✅

#### 3. Set Up SSL (HTTPS) with Let's Encrypt

```bash
# Install Certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx -y

# Get certificate (replace with your domain)
sudo certbot certonly --standalone -d yourdomain.com

# Update docker-compose.yml to use HTTPS
# Add to volumes:
#   - /etc/letsencrypt:/etc/letsencrypt:ro
# Update environment:
#   - N8N_PROTOCOL=https
```

#### 4. Set Up Reverse Proxy (Optional but Recommended)

Using **Nginx** to handle SSL:

```bash
# Install Nginx
sudo apt-get install nginx -y

# Create Nginx config
sudo cat > /etc/nginx/sites-available/n8n << 'EOF'
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:5678;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/n8n /etc/nginx/sites-enabled/

# Test & reload
sudo nginx -t
sudo systemctl reload nginx
```

#### 5. Import Your 4 Workflows

1. Go to n8n dashboard (http://yourdomain.com)
2. Click **"Projects"** → **"New"** → Name: `Project 1: SnagDeals`
3. Click **"Add Workflow"** → **"Import from File"**
4. Upload `n8n-social-posting-v5-fixed.json`
5. **Repeat for all 4 projects** (or create separate projects)

#### 6. Configure Credentials Per Project

For each project, add credentials:

**Telegram (for all 4 projects)**
1. Settings → Credentials → **New**
2. Type: `Telegram`
3. Paste bot token
4. Name: `Telegram_SnagDeals`, `Telegram_TravelDeals`, etc.

**Reddit (for all 4 projects)**
1. Settings → Credentials → **New**
2. Type: `HTTP Basic Auth`
3. Username: Reddit CLIENT_ID
4. Password: Reddit SECRET
5. Name: `Reddit_OAuth_Project1`, etc.

#### 7. Set Workflow Schedules

For each workflow:
1. Open workflow
2. Click **"Trigger Node"** (usually the first node)
3. Set **"Execution"** → **"Schedule"**:
   - Every 30 minutes for deal scraping
   - Every 6 hours for posting (to avoid spam)

#### 8. Monitor All Projects

**View logs in real-time:**
```bash
docker logs -f n8n
```

**Check if container is running:**
```bash
docker ps | grep n8n
```

**Restart if needed:**
```bash
docker-compose restart
```

---

### Credentials Checklist for 4 Projects

Create this table and fill in each project:

| Project | Telegram Bot | Telegram Channel | Reddit Account | Reddit Client ID | Reddit Secret | API URL | API Secret |
|---------|---|---|---|---|---|---|---|
| **SnagDeals** | @SnagDealsBot | @SnagDealsDeals | SnagDealsDeals | abc123... | xyz789... | https://api.railway.app | secret-key |
| **TravelDeals** | @TravelDealsBot | @TravelDealsHub | TravelDealsBot | def456... | uvw123... | https://travel-api.railway.app | secret-key |
| **TechDeals** | @TechDealsBot | @TechDealsHub | TechDealsBot | ghi789... | rst456... | https://tech-api.railway.app | secret-key |
| **FlightDeals** | @FlightDealsBot | @FlightDealsHub | FlightDealsBot | jkl012... | pqr789... | https://flight-api.railway.app | secret-key |

---

### Scaling n8n (for future growth)

If you need **more power** as your projects grow:

**Option 1: Upgrade VPS**
- $10-20/mo gets you 4GB RAM + better CPU
- Run all 4 projects comfortably

**Option 2: Separate VPS per project**
- Project 1 on VPS A ($5)
- Project 2 on VPS B ($5)
- Project 3 on VPS C ($5)
- Project 4 on VPS D ($5)
- Total: **$20/mo** but better isolation/reliability

**Option 3: Switch to n8n Cloud (only for high-volume)**
- €24/mo per project workspace
- Total: **€96/mo** (overkill for most use cases)

---

## Quick Reference: All Credentials Needed

| Service | What You Need | Where to Get It |
|---|---|---|
| **Supabase** | URL + anon key + service key | supabase.com → Project → Settings → API |
| **Vercel** | Account only | vercel.com |
| **Railway** | Account only | railway.app |
| **Telegram** | Bot Token + Channel ID | @BotFather on Telegram |
| **Reddit** | Client ID + Secret + Username + Password | reddit.com/prefs/apps |
| **Amazon Associates** | Affiliate Tag | affiliate-program.amazon.com |
| **Travelpayouts** | API Token | travelpayouts.com |
| **Google Analytics** | Measurement ID | analytics.google.com |
| **n8n Cloud** | Account + workspace | n8n.io (€24/mo per project) |
| **VPS (DigitalOcean/Linode)** | Server IP + credentials | digitalocean.com or linode.com ($5/mo) |

---

## Total Cost to Run SnagDeals

| Item | Cost |
|---|---|
| Vercel (frontend) | FREE |
| Railway (API) | FREE tier / $5/mo for always-on |
| Supabase (database) | FREE tier (500MB, 50K rows) |
| n8n Cloud | €24/mo (or free self-hosted) |
| Domain (snagdeals.co) | ~$12/year |
| Telegram | FREE |
| Reddit | FREE |
| **TOTAL** | **$0-29/month** |

Expected revenue at 10K monthly visitors: **$400-1,200/month** → pays for itself many times over!
