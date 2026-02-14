Hetzner + Supabase deployment guide for `n8n` (minimal, hybrid approach)

Overview
--------
This folder contains the files and scripts to provision a small VPS (Hetzner CX11) and run `n8n` in Docker while using Supabase (managed Postgres) for persistence.

Files
-----
- `docker-compose.n8n.yml` - Compose file for `n8n` container (uses external Postgres)
- `nginx/snagdeals.conf` - Nginx reverse proxy template (replace YOUR_DOMAIN_HERE)
- `setup.sh` - Server bootstrap script (run as root; provides automated install & certbot)
- `.env.example` - Example environment file to place at `/opt/snagdeals/.env`

Steps (summary)
----------------
1. Create a Supabase project and note Postgres host, db, user, password.
2. Provision Hetzner CX11 VPS (Ubuntu 22.04 recommended). Note the server IP.
3. Point your domain's A record to the VPS public IP (or use `@` and `www` as needed).
4. Copy files from this `infra/` folder to the VPS (use `scp` or `git clone`).
5. On the VPS:

```bash
# as root or with sudo
cd /path/to/infra
chmod +x setup.sh
sudo ./setup.sh your.domain.com

# After setup finishes, copy .env to /opt/snagdeals/.env (fill with Supabase values)
sudo cp .env.example /opt/snagdeals/.env
sudo nano /opt/snagdeals/.env   # edit with real values

cd /opt/snagdeals
docker compose up -d
```

6. Visit `https://your.domain.com` and login with `N8N_BASIC_AUTH_USER` credentials.

Notes & hardening
------------------
- Use a strong `N8N_BASIC_AUTH_PASSWORD` and restrict admin IPs if desired.
- Consider putting Cloudflare in front for additional DDoS/WAF protection.
- Use Supabase backups; you can also run periodic pg_dump backups to object storage.
- Monitor disk usage for Docker volumes.

Troubleshooting
---------------
- If Nginx fails: `nginx -t` and `journalctl -u nginx -f`
- If Docker containers fail: `docker compose logs -f` in `/opt/snagdeals`
- If webhooks fail: ensure `WEBHOOK_URL` is the public `https://` URL and reachable by services.
