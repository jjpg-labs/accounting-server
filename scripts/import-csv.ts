/*import fs from 'fs';
import path from 'path';
import csvParse from 'csv-parse/lib/sync';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

type Row = {
  fecha: string;
  descripcion?: string;
  tipo?: string;
  monto: string;
  metodo?: string;
  proveedor?: string;
  categoria?: string;
  cashLeftForNext?: string;
};

function parseAmount(m: string) {
  if (!m) return '0.00';
  return m.replace(',', '.').trim();
}

async function main() {
  const file = process.argv[2] || path.join(process.cwd(), 'import.csv');
  if (!fs.existsSync(file)) {
    console.error('No se encontró el CSV en', file);
    process.exit(1);
  }
  const csv = fs.readFileSync(file, 'utf8');
  const rows: Row[] = csvParse(csv, { columns: true, skip_empty_lines: true });

  const demoEmail = process.env.SEED_USER_EMAIL || 'owner@example.com';
  const user = await prisma.user.findUnique({ where: { email: demoEmail } });
  if (!user)
    throw new Error('No se encontró user demo. Ejecuta el seed primero.');

  const book = await prisma.accountingBook.findFirst({
    where: { userId: user.id, isBusiness: true },
  });
  if (!book) throw new Error('No se encontró AccountingBook de la tienda.');

  const dailyAggregation: Record<
    string,
    { income: Prisma.Decimal; expense: Prisma.Decimal }
  > = {};

  for (const raw of rows) {
    try {
      const valueDate = new Date(raw.fecha);
      if (Number.isNaN(valueDate.getTime())) {
        console.warn('Fila con fecha inválida:', raw);
        continue;
      }
      const amountStr = parseAmount(raw.monto);
      const amount = new Prisma.Decimal(amountStr);

      const type =
        raw.tipo && raw.tipo.toLowerCase().includes('ing')
          ? 'INCOME'
          : 'EXPENSE';

      let supplierId: number | undefined = undefined;
      if (raw.proveedor) {
        const sup = await prisma.supplier.upsert({
          where: {
            userId_name: { userId: user.id, name: raw.proveedor } as any,
          },
          create: { userId: user.id, name: raw.proveedor },
          update: { name: raw.proveedor },
        });
        supplierId = sup.id;
      }

      let categoryId: number | undefined = undefined;
      if (raw.categoria) {
        const cat = await prisma.category.upsert({
          where: {
            accountingBookId_name: {
              accountingBookId: book.id,
              name: raw.categoria,
            } as any,
          },
          create: { accountingBookId: book.id, name: raw.categoria },
          update: { name: raw.categoria },
        });
        categoryId = cat.id;
      }

      const paymentMethod =
        (raw.metodo || 'CASH').toUpperCase() === 'CARD'
          ? 'CARD'
          : (raw.metodo || 'CASH').toUpperCase() === 'TRANSFER'
            ? 'TRANSFER'
            : (raw.metodo || 'CASH').toUpperCase() === 'OTHER'
              ? 'OTHER'
              : 'CASH';

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

      const key = valueDate.toISOString().slice(0, 10);
      if (!dailyAggregation[key]) {
        dailyAggregation[key] = {
          income: new Prisma.Decimal('0'),
          expense: new Prisma.Decimal('0'),
        };
      }
      if ((type as string) === 'INCOME') {
        dailyAggregation[key].income = dailyAggregation[key].income.add(amount);
      } else {
        dailyAggregation[key].expense =
          dailyAggregation[key].expense.add(amount);
      }
    } catch (err) {
      console.error('Error import fila:', raw, err);
    }
  }

  for (const [dateStr, totals] of Object.entries(dailyAggregation)) {
    const date = new Date(dateStr + 'T00:00:00Z');
    await prisma.dailyReport.upsert({
      where: {
        accountingBookId_date: { accountingBookId: book.id, date } as any,
      },
      create: {
        accountingBookId: book.id,
        date,
        openingBalance: new Prisma.Decimal('0.00'),
        totalIncome: totals.income,
        totalExpense: totals.expense,
        closingBalance: new Prisma.Decimal('0.00'),
        cashLeftForNext: new Prisma.Decimal('0.00'),
        removedFromCash: new Prisma.Decimal('0.00'),
      },
      update: {
        totalIncome: totals.income,
        totalExpense: totals.expense,
      },
    });
  }

  console.log('Import finalizado');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());*/
