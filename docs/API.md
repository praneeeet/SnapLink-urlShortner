# SnapLink — API Reference

Base URL: `https://snaplink-backend-production.up.railway.app`

All protected endpoints require:
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

---

## Authentication

### POST /api/auth/signup

Register a new user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "created_at": "2026-03-23T05:00:00.000Z"
    }
  }
}
```

---

### POST /api/auth/login

Login with email and password.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe"
    }
  }
}
```

---

### GET /api/auth/me

Get the currently authenticated user.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "created_at": "2026-03-23T05:00:00.000Z"
  }
}
```

---

## URLs

### GET /api/urls

Get all URLs for the authenticated user (paginated).

**Query params:**
| Param | Type | Default | Description |
|---|---|---|---|
| page | number | 1 | Page number |
| limit | number | 10 | Items per page |
| search | string | - | Search by URL or alias |
| filter | string | all | all / active / expired |

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "short_code": "aB3xQ7",
      "original_url": "https://github.com/explore",
      "title": "GitHub · Explore",
      "favicon_url": "https://github.com/favicon.ico",
      "clicks": 284,
      "is_active": true,
      "is_public_stats": false,
      "expires_at": null,
      "max_clicks": null,
      "created_at": "2026-03-20T10:00:00.000Z",
      "sparkline": [12, 18, 45, 67, 34, 22, 86],
      "healthScore": 87
    }
  ],
  "meta": {
    "total": 24,
    "page": 1,
    "limit": 10,
    "totalPages": 3
  }
}
```

---

### POST /api/urls

Create a new short URL.

**Request:**
```json
{
  "originalUrl": "https://github.com/explore",
  "customAlias": "gh-explore",
  "expiresAt": "2026-12-31T23:59:59.000Z",
  "maxClicks": 1000,
  "isPublicStats": false
}
```

Only `originalUrl` is required. All others are optional.

**Response 201:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "short_code": "gh-explore",
    "original_url": "https://github.com/explore",
    "title": null,
    "clicks": 0,
    "is_active": true,
    "created_at": "2026-03-23T05:00:00.000Z"
  }
}
```

---

### POST /api/urls/bulk

Upload a CSV file to create multiple short URLs at once.

**Request:** `multipart/form-data`
```
file: urls.csv
```

**CSV format:**
```csv
url
https://github.com
https://google.com
https://youtube.com
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "created": 14,
    "failed": 1,
    "errors": ["Row 5: Invalid URL format"]
  }
}
```

---

### PATCH /api/urls/:id

Update an existing URL.

**Request:**
```json
{
  "originalUrl": "https://github.com/new-url",
  "customAlias": "new-alias",
  "expiresAt": "2027-01-01T00:00:00.000Z",
  "maxClicks": 500,
  "isActive": true,
  "isPublicStats": true
}
```

All fields are optional.

**Response 200:**
```json
{
  "success": true,
  "data": { "...updated url object..." }
}
```

---

### DELETE /api/urls/:id

Delete a URL and all its visit data.

**Response 200:**
```json
{
  "success": true,
  "data": { "message": "URL deleted successfully" }
}
```

---

## Analytics

### GET /api/analytics/overview

Get account-level analytics across all user URLs.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "totalUrls": 24,
    "totalClicks": 2847,
    "clicksToday": 184,
    "clicksThisWeek": 891,
    "clicksThisMonth": 2340,
    "topCountry": "India",
    "topUrl": {
      "short_code": "railway",
      "clicks": 284
    }
  }
}
```

---

### GET /api/analytics/:id

Get full analytics for a specific URL.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "url": {
      "id": "uuid",
      "short_code": "aB3xQ7",
      "original_url": "https://github.com",
      "title": "GitHub",
      "clicks": 284
    },
    "totalClicks": 284,
    "uniqueVisitors": 201,
    "lastVisited": "2026-03-23T05:28:00.000Z",
    "healthScore": 87,
    "dailyClicks": [
      { "date": "2026-03-23", "clicks": 45 },
      { "date": "2026-03-22", "clicks": 38 }
    ],
    "hourlyHeatmap": [
      { "hour": 0, "clicks": 3 },
      { "hour": 14, "clicks": 48 }
    ],
    "deviceBreakdown": [
      { "device": "mobile", "count": 174 },
      { "device": "desktop", "count": 110 }
    ],
    "browserBreakdown": [
      { "browser": "Chrome", "count": 165 },
      { "browser": "Safari", "count": 91 }
    ],
    "osBreakdown": [
      { "os": "Android", "count": 142 },
      { "os": "iOS", "count": 89 }
    ],
    "countryBreakdown": [
      { "country": "India", "count": 173 },
      { "country": "United States", "count": 65 }
    ],
    "referrerBreakdown": [
      { "referrer_source": "direct", "count": 125 },
      { "referrer_source": "twitter", "count": 68 }
    ],
    "recentVisits": [
      {
        "id": "uuid",
        "visited_at": "2026-03-23T05:28:00.000Z",
        "country": "India",
        "device": "mobile",
        "browser": "Chrome",
        "os": "Android",
        "referrer_source": "twitter"
      }
    ]
  }
}
```

---

### GET /api/analytics/:id/heatmap

Get hourly click distribution for heatmap visualization.

**Response 200:**
```json
{
  "success": true,
  "data": [
    { "hour": 0, "clicks": 3 },
    { "hour": 1, "clicks": 1 },
    { "hour": 9, "clicks": 28 },
    { "hour": 14, "clicks": 48 },
    { "hour": 20, "clicks": 67 },
    { "hour": 21, "clicks": 45 }
  ]
}
```

---

### GET /api/analytics/public/:shortCode

Get public analytics for a link (if is_public_stats = true).

**Response 200:** Same structure as full analytics but without recentVisits.

**Response 403:**
```json
{
  "statusCode": 403,
  "message": "Stats for this link are private"
}
```

---

## Redirect

### GET /:shortCode

Redirect to the original URL.

**Response 302:** Redirects to original URL.

**Response 404:** Short code not found.

**Response 410:**
```json
{
  "statusCode": 410,
  "message": "This link has expired or is no longer active"
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": ["originalUrl must be a URL address"]
}
```

| Status | Meaning |
|---|---|
| 400 | Bad request / validation error |
| 401 | Missing or invalid JWT token |
| 403 | Forbidden — you don't own this resource |
| 404 | Resource not found |
| 409 | Conflict — alias already taken |
| 410 | Gone — link expired or deactivated |
| 500 | Internal server error |
