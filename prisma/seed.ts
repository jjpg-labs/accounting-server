import { PrismaClient, Prisma } from '@prisma/client';
import { DataFactory } from './factory';

const prisma = new PrismaClient();

async function main() {
  const demoEmail = 'owner@example.com';

  let user = await prisma.user.findUnique({ where: { email: demoEmail } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: demoEmail,
        name: 'Tienda Demo',
        password: 'changeme',
      },
    });
  }

  const book = await prisma.accountingBook.upsert({
    where: { userId_name: { userId: user.id, name: 'Tienda' } as any },
    create: {
      name: 'Tienda',
      userId: user.id,
      isBusiness: true,
    },
    update: { isBusiness: true },
  });

  const categories = [
    'Ventas',
    'Suministros',
    'Alquiler',
    'Marketing',
    'Comisiones',
    'Otros',
  ];

  for (const name of categories) {
    await prisma.category.upsert({
      where: {
        accountingBookId_name: { accountingBookId: book.id, name } as any,
      },
      create: { accountingBookId: book.id, name },
      update: { name },
    });
  }

  const factory = new DataFactory(prisma);

  // Suppliers
  const suppliersList = ['Office Depot', 'Amazon AWS', 'Google Cloud', 'Local Landlord', 'Utility Co.'];
  const suppliers = [];
  for (const sName of suppliersList) {
    suppliers.push(await factory.createSupplier(user.id, sName));
  }

  // Transactions
  const allCategories = await prisma.category.findMany({ where: { accountingBookId: book.id } });

  if (allCategories.length > 0) {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    // Create 50 transactions
    for (let i = 0; i < 50; i++) {
      const isIncome = Math.random() > 0.7; // 30% income, 70% expense
      const type = isIncome ? 'INCOME' : 'EXPENSE';
      const amount = factory.randomAmount(10, 500);
      const date = factory.randomDate(thirtyDaysAgo, today);

      const category = allCategories[Math.floor(Math.random() * allCategories.length)];
      const supplier = !isIncome ? suppliers[Math.floor(Math.random() * suppliers.length)] : null;

      await factory.createTransaction(
        book.id,
        category.id,
        supplier ? supplier.id : null,
        type,
        amount,
        date
      );
    }
    console.log('Created 50 random transactions');
  }

  console.log('Seed completado. User:', user.email, 'BookId:', book.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
