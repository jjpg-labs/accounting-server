import { Injectable } from '@nestjs/common';
import { PrismaService } from '../services/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class VatEntriesService {
  constructor(private prisma: PrismaService) {}

  async upsertEntry(
    accountingBookId: number,
    userId: number,
    date: string,
    vat21: string,
    vat10: string,
    vat4: string,
  ) {
    const book = await this.prisma.accountingBook.findFirst({ where: { id: accountingBookId, userId } });
    if (!book) return null;

    const d = new Date(date);
    return this.prisma.vatEntry.upsert({
      where: { accountingBookId_date: { accountingBookId, date: d } },
      create: {
        accountingBookId,
        date: d,
        vat21: new Prisma.Decimal(vat21 || '0'),
        vat10: new Prisma.Decimal(vat10 || '0'),
        vat4: new Prisma.Decimal(vat4 || '0'),
      },
      update: {
        vat21: new Prisma.Decimal(vat21 || '0'),
        vat10: new Prisma.Decimal(vat10 || '0'),
        vat4: new Prisma.Decimal(vat4 || '0'),
      },
    });
  }

  async getMonthEntries(
    accountingBookId: number,
    year: number,
    month: number,
    userId: number,
  ) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);
    return this.prisma.vatEntry.findMany({
      where: {
        accountingBookId,
        date: { gte: startDate, lte: endDate },
        accountingBook: { userId },
      },
      orderBy: { date: 'asc' },
    });
  }
}
