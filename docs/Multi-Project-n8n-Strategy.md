# 🚀 Multi-Project n8n + Deployment Strategy

## Your 4 Projects Overview

| Project | Purpose | Best Platforms | Update Frequency |
|---------|---------|-----------------|------------------|
| **SnagDeals** | Deal aggregation (Amazon, Walmart, retail) | Telegram, Reddit r/deals, TikTok | Every 30 min |
| **Viral-Poster** | Social media content + viral mechanics | TikTok, Instagram, Twitter, Discord | Every 1-2 hours |
| **Stock-Crypto-Analyzer** | Financial data + price alerts | Twitter, Telegram, Reddit r/crypto | Every 15 min |
| **Short-Stories** | AI-generated stories + storytelling | TikTok, Instagram, Medium, Discord | Daily |

---

## 💰 Cost Comparison: n8n Cloud vs Self-Hosted

### Option 1: n8n Cloud (€24/mo per project)

**Total for 4 projects: €96/mo (~$105/mo)**

| Project | Cost | Per-Day Cost |
|---------|------|-------------|
| SnagDeals | €24 | $3.50 |
| Viral-Poster | €24 | $3.50 |
| Stock-Crypto-Analyzer | €24 | $3.50 |
| Short-Stories | €24 | $3.50 |
| **TOTAL** | **€96/mo** | **$14/day** |

**Pros:**
- ✅ No infrastructure management
- ✅ Auto-scaling
- ✅ Built-in monitoring
- ✅ Easy backup/restore

**Cons:**
- ❌ Expensive for side projects
- ❌ Vendor lock-in
- ❌ Limited customization

---

### Option 2: Self-Hosted n8n on VPS (RECOMMENDED)

**Total for 4 projects: $5-10/mo (~$5-10/mo)**

#### Architecture: Single VPS Running All 4 Projects

```
VPS ($5/mo) → Docker Container (n8n) → 4 Projects
                    ↓
              MongoDB (local)
                    ↓
            Reverse Proxy (Nginx) + SSL
```

**Specs Needed:**
- **CPU:** 2-4 vCPU (DigitalOcean's $5/mo = 1 vCPU; upgrade to $10/mo = 2 vCPU for all 4)
- **RAM:** 4GB minimum
- **Storage:** 30GB SSD
- **Bandwidth:** Unlimited

| Provider | Cost | Specs |
|----------|------|-------|
| DigitalOcean | $5/mo | 1 vCPU, 1GB RAM (tight) |
| DigitalOcean | $12/mo | 2 vCPU, 2GB RAM (ideal for all 4) |
| Linode | $5/mo | 1 vCPU, 1GB RAM |
| Hetzner | €4/mo | 2 vCPU, 4GB RAM (BEST VALUE) |
| Vultr | $2.50/mo | 512MB RAM (too small) |

**Recommendation: Hetzner CX11 (€4/mo) + Cloudflare ($0-20/mo)**

**Pros:**
- ✅ **Save €87/mo** vs n8n Cloud
- ✅ Full control
- ✅ Unlimited workflows
- ✅ Custom integrations
- ✅ Local storage for large data

**Cons:**
- ⚠️ You manage uptime
- ⚠️ Manual backups
- ⚠️ Learning curve

---

## 🏗️ Recommended Architecture: Single VPS for All 4 Projects

```
┌─────────────────────────────────────────┐
│          1 VPS ($5-10/mo)               │
├─────────────────────────────────────────┤
│  Nginx (Reverse Proxy + SSL)            │
│  ├─ https://snagdeals.n8n.dev           │
│  ├─ https://viral-poster.n8n.dev        │
│  ├─ https://stock-crypto.n8n.dev        │
│  └─ https://short-stories.n8n.dev       │
├─────────────────────────────────────────┤
│  Docker Container (n8n)                 │
│  ├─ /data (persistent volume)           │
│  └─ Port 5678 (internal)                │
├─────────────────────────────────────────┤
│  MongoDB (optional, for state)          │
│  Database Vol (persistent)              │
├─────────────────────────────────────────┤
│ Project 1: SnagDeals                    │
│ ├─ Scraper: SlickDeals, DealNews, etc   │
│ ├─ DB: Supabase (deals)                 │
│ ├─ Posting: Telegram, Reddit, TikTok    │
│ └─ Schedule: Every 30 min               │
├─────────────────────────────────────────┤
│ Project 2: Viral-Poster                 │
│ ├─ Content Gen: AI text + image         │
│ ├─ Uploader: TikTok, Instagram, Twitter │
│ ├─ DB: Supabase (content)               │
│ └─ Schedule: Every 1-2 hours            │
├─────────────────────────────────────────┤
│ Project 3: Stock-Crypto-Analyzer        │
│ ├─ Data: CoinGecko, Yahoo Finance API   │
│ ├─ Analysis: Price alerts, signals      │
│ ├─ Posting: Twitter, Telegram, Discord  │
│ └─ Schedule: Every 15 min               │
├─────────────────────────────────────────┤
│ Project 4: Short-Stories                │
│ ├─ Gen: AI (OpenAI, Claude)             │
│ ├─ Format: TikTok script, Instagram post│
│ ├─ DB: Supabase (stories)               │
│ ├─ Posting: TikTok, Medium, Discord     │
│ └─ Schedule: Daily at 9am + 5pm         │
└─────────────────────────────────────────┘
```

**Total Monthly Cost:**
- VPS: $10/mo (Hetzner CX11)
- Cloudflare: FREE (or $20/mo Pro for advanced)
- Supabase: FREE tier (all projects combined)
- Telegram/Reddit/etc: FREE
- **TOTAL: $10/mo** 🎉

---

## 📋 Implementation Roadmap

### Phase 1: Foundation (Week 1)
- [ ] Spin up Hetzner VPS (CX11, €4/mo)
- [ ] Install Docker + Docker Compose
- [ ] Deploy n8n self-hosted instance
- [ ] Set up Nginx reverse proxy + SSL
- [ ] Create 4 n8n Projects (separate orgs)

### Phase 2: Project Setup (Weeks 2-3)
- [ ] **SnagDeals:** Import existing workflow + test Telegram/Reddit posting
- [ ] **Viral-Poster:** Set up OpenAI API + TikTok/Instagram credentials
- [ ] **Stock-Crypto-Analyzer:** Connect CoinGecko + Twitter API
- [ ] **Short-Stories:** Set up Claude/OpenAI + Discord webhook

### Phase 3: Optimization (Week 4)
- [ ] Set up monitoring (n8n built-in + New Relic / Datadog)
- [ ] Configure auto-backups to S3
- [ ] Create runbooks for common failures
- [ ] Set up status page

---

## 🛠️ Step-by-Step VPS Setup

### 1. Create Hetzner Account & Deploy VPS

```bash
# 1. Go to https://www.hetzner.com/cloud
# 2. Create account
# 3. Create project
# 4. Create server:
#    - Image: Ubuntu 22.04 LTS
#    - Type: CX11 (2 vCPU, 4GB RAM, 40GB SSD) - €4/mo
#    - Datacenter: Choose closest region
#    - Add SSH key
# 5. Note the IP: your.vps.ip.address
```

### 2. SSH Into VPS

```bash
ssh root@your.vps.ip.address
```

### 3. Install Docker + Docker Compose

```bash
# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
usermod -aG docker root

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
docker-compose --version
```

### 4. Create n8n + MongoDB Docker Setup

```bash
mkdir -p /opt/n8n-multi-project
cd /opt/n8n-multi-project

# Create docker-compose.yml
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  # Main n8n instance (all 4 projects)
  n8n:
    image: n8nio/n8n:latest
    container_name: n8n-production
    restart: unless-stopped
    ports:
      - "5678:5678"
    environment:
      # Basic settings
      - N8N_HOST=0.0.0.0
      - N8N_PORT=5678
      - N8N_PROTOCOL=https
      - WEBHOOK_URL=https://your-domain.com/
      
      # Security
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=CHANGE_THIS_SECURE_PASSWORD
      - N8N_ENCRYPTION_KEY=CHANGE_THIS_32_CHAR_RANDOM_KEY
      
      # Database (MongoDB for persistence)
      - DB_TYPE=mongodb
      - DB_MONGODB_CONNECTION_URL=mongodb://n8n-mongo:27017
      
      # Timezone
      - TZ=UTC
      - N8N_TIMEZONE=UTC
      
      # Allow external trigger calls
      - WEBHOOK_TUNNEL_URL=https://your-domain.com/
      - GENERIC_FUNCTION_ALLOW_EXTERNAL=false
      
      # Execution
      - EXECUTIONS_TIMEOUT=3600
      - EXECUTIONS_TIMEOUT_MAX=86400
      
    volumes:
      - n8n-data:/home/node/.n8n
      - /etc/letsencrypt:/etc/letsencrypt:ro
    depends_on:
      - n8n-mongo
    networks:
      - n8n-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5678/healthz"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # MongoDB for n8n data persistence
  n8n-mongo:
    image: mongo:latest
    container_name: n8n-mongo
    restart: unless-stopped
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: CHANGE_THIS_MONGO_PASSWORD
    volumes:
      - n8n-mongo-data:/data/db
    networks:
      - n8n-network
    command: mongod --auth

volumes:
  n8n-data:
  n8n-mongo-data:

networks:
  n8n-network:
    driver: bridge
EOF

# Start containers
docker-compose up -d
```

### 5. Install & Configure Nginx + SSL

```bash
# Install Nginx
apt install -y nginx certbot python3-certbot-nginx

# Create Nginx config for n8n
cat > /etc/nginx/sites-available/n8n << 'EOF'
# HTTP redirect to HTTPS
server {
    listen 80;
    server_name your-domain.com *.your-domain.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS
server {
    listen 443 ssl http2;
    server_name your-domain.com *.your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    # SSL best practices
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=n8n_limit:10m rate=10r/s;
    limit_req zone=n8n_limit burst=20 nodelay;

    location / {
        proxy_pass http://localhost:5678;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_buffering off;
        proxy_request_buffering off;
        proxy_redirect http:// https://;
    }

    location /webhooks {
        proxy_pass http://localhost:5678;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Enable site
ln -s /etc/nginx/sites-available/n8n /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test config
nginx -t

# Get SSL certificate
# Replace your-domain.com with your actual domain
certbot certonly --standalone -d your-domain.com -d '*.your-domain.com' --agree-tos -n -m admin@your-domain.com

# Enable auto-renewal
systemctl enable certbot.timer
systemctl start certbot.timer

# Reload Nginx
systemctl reload nginx
```

### 6. Verify n8n is Running

```bash
# Check containers
docker ps

# View logs
docker logs -f n8n-production

# Access n8n
# Open: https://your-domain.com
# Login with admin / CHANGE_THIS_SECURE_PASSWORD
```

---

## 📊 Project-Specific Setup Guide

### Project 1: SnagDeals
```
Workflows Needed:
  1. Scraper (30 min interval)
     - Inputs: 5 RSS feeds + HTTP scrapes
     - Output: Deals → Supabase
  
  2. Social Poster (30 min interval)
     - Input: Top 5 deals from DB
     - Outputs: Telegram, Reddit, TikTok

Credentials:
  - Supabase (deals DB)
  - Telegram bot token + channel ID
  - Reddit client ID + secret
  - TikTok API keys (if available)

Database:
  - Supabase table: deals
  - Columns: title, price, discount, store, image_url, etc.
```

### Project 2: Viral-Poster
```
Workflows Needed:
  1. Content Generator (every 1 hour)
     - Input: Topic from queue
     - OpenAI/Claude API → Generate title + description
     - Output: Store in Supabase
  
  2. Image Generator (as needed)
     - Input: Content title
     - Stable Diffusion / Midjourney → Generate image
     - Output: Upload to CDN
  
  3. Auto-Poster (every 2 hours)
     - Input: Ready content
     - Outputs: TikTok, Instagram, Twitter, Discord

Credentials:
  - OpenAI API key (GPT-4)
  - Stability AI key (images)
  - TikTok API
  - Instagram Graph API
  - Twitter API v2
  - Discord webhook

Database:
  - Supabase table: viral_content
  - Columns: title, description, image_url, platform, posted_at, engagement
```

### Project 3: Stock-Crypto-Analyzer
```
Workflows Needed:
  1. Price Fetcher (every 15 min)
     - Input: Ticker list (BTC, ETH, AAPL, etc.)
     - CoinGecko + Yahoo Finance API
     - Output: Store prices in time-series DB
  
  2. Signal Generator (every 15 min)
     - Input: Price data
     - Analysis: Moving averages, RSI, MACD
     - Output: Signals (BUY, SELL, HOLD)
  
  3. Alert Poster (when signal triggered)
     - Input: Signal alert
     - Outputs: Twitter, Telegram, Discord, Email

Credentials:
  - CoinGecko API (free)
  - Yahoo Finance API
  - Twitter API v2
  - Telegram bot token
  - Discord webhook
  - Email (Gmail/SendGrid)

Database:
  - Supabase table: crypto_prices (time-series)
  - Supabase table: signals
  - Columns: ticker, price, timestamp, signal_type, confidence
```

### Project 4: Short-Stories
```
Workflows Needed:
  1. Story Generator (daily at 9am)
     - Input: Genre + theme
     - Claude/GPT-4 API → Generate story
     - Output: Store in Supabase
  
  2. Format Converter (daily at 10am)
     - Input: Story text
     - Create: TikTok script (under 60 sec read time)
     - Create: Instagram post (caption + image)
     - Create: Medium article (formatted)
  
  3. Media Generator (daily at 11am)
     - Input: Story
     - Generate images for each scene (Stable Diffusion)
     - Output: Upload to CDN
  
  4. Auto-Poster (daily at 12pm)
     - Input: Formatted content + media
     - Outputs: TikTok, Instagram, Medium, Discord

Credentials:
  - OpenAI/Claude API key
  - Stability AI (images)
  - TikTok API
  - Instagram Graph API
  - Medium API (or custom publishing)
  - Discord webhook

Database:
  - Supabase table: stories
  - Columns: title, content, genre, theme, status, published_links
```

---

## 🔑 API Keys & Credentials Summary

### Required for All Projects

| Service | Cost | What You Get | Link |
|---------|------|-------------|------|
| Supabase | FREE tier | 500MB DB for all projects | supabase.com |
| Telegram | FREE | Bot API (unlimited) | @BotFather |
| Discord | FREE | Webhook (unlimited) | discord.com/developers |

### Project 1: SnagDeals

| Service | Cost | Where to Get |
|---------|------|-------------|
| Reddit | FREE | reddit.com/prefs/apps |
| TikTok | FREE (limited) | developers.tiktok.com |

### Project 2: Viral-Poster

| Service | Cost | Limit |
|---------|------|-------|
| OpenAI GPT-4 | $0.03-0.06/1K tokens | Pay-as-you-go |
| Stability AI | Free tier exists | 50 imgs/day free |
| Instagram Graph API | FREE | Part of Meta |
| Twitter API v2 | FREE tier | 450K tweets/month |

### Project 3: Stock-Crypto-Analyzer

| Service | Cost | Limit |
|---------|------|-------|
| CoinGecko | FREE | 50 calls/min |
| Yahoo Finance | FREE | Via unofficial API |
| Twitter API v2 | FREE tier | 450K tweets/month |

### Project 4: Short-Stories

| Service | Cost | Limit |
|---------|------|-------|
| Claude API | $3/M tokens (input), $15/M (output) | Pay-as-you-go |
| Stability AI | FREE tier | 50 imgs/day free |
| Medium API | FREE | Custom publishing |

---

## 📈 Expected Traffic & Revenue

### SnagDeals
```
- 1,000 deals/day
- 100-500 Telegram subs (month 1)
- 50-200 Reddit engagements/day
- CPM: $2-5 (deal aggregation)
- Monthly revenue: $500-1,500
```

### Viral-Poster
```
- 100-500 posts/month
- 10K-50K TikTok followers (month 3)
- CPM: $0.25-0.75 (low CPM content)
- Affiliate: 5-15% conversion
- Monthly revenue: $200-800
```

### Stock-Crypto-Analyzer
```
- 1,000+ alerts/month
- 500-2,000 Twitter followers
- Affiliate (brokers): $50-500/month
- Premium signals: $5-20/user/month
- Monthly revenue: $300-2,000
```

### Short-Stories
```
- 30 stories/month
- 5K-20K Medium followers
- TikTok: 10K-100K followers
- Medium Partner Program: $50-500/month
- TikTok Creator Fund: $200-1,000/month
- Monthly revenue: $250-1,500
```

**Total Potential Monthly Revenue: $1,250 - $5,800/month** (at scale)
**Total Infrastructure Cost: $10/mo**

---

## 🚨 Monitoring & Maintenance

### Weekly Checks
```bash
# SSH into VPS
ssh root@your.vps.ip.address

# Check container health
docker ps
docker stats

# View logs
docker logs n8n-production | tail -100

# Check disk space
df -h

# Monitor processes
top -b -n 1 | head -20
```

### Monthly Maintenance
- [ ] Update Docker images: `docker-compose pull && docker-compose up -d`
- [ ] Backup MongoDB: `docker exec n8n-mongo mongoump`
- [ ] Check SSL cert renewal: `certbot renew --dry-run`
- [ ] Review n8n execution logs for errors
- [ ] Update API credentials if needed

### Automated Backups to S3

```bash
# Install AWS CLI
apt install -y awscli

# Create backup script
cat > /opt/n8n-multi-project/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_PATH="/tmp/n8n-backup-$BACKUP_DATE"

mkdir -p $BACKUP_PATH

# Backup MongoDB
docker exec n8n-mongo mongodump \
  --username admin \
  --password CHANGE_THIS_MONGO_PASSWORD \
  --authenticationDatabase admin \
  --out $BACKUP_PATH/mongodb

# Backup n8n data
docker cp n8n-production:/home/node/.n8n $BACKUP_PATH/n8n-data

# Compress
tar -czf /tmp/n8n-backup-$BACKUP_DATE.tar.gz -C /tmp n8n-backup-$BACKUP_DATE

# Upload to S3
aws s3 cp /tmp/n8n-backup-$BACKUP_DATE.tar.gz s3://your-bucket/backups/

# Cleanup
rm -rf $BACKUP_PATH /tmp/n8n-backup-$BACKUP_DATE.tar.gz

echo "Backup complete: s3://your-bucket/backups/n8n-backup-$BACKUP_DATE.tar.gz"
EOF

chmod +x /opt/n8n-multi-project/backup.sh

# Add to crontab (daily at 2am)
crontab -e
# Add: 0 2 * * * /opt/n8n-multi-project/backup.sh
```

---

## 🎯 Action Plan for This Week

### Day 1-2: VPS Setup
- [ ] Create Hetzner account
- [ ] Spin up CX11 VPS (€4/mo)
- [ ] SSH access working
- [ ] Docker installed

### Day 3: n8n Setup
- [ ] Docker Compose deployed
- [ ] n8n + MongoDB running
- [ ] Nginx + SSL configured
- [ ] n8n accessible at https://your-domain.com

### Day 4: Project 1 (SnagDeals)
- [ ] Import existing workflow
- [ ] Configure Telegram + Reddit
- [ ] Test scraper & posting
- [ ] Set schedule: every 30 min

### Day 5: Project 2 (Viral-Poster)
- [ ] Create OpenAI workflow
- [ ] Configure Instagram + Twitter
- [ ] Test content generation
- [ ] Set schedule: every 1 hour

### Day 6: Project 3 (Stock-Crypto)
- [ ] Create price fetcher workflow
- [ ] Configure signal generator
- [ ] Test alerts
- [ ] Set schedule: every 15 min

### Day 7: Project 4 (Short-Stories)
- [ ] Create story generator
- [ ] Configure multi-platform posting
- [ ] Test full flow
- [ ] Set daily schedule

---

## 💡 Tips for Success

1. **Start with one project** - Get SnagDeals running perfectly first
2. **Test locally** - Use workflow "Debug" mode before activating
3. **Monitor execution logs** - n8n shows detailed error traces
4. **Use environment variables** - Don't hardcode API keys in workflows
5. **Set up error notifications** - Email alerts for failed executions
6. **Backups are critical** - Automate S3 backups weekly
7. **Don't restart n8n frequently** - MongoDB might get corrupted
8. **Use rate limiting** - Respect API quotas for CoinGecko, Twitter, etc.

---

## 📞 Troubleshooting

### n8n won't start
```bash
docker logs n8n-production
# Check Docker disk space: docker system df
# Try: docker-compose restart
```

### MongoDB connection failed
```bash
docker logs n8n-mongo
# Check volumes: docker volume ls
# Rebuild: docker-compose down -v && docker-compose up -d
```

### SSL certificate expired
```bash
certbot renew
systemctl reload nginx
```

### Workflow executions slow
```bash
# Check MongoDB size
docker exec n8n-mongo du -sh /data/db

# Clear old executions (n8n Settings → Executions → Prune)
```

---

## Summary: Your Total Monthly Costs

| Item | Cost |
|------|------|
| Hetzner VPS | €4 (~$4.50) |
| Cloudflare (optional) | $0-20 |
| Supabase | FREE (tier 1) |
| All APIs (Telegram, Reddit, etc.) | FREE |
| **TOTAL** | **$4.50/mo** |

**Contrast with n8n Cloud for 4 projects: €96/mo = ~**$100/mo**

**Your savings: ~$1,140/year** 🎉

Get started today!
