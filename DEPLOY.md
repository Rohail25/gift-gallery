# Gift Gallery - Hostinger Deployment Guide

## Problem
Hostinger shared hosting has strict process limits (`ulimit -u`) that prevent `next build` from completing (spawns `tsc --showConfig` → EAGAIN).

## Solution: Build Locally, Deploy Output

### 1. Build on Your Local Machine (Windows/Mac/Linux)
```bash
# Clone repo locally
git clone <your-repo-url>
cd gift-gallery

# Install dependencies
npm ci

# Build for production (creates .next/standalone/)
npm run build

# Verify build works locally
npm run start
# Test at http://localhost:3000
```

### 2. Deploy to Hostinger
Upload these folders to `/home/u645619849/domains/giftgallery.store/public_html/var/www/gift-gallery/`:
```
.next/standalone/          →  .next/standalone/
.next/static/              →  .next/static/
public/                    →  public/
node_modules/.prisma/      →  node_modules/.prisma/   (if using Prisma)
```

**Do NOT upload:** `node_modules/` (except `.prisma`), `.next/cache/`, `.next/dev/`

### 3. Configure Hostinger Node.js App
In Hostinger hPanel → **Node.js App**:
- **App Root**: `/home/u645619849/domains/giftgallery.store/public_html/var/www/gift-gallery`
- **Startup File**: `server.js`
- **Node.js Version**: 22.x
- **Environment Variables**: Add all from `.env` (DATABASE_URL, NEXTAUTH_SECRET, etc.)

### 4. Restart App
Click **Restart** in Node.js App manager.

### 5. Verify
Visit `https://giftgallery.store` - should show your app, not Hostinger default page.

---

## Files Created for Deployment
- `server.js` - Standalone server entry point
- `.htaccess` - Proxies requests to Node.js app on port 3000
- `next.config.ts` - Configured with `output: 'standalone'`

## Current Status
- ✅ Dependencies fixed (`@prisma/client`, `next` in dependencies; `@prisma/adapter-mariadb@^6`)
- ✅ `next.config.ts` set for standalone output
- ❌ **Build cannot run on Hostinger** (process limit)
- ⏳ **Next step**: Build locally, upload `.next/standalone/`
