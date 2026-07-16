# Swapy Campus Agent Instructions

This repository is structured as a pnpm monorepo:
- `apps/backend`: Express API + Prisma ORM
- `apps/frontend`: React TypeScript frontend
- `apps/ai-service`: Python FastAPI AI service

## Developer Guidelines
1. Always run commands using `pnpm` from the root of the workspace.
2. Filter commands to specific apps when necessary, e.g., `pnpm --filter swapy-campus-api test`.
3. Keep module boundaries clean. Do not mix business logic of different modules.
