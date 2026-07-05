# Swapy Campus API

Swapy Campus is a Node.js web backend for a campus circular-economy platform. It uses a modular monolith architecture: one deployable API, but with clear internal modules for identity, marketplace, repair assistance, AI prediction adapters, trust, and sustainability.

The database target is PostgreSQL, modeled through Prisma so the entities, relations, constraints, and migrations are explicit.

## Tech Stack

- Node.js + TypeScript
- Express
- Prisma ORM
- PostgreSQL
- Zod validation
- Vitest + Supertest

## Project Structure

```text
prisma/
  schema.prisma       PostgreSQL entity model
src/
  app.ts              Express app composition
  server.ts           HTTP server bootstrap
  config/             env and Prisma client
  common/             shared errors, validation, async helpers
  modules/
    auth/             login and token generation
    users/            students/admins, profile and trust data
    marketplace/      categories, listings, feedback, transactions
    repair/           repair tickets and AI cost recommendations
    ai/               local AI adapters, replaceable by Bedrock/SageMaker
    sustainability/   dashboard impact metrics
docs/                 architecture and domain model notes
tests/                smoke tests
```

## Run Locally

```bash
pnpm install
copy .env.example .env
docker compose up -d postgres
pnpm prisma:generate
pnpm prisma:migrate
pnpm dev
```

The API runs at `http://localhost:4000`.

## Useful Commands

```bash
pnpm dev              # start API in watch mode
pnpm build            # compile TypeScript
pnpm test             # run tests
pnpm prisma:studio    # inspect PostgreSQL data
```
