import { Module } from '@nestjs/common';
import { SavingsGoalsController } from './savings-goals.controller';
import { SavingsGoalsService } from './savings-goals.service';
import { PrismaService } from '../services/prisma.service';

@Module({
  controllers: [SavingsGoalsController],
  providers: [SavingsGoalsService, PrismaService],
})
export class SavingsGoalsModule {}
