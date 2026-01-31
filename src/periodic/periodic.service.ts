import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../services/prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CreateRecurringDto } from './dto/create-recurring.dto';
import { Frequency } from '@prisma/client';

@Injectable()
export class PeriodicService {
  private readonly logger = new Logger(PeriodicService.name);

  constructor(private prisma: PrismaService) {}

  async create(userId: number, dto: CreateRecurringDto) {
    return this.prisma.recurringTransaction.create({
      data: {
        ...dto,
        userId,
        nextRunDate: dto.startDate,
      },
    });
  }

  async findAll(userId: number) {
    return this.prisma.recurringTransaction.findMany({
      where: { userId },
      include: { category: true, accountingBook: true },
    });
  }

  async findOne(id: number, userId: number) {
    return this.prisma.recurringTransaction.findFirst({
      where: { id, userId },
      include: { category: true },
    });
  }

  async remove(id: number, userId: number) {
    return this.prisma.recurringTransaction.deleteMany({
      where: { id, userId },
    });
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCron() {
    this.logger.log('Running recurring transactions check...');
    await this.processPending();
  }

  async processPending(userId?: number) {
    const now = new Date();
    const where: any = {
      active: true,
      nextRunDate: { lte: now },
    };
    if (userId) where.userId = userId;

    const pending = await this.prisma.recurringTransaction.findMany({
      where,
    });

    let count = 0;
    for (const rec of pending) {
      await this.prisma.$transaction(async (tx) => {
        // Create Transaction
        await tx.transaction.create({
          data: {
            description: rec.description,
            amount: rec.amount,
            type: rec.type,
            paymentMethod: rec.paymentMethod,
            valueDate: now,
            accountingBookId: rec.accountingBookId,
            categoryId: rec.categoryId,
          },
        });

        // Update Recurring
        const nextDate = this.calculateNextDate(rec.nextRunDate, rec.frequency);

        await tx.recurringTransaction.update({
          where: { id: rec.id },
          data: {
            lastRunDate: now,
            nextRunDate: nextDate,
          },
        });
      });
      count++;
    }
    this.logger.log(`Processed ${count} recurring transactions.`);
    return { processed: count };
  }

  private calculateNextDate(current: Date, freq: Frequency): Date {
    const date = new Date(current);
    switch (freq) {
      case Frequency.DAILY:
        date.setDate(date.getDate() + 1);
        break;
      case Frequency.WEEKLY:
        date.setDate(date.getDate() + 7);
        break;
      case Frequency.MONTHLY:
        date.setMonth(date.getMonth() + 1);
        break;
      case Frequency.YEARLY:
        date.setFullYear(date.getFullYear() + 1);
        break;
    }
    return date;
  }
}
