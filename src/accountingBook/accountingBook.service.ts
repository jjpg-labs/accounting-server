import { Injectable } from '@nestjs/common';
import { AccountingBook, Prisma } from '@prisma/client';
import { PrismaService } from '../services/prisma.service';

@Injectable()
export class AccountingBookService {
  constructor(private prisma: PrismaService) { }

  async createAccountingBook(
    data: Prisma.AccountingBookCreateInput,
  ): Promise<AccountingBook | null> {
    return this.prisma.accountingBook.create({
      data,
    });
  }

  async get(id: number): Promise<AccountingBook | null> {
    return this.prisma.accountingBook.findUnique({
      where: {
        id,
      },
    });
  }

  async update(
    id: number,
    data: Prisma.AccountingBookUpdateInput,
  ): Promise<AccountingBook | null> {
    try {
      return this.prisma.accountingBook.update({
        where: {
          id,
        },
        data,
      });
    } catch (error) {
      return null;
    }
  }
}
