# Dental AI — Web

Next.js 16 (App Router) + Convex (database, auth, functions) frontend for the
Dental AI diagnostic and quotation platform.

## Local development

```bash
npm install
npx convex dev   # first run: logs in, links/creates a Convex project,
                  # writes CONVEX_DEPLOYMENT / NEXT_PUBLIC_CONVEX_URL to .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). See `.env.local.example`
for the full list of environment variables (most are optional — Password auth
works with none of them set).

## Deploying to Vercel

This app is split across two systems that must both be deployed:

- **Convex** hosts the database, auth, and all `convex/*.ts` functions.
- **Vercel** hosts the Next.js frontend.

`vercel.json` wires these together so a single Vercel deploy pushes both:

```json
{
  "buildCommand": "npx convex deploy --cmd 'npm run build' --cmd-url-env-var-name NEXT_PUBLIC_CONVEX_URL"
}
```

`npx convex deploy` pushes `convex/` to the right Convex deployment (prod for
the `main` branch, a preview deployment per branch for Vercel Preview
deployments), then runs `npm run build` (`next build`) with
`NEXT_PUBLIC_CONVEX_URL` populated for that deployment automatically — you
don't need to set it by hand in Vercel.

### One-time setup

1. **Import the repo into Vercel** and set the project's **Root Directory** to
   `apps/web` (this is a monorepo — `apps/web` is the deployable Next.js app).
2. In the [Convex dashboard](https://dashboard.convex.dev), go to your
   project's **Settings → Deploy Keys** and create a **Production** deploy
   key (create a **Preview** deploy key too if you want Vercel Preview
   deployments to get their own isolated Convex backend per branch).
3. In Vercel's **Project Settings → Environment Variables**, add:
   - `CONVEX_DEPLOY_KEY` — the Production key, scoped to the **Production**
     environment.
   - `CONVEX_DEPLOY_KEY` — the Preview key, scoped to the **Preview**
     environment (Vercel lets you scope the same variable name differently
     per environment).
4. Configure the Convex Auth provider domain: in the Convex dashboard, set the
   `CONVEX_SITE_URL` deployment environment variable (used by
   `convex/auth.config.ts`) to your deployment's `.convex.site` URL — `npx
   convex dev`/`deploy` prints this, and it's also visible in the Convex
   dashboard.
5. Push to `main` (or open a PR) — Vercel will run the build command above,
   which deploys Convex functions and builds the frontend together.

No other Vercel configuration is required: `next.config.ts` needs no
`output` mode changes and the app has no custom server, so Vercel's default
Next.js build/runtime detection handles the rest.
