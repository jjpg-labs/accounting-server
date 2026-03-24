import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../services/prisma.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { CreateLiabilityDto } from './dto/create-liability.dto';

@Injectable()
export class NetWorthService {
  constructor(private prisma: PrismaService) {}

  // Assets
  async createAsset(userId: number, accountingBookId: number, dto: CreateAssetDto) {
    const book = await this.prisma.accountingBook.findFirst({
      where: { id: accountingBookId, userId },
      select: { id: true },
    });
    if (!book) return null;
    return this.prisma.asset.create({
      data: { userId, accountingBookId, name: dto.name, value: new Prisma.Decimal(dto.value), category: dto.category, notes: dto.notes },
    });
  }

  async updateAsset(id: number, userId: number, dto: Partial<CreateAssetDto>) {
    const asset = await this.prisma.asset.findFirst({ where: { id, accountingBook: { userId } } });
    if (!asset) return null;
    return this.prisma.asset.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.value && { value: new Prisma.Decimal(dto.value) }),
        ...(dto.category && { category: dto.category }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
      },
    });
  }

  async removeAsset(id: number, userId: number) {
    const asset = await this.prisma.asset.findFirst({ where: { id, accountingBook: { userId } } });
    if (!asset) return null;
    return this.prisma.asset.delete({ where: { id } });
  }

  // Liabilities
  async createLiability(userId: number, accountingBookId: number, dto: CreateLiabilityDto) {
    const book = await this.prisma.accountingBook.findFirst({
      where: { id: accountingBookId, userId },
      select: { id: true },
    });
    if (!book) return null;
    return this.prisma.liability.create({
      data: { userId, accountingBookId, name: dto.name, amount: new Prisma.Decimal(dto.amount), category: dto.category, notes: dto.notes },
    });
  }

  async updateLiability(id: number, userId: number, dto: Partial<CreateLiabilityDto>) {
    const liability = await this.prisma.liability.findFirst({ where: { id, accountingBook: { userId } } });
    if (!liability) return null;
    return this.prisma.liability.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.amount && { amount: new Prisma.Decimal(dto.amount) }),
        ...(dto.category && { category: dto.category }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
      },
    });
  }

  async removeLiability(id: number, userId: number) {
    const liability = await this.prisma.liability.findFirst({ where: { id, accountingBook: { userId } } });
    if (!liability) return null;
    return this.prisma.liability.delete({ where: { id } });
  }

  // Summary per book
  async getSummary(accountingBookId: number, userId: number) {
    const [assets, liabilities, unlinkedPositions, rawAccounts] = await Promise.all([
      this.prisma.asset.findMany({ where: { accountingBookId, accountingBook: { userId } }, orderBy: { category: 'asc' } }),
      this.prisma.liability.findMany({ where: { accountingBookId, accountingBook: { userId } }, orderBy: { category: 'asc' } }),
      // Only positions NOT linked to an account (linked ones are counted via account balance)
      this.prisma.investmentPosition.findMany({ where: { accountingBookId, accountingBook: { userId }, accountId: null } }),
      this.prisma.account.findMany({ where: { accountingBookId, accountingBook: { userId } }, orderBy: { createdAt: 'asc' } }),
    ]);

    const accounts = await Promise.all(rawAccounts.map((acc) => this.calcAccountBalance(acc)));

    const totalAssets = assets.reduce((s, a) => s + Number(a.value), 0);
    const totalLiabilities = liabilities.reduce((s, l) => s + Number(l.amount), 0);
    // investmentTotal = only unlinked positions (linked ones are inside account.balance)
    const investmentTotal = unlinkedPositions.reduce((s, p) => s + Number(p.currentPrice) * Number(p.shares), 0);
    const accountsTotal = accounts.reduce((s, a) => s + a.balance, 0);
    const grandTotalAssets = totalAssets + investmentTotal + accountsTotal;

    return {
      totalAssets: grandTotalAssets,
      totalLiabilities,
      netWorth: grandTotalAssets - totalLiabilities,
      assets,
      liabilities,
      investmentTotal,
      accounts,
      accountsTotal,
    };
  }

  private async calcAccountBalance(account: { id: number; type: string; startingBalance: any; [key: string]: any }) {
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
    const balance = Number(account.startingBalance) + income - expense + incoming - outgoing + positionsValue;

    return { ...account, balance, positions };
  }

  // Global summary across all books
  async getGlobalSummary(userId: number) {
    const books = await this.prisma.accountingBook.findMany({
      where: { userId },
      select: { id: true, name: true },
    });

    const bookSummaries = await Promise.all(
      books.map(async (book) => {
        const [assets, liabilities, investmentPositions] = await Promise.all([
          this.prisma.asset.findMany({ where: { accountingBookId: book.id } }),
          this.prisma.liability.findMany({ where: { accountingBookId: book.id } }),
          this.prisma.investmentPosition.findMany({ where: { accountingBookId: book.id } }),
        ]);

        const rawAccounts = await this.prisma.account.findMany({ where: { accountingBookId: book.id } });
        const accounts = await Promise.all(rawAccounts.map((acc) => this.calcAccountBalance(acc)));
        const accountsTotal = accounts.reduce((s, a) => s + a.balance, 0);

        const totalAssets = assets.reduce((s, a) => s + Number(a.value), 0);
        const totalLiabilities = liabilities.reduce((s, l) => s + Number(l.amount), 0);
        const investmentTotal = investmentPositions.reduce(
          (s, p) => s + Number(p.currentPrice) * Number(p.shares),
          0,
        );
        const grandTotalAssets = totalAssets + investmentTotal + accountsTotal;

        return {
          bookId: book.id,
          bookName: book.name,
          totalAssets: grandTotalAssets,
          totalLiabilities,
          investmentTotal,
          accountsTotal,
          netWorth: grandTotalAssets - totalLiabilities,
        };
      }),
    );

    const totalAssets = bookSummaries.reduce((s, b) => s + b.totalAssets, 0);
    const totalLiabilities = bookSummaries.reduce((s, b) => s + b.totalLiabilities, 0);
    const investmentTotal = bookSummaries.reduce((s, b) => s + b.investmentTotal, 0);

    return {
      totalAssets,
      totalLiabilities,
      investmentTotal,
      netWorth: totalAssets - totalLiabilities,
      books: bookSummaries,
    };
  }
}
