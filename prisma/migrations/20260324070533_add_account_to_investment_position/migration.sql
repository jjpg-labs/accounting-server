-- AlterTable
ALTER TABLE "InvestmentPosition" ADD COLUMN     "accountId" INTEGER;

-- CreateIndex
CREATE INDEX "InvestmentPosition_accountId_idx" ON "InvestmentPosition"("accountId");

-- AddForeignKey
ALTER TABLE "InvestmentPosition" ADD CONSTRAINT "InvestmentPosition_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;
