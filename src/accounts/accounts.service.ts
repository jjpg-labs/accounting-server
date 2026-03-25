import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../services/prisma.service';
import { CreateAccountDto } from './dto/create-account.dto';

@Injectable()
export class AccountsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, accountingBookId: number, dto: CreateAccountDto) {
    const book = await this.prisma.accountingBook.findFirst({
      where: { id: accountingBookId, userId },
      select: { id: true },
    });
    if (!book) return null;
    return this.prisma.account.create({
      data: {
        userId,
        accountingBookId,
        name: dto.name,
        type: dto.type ?? 'CHECKING',
        startingBalance: dto.startingBalance != null ? new Prisma.Decimal(dto.startingBalance) : new Prisma.Decimal(0),
        marginBalance: dto.marginBalance != null ? new Prisma.Decimal(dto.marginBalance) : new Prisma.Decimal(0),
        notes: dto.notes,
      },
    });
  }

  async findAll(accountingBookId: number, userId: number) {
    return this.prisma.account.findMany({
      where: { accountingBookId, accountingBook: { userId } },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findAllWithBalances(accountingBookId: number, userId: number) {
    const accounts = await this.findAll(accountingBookId, userId);
    return Promise.all(accounts.map((acc) => this.withBalance(acc)));
  }

  async update(id: number, userId: number, dto: Partial<CreateAccountDto>) {
    const account = await this.prisma.account.findFirst({
      where: { id, accountingBook: { userId } },
    });
    if (!account) return null;
    return this.prisma.account.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.type && { type: dto.type }),
        ...(dto.startingBalance != null && { startingBalance: new Prisma.Decimal(dto.startingBalance) }),
        ...(dto.marginBalance != null && { marginBalance: new Prisma.Decimal(dto.marginBalance) }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
      },
    });
  }

  async remove(id: number, userId: number) {
    const account = await this.prisma.account.findFirst({
      where: { id, accountingBook: { userId } },
    });
    if (!account) return null;
    return this.prisma.account.delete({ where: { id } });
  }

  private async withBalance(account: { id: number; type: string; startingBalance: Prisma.Decimal; marginBalance: Prisma.Decimal; [key: string]: any }) {
    const [incomeExpense, transferOut, transferIn, positions] = await Promise.all([
      this.prisma.transaction.groupBy({
        by: ['type'],
        where: { accountId: account.id, type: { in: ['INCOME', 'EXPENSE'] } },
        _sum: { amount: true },
      }),
      this.prisma.transaction.aggregate({
        where: { accountId: account.id, type: 'TRANSFER' },
        _sum: { amount: true },
      }),
      this.prisma.transaction.aggregate({
        where: { toAccountId: account.id, type: 'TRANSFER' },
        _sum: { amount: true },
      }),
      account.type === 'INVESTMENT'
        ? this.prisma.investmentPosition.findMany({
            where: { accountId: account.id },
            select: { id: true, name: true, ticker: true, shares: true, currentPrice: true, currency: true },
          })
        : Promise.resolve([]),
    ]);

    const income = Number(incomeExpense.find((r) => r.type === 'INCOME')?._sum?.amount ?? 0);
    const expense = Number(incomeExpense.find((r) => r.type === 'EXPENSE')?._sum?.amount ?? 0);
    const outgoing = Number(transferOut._sum?.amount ?? 0);
    const incoming = Number(transferIn._sum?.amount ?? 0);
    const positionsValue = positions.reduce((s, p) => s + Number(p.shares) * Number(p.currentPrice), 0);
    const balance = Number(account.startingBalance) + income - expense + incoming - outgoing + positionsValue + Number(account.marginBalance ?? 0);

    return { ...account, balance, positions };
  }
}
