-- SQL de ejemplo para índices compuestos y un CHECK en amount
-- Coloca esto en una migration manual si prefieres controlar SQL exacto.

CREATE INDEX IF NOT EXISTS tx_book_date_idx ON "Transaction" ("accountingBookId", "valueDate");
CREATE INDEX IF NOT EXISTS tx_book_date_paymethod_idx ON "Transaction" ("accountingBookId", "valueDate", "paymentMethod");
CREATE INDEX IF NOT EXISTS tx_category_idx ON "Transaction" ("categoryId");
CREATE INDEX IF NOT EXISTS dr_book_date_idx ON "DailyReport" ("accountingBookId", "date");

-- CHECK constraint para amount >= 0
ALTER TABLE "Transaction"
  ADD CONSTRAINT transaction_amount_nonnegative CHECK (amount >= 0);
