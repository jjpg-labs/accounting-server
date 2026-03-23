import { Module } from '@nestjs/common';
import { InvestmentsController } from './investments.controller';
import { InvestmentsService } from './investments.service';
import { PrismaService } from '../services/prisma.service';

@Module({
  controllers: [InvestmentsController],
  providers: [InvestmentsService, PrismaService],
  exports: [InvestmentsService],
})
export class InvestmentsModule {}
