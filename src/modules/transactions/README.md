# Transactions module (sketch)

Endpoints to implement:
- POST /transactions  -> create transaction
- GET  /transactions -> list (filter by book, date range, paymentMethod, category)
- GET  /transactions/:id
- PUT  /transactions/:id
- DELETE /transactions/:id

Use DTOs with class-validator and transform amount strings to Prisma.Decimal in the service.
