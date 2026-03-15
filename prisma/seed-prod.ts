import { PrismaClient, Prisma, TransactionType, PaymentMethod } from '@prisma/client';
import * as XLSX from 'xlsx';

// ---------------------------------------------------------------------------
// CONFIGURACIÓN — editar antes de ejecutar
// ---------------------------------------------------------------------------
const EXCEL_FILE_PATH = '/home/jjpg95/Descargas/Operativa estanco.xlsx';
const PROD_USER_EMAIL = 'owner@estanco.com';          // CAMBIAR
const PROD_USER_NAME = 'Propietario';                  // CAMBIAR
const PROD_USER_PASS = 'CAMBIAR_ANTES_DE_EJECUTAR';   // CAMBIAR
// ---------------------------------------------------------------------------

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed de producción...');

  // 1. Upsert usuario
  const user = await prisma.user.upsert({
    where: { email: PROD_USER_EMAIL },
    create: { email: PROD_USER_EMAIL, name: PROD_USER_NAME, password: PROD_USER_PASS },
    update: {},
  });
  console.log(`Usuario: ${user.email} (id=${user.id})`);

  // 2. Upsert libro contable
  const book = await prisma.accountingBook.upsert({
    where: { userId_name: { userId: user.id, name: 'Estanco' } as any },
    create: { name: 'Estanco', userId: user.id, isBusiness: true },
    update: { isBusiness: true },
  });
  console.log(`Libro: "${book.name}" (id=${book.id})`);

  // 3. Upsert categorías
  const catVentas = await prisma.category.upsert({
    where: { accountingBookId_name: { accountingBookId: book.id, name: 'Ventas' } as any },
    create: { accountingBookId: book.id, name: 'Ventas' },
    update: {},
  });
  const catGastos = await prisma.category.upsert({
    where: { accountingBookId_name: { accountingBookId: book.id, name: 'Gastos' } as any },
    create: { accountingBookId: book.id, name: 'Gastos' },
    update: {},
  });
  console.log(`Categorías: Ventas(${catVentas.id}), Gastos(${catGastos.id})`);

  // 4. Idempotencia — saltar si ya hay transacciones en este libro
  const existing = await prisma.transaction.count({ where: { accountingBookId: book.id } });
  if (existing > 0) {
    console.log(`Ya existen ${existing} transacciones. Saltando importación.`);
    return;
  }

  // 5. Leer Excel (cellDates:true convierte automáticamente seriales de fecha a Date de JS)
  console.log(`Leyendo Excel: ${EXCEL_FILE_PATH}`);
  const workbook = XLSX.readFile(EXCEL_FILE_PATH, { cellDates: true });
  const sheet = workbook.Sheets['Diario'];
  if (!sheet) throw new Error('Hoja "Diario" no encontrada en el Excel');

  const rows: Array<{ Fecha: Date; Tipo: string; Monto: number }> =
    XLSX.utils.sheet_to_json(sheet);

  console.log(`Filas encontradas: ${rows.length}`);

  // 6. Mapear filas a TransactionCreateManyInput
  const transactions: Prisma.TransactionCreateManyInput[] = [];
  let skipped = 0;

  for (const row of rows) {
    const tipo = (row.Tipo || '').trim();
    if (tipo !== 'Ingreso' && tipo !== 'Gasto') {
      skipped++;
      continue;
    }
    if (!row.Fecha || !(row.Fecha instanceof Date)) {
      skipped++;
      continue;
    }
    if (!row.Monto || isNaN(row.Monto)) {
      skipped++;
      continue;
    }

    const type: TransactionType = tipo === 'Ingreso' ? 'INCOME' : 'EXPENSE';
    transactions.push({
      accountingBookId: book.id,
      type,
      amount: new Prisma.Decimal(row.Monto),
      paymentMethod: PaymentMethod.CASH,
      valueDate: row.Fecha,
      categoryId: tipo === 'Ingreso' ? catVentas.id : catGastos.id,
    });
  }

  if (skipped > 0) console.warn(`Filas saltadas por datos inválidos: ${skipped}`);

  // 7. Inserción en batches de 1.000 para evitar límites de tamaño de sentencia
  const BATCH_SIZE = 1000;
  let inserted = 0;
  for (let i = 0; i < transactions.length; i += BATCH_SIZE) {
    const batch = transactions.slice(i, i + BATCH_SIZE);
    const result = await prisma.transaction.createMany({ data: batch });
    inserted += result.count;
    console.log(`  Lote ${Math.floor(i / BATCH_SIZE) + 1}: ${result.count} insertadas`);
  }

  console.log(`Completado. Total insertadas: ${inserted} transacciones.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
