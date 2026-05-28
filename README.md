# Shelcorp Website

This repository is the source of truth for the static website served from the Shelcorp VPS.

Production host: `server1.shelcorp.com` / `shelcorp.com`

Production checkout on the VPS:

```text
/opt/shelcorp/shel-web
```

Nginx serves this checkout directly as the document root. To deploy changes on the VPS:

```bash
cd /opt/shelcorp/shel-web
./deploy.sh
```

## Local development

```bash
npm install
cp .env.example .env
npm run dev -- --host 0.0.0.0 --port 5173
```

## Database

The app uses PostgreSQL through a server-side Drizzle ORM layer under `server/db/`. Keep `DATABASE_URL` server-only; do not expose it through `VITE_*` variables or import database modules from browser code.

Local setup on macOS uses Homebrew PostgreSQL 18:

```bash
brew install postgresql@18
brew services start postgresql@18
/opt/homebrew/opt/postgresql@18/bin/createdb shel_web_dev
cp .env.example .env
npm run db:migrate
npm run db:check
```

Useful scripts:

```bash
npm run db:generate  # create a migration from server/db/schema.ts
npm run db:migrate   # apply committed migrations
npm run db:check     # verify DATABASE_URL connectivity
```
