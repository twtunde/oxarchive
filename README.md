# Oxarchive Ebook Platform (Kickoff)

This repository is the kickoff scaffold for a full-stack ebook marketplace built with:

- Next.js (App Router, TypeScript, Server Components)
- Drizzle ORM + PostgreSQL
- Redis caching
- shadcn/ui + Tailwind

## What Is Included In This Kickoff

- Core database schema for:
  - `categories`
  - `ebooks`
  - `orders`
  - `order_items`
  - `purchases`
- Drizzle config and migration scripts
- Local infrastructure via Docker Compose (`postgres`, `redis`)
- Server-rendered `/catalog` page loading ebooks from Postgres
- Redis-backed cache-aside strategy for catalog listing queries

## Setup

1. Install dependencies:

```bash
pnpm install
```

2. Create your environment file:

```bash
cp .env.example .env
```

3. Start local infrastructure:

```bash
pnpm infra:up
```

4. Generate and run migrations:

```bash
pnpm db:generate
pnpm db:migrate
```

5. Run the app:

```bash
pnpm dev
```

Open `http://localhost:3000` and you will be redirected to `/catalog`.

## Useful Commands

- `pnpm db:generate` - Generate migration files from schema changes
- `pnpm db:migrate` - Apply migrations
- `pnpm db:studio` - Open Drizzle Studio
- `pnpm infra:up` - Start Postgres and Redis
- `pnpm infra:down` - Stop local infrastructure
