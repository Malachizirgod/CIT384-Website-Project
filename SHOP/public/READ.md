# Campus Shop (Demo)


A minimal, class-friendly e‑commerce demo: HTML/CSS/JS frontend with a future PHP checkout. No real payments.


## Quick start
```bash
# 1) Create folders
mkdir -p campus-shop/public/assets/js assets/img
# 2) Put files under public/ as shown
# 3) Open in VS Code and use Live Server (optional)
```


## Structure
```
public/
index.html
cart.html
assets/
styles.css
js/
products.js
main.js
cart.js
```


## Next steps
- Push to GitHub (init → commit → remote → push).
- Host static site first (Netlify/Cloudflare Pages) to preview.
- For PHP checkout (sessions, order saving, email), deploy to a PHP host (e.g., DreamHost/Hostinger/Render) and move files to a `/public` web root with `index.php`.


## Security (when adding PHP)
- Use prepared statements (PDO), CSRF tokens, server-side validation, and HTTPS (Let’s Encrypt).