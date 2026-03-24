import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../services/prisma.service';
import { CreateInvestmentDto } from './dto/create-investment.dto';

@Injectable()
export class InvestmentsService {
  private readonly logger = new Logger(InvestmentsService.name);
  constructor(private prisma: PrismaService) {}

  async findAll(accountingBookId: number, userId: number) {
    const positions = await this.prisma.investmentPosition.findMany({
      where: { accountingBookId, accountingBook: { userId } },
      orderBy: { createdAt: 'asc' },
      include: { account: { select: { id: true, name: true } } },
    });
    const totalValue = positions.reduce(
      (sum, p) => sum + Number(p.currentPrice) * Number(p.shares),
      0,
    );
    return { positions, totalValue };
  }

  async findAllGlobal(userId: number) {
    const positions = await this.prisma.investmentPosition.findMany({
      where: { accountingBook: { userId } },
      orderBy: { createdAt: 'asc' },
      include: { accountingBook: { select: { id: true, name: true } } },
    });
    const totalValue = positions.reduce(
      (sum, p) => sum + Number(p.currentPrice) * Number(p.shares),
      0,
    );
    return { positions, totalValue };
  }

  async create(userId: number, accountingBookId: number, dto: CreateInvestmentDto) {
    const book = await this.prisma.accountingBook.findFirst({
      where: { id: accountingBookId, userId },
      select: { id: true },
    });
    if (!book) return null;
    return this.prisma.investmentPosition.create({
      data: {
        userId,
        accountingBookId,
        accountId: dto.accountId ?? null,
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
    const position = await this.prisma.investmentPosition.findFirst({
      where: { id, accountingBook: { userId } },
    });
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
        ...('accountId' in dto && { accountId: dto.accountId ?? null }),
      },
    });
  }

  async remove(id: number, userId: number) {
    const position = await this.prisma.investmentPosition.findFirst({
      where: { id, accountingBook: { userId } },
    });
    if (!position) return null;
    return this.prisma.investmentPosition.delete({ where: { id } });
  }

  async refreshPrices(accountingBookId: number, userId: number) {
    const positions = await this.prisma.investmentPosition.findMany({
      where: { accountingBookId, accountingBook: { userId } },
    });

    // Step 1: fetch prices for all positions (currency inferred from ticker suffix, no extra API calls)
    const priceResults = await Promise.allSettled(
      positions.map(async (pos) => {
        const price = await this.fetchPrice(pos.ticker);
        const currency = this.getCurrencyFromTicker(pos.ticker);
        return { id: pos.id, price, currency };
      }),
    );

    // Step 2: fetch exchange rates for unique non-EUR currencies (one call per currency)
    const foreignCurrencies = new Set<string>();
    for (const result of priceResults) {
      if (result.status === 'fulfilled' && result.value.price !== null && result.value.currency !== 'EUR') {
        foreignCurrencies.add(result.value.currency);
      }
    }
    const exchangeRates = new Map<string, number>();
    await Promise.allSettled(
      Array.from(foreignCurrencies).map(async (currency) => {
        const rate = await this.fetchExchangeRate(currency);
        exchangeRates.set(currency, rate);
      }),
    );

    // Step 3: update positions with EUR-converted prices
    await Promise.allSettled(
      priceResults.map(async (result) => {
        if (result.status !== 'fulfilled' || result.value.price === null) return;
        const { id, price, currency } = result.value;
        const rate = currency !== 'EUR' ? (exchangeRates.get(currency) ?? 1) : 1;
        const eurPrice = price * rate;
        await this.prisma.investmentPosition.update({
          where: { id },
          data: { currentPrice: new Prisma.Decimal(eurPrice) },
        });
      }),
    );

    return this.findAll(accountingBookId, userId);
  }

  private async fetchPrice(ticker: string): Promise<number | null> {
    try {
      const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
      const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${encodeURIComponent(ticker)}&apikey=${apiKey}`;
      const res = await fetch(url);
      const data = await res.json();
      this.logger.log(`GLOBAL_QUOTE [${ticker}]: ${JSON.stringify(data)}`);
      const price = data['Global Quote']?.['05. price'];
      return price ? parseFloat(price) : null;
    } catch (err) {
      this.logger.error(`fetchPrice error [${ticker}]: ${err}`);
      return null;
    }
  }

  private getCurrencyFromTicker(ticker: string): string {
    const suffix = ticker.includes('.') ? ticker.split('.').pop()!.toUpperCase() : '';
    const eurSuffixes = ['AMS', 'MIL', 'DEX', 'FRA', 'PAR', 'EPA', 'EBR', 'BME', 'MCE', 'HEL', 'OSL', 'VIE', 'IST'];
    const gbpSuffixes = ['LON', 'LSE'];
    const sekSuffixes = ['STO'];
    const chfSuffixes = ['SWX', 'VTX'];

    if (!suffix) return 'USD'; // No suffix → US market
    if (eurSuffixes.includes(suffix)) return 'EUR';
    if (gbpSuffixes.includes(suffix)) return 'GBP';
    if (sekSuffixes.includes(suffix)) return 'SEK';
    if (chfSuffixes.includes(suffix)) return 'CHF';
    return 'USD'; // Unknown suffix → assume USD
  }

  private async fetchExchangeRate(fromCurrency: string, toCurrency = 'EUR'): Promise<number> {
    if (fromCurrency === toCurrency) return 1;
    // Handle GBX (British pence): 1 GBP = 100 GBX, but we use GBP exchange rate and divide price by 100
    if (fromCurrency === 'GBX') {
      const gbpRate = await this.fetchExchangeRate('GBP', toCurrency);
      return gbpRate / 100;
    }
    try {
      const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
      const url = `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=${fromCurrency}&to_currency=${toCurrency}&apikey=${apiKey}`;
      const res = await fetch(url);
      const data = await res.json();
      this.logger.log(`CURRENCY_EXCHANGE_RATE [${fromCurrency}->${toCurrency}]: ${JSON.stringify(data)}`);
      const rate = data['Realtime Currency Exchange Rate']?.['5. Exchange Rate'];
      return rate ? parseFloat(rate) : 1;
    } catch (err) {
      this.logger.error(`fetchExchangeRate error [${fromCurrency}->${toCurrency}]: ${err}`);
      return 1;
    }
  }
}
