-- AlterTable
ALTER TABLE "SavingsGoal" ADD COLUMN     "accountId" INTEGER;

-- CreateIndex
CREATE INDEX "SavingsGoal_accountId_idx" ON "SavingsGoal"("accountId");

-- AddForeignKey
ALTER TABLE "SavingsGoal" ADD CONSTRAINT "SavingsGoal_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;
