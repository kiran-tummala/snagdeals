SnagDeals static landing page (backup) — includes Travelpayouts script and social links.

Files:
- index.html — simple landing page with Travelpayouts script included in <head>.

How to deploy (GitHub Pages):

1. Initialize a repo (if not already):

```bash
git init
git add .
git commit -m "Add snagdeals landing page"
# create remote on GitHub then:
git remote add origin git@github.com:YOUR_USERNAME/snagdeals.git
git push -u origin main
```

2. Enable GitHub Pages in repo Settings → Pages → set `main` branch and `/ (root)` folder.

3. Visit `https://YOUR_USERNAME.github.io/snagdeals/` after publishing.

How to deploy (Vercel):

```bash
# if you have vercel CLI
npm i -g vercel
vercel login
vercel --prod
```

How to test locally:

```bash
# serve with Python (simple)
python3 -m http.server 8000
# open http://localhost:8000 in browser
```

Security notes:
- This page includes a third-party affiliate script. Confirm with Travelpayouts support if you need special consent for EU visitors.
- Add privacy/affiliate disclosure (already included in page).

Next steps:
- Replace `YOUR_USERNAME` with your GitHub username when pushing.
- If you want, I can create the repo and push the site for you (you must provide GitHub access or run the push locally).