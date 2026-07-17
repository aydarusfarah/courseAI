# Dashboard Routing Fix - Production Deployment Checklist

## Problem Identified
When users clicked the "Open dashboard" button on the homepage, they got **"This site can't be reached"** error instead of loading the dashboard.

## Root Cause Analysis
The Clerk authentication provider was missing critical redirect configuration:
- ❌ No `signInFallbackRedirectUrl` → Clerk redirected to "/" after sign-in instead of back to "/dashboard"
- ❌ No `signUpFallbackRedirectUrl` → New users couldn't complete signup and reach dashboard
- ❌ Missing `NEXT_PUBLIC_APP_URL` in production → Clerk couldn't validate redirect URLs in Vercel

## Changes Made

### 1. Fixed Clerk Provider Configuration
**File:** `components/clerk-provider.tsx`

Added redirect fallbacks so after authentication, users are sent to `/dashboard`:
```typescript
<ClerkProvider
  publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
  signInUrl="/auth/sign-in"
  signUpUrl="/auth/sign-up"
  signInFallbackRedirectUrl="/dashboard"      // ← Added
  signUpFallbackRedirectUrl="/dashboard"      // ← Added
>
```

This ensures:
- Unauthenticated users clicking `/dashboard` → redirected to `/auth/sign-in`
- After successful sign-in → redirected to `/dashboard` (not back to homepage)
- New users signing up → redirected to `/dashboard` (not left at sign-up page)

### 2. Fixed CSP Headers
**File:** `next.config.mjs`

- ✅ Removed incorrect `https://clerk.courseai.app` from script-src (already in CSP)
- ✅ Added `https://clerk.courseai.com` domain to both script-src and connect-src

### 3. Cleaned Up Tailwind Config
**File:** Deleted `tailwind.config.js` (duplicate)

Kept only `tailwind.config.ts` to prevent Next.js build confusion.

---

## Build Verification
✅ Production build completed successfully (15.1 seconds)
✅ All routes compiled correctly
✅ /dashboard route confirmed dynamic (server-rendered)
✅ No syntax or type errors

---

## Required Vercel Environment Variables

Before deploying, ensure these are set in **Vercel Project Settings > Environment Variables** for **Production** environment:

```env
# ── Auth (REQUIRED) ────────────────────────────────────────────
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_[YOUR_PRODUCTION_KEY]
CLERK_SECRET_KEY=sk_live_[YOUR_PRODUCTION_KEY]

# ── Database (REQUIRED) ────────────────────────────────────────
DATABASE_URL=postgresql://[YOUR_CONNECTION_STRING]

# ── App URL (REQUIRED for Clerk) ────────────────────────────────
NEXT_PUBLIC_APP_URL=https://[YOUR_VERCEL_DOMAIN].vercel.app

# ── Environment (REQUIRED) ─────────────────────────────────────
NODE_ENV=production

# ── Optional but Recommended ────────────────────────────────────
OPENAI_API_KEY=sk-proj-[YOUR_KEY]
STRIPE_SECRET_KEY=sk_live_[YOUR_KEY]
NEXT_PUBLIC_POSTHOG_KEY=[YOUR_KEY]
NEXT_PUBLIC_SENTRY_DSN=[YOUR_DSN]
```

---

## Deployment Steps

### Step 1: Verify Local Environment
```bash
npm run build    # Should complete in ~15-20s with no errors
npm run start    # Test locally at http://localhost:3000
```

### Step 2: Update Vercel Environment Variables
1. Go to [Vercel Dashboard](https://vercel.com) → Your Project → Settings → Environment Variables
2. Add/Update:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...` (Production key from Clerk)
   - `CLERK_SECRET_KEY=sk_live_...` (Production key from Clerk)
   - `NEXT_PUBLIC_APP_URL=https://[YOUR_DOMAIN].vercel.app`
   - Set environment to **Production**
3. Click **Save and Deploy** (Vercel will redeploy automatically)

### Step 3: Push to Git (Will Trigger Auto-Deploy)
```bash
git add .
git commit -m "fix: add clerk redirect fallbacks and fix CSP headers"
git push origin main
```

### Step 4: Test in Production
1. Wait for Vercel deployment to complete (~2 minutes)
2. Go to your production URL
3. Click "Open dashboard"
4. Should redirect to Clerk sign-in (if not logged in)
5. After signing in, should land on `/dashboard` (not homepage)
6. Dashboard should render with styling and data

---

## Expected Flow After Fix

### For Unauthenticated Users:
```
Homepage (/dashboard link)
    ↓
Middleware protects /dashboard
    ↓
Redirects to Clerk SignIn
    ↓
User authenticates
    ↓
Clerk redirects to signInFallbackRedirectUrl → /dashboard ✅
    ↓
Dashboard renders with user data
```

### For Authenticated Users:
```
Homepage (/dashboard link)
    ↓
/dashboard loads directly
    ↓
Dashboard renders with user data ✅
```

---

## Rollback Plan

If something goes wrong after deployment:

1. **Revert the Clerk provider config:**
   ```bash
   git revert HEAD
   git push origin main
   ```

2. **Clear Vercel cache:**
   - Go to Vercel Dashboard → Project → Settings → Advanced
   - Click "Clear Build Cache"
   - Redeploy

---

## Files Changed

| File | Change |
|------|--------|
| `components/clerk-provider.tsx` | Added `signInFallbackRedirectUrl="/dashboard"` and `signUpFallbackRedirectUrl="/dashboard"` |
| `next.config.mjs` | Fixed CSP headers (removed duplicate domain, added .com variant) |
| `tailwind.config.js` | Deleted (was duplicate of tailwind.config.ts) |
| `.github/workflows/ci.yml` | No changes needed |

---

## Troubleshooting

### Issue: "Still getting 'This site can't be reached'"
**Likely cause:** Vercel environment variables not updated
- [ ] Check Vercel logs: Vercel Dashboard → Deployments → Function Logs
- [ ] Ensure `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` are set for Production
- [ ] Ensure `NEXT_PUBLIC_APP_URL` matches your actual Vercel domain
- [ ] Redeploy: Vercel Dashboard → Redeploy

### Issue: "Infinite redirect loop"
**Likely cause:** Clerk configuration missing
- [ ] Verify `signInFallbackRedirectUrl` is set to `/dashboard`
- [ ] Check Clerk Dashboard → Settings → Redirect URIs includes your Vercel domain

### Issue: "Dashboard renders but shows empty states"
**Likely cause:** Database connection issue
- [ ] Verify `DATABASE_URL` is correct in Vercel
- [ ] Check if user exists in database: `SELECT * FROM "User" WHERE email = '[your@email.com]'`
- [ ] Check Sentry for errors: Sentry Dashboard → Issues

---

## Performance Notes

- Build time: ~15-20 seconds (normal for Next.js 15 + Prisma)
- Runtime: Dashboard is server-side rendered (dynamic route)
- Database queries are optimized with `Promise.all()` for parallel execution
- Middleware adds ~99KB (Clerk + Sentry)

---

## Verification Checklist

After deployment, verify:

- [ ] Homepage loads without errors
- [ ] "Open dashboard" button navigates to /dashboard
- [ ] Unauthenticated users redirected to Clerk sign-in
- [ ] After sign-in, user lands on dashboard (not homepage)
- [ ] Dashboard shows user data (courses, usage, etc.)
- [ ] Console has no CSP errors or warnings
- [ ] Network tab shows CSS files loading with 200 status
- [ ] Clerk authentication working (sign out and sign back in)
- [ ] No errors in Vercel function logs

---

## Next Steps

1. **Immediate:** Update Vercel environment variables
2. **Immediate:** Deploy this commit to production
3. **Post-deployment:** Test the complete user flow (sign-up → dashboard)
4. **Post-deployment:** Monitor Sentry for any errors
5. **Post-deployment:** Check analytics (PostHog) for user behavior

---

**Questions?** Check the [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) for additional context.
