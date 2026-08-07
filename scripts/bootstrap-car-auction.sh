#!/usr/bin/env bash
set -euo pipefail

if ! command -v pnpm >/dev/null 2>&1; then
  echo "pnpm is required. Install pnpm first." >&2
  exit 1
fi

echo "[bootstrap] Installing dependencies"
pnpm install

echo "[bootstrap] Creating folder structure"
mkdir -p \
  app/'(public)'/listings/'[slug]' \
  app/'(auth)'/login app/'(auth)'/register \
  app/'(buyer)'/watchlist app/'(buyer)'/bids app/'(buyer)'/wins \
  app/'(seller)'/listings/new app/'(seller)'/listings \
  app/admin/'(protected)'/listings app/admin/'(protected)'/categories app/admin/'(protected)'/users app/admin/'(protected)'/email-test \
  app/api/health app/api/listings app/api/bids \
  components/ui components/listing components/bid components/nav \
  db/schema db/queries \
  docs/blueprints

echo "[bootstrap] Creating starter files if missing"
create_if_missing() {
  local file="$1"
  local content="$2"
  if [[ ! -f "$file" ]]; then
    printf "%s\n" "$content" > "$file"
  fi
}

create_if_missing app/'(public)'/page.tsx 'export default function HomePage() { return <main>Car Auction Home</main> }'
create_if_missing app/'(public)'/listings/page.tsx 'export default function ListingsPage() { return <main>Listings</main> }'
create_if_missing app/'(public)'/listings/'[slug]'/page.tsx 'export default function ListingDetailPage() { return <main>Listing Detail</main> }'
create_if_missing app/api/health/route.ts 'export async function GET() { return Response.json({ status: "ok" }) }'
create_if_missing docs/blueprints/README.md '# Blueprint notes'

echo "[bootstrap] Running quality checks"
pnpm lint || true
pnpm typecheck || true

echo "[bootstrap] Completed. Next steps:"
echo "1. Configure .env"
echo "2. Add Drizzle schema + migrations"
echo "3. Build listing, bid, and admin modules"
