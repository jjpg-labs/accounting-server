import { Injectable, Logger } from '@nestjs/common';
import { Prisma, Transaction } from '@prisma/client';
import { PrismaService } from '../services/prisma.service';
import * as XLSX from 'xlsx';

@Injectable()
export class TransactionService {
  private readonly logger = new Logger(TransactionService.name);
  constructor(private prisma: PrismaService) {}

  async createTransaction(
    data: Prisma.TransactionUncheckedCreateInput,
    userId: number,
  ): Promise<Transaction | null> {
    try {
      const book = await this.prisma.accountingBook.findFirst({
        where: { id: data.accountingBookId, userId },
        select: { id: true },
      });
      if (!book) return null;

      return await this.prisma.transaction.create({ data });
    } catch (error) {
      this.logger.error('Error creating transaction', error);
      return null;
    }
  }

  async update(
    id: number,
    data: Prisma.TransactionUncheckedUpdateInput,
    userId: number,
  ): Promise<Transaction | null> {
    try {
      const existing = await this.prisma.transaction.findFirst({
        where: { id, accountingBook: { userId } },
        select: { id: true },
      });
      if (!existing) return null;

      return await this.prisma.transaction.update({ where: { id }, data });
    } catch {
      return null;
    }
  }

  async get(id: number, userId: number): Promise<Transaction | null> {
    try {
      return await this.prisma.transaction.findFirst({
        where: { id, accountingBook: { userId } },
      });
    } catch {
      return null;
    }
  }

  async getAll(
    accountingBookId: number,
    userId: number,
  ): Promise<Transaction[]> {
    try {
      return await this.prisma.transaction.findMany({
        where: { accountingBookId, accountingBook: { userId } },
      });
    } catch {
      return [];
    }
  }

  async getMetrics(
    accountingBookId: number,
    userId: number,
    startDate?: string,
    endDate?: string,
  ) {
    try {
      const where: Prisma.TransactionWhereInput = {
        accountingBookId,
        accountingBook: { userId },
      };

      if (startDate || endDate) {
        where.valueDate = {};
        if (startDate) {
          where.valueDate.gte = new Date(startDate);
        }
        if (endDate) {
          where.valueDate.lte = new Date(endDate);
        }
      }

      const metrics = await this.prisma.transaction.groupBy({
        by: ['type'],
        where,
        _sum: {
          amount: true,
        },
      });

      const result = {
        totalIncome: 0,
        totalExpense: 0,
        netRevenue: 0,
      };

      metrics.forEach((m) => {
        if (m.type === 'INCOME') {
          result.totalIncome = Number(m._sum.amount || 0);
        } else if (m.type === 'EXPENSE') {
          result.totalExpense = Number(m._sum.amount || 0);
        }
      });

      result.netRevenue = result.totalIncome - result.totalExpense;

      return result;
    } catch (error) {
      this.logger.error('Error fetching metrics', error);
      return { totalIncome: 0, totalExpense: 0, netRevenue: 0 };
    }
  }

  async getMonthlyMetrics(
    accountingBookId: number,
    userId: number,
    months: number = 6,
  ) {
    try {
      const results = [];
      const now = new Date();

      for (let i = months - 1; i >= 0; i--) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const startDate = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
        const endDate = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0, 23, 59, 59);

        const metrics = await this.getMetrics(
          accountingBookId,
          userId,
          startDate.toISOString(),
          endDate.toISOString(),
        );

        results.push({
          month: `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`,
          totalIncome: metrics.totalIncome,
          totalExpense: metrics.totalExpense,
          net: metrics.netRevenue,
        });
      }

      return results;
    } catch (error) {
      this.logger.error('Error fetching monthly metrics', error);
      return [];
    }
  }

  async getCategoryBreakdown(
    accountingBookId: number,
    userId: number,
    startDate?: string,
    endDate?: string,
  ) {
    try {
      const where: Prisma.TransactionWhereInput = {
        accountingBookId,
        accountingBook: { userId },
        type: 'EXPENSE',
      };

      if (startDate || endDate) {
        where.valueDate = {};
        if (startDate) where.valueDate.gte = new Date(startDate);
        if (endDate) where.valueDate.lte = new Date(endDate);
      }

      const grouped = await this.prisma.transaction.groupBy({
        by: ['categoryId'],
        where,
        _sum: { amount: true },
        orderBy: { _sum: { amount: 'desc' } },
      });

      const categoryIds = grouped
        .map((g) => g.categoryId)
        .filter(Boolean) as number[];

      const categories = await this.prisma.category.findMany({
        where: { id: { in: categoryIds } },
        select: { id: true, name: true },
      });

      const categoryMap = new Map(categories.map((c) => [c.id, c.name]));
      const total = grouped.reduce(
        (sum, g) => sum + Number(g._sum.amount || 0),
        0,
      );

      return grouped.map((g) => ({
        categoryName: g.categoryId
          ? (categoryMap.get(g.categoryId) ?? 'Sin categoría')
          : 'Sin categoría',
        total: Number(g._sum.amount || 0),
        percentage: total > 0 ? (Number(g._sum.amount || 0) / total) * 100 : 0,
      }));
    } catch (error) {
      this.logger.error('Error fetching category breakdown', error);
      return [];
    }
  }

  async exportToXlsx(
    accountingBookId: number,
    userId: number,
    startDate?: string,
    endDate?: string,
  ): Promise<Buffer | null> {
    const book = await this.prisma.accountingBook.findFirst({
      where: { id: accountingBookId, userId },
      select: { id: true },
    });
    if (!book) return null;

    const where: Prisma.TransactionWhereInput = { accountingBookId };
    if (startDate || endDate) {
      where.valueDate = {};
      if (startDate) where.valueDate.gte = new Date(startDate);
      if (endDate) where.valueDate.lte = new Date(endDate);
    }

    const transactions = await this.prisma.transaction.findMany({
      where,
      include: { category: true, supplier: true },
      orderBy: { valueDate: 'asc' },
    });

    const rows = transactions.map((t) => ({
      Date: new Date(t.valueDate).toISOString().slice(0, 10),
      Description: t.description ?? '',
      Type: t.type,
      Amount: Number(t.amount),
      PaymentMethod: t.paymentMethod ?? '',
      Category: t.category?.name ?? '',
      Supplier: t.supplier?.name ?? '',
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Transactions');
    return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer;
  }

  async delete(id: number, userId: number): Promise<Transaction | null> {
    try {
      const existing = await this.prisma.transaction.findFirst({
        where: { id, accountingBook: { userId } },
        select: { id: true },
      });
      if (!existing) return null;

      return await this.prisma.transaction.delete({ where: { id } });
    } catch {
      return null;
    }
  }
}
