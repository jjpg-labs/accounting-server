import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Post,
  Put,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';
import { TransactionService } from './transaction.service';

@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  async createTransaction(
    @Body() data: Prisma.TransactionUncheckedCreateInput,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const userId = req.user.sub;
      const transaction = (await this.transactionService.createTransaction(
        data,
        userId,
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
    @Req() req: Request,
    @Res() res: Response,
  ) {
    if (typeof data.id !== 'number') {
      res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: 'Transaction id is required' });
      return;
    }

    try {
      const userId = req.user.sub;
      const transaction = (await this.transactionService.update(
        Number(data.id),
        data,
        userId,
      )) || { message: 'Failed to update transaction' };
      const status =
        'message' in transaction ? HttpStatus.BAD_REQUEST : HttpStatus.OK;
      res.status(status).json(transaction);
    } catch {
      res.status(HttpStatus.BAD_REQUEST).json({ message: 'Unknown error' });
    }
  }

  @Get()
  async getTransaction(
    @Query('id') id: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const userId = req.user.sub;
      const transaction = (await this.transactionService.get(id, userId)) || {
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
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const userId = req.user.sub;
      const transactions = await this.transactionService.getAll(
        accountingId,
        userId,
      );
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
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const userId = req.user.sub;
      const metrics = await this.transactionService.getMetrics(
        accountingId,
        userId,
        startDate,
        endDate,
      );
      res.status(HttpStatus.OK).json(metrics);
    } catch {
      res.status(HttpStatus.BAD_REQUEST).json({ message: 'Unknown error' });
    }
  }

  @Get('export')
  async exportTransactions(
    @Query('accountingId') accountingId: number,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const userId = req.user.sub;
      const buffer = await this.transactionService.exportToXlsx(
        accountingId,
        userId,
        startDate,
        endDate,
      );
      if (!buffer) {
        return res.status(HttpStatus.NOT_FOUND).json({ message: 'Accounting book not found' });
      }
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="transactions.xlsx"`);
      return res.status(HttpStatus.OK).send(buffer);
    } catch {
      res.status(HttpStatus.BAD_REQUEST).json({ message: 'Unknown error' });
    }
  }

  @Delete()
  async deleteTransaction(
    @Query('id') id: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const userId = req.user.sub;
      const transaction = (await this.transactionService.delete(
        id,
        userId,
      )) || { message: 'Failed to delete transaction' };
      const status =
        'message' in transaction ? HttpStatus.BAD_REQUEST : HttpStatus.OK;
      res.status(status).json(transaction);
    } catch {
      res.status(HttpStatus.BAD_REQUEST).json({ message: 'Unknown error' });
    }
  }
}
