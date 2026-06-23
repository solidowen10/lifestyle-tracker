# lürú lifestyle tracker — Deploy Guide

## Stack
- Next.js 16 App Router, TypeScript
- libsql (SQLite) via `@libsql/client` + Drizzle ORM
- No native build deps (libsql is pure JS/WASM)
- PM2 + Nginx on AWS Lightsail

---

## 1. Server setup

```bash
# On server — create data dir
mkdir -p /var/data/lifestyle-tracker

# Clone / copy project
cd /var/www
git clone <your-repo> lifestyle-tracker   # or rsync from local
cd lifestyle-tracker

# Install
npm install

# Run DB migration
DATA_DIR=/var/data/lifestyle-tracker npx ts-node lib/migrate.ts

# Build
npm run build
```

---

## 2. PM2

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

`ecosystem.config.js`:
```js
module.exports = {
  apps: [{
    name: "lifestyle-tracker",
    script: "node_modules/.bin/next",
    args: "start",
    cwd: "/var/www/lifestyle-tracker",
    env: {
      PORT: 3002,
      DATA_DIR: "/var/data/lifestyle-tracker",
      NODE_ENV: "production",
    }
  }]
};
```

---

## 3. Nginx

Add to your Nginx config (alongside existing split-bill block):

```nginx
location /lifestyle-tracker {
    proxy_pass http://localhost:3002;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
```

Add to `next.config.ts`:
```ts
basePath: "/lifestyle-tracker"
```

Then reload Nginx: `sudo nginx -s reload`

---

## 4. Goals
Goals are stored in `localStorage` — per-browser, no server state needed.

Default goals: Protein 5, Carbs 3, Alcohol 1, Coffee 2, Exercise 1.
