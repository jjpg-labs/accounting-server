import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";
import { Prisma } from "@prisma/client";

@Injectable()
export class TransactionService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, data: any) {
    const tx = await this.prisma.transaction.create({
      data: {
        description: data.description,
        amount: new Prisma.Decimal(data.amount),
        type: data.type,
        paymentMethod: data.paymentMethod || "CASH",
        valueDate: new Date(data.valueDate),
        accountingBookId: data.accountingBookId,
        supplierId: data.supplierId,
        categoryId: data.categoryId,
      },
    });
    return tx;
  }

  async findByBookAndRange(accountingBookId: number, from: string, to: string, take = 100, skip = 0) {
    return this.prisma.transaction.findMany({
      where: {
        accountingBookId,
        valueDate: { gte: new Date(from), lte: new Date(to) },
      },
      orderBy: { valueDate: "desc" },
      take,
      skip,
    });
  }
}