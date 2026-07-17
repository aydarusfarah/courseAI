# CourseAI Production Deployment Checklist

> **Last Updated:** 2025-01-07  
> **Target:** Vercel Deployment  
> **Status:** Ready for Production

---

## 🔐 **STEP 1: Update Clerk Keys to Production**

### What's the Problem?
Your `.env` contains **development keys** (`pk_test_*`, `sk_test_*`). In production, these:
- Only allow one test user
- Redirect to a development environment
- Cause user ID mismatches between Clerk and your database
- Can trigger CSP/CORS errors

### Action:
1. **Get your Production Keys:**
   - Go to [Clerk Dashboard](https://dashboard.clerk.com)
   - Select your project → **Settings > API Keys**
   - Copy your **Production** keys (NOT test keys):
     - **Publishable Key:** `pk_live_...`
     - **Secret Key:** `sk_live_...`

2. **Update Vercel Environment Variables:**
   - Go to [Vercel Dashboard](https://vercel.com) → Your Project → **Settings > Environment Variables**
   - Add/Update:
     ```
     NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_[PASTE_YOUR_KEY]
     CLERK_SECRET_KEY=sk_live_[PASTE_YOUR_KEY]
     ```
   - Select **Production** environment
   - Click **Save and Deploy**

3. **Update Local Development (optional, but recommended):**
   - Get your **Development keys** from Clerk Dashboard:
     - **Publishable Key:** `pk_test_...`
     - **Secret Key:** `sk_test_...`
   - Update your local `.env` file (don't commit it):
     ```
     NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
     CLERK_SECRET_KEY=sk_test_...
     ```

### Expected Outcome:
✅ Console warnings about Clerk development keys disappear  
✅ Clerk authentication works with real user IDs  
✅ Dashboard shows correct user data from your database

---

## 🎨 **STEP 2: Verify Tailwind CSS Configuration**

### What Was Fixed:
- ❌ Deleted duplicate `tailwind.config.js` (kept `tailwind.config.ts`)
- ✅ Verified Tailwind v4.0 is properly configured with `@tailwindcss/postcss`

### Action:
1. **Rebuild locally to test:**
   ```bash
   npm run build
   npm run start
   ```
   - Verify the dashboard has styling (not naked HTML)

2. **If CSS is still missing:**
   - Check the Network tab in DevTools
   - Confirm `_next/static/css/...` files load with **200** status
   - If 404, your build didn't include CSS → go back to STEP 1

### Expected Outcome:
✅ Dashboard renders with full Tailwind styling  
✅ All components (buttons, cards, forms) are styled  
✅ Dark mode CSS is applied

---

## 🔒 **STEP 3: Review Content Security Policy (CSP)**

### What Was Fixed:
- ✅ Removed hardcoded `https://clerk.courseai.app` (only for custom domains)
- ✅ Added `https://*.clerk.accounts.dev` (Clerk's correct domain)
- ✅ Kept `https://js.clerk.dev` for Clerk's JS SDK

### Current Policy:
```
script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.clerk.dev https://*.clerk.accounts.dev ...
style-src 'self' 'unsafe-inline'
img-src 'self' data: blob: https://img.clerk.com ...
connect-src 'self' https://*.clerk.accounts.dev ...
```

### Action:
- ✅ CSP headers are already updated in `next.config.mjs`
- Monitor the browser console in production for CSP violations
- If you see CSP errors, add the missing domain to the appropriate directive

### Expected Outcome:
✅ No CSP violation warnings in console  
✅ Clerk authentication works without CORS errors

---

## 📊 **STEP 4: Verify Database & User Sync**

### What to Check:
1. **User IDs Match:**
   ```bash
   # In your database:
   SELECT id, "clerkId", email FROM "User" LIMIT 5;
   ```
   - Verify `clerkId` matches the Clerk user ID from your Clerk Dashboard → Users

2. **Test Dashboard Access:**
   - Go to your production URL
   - Sign in with a production Clerk account
   - Verify you see dashboard data (not empty states)
   - Check the database for a new `User` record

### Expected Outcome:
✅ User data appears in dashboard immediately after sign-in  
✅ Database has accurate Clerk user IDs  
✅ No data mismatch errors in logs (Sentry)

---

## 🚀 **STEP 5: Deploy to Vercel**

### Before Deploying:
- [ ] Clerk production keys added to Vercel
- [ ] `tailwind.config.js` deleted
- [ ] CSP headers updated
- [ ] Local build works: `npm run build && npm run start`

### Deploy:
1. **Option A: Auto-deploy from Git**
   ```bash
   git add .
   git commit -m "fix: update clerk keys and csp headers for production"
   git push origin main
   ```
   - Vercel automatically rebuilds on `main` push

2. **Option B: Manual redeploy in Vercel**
   - Go to [Vercel Dashboard](https://vercel.com) → Your Project
   - Click **Redeploy** (with latest environment variables)

### Wait For:
⏳ Build completes (usually 1-2 minutes)  
⏳ Deployment succeeds (shows "Ready")  
⏳ Preview URL updates

### Test Production:
1. Go to your production URL
2. Open DevTools → Console (check for errors)
3. Open DevTools → Network → Refresh
   - Confirm CSS files load with **200** status
   - Confirm Clerk scripts load from `js.clerk.dev`
4. Sign in → verify dashboard has styling and data

---

## 🐛 **Troubleshooting**

### Issue: "Styles not loading in production"
**Causes:**
- Clerk development keys redirect to wrong environment
- Tailwind CSS not compiled correctly
- CSP blocking style injection

**Fix:**
1. Update Clerk keys to production (STEP 1)
2. Rebuild: `npm run build`
3. Check Network tab for CSS file status
4. Check Console for CSP errors

---

### Issue: "Dashboard shows empty states / no data"
**Causes:**
- User ID mismatch (Clerk development vs production)
- User not synced to database
- Wrong database URL in production

**Fix:**
1. Sign out → Sign in again with production Clerk account
2. Check database for new `User` record:
   ```bash
   SELECT * FROM "User" WHERE email = '[your@email.com]';
   ```
3. Verify `NEXT_PUBLIC_APP_URL` matches your Vercel domain

---

### Issue: "CSP violations in console"
**Example error:**
```
Refused to load the script 'https://example.com/file.js' because it violates the Content-Security-Policy
```

**Fix:**
1. Add the domain to the appropriate CSP directive in `next.config.mjs`
2. Redeploy: `git push` or manually redeploy in Vercel

---

## 📋 **Production Environment Variables Template**

Copy these into Vercel **Settings > Environment Variables** for **Production**:

```env
# ── Database ──────────────────────────────────────────────────────────────────
DATABASE_URL=postgresql://...  # Your production Neon/Supabase URL

# ── Auth (Clerk) — PRODUCTION KEYS ────────────────────────────────────────────
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...

# ── App ───────────────────────────────────────────────────────────────────────
NEXT_PUBLIC_APP_URL=https://[YOUR_VERCEL_DOMAIN].vercel.app
NODE_ENV=production

# ── AI (OpenAI) ───────────────────────────────────────────────────────────────
OPENAI_API_KEY=sk-proj-...

# ── Billing (Stripe) ──────────────────────────────────────────────────────────
STRIPE_SECRET_KEY=sk_live_...  # Use live key, not test
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID_MONTHLY=price_...
STRIPE_PRICE_ID_YEARLY=price_...

# ── Optional: Error Monitoring (Sentry) ───────────────────────────────────────
NEXT_PUBLIC_SENTRY_DSN=https://...
SENTRY_AUTH_TOKEN=...
SENTRY_ORG=...
SENTRY_PROJECT=...

# ── Optional: Analytics (PostHog) ─────────────────────────────────────────────
NEXT_PUBLIC_POSTHOG_KEY=...
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# ── Optional: Caching (Upstash Redis) ─────────────────────────────────────────
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
```

---

## ✨ **Next Steps After Successful Deployment**

1. **Monitor in Production:**
   - Watch Sentry for errors
   - Check PostHog for user behavior
   - Monitor Vercel Analytics for performance

2. **Test All Features:**
   - [ ] Authentication (sign-up, sign-in, sign-out)
   - [ ] Dashboard data loads correctly
   - [ ] Course generation works
   - [ ] Billing/Stripe integration works
   - [ ] Admin panel accessible

3. **Document Production URLs:**
   - Production: `https://[YOUR_VERCEL_DOMAIN].vercel.app`
   - Clerk Dashboard: `https://dashboard.clerk.com`
   - Vercel Dashboard: `https://vercel.com`

---

**Questions?** Check `lib/env.ts` for required env variables or `next.config.mjs` for CSP/security headers.
