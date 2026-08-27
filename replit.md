# SmartShop

SmartShop helps shoppers find practical products within their budget using a transparent local recommendation catalog.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/smartshop/src/App.tsx` — main responsive experience and local state
- `artifacts/smartshop/src/data/products.ts` — source of truth for the product catalog
- `artifacts/smartshop/src/lib/recommendations.ts` — explainable keyword, category, budget, and ranking logic
- `artifacts/smartshop/src/components/smart-product.tsx` — product cards and comparison visuals
- `artifacts/smartshop/src/index.css` — SmartShop theme and interaction styles
- `artifacts/smartshop/README.md` — beginner-friendly project guide

## Architecture decisions

- The first version is frontend-only so it works without paid APIs, API keys, or database setup.
- Product recommendations use keyword matching and tags so the results are easy to explain in a student presentation.
- localStorage keeps saved picks, recent searches, and insight counts on the current device.

## Product

Users can describe a shopping need, narrow it with category and budget controls, review explained recommendations, save products, and compare two options side by side.

## User preferences

The project should stay simple, clean, and beginner-friendly.

## Gotchas

The frontend workflow supplies `PORT` and `BASE_PATH`; use the managed workflow rather than starting Vite without those values.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
