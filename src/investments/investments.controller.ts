import { Body, Controller, Delete, Get, NotFoundException, Param, ParseIntPipe, Post, Put, Query, Req } from '@nestjs/common';
import { InvestmentsService } from './investments.service';
import { CreateInvestmentDto } from './dto/create-investment.dto';

@Controller('investments')
export class InvestmentsController {
  constructor(private readonly investmentsService: InvestmentsService) {}

  @Get('global')
  findAllGlobal(@Req() req) {
    return this.investmentsService.findAllGlobal(req.user.sub);
  }

  @Get()
  findAll(@Req() req, @Query('bookId', ParseIntPipe) bookId: number) {
    return this.investmentsService.findAll(bookId, req.user.sub);
  }

  @Post()
  async create(@Req() req, @Body() dto: CreateInvestmentDto, @Query('bookId', ParseIntPipe) bookId: number) {
    const result = await this.investmentsService.create(req.user.sub, bookId, dto);
    if (!result) throw new NotFoundException('Accounting book not found');
    return result;
  }

  @Put(':id')
  async update(@Req() req, @Param('id', ParseIntPipe) id: number, @Body() dto: Partial<CreateInvestmentDto>) {
    const result = await this.investmentsService.update(id, req.user.sub, dto);
    if (!result) throw new NotFoundException('Investment position not found');
    return result;
  }

  @Delete(':id')
  async remove(@Req() req, @Param('id', ParseIntPipe) id: number) {
    const result = await this.investmentsService.remove(id, req.user.sub);
    if (!result) throw new NotFoundException('Investment position not found');
    return result;
  }

  @Post('refresh-prices')
  refreshPrices(@Req() req, @Query('bookId', ParseIntPipe) bookId: number) {
    return this.investmentsService.refreshPrices(bookId, req.user.sub);
  }
}
