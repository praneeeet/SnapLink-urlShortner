# SnapLink — AI Planning Document

## Overview

This document covers the complete planning process for SnapLink — from reading the problem statement to building and deploying the application. AI tools were used throughout, and all generated code was reviewed and understood before use.

---

## Tools Used

| Tool | Purpose |
|---|---|
| Claude AI (Anthropic) | Planning, architecture, code generation, debugging |
| GitHub Copilot | Inline code completion |
| Prisma Studio | Database inspection during development |
| Postman | API testing |

---

## Planning Process

### Step 1 — Read and Categorise Requirements

After reading the problem statement, all features were categorised:

**Mandatory (must have):**
- Signup / login with JWT
- Shorten URL → unique short code
- 302 redirect on short URL visit
- Dashboard: view, copy, delete links
- Click count tracking
- Analytics: total clicks, last visited, visit history
- Loading / error states, form validation

**Bonus (extra credit):**
- Custom alias
- QR code
- Expiry date
- Geo + device + browser analytics
- Daily click charts
- Public stats page
- Edit URL
- Bulk CSV

**Unique extras (not in any other submission):**
- Link health score 0–100
- Peak hour heatmap
- Sparklines per URL row
- OG metadata (title + favicon) auto-fetch
- IP hashing for privacy
- Click velocity indicator (trending / cooling)
- Account-level overview dashboard
- Referrer source classification

---

### Step 2 — Database Schema Design

Decided on 3 tables before writing any code:

```
users
  id (UUID PK)
  email (UNIQUE)
  password_hash
  name?
  created_at, updated_at

urls
  id (UUID PK)
  short_code (UNIQUE, indexed)
  original_url
  user_id (FK → users, CASCADE)
  title?, favicon_url?        ← OG metadata
  clicks (default 0)
  expires_at?
  max_clicks?
  is_active (default true)
  is_public_stats (default false)
  created_at, updated_at

visits
  id (UUID PK)
  url_id (FK → urls, CASCADE, indexed)
  visited_at (indexed)
  ip_hash?       ← SHA-256, never raw IP
  country?, city?
  device?, browser?, os?
  referrer?, referrer_source?
  compound index: (url_id, visited_at DESC)
```

**Key decisions:**
- UUID primary keys (not integers) — harder to enumerate/scrape
- Separate visits table (not just a counter) — enables all analytics
- ip_hash not raw IP — GDPR compliance from day one
- Compound index on (url_id, visited_at) — fast recent visits queries

---

### Step 3 — API Endpoint Design

Mapped 13 endpoints across 4 NestJS modules:

```
AuthModule
  POST /api/auth/signup
  POST /api/auth/login
  GET  /api/auth/me

UrlsModule
  GET    /api/urls              (paginated, search, filter)
  POST   /api/urls
  POST   /api/urls/bulk
  PATCH  /api/urls/:id
  DELETE /api/urls/:id

AnalyticsModule
  GET /api/analytics/overview
  GET /api/analytics/public/:code
  GET /api/analytics/:id
  GET /api/analytics/:id/heatmap

RedirectModule (root level — imported FIRST)
  GET /:shortCode
```

**Critical routing decision:** RedirectModule must be imported before all other modules in AppModule. Otherwise `/api/urls` would be caught by `/:shortCode` and fail.

---

### Step 4 — Backend Implementation Order

```
1. PrismaModule     → @Global() singleton, injected everywhere
2. AuthModule       → JWT strategy, JwtAuthGuard, bcrypt
3. UrlsModule       → nanoid, OG fetch, bulk CSV
4. AnalyticsModule  → GROUP BY queries via $queryRaw, health score
5. RedirectModule   → 302 redirect + setImmediate async logging
```

---

### Step 5 — Key Technical Decisions

**Redirect flow (most critical path):**
```typescript
// 1. Validate URL
const url = await this.findAndValidate(shortCode);

// 2. Send redirect IMMEDIATELY — never block on analytics
res.redirect(302, url.original_url);

// 3. Log visit AFTER response sent
setImmediate(async () => {
  await this.logVisit(url.id, req);
  await this.incrementClicks(url.id);
  await this.checkMaxClicks(url);
});
```

**Health score formula:**
```
score = velocity + recency + diversity + milestone

velocity  = min(40, clicks_last_7d * 2)
recency   = last_visit < 24h ? 25 : last_visit < 7d ? 15 : 0
diversity = min(20, unique_devices * 7)
milestone = clicks >= 1000 ? 15 : clicks >= 500 ? 10 : clicks >= 100 ? 5 : 0

final = min(100, score)
```

**OG metadata fetch (non-blocking):**
```typescript
// After createUrl() returns to user
setImmediate(async () => {
  try {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 5000); // 5s timeout
    const res = await fetch(url, { signal: controller.signal });
    const html = await res.text();
    const $ = cheerio.load(html);
    const title = $('meta[property="og:title"]').attr('content') || $('title').text();
    const favicon = `${new URL(url).origin}/favicon.ico`;
    await prisma.url.update({ where: { id }, data: { title, favicon_url: favicon } });
  } catch {
    // Silent fail — link still works without metadata
  }
});
```

**nanoid collision handling:**
```typescript
let shortCode = customAlias || nanoid(6);
let attempts = 0;
while (attempts < 5) {
  const exists = await prisma.url.findUnique({ where: { short_code: shortCode } });
  if (!exists) break;
  shortCode = nanoid(6);
  attempts++;
}
```

---

### Step 6 — Frontend Architecture

```
src/
├── api/
│   ├── axios.ts          ← baseURL from env, JWT interceptor, 401 handler
│   ├── auth.api.ts
│   ├── urls.api.ts
│   └── analytics.api.ts
├── context/
│   └── AuthContext.tsx   ← JWT in localStorage, getMe() on mount
├── pages/
│   ├── Home.tsx          ← public landing + URL shortener
│   ├── Login.tsx
│   ├── Signup.tsx
│   ├── Dashboard.tsx
│   ├── Analytics.tsx
│   └── PublicStats.tsx
├── components/
│   ├── layout/           ← Sidebar, AppLayout, ProtectedRoute
│   ├── url/              ← URLTable, URLRow, SparkLine, modals
│   ├── analytics/        ← StatCard, BarChart, HeatmapGrid, BreakdownBar
│   └── ui/               ← Button, Input, Modal, Toast, Badge
└── utils/
    └── format.ts         ← formatNumber, timeAgo, getShortUrl, healthColor
```

---

### Step 7 — Prompts Used (for interview reference)

```
1. "Design a NestJS + Prisma PostgreSQL schema for a URL shortener
    with full analytics — countries, devices, browsers, referrers,
    hourly heatmap. Use UUID PKs, proper indexes, cascade deletes."

2. "Implement GET /:shortCode in NestJS that does a 302 redirect
    then logs the visit asynchronously using setImmediate without
    blocking the response. Handle expired links with 410 Gone."

3. "Create a health score algorithm for URL links, 0-100 score,
    based on click velocity (last 7 days), recency (last visit),
    device diversity, and click milestones."

4. "Build a React dashboard with dark glass morphism theme,
    fire color palette (#08000a background, #920004 to #F3500A
    gradient), floating stat cards with icon + left glow bar,
    URL table with sparklines and health badges."

5. "Fix NaN% in breakdown percentage calculations and
    decimal Y-axis values in Recharts bar chart."
```

---

## Complete Feature List

### 41 Total Features

| # | Feature | Category | Status |
|---|---|---|---|
| 1 | User signup | Mandatory | ✅ |
| 2 | User login with JWT | Mandatory | ✅ |
| 3 | Protected dashboard routes | Mandatory | ✅ |
| 4 | User owns only their links | Mandatory | ✅ |
| 5 | Shorten any URL | Mandatory | ✅ |
| 6 | Unique short codes | Mandatory | ✅ |
| 7 | 302 redirect | Mandatory | ✅ |
| 8 | URL validation | Mandatory | ✅ |
| 9 | View all links in dashboard | Mandatory | ✅ |
| 10 | Copy short URL | Mandatory | ✅ |
| 11 | Delete URL | Mandatory | ✅ |
| 12 | Click count tracking | Mandatory | ✅ |
| 13 | Visit timestamp recording | Mandatory | ✅ |
| 14 | Analytics page per URL | Mandatory | ✅ |
| 15 | Loading / error states | Mandatory | ✅ |
| 16 | Form validation | Mandatory | ✅ |
| 17 | Custom alias | Bonus | ✅ |
| 18 | QR code generation | Bonus | ✅ |
| 19 | Expiry date | Bonus | ✅ |
| 20 | Geo analytics (country/city) | Bonus | ✅ |
| 21 | Device analytics | Bonus | ✅ |
| 22 | Browser analytics | Bonus | ✅ |
| 23 | Daily click chart | Bonus | ✅ |
| 24 | Public stats page | Bonus | ✅ |
| 25 | Edit URL | Bonus | ✅ |
| 26 | Bulk CSV upload | Bonus | ✅ |
| 27 | Link health score 0–100 | Unique | ✅ |
| 28 | Peak hour heatmap | Unique | ✅ |
| 29 | Sparklines per URL row | Unique | ✅ |
| 30 | OG metadata (title+favicon) | Unique | ✅ |
| 31 | IP hashing SHA-256 | Unique | ✅ |
| 32 | Account-level overview | Unique | ✅ |
| 33 | Referrer classification | Unique | ✅ |
| 34 | OS breakdown | Unique | ✅ |
| 35 | Max click limit | Unique | ✅ |
| 36 | is_active toggle | Unique | ✅ |
| 37 | Expired link 410 Gone page | Unique | ✅ |
| 38 | Async OG fetch (non-blocking) | Unique | ✅ |
| 39 | Public landing page | Unique | ✅ |
| 40 | Skeleton shimmer loaders | Unique | ✅ |
| 41 | Click velocity indicator | Unique | ✅ |
