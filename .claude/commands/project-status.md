Report the current status of the accounting-server project.

## Process

### 1. List modules
Scan `src/` for NestJS modules (directories with `*.module.ts`). For each module, list its endpoints from the controller.

### 2. Check test coverage
Run `npm run test:cov -- --silent 2>&1 | tail -20` to get current coverage numbers.

### 3. Check pending work
- Read `prisma/schema.prisma` for models that might not have corresponding modules
- Check for TODO/FIXME comments: `grep -r "TODO\|FIXME" src/ --include="*.ts" | head -20`
- Check git status for uncommitted changes

### 4. Check API completeness
For each module, verify it has:
- [ ] CRUD endpoints (GET all, GET by id, POST, PATCH, DELETE)
- [ ] DTOs with validation
- [ ] Ownership enforcement in service
- [ ] Tests

### 5. Report
Output a structured summary:
- Modules and their endpoint count
- Test coverage percentage
- Missing functionality
- Suggested next steps
