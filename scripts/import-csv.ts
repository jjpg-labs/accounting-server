import fs from "fs";
import path from "path";
import csvParse from "csv-parse/lib/sync";
import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

// Configura estas columnas según tu CSV
type Row = {
  fecha: string; // yyyy-mm-dd
  descripcion?: string;
  tipo?: string; // 'INGRESO' / 'GASTO' o text
  monto: string; // '123.45'
  metodo?: string; // CASH|CARD|TRANSFER|OTHER
  proveedor?: string;
  categoria?: string;
  cashLeftForNext?: string; // opcional, si tu csv incluye cierre
};

function parseAmount(m: string) {
  // Normaliza comas/puntos
  if (!m) return "0.00";
  return m.replace(",", ".").trim();
}

async function main() {
  const file = process.argv[2] || path.join(process.cwd(), "import.csv");
  if (!fs.existsSync(file)) {
    console.error("No se encontró el CSV en", file);
    process.exit(1);
  }
  const csv = fs.readFileSync(file, "utf8");
  const rows: Row[] = csvParse(csv, { columns: true, skip_empty_lines: true });

  // Ajusta: busca el accountingBook de la tienda (asume user ya existe)
  const demoEmail = process.env.SEED_USER_EMAIL || "owner@example.com";
  const user = await prisma.user.findUnique({ where: { email: demoEmail } });
  if (!user) throw new Error("No se encontró user demo. Ejecuta el seed primero.");

  const book = await prisma.accountingBook.findFirst({
    where: { userId: user.id, isBusiness: true },
  });
  if (!book) throw new Error("No se encontró AccountingBook de la tienda.");

  // Colecciones para agregación por día (si quieres upsert totals)
  const dailyAggregation: Record<string, { income: Prisma.Decimal; expense: Prisma.Decimal }> = {};

  for (const raw of rows) {
    try {
      const valueDate = new Date(raw.fecha);
      if (Number.isNaN(valueDate.getTime())) {
        console.warn("Fila con fecha inválida:", raw);
        continue;
      }
      const amountStr = parseAmount(raw.monto);
      const amount = new Prisma.Decimal(amountStr);

      const type =
        raw.tipo && raw.tipo.toLowerCase().includes("ing")
          ? "INCOME"
          : "EXPENSE";

      // supplier upsert
      let supplierId: number | undefined = undefined;
      if (raw.proveedor) {
        const sup = await prisma.supplier.upsert({
          where: { userId_name: { userId: user.id, name: raw.proveedor } as any },
          create: { userId: user.id, name: raw.proveedor },
          update: { name: raw.proveedor },
        });
        supplierId = sup.id;
      }

      // category upsert (opcional)
      let categoryId: number | undefined = undefined;
      if (raw.categoria) {
        const cat = await prisma.category.upsert({
          where: {
            accountingBookId_name: { accountingBookId: book.id, name: raw.categoria } as any,
          },
          create: { accountingBookId: book.id, name: raw.categoria },
          update: { name: raw.categoria },
        });
        categoryId = cat.id;
      }

      // paymentMethod normalize
      const paymentMethod =
        (raw.metodo || "CASH").toUpperCase() === "CARD"
          ? "CARD"
          : (raw.metodo || "CASH").toUpperCase() === "TRANSFER"
          ? "TRANSFER"
          : (raw.metodo || "CASH").toUpperCase() === "OTHER"
          ? "OTHER"
          : "CASH";

      // create transaction
      await prisma.transaction.create({
        data: {
          description: raw.descripcion || undefined,
          amount: amount,
          type: type as any,
          paymentMethod: paymentMethod as any,
          valueDate: valueDate,
          accountingBookId: book.id,
          supplierId: supplierId,
          categoryId: categoryId,
        },
      });

      // acumular para dailyAggregation
      const key = valueDate.toISOString().slice(0, 10); // YYYY-MM-DD
      if (!dailyAggregation[key]) {
        dailyAggregation[key] = {
          income: new Prisma.Decimal("0"),
          expense: new Prisma.Decimal("0"),
        };
      }
      if ((type as string) === "INCOME") {
        dailyAggregation[key].income = dailyAggregation[key].income.add(amount);
      } else {
        dailyAggregation[key].expense = dailyAggregation[key].expense.add(amount);
      }
    } catch (err) {
      console.error("Error import fila:", raw, err);
    }
  }

  // Upsert DailyReport por fecha con totales
  for (const [dateStr, totals] of Object.entries(dailyAggregation)) {
    const date = new Date(dateStr + "T00:00:00Z");
    await prisma.dailyReport.upsert({
      where: { accountingBookId_date: { accountingBookId: book.id, date } as any },
      create: {
        accountingBookId: book.id,
        date,
        openingBalance: new Prisma.Decimal("0.00"),
        totalIncome: totals.income,
        totalExpense: totals.expense,
        closingBalance: new Prisma.Decimal("0.00"),
        cashLeftForNext: new Prisma.Decimal("0.00"),
        removedFromCash: new Prisma.Decimal("0.00"),
      },
      update: {
        // si ya existe, solo actualizamos los totales (podrías querer sumar en lugar de sobrescribir)
        totalIncome: totals.income,
        totalExpense: totals.expense,
      },
    });
  }

  console.log("Import finalizado");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
}).finally(() => prisma.$disconnect();
