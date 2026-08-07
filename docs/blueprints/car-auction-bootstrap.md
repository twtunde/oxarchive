# Car Auction and Sales Bootstrap Blueprint

Use this prompt to bootstrap a new car auction and sales platform with the Oxarchive-style architecture and UI language.

## System Prompt Template

Build a production-ready car auction and sales platform with:

1. Next.js App Router, TypeScript, Tailwind v4, shadcn UI.
2. Drizzle ORM with Neon Postgres.
3. Upstash Redis cache.
4. Resend transactional emails.
5. Zustand + TanStack Query for client state and data.

Follow the structure and modules exactly below.

## Required Folder Structure

```text
app/
  (public)/
    page.tsx
    listings/
      page.tsx
      [slug]/
        page.tsx
  (auth)/
    login/
      page.tsx
    register/
      page.tsx
  (buyer)/
    watchlist/
      page.tsx
    bids/
      page.tsx
    wins/
      page.tsx
  (seller)/
    listings/
      new/
        page.tsx
      page.tsx
  admin/
    page.tsx
    (protected)/
      listings/
        page.tsx
      categories/
        page.tsx
      users/
        page.tsx
      email-test/
        page.tsx
  api/
    health/
      route.ts
    listings/
      route.ts
    bids/
      route.ts
components/
  ui/
  listing/
  bid/
  nav/
db/
  schema/
  queries/
lib/
  env.ts
  redis.ts
  email.ts
  utils.ts
docs/
  blueprints/
```

## Feature Checklist

1. Listing catalog with category filter drawer and sorting.
2. Listing detail page with bid panel and timeline.
3. Buyer watchlist and active bid tracking.
4. Seller listing creation and status management.
5. Admin category management with create, edit, delete safeguards.
6. Transactional emails for bid/outcome/payment milestones.
7. Health endpoint with database + cache checks.
8. SEO metadata, sitemap, robots, and favicon support.

## Build Commands

```bash
pnpm install
pnpm db:migrate
pnpm dev
```

## Validation Checklist

1. Typecheck and lint pass.
2. Mobile dock and desktop sidebar both work.
3. Category filter updates URL and resets page.
4. Admin protected routes reject unauthenticated access.
5. Email test page can send both admin and user templates.
