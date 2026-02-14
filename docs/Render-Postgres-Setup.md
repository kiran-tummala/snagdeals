# Render Postgres Setup for n8n

**Quick overview:**
- Render offers free Postgres with IPv4 + IPv6 support
- Connection string format is identical to Supabase
- Takes ~3 minutes to create and connect

---

## Step 1: Create Render Postgres Instance

1) Go to https://render.com and sign up (free)
2) Dashboard → Create New → PostgreSQL
3) Fill in:
   - **Name:** `snagdeals-postgres` (or any name)
   - **Database:** `snagdeals` (or `postgres`)
   - **User:** `postgres` (default)
   - **Region:** Choose closest to your VPS (or same as Hetzner)
   - **PostgreSQL Version:** Latest (15+)
4) Click "Create Database"
5) Wait 2–5 minutes for provisioning

---

## Step 2: Get Connection Details

After creation, the database page shows:

- **External Database URL** (copy this)
  - Format: `postgresql://user:password@host:5432/database`
- **Host**
- **Port** (usually 5432)
- **Database**
- **User**
- **Password**

---

## Step 3: Parse and Update n8n `.env`

From the Render URL, extract:
- **Host:** the hostname after `@` and before `:`
- **Port:** 5432 (usually)
- **Database:** name after last `/`
- **User:** before the first `:`
- **Password:** between `:` and `@`

Example Render URL:
```
postgresql://postgres:abc123xyz@snagdeals-pg.render.com:5432/snagdeals
```

Becomes `.env`:
```
DB_POSTGRESDB_HOST=snagdeals-pg.render.com
DB_POSTGRESDB_PORT=5432
DB_POSTGRESDB_DATABASE=snagdeals
DB_POSTGRESDB_USER=postgres
DB_POSTGRESDB_PASSWORD=abc123xyz
```

---

## Step 4: Update n8n on VPS

SSH to VPS and update `.env`:

```bash
# Backup current .env
sudo cp /opt/snagdeals/.env /opt/snagdeals/.env.bak

# Create new .env with Render credentials (replace values below)
sudo tee /opt/snagdeals/.env > /dev/null <<'EOF'
WEBHOOK_URL=https://snagdeals.cc/
N8N_HOST=snagdeals.cc
GENERIC_TIMEZONE=UTC

DB_POSTGRESDB_HOST=your-render-host.render.com
DB_POSTGRESDB_PORT=5432
DB_POSTGRESDB_DATABASE=snagdeals
DB_POSTGRESDB_USER=postgres
DB_POSTGRESDB_PASSWORD=your_render_password

N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=ReplaceWithAStrongPassword123!
EOF
```

---

## Step 5: Restart n8n

On VPS:

```bash
cd /opt/snagdeals
sudo docker-compose down
sudo docker-compose up -d
sudo docker-compose logs --tail=200 -f n8n
```

Watch logs for 30–60 seconds. If you see:
- **Success:** "Starting n8n" and no DB errors
- **Failure:** "connect ECONNREFUSED" or "ENETUNREACH" (paste the error, I'll fix)

---

## Step 6: Test

Once n8n starts, test:

```bash
curl -I http://127.0.0.1:5678
curl -I https://snagdeals.cc
# Should see 200 OK or 401 (n8n login required)
```

If 502, check logs:
```bash
sudo docker-compose logs n8n --tail=80
```

---

## Troubleshooting

**"connection refused"**
- Check Render firewall: Render Dashboard → Database → Firewall Rules
- Add your VPS IP or allow all (0.0.0.0/0)

**"authentication failed"**
- Double-check user + password in `.env`
- Render user is always `postgres` (unless you created custom user)

**"timeout"**
- Render may be slow on first connection; wait 30 sec and retry

---

## Next: Add Render Firewall Rule (if needed)

If connection still fails, allow your VPS IP:

1) Render Dashboard → Database → Firewall
2) Add rule:
   - **CIDR Block:** `178.156.250.6/32` (your VPS IP)
   - Or allow all: `0.0.0.0/0`
3) Save and retry

---

**Ready?** Paste your Render connection string (or the parsed Host/Port/Database/User/Password) and I'll generate the exact `.env` for you.
