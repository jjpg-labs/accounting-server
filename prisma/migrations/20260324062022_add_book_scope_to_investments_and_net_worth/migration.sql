-- AlterTable
ALTER TABLE "Asset" ADD COLUMN     "accountingBookId" INTEGER;

-- AlterTable
ALTER TABLE "InvestmentPosition" ADD COLUMN     "accountingBookId" INTEGER;

-- AlterTable
ALTER TABLE "Liability" ADD COLUMN     "accountingBookId" INTEGER;

-- CreateIndex
CREATE INDEX "Asset_accountingBookId_idx" ON "Asset"("accountingBookId");

-- CreateIndex
CREATE INDEX "InvestmentPosition_accountingBookId_idx" ON "InvestmentPosition"("accountingBookId");

-- CreateIndex
CREATE INDEX "Liability_accountingBookId_idx" ON "Liability"("accountingBookId");

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_accountingBookId_fkey" FOREIGN KEY ("accountingBookId") REFERENCES "AccountingBook"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Liability" ADD CONSTRAINT "Liability_accountingBookId_fkey" FOREIGN KEY ("accountingBookId") REFERENCES "AccountingBook"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvestmentPosition" ADD CONSTRAINT "InvestmentPosition_accountingBookId_fkey" FOREIGN KEY ("accountingBookId") REFERENCES "AccountingBook"("id") ON DELETE SET NULL ON UPDATE CASCADE;
