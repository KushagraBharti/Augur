# Augur

Texas intelligence for businesses evaluating expansion, permitting, policy, and market risk.

## Repo Layout

- `frontend` - Next.js app deployed on Vercel.
- `backend` - thin Node service placeholder for backend-only routes/jobs that do not belong in Next.js.
- `workers` - Railway workers for long-running ingestion and agent jobs.
- `shared` - shared TypeScript types and reusable logic.
- `mcp` - MCP/tool exposure, kept minimal until a separate service is actually needed.
- `supabase` - database migrations for the cloud Supabase project.
- `docs` - product plan, implementation plan, setup notes, and transcript context.
- `skills` - local Augur agent skill/reference material.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` from `.env.example` and fill in the real values.

3. Verify the app can build:

```bash
npm run build
```

## Dev

Start the whole local stack from the project root:

```bash
npm run dev
```

That starts:

- Frontend: `http://localhost:3000`
- Backend health: `http://localhost:3010/health`
- Worker health: `http://localhost:3020/health`

The dev runner loads root `.env.local` and passes it to every service.

## Diagnostics

After `npm run dev`, open:

```text
http://localhost:3000/diagnostics
```

This tests Supabase, Featherless, Exa, OpenStates, Socrata, Apify, and public Texas data sources without exposing secret values in the browser.

## Useful Commands

```bash
npm run build
npm run dev
npm run supabase:types
npm run vercel
npm run railway
```
