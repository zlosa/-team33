# HEUMN AI App Deployment Guide

## Deploy to Vercel

### Option 1: Deploy from GitHub (Recommended)

1. **Create a new Vercel project:**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import from GitHub: `secretisgratitude/-team33`
   - **IMPORTANT**: Set Root Directory to `next-js-streaming-example`
   - Framework Preset: Next.js (should auto-detect)

2. **Configure custom domain:**
   - After deployment, go to Project Settings → Domains
   - Add custom domain: `app.heumn.com`
   - Configure DNS: Add CNAME record pointing `app` to your Vercel domain

### Option 2: Deploy via CLI

```bash
cd next-js-streaming-example
npx vercel --prod
# Follow prompts to link to project
```

## Environment Variables

Make sure to add these in Vercel dashboard:
- `HUME_API_KEY` - Your Hume AI API key (if needed for server-side requests)

## DNS Configuration

In your domain provider (where heumn.com is registered):

```
Type: CNAME
Name: app
Value: cname.vercel-dns.com
TTL: 3600
```

## Expected URLs after deployment:
- Landing page: `heumn.com` 
- App: `app.heumn.com`