Add a new endpoint to an existing NestJS module.

## Arguments
$ARGUMENTS

Expected format: `<HttpMethod> <path> <module>`. Example: "GET /summary transactions".

## Process

### 1. Analyze existing module
Read the current controller and service files for the specified module to understand existing endpoints and patterns.

### 2. Create DTO (if needed)
If the endpoint accepts a body (POST, PUT, PATCH), create a DTO in `src/<module>/dto/` with class-validator decorators.

### 3. Add service method
Add the business logic method to `src/<module>/<module>.service.ts`:
- Enforce ownership via userId in Prisma where clauses
- Return `null` on not found
- Use `Prisma.Decimal` for financial calculations

### 4. Add controller method
Add the endpoint to `src/<module>/<module>.controller.ts`:
- Use appropriate HTTP decorator (@Get, @Post, etc.)
- Extract userId from `req.user.sub`
- Check service return for null, respond with 404 if needed

### 5. Add test
Add test cases to the existing test file or create a new one at `src/test/<module>/`:
- Test the happy path
- Test ownership enforcement (wrong userId)
- Test not found case

### 6. Verify
- Run `npx tsc --noEmit`
- Run `npx jest src/test/<module>`
