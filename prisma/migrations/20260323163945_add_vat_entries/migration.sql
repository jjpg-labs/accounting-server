-- CreateTable
CREATE TABLE "VatEntry" (
    "id" SERIAL NOT NULL,
    "accountingBookId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "vat21" DECIMAL(14,2) NOT NULL DEFAULT 0.00,
    "vat10" DECIMAL(14,2) NOT NULL DEFAULT 0.00,
    "vat4" DECIMAL(14,2) NOT NULL DEFAULT 0.00,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VatEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VatEntry_accountingBookId_idx" ON "VatEntry"("accountingBookId");

-- CreateIndex
CREATE UNIQUE INDEX "VatEntry_book_date_unique" ON "VatEntry"("accountingBookId", "date");

-- AddForeignKey
ALTER TABLE "VatEntry" ADD CONSTRAINT "VatEntry_accountingBookId_fkey" FOREIGN KEY ("accountingBookId") REFERENCES "AccountingBook"("id") ON DELETE CASCADE ON UPDATE CASCADE;
