import { Injectable } from '@nestjs/common';
import { Prisma, Transaction } from '@prisma/client';
import { PrismaService } from '../services/prisma.service';

@Injectable()
export class TransactionService {
  constructor(private prisma: PrismaService) {}

  async createTransaction(
    data: Prisma.TransactionCreateInput,
  ): Promise<Transaction | null> {
    try {
      return await this.prisma.transaction.create({
        data,
      });
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async update(
    id: number,
    data: Prisma.TransactionUpdateInput,
  ): Promise<Transaction | null> {
    try {
      return await this.prisma.transaction.update({
        where: {
          id,
        },
        data,
      });
    } catch {
      return null;
    }
  }

  async get(id: number): Promise<Transaction | null> {
    try {
      return await this.prisma.transaction.findUnique({
        where: {
          id,
        },
      });
    } catch {
      return null;
    }
  }

  async getAll(accountingBookId: number): Promise<Transaction[]> {
    try {
      return await this.prisma.transaction.findMany({
        where: {
          accountingBookId: accountingBookId,
        },
      });
    } catch {
      return [];
    }
  }

  async getMetrics(
    accountingBookId: number,
    startDate?: string,
    endDate?: string,
  ) {
    try {
      const where: Prisma.TransactionWhereInput = {
        accountingBookId,
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
      console.error('Error fetching metrics:', error);
      return { totalIncome: 0, totalExpense: 0, netRevenue: 0 };
    }
  }

  async delete(id: number): Promise<Transaction | null> {
    try {
      return await this.prisma.transaction.delete({
        where: {
          id,
        },
      });
    } catch {
      return null;
    }
  }
}
