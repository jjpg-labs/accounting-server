import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Delete,
  Request,
  UseGuards,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { BudgetsService } from './budgets.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { AuthGuard } from '../auth/auth.guard';

@Controller('budgets')
@UseGuards(AuthGuard)
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}

  @Post()
  create(@Request() req, @Body() createBudgetDto: CreateBudgetDto) {
    return this.budgetsService.create(req.user.sub, createBudgetDto);
  }

  @Get()
  findAll(@Request() req) {
    return this.budgetsService.findAll(req.user.sub);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: number) {
    return this.budgetsService.findOne(id, req.user.sub);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Request() req,
    @Param('id') id: number,
    @Body() updateBudgetDto: UpdateBudgetDto,
  ) {
    const result = await this.budgetsService.update(id, req.user.sub, updateBudgetDto);
    if (!result) throw new NotFoundException('Budget not found');
    return result;
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: number) {
    return this.budgetsService.remove(id, req.user.sub);
  }
}
