import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Post,
  Put,
  Query,
  Res,
} from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { Prisma, Transaction } from '@prisma/client';
import { Response } from 'express';

@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  async createTransaction(
    @Body() data: Prisma.TransactionCreateInput,
    @Res() res: Response,
  ) {
    try {
      const transaction = (await this.transactionService.createTransaction(
        data,
      )) || { message: 'Failed to create transaction' };
      const status =
        'message' in transaction ? HttpStatus.BAD_REQUEST : HttpStatus.CREATED;
      res.status(status).json(transaction);
    } catch (error) {
      res.status(HttpStatus.BAD_REQUEST).json({ message: 'Unknown error' });
    }
  }

  @Put()
  async updateTransaction(
    @Body() data: Prisma.TransactionUncheckedUpdateInput,
    @Res() res: Response,
  ) {
    if (typeof data.id !== 'number') {
      res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: 'Transaction id is required' });
    }

    try {
      const transaction = (await this.transactionService.update(
        Number(data.id),
        data,
      )) || { message: 'Failed to update transaction' };
      const status =
        'message' in transaction ? HttpStatus.BAD_REQUEST : HttpStatus.OK;
      res.status(status).json(transaction);
    } catch (error) {
      res.status(HttpStatus.BAD_REQUEST).json({ message: 'Unknown error' });
    }
  }

  @Get()
  async getTransaction(@Query('id') id: number, @Res() res: Response) {
    try {
      const transaction = (await this.transactionService.get(id)) || {
        message: 'Transaction not found',
      };
      const status =
        'message' in transaction ? HttpStatus.NOT_FOUND : HttpStatus.OK;
      res.status(status).json(transaction);
    } catch (error) {
      res.status(HttpStatus.BAD_REQUEST).json({ message: 'Unknown error' });
    }
  }

  @Get('all')
  async getTransactions(
    @Query('accountingId') accountingId: number,
    @Res() res: Response,
  ) {
    try {
      const transactions = await this.transactionService.getAll(accountingId);
      const status =
        transactions.length > 0 ? HttpStatus.OK : HttpStatus.NOT_FOUND;
      res.status(status).json(transactions);
    } catch (error) {
      res.status(HttpStatus.BAD_REQUEST).json({ message: 'Unknown error' });
    }
  }

  @Delete()
  async deleteTransaction(@Query() id: number, @Res() res: Response) {
    try {
      const transaction = (await this.transactionService.delete(id)) || {
        message: 'Failed to delete transaction',
      };
      const status =
        'message' in transaction ? HttpStatus.BAD_REQUEST : HttpStatus.OK;
      res.status(status).json(transaction);
    } catch (error) {
      res.status(HttpStatus.BAD_REQUEST).json({ message: 'Unknown error' });
    }
  }
}
