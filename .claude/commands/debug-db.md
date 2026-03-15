Diagnose and fix database-related issues.

## Process

### 1. Check Docker
Run `docker ps` to verify PostgreSQL container is running.
If not running, suggest `docker compose up -d`.

### 2. Check DATABASE_URL
Read `.env` to verify the `DATABASE_URL` connection string matches the Docker configuration.
Expected format: `postgresql://pepeju:password@localhost:5433/accounting_db`

### 3. Check migration status
Run `npx prisma migrate status` to see if there are pending migrations.

### 4. Check Prisma client
Run `npx prisma generate` to ensure the client is up to date with the schema.

### 5. Test connection
Run `npx prisma db pull --print` to verify the connection works.

### 6. Common fixes
- **Container not running**: `docker compose up -d`
- **Pending migrations**: `npx prisma migrate dev`
- **Stale client**: `npx prisma generate`
- **Port conflict**: Check if another service is using port 5433
- **Schema drift**: `npx prisma migrate reset` (WARNING: destroys data)

### 7. Report
Summarize what was found and what was fixed.
