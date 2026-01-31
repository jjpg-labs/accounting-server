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
import { Prisma } from '@prisma/client';
import { Response } from 'express';
import { TransactionService } from './transaction.service';

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
    } catch {
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
    } catch {
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
    } catch {
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
    } catch {
      res.status(HttpStatus.BAD_REQUEST).json({ message: 'Unknown error' });
    }
  }

  @Get('metrics')
  async getMetrics(
    @Query('accountingId') accountingId: number,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Res() res: Response,
  ) {
    try {
      const metrics = await this.transactionService.getMetrics(
        accountingId,
        startDate,
        endDate,
      );
      res.status(HttpStatus.OK).json(metrics);
    } catch {
      res.status(HttpStatus.BAD_REQUEST).json({ message: 'Unknown error' });
    }
  }

  @Delete()
  async deleteTransaction(@Query('id') id: number, @Res() res: Response) {
    try {
      const transaction = (await this.transactionService.delete(id)) || {
        message: 'Failed to delete transaction',
      };
      const status =
        'message' in transaction ? HttpStatus.BAD_REQUEST : HttpStatus.OK;
      res.status(status).json(transaction);
    } catch {
      res.status(HttpStatus.BAD_REQUEST).json({ message: 'Unknown error' });
    }
  }
}
