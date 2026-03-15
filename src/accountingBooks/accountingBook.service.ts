import { Injectable } from '@nestjs/common';
import { AccountingBook, Prisma } from '@prisma/client';
import { PrismaService } from '../services/prisma.service';

@Injectable()
export class AccountingBookService {
  constructor(private prisma: PrismaService) {}

  async createAccountingBook(
    data: Prisma.AccountingBookUncheckedCreateInput,
  ): Promise<AccountingBook | null> {
    try {
      return await this.prisma.accountingBook.create({ data });
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

  async get(id: number, userId: number): Promise<AccountingBook | null> {
    try {
      return await this.prisma.accountingBook.findFirst({
        where: { id, userId },
      });
    } catch {
      return null;
    }
  }

  async update(
    id: number,
    data: Prisma.AccountingBookUncheckedUpdateInput,
    userId: number,
  ): Promise<AccountingBook | null> {
    try {
      const existing = await this.prisma.accountingBook.findFirst({
        where: { id, userId },
        select: { id: true },
      });
      if (!existing) return null;

      return await this.prisma.accountingBook.update({ where: { id }, data });
    } catch {
      return null;
    }
  }

  async delete(id: number, userId: number): Promise<AccountingBook | null> {
    try {
      const existing = await this.prisma.accountingBook.findFirst({
        where: { id, userId },
        select: { id: true },
      });
      if (!existing) return null;

      return await this.prisma.accountingBook.delete({ where: { id } });
    } catch {
      return null;
    }
  }
}
