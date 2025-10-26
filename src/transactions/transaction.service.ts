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
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
      return [];
    }
  }

  async delete(id: number): Promise<Transaction | null> {
    try {
      return await this.prisma.transaction.delete({
        where: {
          id,
        },
      });
    } catch (error) {
      return null;
    }
  }
}
