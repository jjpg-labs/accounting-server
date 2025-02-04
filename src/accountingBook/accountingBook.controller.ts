import { Body, Controller, Get, Post, Put, Query } from '@nestjs/common';
import { AccountingBookService } from './accountingBook.service';
import { AccountingBook, Prisma } from '@prisma/client';

@Controller('book')
export class AccountingBookController {
  constructor(private readonly accountingBookService: AccountingBookService) {}

  @Post()
  async createAccountingBook(
    @Body() data: Prisma.AccountingBookCreateInput,
  ): Promise<AccountingBook | null> {
    return this.accountingBookService.createAccountingBook(data);
  }

  @Get()
  async getAccountingBook(
    @Query('id') id: number,
  ): Promise<AccountingBook | null> {
    return this.accountingBookService.get(id);
  }

  @Put()
  async updateAccountingBook(
    @Query('id') id: number,
    @Body() data: Prisma.AccountingBookUpdateInput,
  ): Promise<AccountingBook | null> {
    return this.accountingBookService.update(id, data);
  }
}
