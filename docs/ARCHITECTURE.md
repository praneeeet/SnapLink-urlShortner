# SnapLink — Architecture Document

## System Overview

SnapLink is a three-tier web application:

```
Browser → Vercel (React Frontend)
        → Railway (NestJS Backend)
        → Supabase (PostgreSQL Database)
```

The frontend and backend are completely decoupled. Communication happens via REST API with JWT authentication.

---

## Infrastructure Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER'S BROWSER                          │
│                                                                 │
│   Opens app UI          Makes API calls       Visits short URL  │
│   (React SPA)           (axios + JWT)         (direct to Railway│
└──────┬──────────────────────┬────────────────────────┬──────────┘
       │                      │                        │
       ▼                      ▼                        ▼
┌─────────────┐    ┌─────────────────────┐    ┌───────────────────┐
│   VERCEL    │    │      RAILWAY        │    │      RAILWAY      │
│             │    │   NestJS Backend    │    │  GET /:shortCode  │
│  React 18   │    │                    │    │                   │
│  Vite Build │    │  REST API          │    │  302 redirect     │
│             │    │  JWT Auth          │    │  → original URL   │
│  Static SPA │    │  Business Logic    │    │                   │
│  No SSR     │    │  Analytics         │    │  Async visit log  │
└─────────────┘    └──────────┬──────────┘    └────────┬──────────┘
                              │                        │
                              │ Prisma ORM             │
                              ▼                        ▼
                   ┌─────────────────────────────────────────────┐
                   │              SUPABASE                        │
                   │           PostgreSQL 15                      │
                   │                                             │
                   │   Connection: pgbouncer (port 6543)         │
                   │   Migration:  direct    (port 5432)         │
                   │                                             │
                   │   ┌──────────┐ ┌────────────┐ ┌─────────┐  │
                   │   │  users   │ │    urls    │ │ visits  │  │
                   │   └──────────┘ └────────────┘ └─────────┘  │
                   └─────────────────────────────────────────────┘
```

---

## Backend Module Structure

```
AppModule
├── PrismaModule (@Global)     ← Singleton DB connection
├── AuthModule                 ← JWT, bcrypt, guards
├── UrlsModule                 ← CRUD, nanoid, OG, CSV
├── AnalyticsModule            ← GROUP BY queries, health score
└── RedirectModule             ← GET /:shortCode (imported FIRST)
```

**Why RedirectModule is imported first:**
NestJS registers routes in import order. If UrlsModule registers `/api/urls` before RedirectModule registers `/:shortCode`, the dynamic param route `/:shortCode` would never catch API calls. By importing RedirectModule first, `/:shortCode` is registered before `/api/*` routes.

---

## Database Schema

```sql
-- users
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         VARCHAR UNIQUE NOT NULL,
  password_hash VARCHAR NOT NULL,
  name          VARCHAR,
  created_at    TIMESTAMP DEFAULT NOW(),
  updated_at    TIMESTAMP
);

-- urls
CREATE TABLE urls (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  short_code      VARCHAR UNIQUE NOT NULL,    -- indexed
  original_url    TEXT NOT NULL,
  user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
  title           VARCHAR,                    -- OG title
  favicon_url     VARCHAR,                    -- OG favicon
  clicks          INT DEFAULT 0,
  expires_at      TIMESTAMP,
  max_clicks      INT,
  is_active       BOOLEAN DEFAULT true,
  is_public_stats BOOLEAN DEFAULT false,
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP
);
CREATE INDEX idx_urls_short_code ON urls(short_code);
CREATE INDEX idx_urls_user_id ON urls(user_id);

-- visits
CREATE TABLE visits (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url_id          UUID REFERENCES urls(id) ON DELETE CASCADE,
  visited_at      TIMESTAMP DEFAULT NOW(),
  ip_hash         VARCHAR,         -- SHA-256 of IP, never raw
  country         VARCHAR,
  city            VARCHAR,
  device          VARCHAR,         -- mobile/desktop/tablet
  browser         VARCHAR,
  os              VARCHAR,
  referrer        VARCHAR,
  referrer_source VARCHAR          -- direct/google/twitter/etc
);
CREATE INDEX idx_visits_url_id ON visits(url_id);
CREATE INDEX idx_visits_visited_at ON visits(visited_at);
CREATE INDEX idx_visits_url_time ON visits(url_id, visited_at DESC);
```

---

## Data Flow Diagrams

### 1. URL Creation Flow

```
POST /api/urls
│
├── JwtAuthGuard validates Bearer token
├── CreateUrlDto validates input (@IsUrl, etc.)
├── Check if customAlias already exists
├── Generate nanoid(6) if no custom alias
│   └── Retry up to 5x on collision
├── prisma.url.create()
├── Return short URL to user ← IMMEDIATE
│
└── setImmediate(() => {
      fetch(originalUrl) with 5s timeout
      cheerio.load(html)
      extract og:title + favicon
      prisma.url.update({ title, favicon_url })
    })
```

### 2. Redirect Flow

```
GET /:shortCode
│
├── prisma.url.findUnique({ where: { short_code } })
├── if not found → 404 NotFound
├── if expires_at < now → 410 Gone
├── if !is_active → 410 Gone
├── if clicks >= max_clicks → 410 Gone
│
├── res.redirect(302, original_url) ← SENT IMMEDIATELY
│
└── setImmediate(async () => {
      // Never blocks the redirect
      logVisit(url.id, {
        ip_hash:  sha256(req.ip),
        country:  geoip.lookup(req.ip)?.country,
        device:   uaParser.getDevice(ua).type,
        browser:  uaParser.getBrowser(ua).name,
        os:       uaParser.getOS(ua).name,
        referrer: req.headers.referer,
        referrer_source: classifyReferrer(referer)
      })
      prisma.url.update({ clicks: { increment: 1 } })
      if (url.max_clicks && clicks + 1 >= url.max_clicks) {
        prisma.url.update({ is_active: false })
      }
    })
```

### 3. Analytics Query Flow

```
GET /api/analytics/:id
│
├── Verify user owns this URL
│
└── Promise.all([
      totalClicks:      SELECT COUNT(*) FROM visits WHERE url_id = ?
      uniqueVisitors:   SELECT COUNT(DISTINCT ip_hash) FROM visits WHERE url_id = ?
      lastVisited:      SELECT MAX(visited_at) FROM visits WHERE url_id = ?
      dailyClicks:      SELECT DATE(visited_at), COUNT(*) FROM visits
                        WHERE url_id = ? GROUP BY DATE(visited_at)
                        ORDER BY date DESC LIMIT 30
      hourlyHeatmap:    SELECT EXTRACT(HOUR FROM visited_at), COUNT(*)
                        FROM visits WHERE url_id = ?
                        GROUP BY EXTRACT(HOUR FROM visited_at)
      deviceBreakdown:  SELECT device, COUNT(*) FROM visits
                        WHERE url_id = ? GROUP BY device
      browserBreakdown: SELECT browser, COUNT(*) FROM visits
                        WHERE url_id = ? GROUP BY browser
      countryBreakdown: SELECT country, COUNT(*) FROM visits
                        WHERE url_id = ? GROUP BY country
      referrerBreakdown:SELECT referrer_source, COUNT(*) FROM visits
                        WHERE url_id = ? GROUP BY referrer_source
      recentVisits:     SELECT * FROM visits WHERE url_id = ?
                        ORDER BY visited_at DESC LIMIT 20
      sparkline:        SELECT DATE(visited_at), COUNT(*) FROM visits
                        WHERE url_id = ? AND visited_at > NOW() - 7 days
                        GROUP BY DATE(visited_at)
    ])
    │
    └── Calculate healthScore from results
        Return combined response
```

---

## Health Score Algorithm

```
healthScore = min(100, velocity + recency + diversity + milestone)

velocity  = min(40, clicks_last_7_days × 2)
            → 20+ clicks/week = full velocity score

recency   = last_visit < 24 hours ago ? 25
          : last_visit < 7 days ago   ? 15
          : 0

diversity = min(20, unique_device_types × 7)
            → mobile + desktop + tablet = 21 (capped at 20)

milestone = total_clicks >= 1000 ? 15
          : total_clicks >= 500  ? 10
          : total_clicks >= 100  ? 5
          : 0

Score meaning:
  71–100  🟢 Healthy — active, diverse traffic
  41–70   🟡 Average — some activity
   0–40   🔴 Low — inactive or single source
```

---

## Security Design

| Concern | Solution |
|---|---|
| Password storage | bcrypt with 12 salt rounds |
| Authentication | JWT with 7 day expiry |
| Authorization | JwtAuthGuard on all protected routes |
| URL ownership | user_id check before every CRUD operation |
| IP privacy | SHA-256 hash — raw IP never stored |
| SQL injection | Prisma parameterised queries — no raw string concat |
| CORS | Restricted to FRONTEND_URL env variable |

---

## Environment Configuration

```
Development:  localhost:3000 (backend) + localhost:5173 (frontend)
Production:   Railway (backend) + Vercel (frontend) + Supabase (DB)

Supabase uses two URLs:
  DATABASE_URL  → pooler (port 6543) for all queries
  DIRECT_URL    → direct (port 5432) for migrations only
  (pgbouncer=true for connection pooling compatibility with Prisma)
```
