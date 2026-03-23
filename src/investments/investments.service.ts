import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../services/prisma.service';
import { CreateInvestmentDto } from './dto/create-investment.dto';

@Injectable()
export class InvestmentsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: number) {
    const positions = await this.prisma.investmentPosition.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });
    const totalValue = positions.reduce(
      (sum, p) => sum + Number(p.currentPrice) * Number(p.shares),
      0,
    );
    return { positions, totalValue };
  }

  async create(userId: number, dto: CreateInvestmentDto) {
    return this.prisma.investmentPosition.create({
      data: {
        userId,
        name: dto.name,
        ticker: dto.ticker,
        shares: new Prisma.Decimal(dto.shares),
        currentPrice: new Prisma.Decimal(dto.currentPrice),
        currency: dto.currency ?? 'EUR',
        notes: dto.notes,
      },
    });
  }

  async update(id: number, userId: number, dto: Partial<CreateInvestmentDto>) {
    const position = await this.prisma.investmentPosition.findFirst({ where: { id, userId } });
    if (!position) return null;
    return this.prisma.investmentPosition.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.ticker && { ticker: dto.ticker }),
        ...(dto.shares && { shares: new Prisma.Decimal(dto.shares) }),
        ...(dto.currentPrice && { currentPrice: new Prisma.Decimal(dto.currentPrice) }),
        ...(dto.currency && { currency: dto.currency }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
      },
    });
  }

  async remove(id: number, userId: number) {
    const position = await this.prisma.investmentPosition.findFirst({ where: { id, userId } });
    if (!position) return null;
    return this.prisma.investmentPosition.delete({ where: { id } });
  }

  async refreshPrices(userId: number) {
    const positions = await this.prisma.investmentPosition.findMany({ where: { userId } });
    const results = await Promise.allSettled(
      positions.map(async (pos) => {
        const price = await this.fetchPrice(pos.ticker);
        if (price !== null) {
          await this.prisma.investmentPosition.update({
            where: { id: pos.id },
            data: { currentPrice: new Prisma.Decimal(price) },
          });
        }
      }),
    );
    // Return updated positions regardless of individual failures
    void results;
    return this.findAll(userId);
  }

  private async fetchPrice(ticker: string): Promise<number | null> {
    try {
      const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
      const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${encodeURIComponent(ticker)}&apikey=${apiKey}`;
      const res = await fetch(url);
      const data = await res.json();
      const price = data['Global Quote']?.['05. price'];
      return price ? parseFloat(price) : null;
    } catch {
      return null;
    }
  }
}
