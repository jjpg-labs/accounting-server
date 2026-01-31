import { Injectable } from '@nestjs/common';
import { AccountingBook, Prisma } from '@prisma/client';
import { PrismaService } from '../services/prisma.service';

@Injectable()
export class AccountingBookService {
  constructor(private prisma: PrismaService) {}

  async createAccountingBook(
    data: Prisma.AccountingBookCreateInput,
  ): Promise<AccountingBook | null> {
    try {
      return await this.prisma.accountingBook.create({
        data,
      });
    } catch {
      return null;
    }
  }

  async getAll(userId: number): Promise<AccountingBook[]> {
    return this.prisma.accountingBook.findMany({
      where: { userId },
      include: { transactions: true },
    });
  }

  async get(id: number): Promise<AccountingBook | null> {
    try {
      return await this.prisma.accountingBook.findUnique({
        where: {
          id,
        },
      });
    } catch {
      return null;
    }
  }

  async update(
    id: number,
    data: Prisma.AccountingBookUpdateInput,
  ): Promise<AccountingBook | null> {
    try {
      return await this.prisma.accountingBook.update({
        where: {
          id,
        },
        data,
      });
    } catch {
      return null;
    }
  }

  async delete(id: number): Promise<AccountingBook | null> {
    try {
      return await this.prisma.accountingBook.delete({
        where: {
          id,
        },
      });
    } catch {
      return null;
    }
  }
}
