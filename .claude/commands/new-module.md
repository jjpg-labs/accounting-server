Create a complete NestJS module with all standard files.

## Arguments
$ARGUMENTS

Expected format: `<ModuleName>`. Example: "invoices".

## Process

### 1. Create module files
Create the following files in `src/<moduleName>/`:

- `<moduleName>.module.ts` — NestJS module importing PrismaService
- `<moduleName>.controller.ts` — controller with standard CRUD endpoints
- `<moduleName>.service.ts` — service with Prisma queries and ownership enforcement
- `dto/create-<moduleName>.dto.ts` — DTO with class-validator decorators
- `dto/update-<moduleName>.dto.ts` — partial DTO for updates

### 2. Register in AppModule
Add the new module to `src/app.module.ts` imports array.

### 3. Create test
Create test file at `src/test/<moduleName>/<moduleName>.service.spec.ts` following the project's testing pattern (real PrismaService + jest.spyOn).

### 4. Verify
- Run `npx tsc --noEmit` to check for type errors
- Run `npx jest src/test/<moduleName>` to verify tests pass

### Conventions
- All endpoints protected by default (global AuthGuard)
- Use `@Public()` only for endpoints that truly need no auth
- Extract userId from `req.user.sub`
- Services return `null` on not found, controllers map to 404
- Financial amounts: `Decimal(14,2)` in schema, `Prisma.Decimal` in code
