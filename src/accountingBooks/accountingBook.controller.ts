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
import { AccountingBookService } from './accountingBook.service';

@Controller('book')
export class AccountingBookController {
  constructor(private readonly accountingBookService: AccountingBookService) {}

  @Post()
  async createAccountingBook(
    @Body() data: Prisma.AccountingBookUncheckedCreateInput,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const userId = req.user.sub;
      const newAccountingBook =
        (await this.accountingBookService.createAccountingBook({
          ...data,
          userId,
        })) || { message: 'Accounting book not created' };

      const status =
        'message' in newAccountingBook
          ? HttpStatus.BAD_REQUEST
          : HttpStatus.CREATED;
      res.status(status).json(newAccountingBook);
    } catch {
      res.status(HttpStatus.BAD_REQUEST).json({ message: 'An error occurred' });
    }
  }

  @Get('all')
  async getAccountingBooks(@Req() req: Request, @Res() res: Response) {
    try {
      const books = await this.accountingBookService.getAll(req.user.sub);
      res.status(HttpStatus.OK).json(books);
    } catch {
      res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: 'Failed to fetch accounting books' });
    }
  }

  @Get()
  async getAccountingBook(
    @Query('id') id: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const accountigBook =
        (await this.accountingBookService.get(id, req.user.sub)) || {
          message: 'Accounting book not found',
        };
      const status =
        'message' in accountigBook ? HttpStatus.NOT_FOUND : HttpStatus.OK;

      res.status(status).json(accountigBook);
    } catch {
      res.status(HttpStatus.BAD_REQUEST).json({ message: 'An error occurred' });
    }
  }

  @Put()
  async updateAccountingBook(
    @Body() data: Prisma.AccountingBookUncheckedUpdateInput,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    if (typeof data.id !== 'number') {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: 'Accounting book id is required' });
    }

    try {
      const accountingBook = await this.accountingBookService.update(
        data.id,
        data,
        req.user.sub,
      );
      const status = accountingBook ? HttpStatus.OK : HttpStatus.BAD_REQUEST;
      res
        .status(status)
        .json(accountingBook || { message: 'Accounting book not updated' });
    } catch {
      res.status(HttpStatus.BAD_REQUEST).json({ message: 'An error occurred' });
    }
  }

  @Delete()
  async deleteAccountingBook(
    @Query('id') id: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const accountingBook = await this.accountingBookService.delete(
        id,
        req.user.sub,
      );
      const status = accountingBook ? HttpStatus.OK : HttpStatus.BAD_REQUEST;
      res
        .status(status)
        .json(accountingBook || { message: 'Accounting book not deleted' });
    } catch {
      res.status(HttpStatus.BAD_REQUEST).json({ message: 'An error occurred' });
    }
  }
}
