import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Ajusta email/credentials según necesites
  const demoEmail = "owner@example.com";

  // Crear user demo si no existe
  let user = await prisma.user.findUnique({ where: { email: demoEmail } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: demoEmail,
        name: "Tienda Demo",
        password: "changeme", // reemplazar por hash en prod o crear flujo de signup
      },
    });
  }

  // Crear AccountingBook tienda (isBusiness = true)
  const book = await prisma.accountingBook.upsert({
    where: { userId_name: { userId: user.id, name: "Tienda" } as any },
    create: {
      name: "Tienda",
      userId: user.id,
      isBusiness: true,
    },
    update: { isBusiness: true },
  });

  // Categorías iniciales
  const categories = [
    "Ventas",
    "Suministros",
    "Alquiler",
    "Marketing",
    "Comisiones",
    "Otros",
  ];

  for (const name of categories) {
    await prisma.category.upsert({
      where: { accountingBookId_name: { accountingBookId: book.id, name } as any },
      create: { accountingBookId: book.id, name },
      update: { name },
    });
  }

  console.log("Seed completado. User:", user.email, "BookId:", book.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });