import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { Prisma, Transaction } from '@prisma/client';

@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  async createTransaction(
    @Body() data: Prisma.TransactionCreateInput,
  ): Promise<Transaction | null> {
    return this.transactionService.createTransaction(data);
  }

  @Put()
  async updateTransaction(
    @Query('id') id: number,
    @Body() data: Prisma.TransactionUpdateInput,
  ): Promise<Transaction | null> {
    return this.transactionService.update(id, data);
  }

  @Get()
  async getTransaction(@Query('id') id: number): Promise<Transaction | null> {
    return this.transactionService.get(id);
  }

  @Get('all')
  async getTransactions(
    @Query('accountingId') accountingId: number,
  ): Promise<Transaction[]> {
    return this.transactionService.getAll(accountingId);
  }

  @Delete()
  async deleteTransaction(@Query() id: number): Promise<Transaction | null> {
    return this.transactionService.delete(id);
  }
}
