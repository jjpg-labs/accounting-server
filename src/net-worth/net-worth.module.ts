import { Module } from '@nestjs/common';
import { NetWorthController } from './net-worth.controller';
import { NetWorthService } from './net-worth.service';
import { PrismaService } from '../services/prisma.service';

@Module({
  controllers: [NetWorthController],
  providers: [NetWorthService, PrismaService],
})
export class NetWorthModule {}
