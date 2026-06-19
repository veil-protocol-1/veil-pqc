# Deploy to Vercel

## First time setup:
npm i -g vercel
vercel login
vercel link  (link to veilprotocol project)
vercel env add KV_REST_API_URL
vercel env add KV_REST_API_TOKEN

## Deploy:
cd apps/landing
vercel --prod

## Custom domain:
In Vercel dashboard → Settings → Domains
Add: veilprotocol.net
Add: www.veilprotocol.net
Follow DNS instructions to point domain to Vercel.

## Environment variables needed:
- KV_REST_API_URL (from Upstash dashboard)
- KV_REST_API_TOKEN (from Upstash dashboard)
These are already in root .env from the old landing package.
