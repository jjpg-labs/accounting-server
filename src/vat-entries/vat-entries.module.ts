import { Module } from '@nestjs/common';
import { VatEntriesController } from './vat-entries.controller';
import { VatEntriesService } from './vat-entries.service';
import { PrismaService } from '../services/prisma.service';

@Module({
  controllers: [VatEntriesController],
  providers: [VatEntriesService, PrismaService],
})
export class VatEntriesModule {}
