import { Injectable, Logger } from '@nestjs/common';
import { Prisma, Transaction } from '@prisma/client';
import { PrismaService } from '../services/prisma.service';

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
