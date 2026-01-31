import { Module } from '@nestjs/common';
import { PeriodicService } from './periodic.service';
import { PeriodicController } from './periodic.controller';
import { PrismaService } from '../services/prisma.service';

@Module({
  controllers: [PeriodicController],
  providers: [PeriodicService, PrismaService],
})
export class PeriodicModule {}
