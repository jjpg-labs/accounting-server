import { Module } from '@nestjs/common';
import { DailyReportsService } from './dailyReports.service';
import { DailyReportsController } from './dailyReports.controller';
import { PrismaService } from '../services/prisma.service';

@Module({
  controllers: [DailyReportsController],
  providers: [DailyReportsService, PrismaService],
  exports: [DailyReportsService],
})
export class DailyReportsModule {}
