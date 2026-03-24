import { Body, Controller, Delete, Get, NotFoundException, Param, ParseIntPipe, Post, Put, Query, Req } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';

@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Get()
  findAll(@Req() req, @Query('bookId', ParseIntPipe) bookId: number) {
    return this.accountsService.findAllWithBalances(bookId, req.user.sub);
  }

  @Post()
  async create(@Req() req, @Body() dto: CreateAccountDto, @Query('bookId', ParseIntPipe) bookId: number) {
    const result = await this.accountsService.create(req.user.sub, bookId, dto);
    if (!result) throw new NotFoundException('Accounting book not found');
    return result;
  }

  @Put(':id')
  async update(@Req() req, @Param('id', ParseIntPipe) id: number, @Body() dto: Partial<CreateAccountDto>) {
    const result = await this.accountsService.update(id, req.user.sub, dto);
    if (!result) throw new NotFoundException('Account not found');
    return result;
  }

  @Delete(':id')
  async remove(@Req() req, @Param('id', ParseIntPipe) id: number) {
    const result = await this.accountsService.remove(id, req.user.sub);
    if (!result) throw new NotFoundException('Account not found');
    return result;
  }
}
