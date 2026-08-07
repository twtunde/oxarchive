---
description: Reusable build instructions for car auction and sales platforms using the Oxarchive design system.
applyTo: "**/*.{ts,tsx,js,jsx,css,scss,json,md}"
---

# Car Auction Platform Style Instructions

Use these instructions whenever building or extending a car auction and sales platform from this codebase style.

## Core Stack

1. Next.js App Router with TypeScript.
2. Tailwind CSS v4 and shadcn UI primitives.
3. Drizzle ORM with Neon Postgres.
4. Upstash Redis for caching and lightweight state checks.
5. Resend for transactional email.
6. Zustand for persisted client-side state.
7. TanStack Query for client data fetching.

## Design Language

1. Editorial-commerce visual style.
2. Strong typography hierarchy for titles, metadata, and pricing.
3. Neutral tones with high-contrast text.
4. Minimal chrome, spacious layout, clear call-to-action emphasis.
5. Route-level loading and action-level pending states with skeletons.

## Navigation Pattern

1. Desktop: persistent sidebar.
2. Mobile: bottom dock with quick actions and counters.
3. Search in sticky header where listing discovery is primary.

## Required Product Areas

1. Public storefront:

- Home
- Listings catalog
- Listing detail
- Search and sort
- Category filter drawer

2. Buyer area:

- Watchlist
- Active bids
- Won auctions
- Saved payment methods

3. Seller area:

- Create listing
- Manage listings
- Offer/auction status

4. Admin area:

- Moderation queue
- Category management (create/edit/delete safeguards)
- User and listing oversight
- Email template test tools

## Data Model Expectations

At minimum include tables for:

1. users
2. vehicles
3. listings
4. bids
5. orders or transactions
6. payments
7. categories
8. notifications

## UX Rules

1. Any filter change resets pagination.
2. Any destructive action requires explicit confirmation.
3. Payment and fulfillment states must be explicit and traceable.
4. Always show empty-state and error-state UI for list screens.
5. Provide mobile-first interaction support for all buyer flows.

## Operational Rules

1. Add health endpoint checks for database and Redis.
2. Revalidate relevant pages after admin mutations.
3. Invalidate cache namespaces after writes.
4. Keep admin routes excluded from public robots crawl where appropriate.

## Implementation Rules

1. Prefer server actions for protected writes.
2. Validate all form input with zod.
3. Keep query and mutation logic in db/queries and route/action modules.
4. Reuse UI primitives from components/ui before adding custom atoms.
5. Keep folder structure consistent with docs/blueprints/car-auction-bootstrap.md.
