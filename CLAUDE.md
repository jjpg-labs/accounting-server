# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run start:dev        # Start with hot reload
npm run build            # Compile TypeScript to dist/

# Testing
npm test                 # Run all unit tests
npm run test:watch       # Watch mode
npm run test:cov         # With coverage report
npm run test:e2e         # End-to-end tests

# To run a single test file:
npx jest path/to/file.spec.ts

# Code quality
npm run lint             # ESLint with auto-fix
npm run format           # Prettier formatting

# Database
npx prisma migrate dev   # Apply migrations
npx prisma generate      # Regenerate Prisma client
npx prisma studio        # GUI for database inspection
```

## Architecture

**NestJS REST API** for multi-user accounting/bookkeeping, backed by PostgreSQL via Prisma ORM.

### Request Lifecycle

All endpoints are JWT-protected by default via a global `AuthGuard` registered in `AppModule`. To make an endpoint public, use the `@Public()` decorator exported from `src/auth/auth.guard.ts` (shorthand for `@SetMetadata(IS_PUBLIC_KEY, true)`). Tokens: 1-day access, 90-day refresh.

Controllers read the authenticated user ID via `req.user.sub` (typed as `DecodedToken` in `src/auth/auth.types.ts`, extended onto `express.Request` in `src/types/express.d.ts`).

### Module Structure

Each feature module (`accountingBooks`, `transactions`, `budgets`, `categories`, `suppliers`, `dailyReports`, `periodic`, `auth`, `users`) follows the NestJS pattern: `*.module.ts` → `*.controller.ts` → `*.service.ts`, with `dto/` subdirectories where needed.

**Data ownership:**
- `User` → `AccountingBook` → `Transaction`, `Category`, `DailyReport`
- `User` → `Budget` (optionally linked to a `Category`)
- `User` → `Supplier` (referenced by `Transaction`, but owned at user level, not book level)
- `User` → `RecurringTransaction` → `AccountingBook`

### Service / Controller Pattern

Services return `null` on failure or when the resource isn't found. Controllers check for `null` and map it to the appropriate HTTP status (e.g., `404`, `400`). Services enforce ownership by verifying the resource belongs to the authenticated user before mutating it — typically by filtering through a Prisma relation (`accountingBook: { userId }`) in the query.

### Key Architectural Notes

- **PrismaService** (`src/services/prisma.service.ts`) is the single database abstraction, extended from `PrismaClient`. Imported into each feature module that needs DB access.
- **Periodic module** uses `@nestjs/schedule` cron jobs (runs daily at midnight) to auto-execute recurring transactions. `RecurringTransaction` records track `nextRunDate`, `lastRunDate`, and supported frequencies: `DAILY`, `WEEKLY`, `MONTHLY`, `YEARLY`.
- **DailyReports** handle daily reconciliation (`closeDay` upserts a report aggregating that day's transactions) — distinct from regular transactions.
- Financial amounts use `Decimal` fields (14,2 precision) in Prisma schema. Use `new Prisma.Decimal(value)` when constructing these in code or tests.
- Schema enums: `TransactionType` (INCOME, EXPENSE), `PaymentMethod` (CASH, CARD, TRANSFER, OTHER), `Frequency` (DAILY, WEEKLY, MONTHLY, YEARLY).
- Tests live in `src/test/` (mirroring `src/` structure). Tests provide the real `PrismaService` and mock individual methods with `jest.spyOn(prismaService.model, 'method').mockResolvedValue(...)`.
- TypeScript is configured with lenient settings (strict mode off, no `noImplicitAny`).
- Prettier enforces single quotes and trailing commas (`all`).

### Environment / Config

Configuration is loaded via `@nestjs/config` from `config/configuration.ts`. App env vars: `DATABASE_HOST`, `DATABASE_PORT` (default 5432), `PORT` (default 3000). Prisma also requires `DATABASE_URL` (connection string). A `docker-compose` file provides PostgreSQL 16.
