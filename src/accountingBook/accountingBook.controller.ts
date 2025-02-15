import { Body, Controller, Delete, Get, HttpStatus, Post, Put, Query, Res } from '@nestjs/common';
import { AccountingBookService } from './accountingBook.service';
import { AccountingBook, Prisma } from '@prisma/client';
import { Response } from 'express';

@Controller('book')
export class AccountingBookController {
  constructor(private readonly accountingBookService: AccountingBookService) { }

  @Post()
  async createAccountingBook(
    @Body() data: Prisma.AccountingBookCreateInput,
    @Res() res: Response,
  ) {
    try {
      const newAccountingBook = await this.accountingBookService.createAccountingBook(data) || { message: 'Accounting book not created' };
      const status = 'message' in newAccountingBook ? HttpStatus.BAD_REQUEST : HttpStatus.CREATED;
      res.status(status).json(newAccountingBook);
    } catch (error) {
      res.status(HttpStatus.BAD_REQUEST).json({ message: 'An error occurred', });
    }
  }

  @Get()
  async getAccountingBook(
    @Query('id') id: number,
    @Res() res: Response,
  ) {
    try {
      const accountigBook = await this.accountingBookService.get(id) || { message: 'Accounting book not found' };
      const status = 'message' in accountigBook ? HttpStatus.NOT_FOUND : HttpStatus.OK;

      res.status(status).json(accountigBook);
    } catch (error) {
      res.status(HttpStatus.BAD_REQUEST).json({ message: 'An error occurred', });
    }
  }

  @Put()
  async updateAccountingBook(
    @Body() data: Prisma.AccountingBookUncheckedUpdateInput,
    @Res() res: Response,
  ) {
    if (typeof data.id !== 'number') {
      return res.status(HttpStatus.BAD_REQUEST).json({ message: 'Accounting book id is required' });
    }

    try {
      const accountingBook = await this.accountingBookService.update(data.id, data);
      const status = accountingBook ? HttpStatus.OK : HttpStatus.BAD_REQUEST;
      res.status(status).json(accountingBook || { message: 'Accounting book not updated' });
    } catch (error) {
      res.status(HttpStatus.BAD_REQUEST).json({ message: 'An error occurred', });
    }
  }

  @Delete()
  async deleteAccountingBook(
    @Query('id') id: number,
    @Res() res: Response,
  ) {
    try {
      const accountingBook = await this.accountingBookService.delete(id);
      const status = accountingBook ? HttpStatus.OK : HttpStatus.BAD_REQUEST;
      res.status(status).json(accountingBook || { message: 'Accounting book not deleted' });
    } catch (error) {
      res.status(HttpStatus.BAD_REQUEST).json({ message: 'An error occurred', });
    }
  }
}
