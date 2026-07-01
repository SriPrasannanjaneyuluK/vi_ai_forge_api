# Production deployment (all on Render)

You likely have **three Render services**:

| Service type | Example URL |
|--------------|-------------|
| Web Service (API) | `https://vi-ai-forge-api.onrender.com` |
| Static Site (portal) | `https://vi-ai-forge.onrender.com` |
| Static Site (admin) | `https://vi-ai-forge-admin.onrender.com` |

Even though everything is on Render, those are **different hostnames** → the browser treats API calls as **cross-origin**.

---

## Issue 1: Logged out after refresh (`refresh` 401)

### Why it happens

1. On login, the API sets an HttpOnly cookie on **`vi-ai-forge-api.onrender.com`**.
2. On page reload, memory is cleared; the app calls `POST /api/auth/refresh` with `credentials: "include"`.
3. The browser must **send that cookie** from your static site origin to the API origin.
4. That is a **cross-origin `fetch`**. With default `SameSite=Lax`, the cookie is **not sent** on this request.
5. API sees no cookie → 401 → you appear logged out.

Being on Render does **not** fix this. Different Render URLs are still different origins.

### Fix (API Web Service → Environment)

Set on the **API** service only:

```
CORS_ORIGIN=https://YOUR-PORTAL.onrender.com,https://YOUR-ADMIN.onrender.com
COOKIE_SECURE=true
COOKIE_SAME_SITE=none
```

Rules:

- Use **exact** static site URLs (copy from Render dashboard).
- **No trailing slash**.
- Include **both** portal and admin if you use both.
- `SameSite=None` requires `Secure=true` (HTTPS — Render provides this).

On each **Static Site** service, set build env:

```
VITE_API_URL=https://vi-ai-forge-api.onrender.com
```

Rebuild/redeploy static sites after changing `VITE_*` vars.

### Verify

1. Log in → Network → `login` → Response has `Set-Cookie` with `Secure` and `SameSite=None`.
2. Hard refresh → `refresh` → Request headers include `Cookie: vj_refresh_token=...`.
3. If login sets cookie but refresh has no `Cookie`, check `CORS_ORIGIN` and cookie env vars on the API.

---

## Issue 2: "Not Found" when refreshing `/login`, `/dashboard`, etc.

### Why it happens

Render Static Sites serve **files**. There is no real file at `/login` — only `index.html` at `/`. A full page refresh asks the server for `/login` → **404 Not Found**.

This is unrelated to auth or Supabase.

### Fix (each Static Site on Render)

**Option A — Render Dashboard (recommended)**

1. Open the static site service → **Redirects/Rewrites**.
2. Add a **Rewrite** rule:
   - Source: `/*`
   - Destination: `/index.html`

**Option B — File in repo**

`public/_redirects` is copied into `dist/` on build. If Render does not pick it up, use Option A.

Redeploy the static site after adding the rule.

---

## Render checklist

**API (Web Service)**

- [ ] `CORS_ORIGIN` = both static URLs
- [ ] `COOKIE_SECURE=true`
- [ ] `COOKIE_SAME_SITE=none`
- [ ] `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`

**Each Static Site**

- [ ] `VITE_API_URL` = API URL (rebuild required)
- [ ] SPA rewrite `/*` → `/index.html`
- [ ] Build command: `npm install && npm run build`
- [ ] Publish directory: `dist`

**Notes**

- Free Web Services **sleep**; first request after idle can be slow.
- `PORT` is injected by Render — do not override in code.
