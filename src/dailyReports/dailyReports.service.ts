import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../services/prisma.service';

@Injectable()
export class DailyReportsService {
  constructor(private prisma: PrismaService) {}

  async closeDay(
    accountingBookId: number,
    date: string,
    payload: {
      closingBalance: string;
      cashLeftForNext?: string;
      removedFromCash?: string;
      notes?: string;
    },
  ) {
    const d = new Date(date);

    const income = await this.prisma.transaction.aggregate({
      _sum: { amount: true },
      where: {
        accountingBookId,
        valueDate: {
          gte: new Date(date + 'T00:00:00Z'),
          lte: new Date(date + 'T23:59:59Z'),
        },
        type: 'INCOME',
      },
    });
    const expense = await this.prisma.transaction.aggregate({
      _sum: { amount: true },
      where: {
        accountingBookId,
        valueDate: {
          gte: new Date(date + 'T00:00:00Z'),
          lte: new Date(date + 'T23:59:59Z'),
        },
        type: 'EXPENSE',
      },
    });

    const totalIncome = (
      income._sum.amount || new Prisma.Decimal(0)
    ).toString();
    const totalExpense = (
      expense._sum.amount || new Prisma.Decimal(0)
    ).toString();

    const upsert = await this.prisma.dailyReport.upsert({
      where: { accountingBookId_date: { accountingBookId, date: d } as any },
      create: {
        accountingBookId,
        date: d,
        openingBalance: new Prisma.Decimal('0.00'),
        totalIncome: new Prisma.Decimal(totalIncome),
        totalExpense: new Prisma.Decimal(totalExpense),
        closingBalance: new Prisma.Decimal(payload.closingBalance),
        cashLeftForNext: new Prisma.Decimal(payload.cashLeftForNext || '0.00'),
        removedFromCash: new Prisma.Decimal(payload.removedFromCash || '0.00'),
        notes: payload.notes,
        reconciled: true,
      },
      update: {
        totalIncome: new Prisma.Decimal(totalIncome),
        totalExpense: new Prisma.Decimal(totalExpense),
        closingBalance: new Prisma.Decimal(payload.closingBalance),
        cashLeftForNext: new Prisma.Decimal(payload.cashLeftForNext || '0.00'),
        removedFromCash: new Prisma.Decimal(payload.removedFromCash || '0.00'),
        notes: payload.notes,
        reconciled: true,
      },
    });

    return upsert;
  }

  async getReport(accountingBookId: number, date: string, userId: number) {
    const d = new Date(date);
    return this.prisma.dailyReport.findFirst({
      where: {
        accountingBookId,
        date: d,
        accountingBook: { userId },
      },
    });
  }

  async getReports(
    accountingBookId: number,
    startDate: string,
    endDate: string,
    userId: number,
  ) {
    return this.prisma.dailyReport.findMany({
      where: {
        accountingBookId,
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
        accountingBook: { userId },
      },
      orderBy: {
        date: 'asc',
      },
    });
  }
}
