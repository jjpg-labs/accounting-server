Create a new Prisma database migration.

## Arguments
$ARGUMENTS

Expected format: description of the schema change. Example: "add invoice model with relations to user and accounting book".

## Process

### 1. Plan the schema change
Based on the arguments, determine what changes to `prisma/schema.prisma` are needed.

### 2. Read current schema
Read `prisma/schema.prisma` to understand existing models and relations.

### 3. Modify schema
Edit `prisma/schema.prisma` following project conventions:
- IDs: `@id @default(autoincrement())`
- Cascading deletes: `onDelete: Cascade`
- Financial fields: `@db.Decimal(14, 2)`
- Timestamps: `createdAt @default(now())`, `updatedAt @updatedAt`
- Indexes on foreign keys

### 4. Generate migration
Run: `npx prisma migrate dev --name <descriptive-kebab-case-name>`

### 5. Regenerate client
Run: `npx prisma generate`

### 6. Verify
Run: `npx tsc --noEmit` to ensure generated types work with existing code.

### 7. Report
List the changes made and any manual steps needed (e.g., updating services to use new fields).
