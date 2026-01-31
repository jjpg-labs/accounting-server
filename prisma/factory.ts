import { PrismaClient, TransactionType, PaymentMethod, Prisma } from '@prisma/client';

export class DataFactory {
    constructor(private prisma: PrismaClient) { }

    async createSupplier(userId: number, name: string) {
        return this.prisma.supplier.upsert({
            where: { userId_name: { userId, name } as any },
            create: { userId, name },
            update: {},
        });
    }

    async createTransaction(
        accountingBookId: number,
        categoryId: number | null,
        supplierId: number | null,
        type: TransactionType,
        amount: number,
        date: Date
    ) {
        return this.prisma.transaction.create({
            data: {
                accountingBookId,
                categoryId,
                supplierId,
                type,
                amount: new Prisma.Decimal(amount),
                paymentMethod: PaymentMethod.CASH,
                valueDate: date,
                description: `Auto-generated ${type} transaction`,
            },
        });
    }

    randomDate(start: Date, end: Date) {
        return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    }

    randomAmount(min: number, max: number) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}
