-- CreateTable
CREATE TABLE "InvestmentPosition" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "ticker" TEXT NOT NULL,
    "shares" DECIMAL(14,6) NOT NULL,
    "currentPrice" DECIMAL(14,4) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "notes" TEXT,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InvestmentPosition_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "InvestmentPosition_userId_idx" ON "InvestmentPosition"("userId");

-- AddForeignKey
ALTER TABLE "InvestmentPosition" ADD CONSTRAINT "InvestmentPosition_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
