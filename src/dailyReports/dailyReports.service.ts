import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../services/prisma.service';

@Injectable()
export class DailyReportsService {
  constructor(private prisma: PrismaService) {}

  async closeDay(
    accountingBookId: number,
    userId: number,
    date: string,
    payload: {
      closingBalance: string;
      cashLeftForNext?: string;
      notes?: string;
    },
  ) {
    const book = await this.prisma.accountingBook.findFirst({
      where: { id: accountingBookId, userId },
    });
    if (!book) return null;

    const d = new Date(date);

    // Determine openingBalance from previous day's cashLeftForNext
    const previousReport = await this.prisma.dailyReport.findFirst({
      where: {
        accountingBookId,
        date: { lt: d },
        accountingBook: { userId },
      },
      orderBy: { date: 'desc' },
    });
    const openingBalance = previousReport
      ? previousReport.cashLeftForNext.toString()
      : '0.00';

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

    // Auto-calculate removedFromCash and reconciliation
    const cashLeftForNext = Number(payload.cashLeftForNext || '0.00');
    const closingBalance = Number(payload.closingBalance);
    const removedFromCash = closingBalance - cashLeftForNext;

    const expectedClosing =
      Number(openingBalance) + Number(totalIncome) - Number(totalExpense);
    const reconciled = Math.abs(closingBalance - expectedClosing) <= 0.01;
    const discrepancy = closingBalance - expectedClosing;

    const upsert = await this.prisma.dailyReport.upsert({
      where: { accountingBookId_date: { accountingBookId, date: d } as any },
      create: {
        accountingBookId,
        date: d,
        openingBalance: new Prisma.Decimal(openingBalance),
        totalIncome: new Prisma.Decimal(totalIncome),
        totalExpense: new Prisma.Decimal(totalExpense),
        closingBalance: new Prisma.Decimal(payload.closingBalance),
        cashLeftForNext: new Prisma.Decimal(cashLeftForNext.toFixed(2)),
        removedFromCash: new Prisma.Decimal(removedFromCash.toFixed(2)),
        notes: payload.notes,
        reconciled,
      },
      update: {
        openingBalance: new Prisma.Decimal(openingBalance),
        totalIncome: new Prisma.Decimal(totalIncome),
        totalExpense: new Prisma.Decimal(totalExpense),
        closingBalance: new Prisma.Decimal(payload.closingBalance),
        cashLeftForNext: new Prisma.Decimal(cashLeftForNext.toFixed(2)),
        removedFromCash: new Prisma.Decimal(removedFromCash.toFixed(2)),
        notes: payload.notes,
        reconciled,
      },
    });

    return { ...upsert, discrepancy };
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
