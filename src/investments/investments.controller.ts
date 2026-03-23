import { Body, Controller, Delete, Get, NotFoundException, Param, ParseIntPipe, Post, Put, Req } from '@nestjs/common';
import { InvestmentsService } from './investments.service';
import { CreateInvestmentDto } from './dto/create-investment.dto';

@Controller('investments')
export class InvestmentsController {
  constructor(private readonly investmentsService: InvestmentsService) {}

  @Get()
  findAll(@Req() req) {
    return this.investmentsService.findAll(req.user.sub);
  }

  @Post()
  create(@Req() req, @Body() dto: CreateInvestmentDto) {
    return this.investmentsService.create(req.user.sub, dto);
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
  refreshPrices(@Req() req) {
    return this.investmentsService.refreshPrices(req.user.sub);
  }
}
