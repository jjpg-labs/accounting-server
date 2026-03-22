import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { SavingsGoalsService } from './savings-goals.service';
import { CreateSavingsGoalDto } from './dto/create-savings-goal.dto';
import { ContributeDto } from './dto/contribute.dto';

@Controller('savings-goals')
@UseGuards(AuthGuard)
export class SavingsGoalsController {
  constructor(private readonly savingsGoalsService: SavingsGoalsService) {}

  @Post()
  create(@Request() req, @Body() dto: CreateSavingsGoalDto) {
    return this.savingsGoalsService.create(req.user.sub, dto);
  }

  @Get()
  findAll(@Request() req) {
    return this.savingsGoalsService.findAll(req.user.sub);
  }

  @Get(':id')
  async findOne(@Request() req, @Param('id') id: number) {
    const goal = await this.savingsGoalsService.findOne(id, req.user.sub);
    if (!goal) throw new NotFoundException('Savings goal not found');
    return goal;
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Request() req,
    @Param('id') id: number,
    @Body() dto: Partial<CreateSavingsGoalDto>,
  ) {
    const result = await this.savingsGoalsService.update(id, req.user.sub, dto);
    if (!result) throw new NotFoundException('Savings goal not found');
    return result;
  }

  @Patch(':id/contribute')
  @HttpCode(HttpStatus.OK)
  async contribute(
    @Request() req,
    @Param('id') id: number,
    @Body() dto: ContributeDto,
  ) {
    const result = await this.savingsGoalsService.contribute(id, req.user.sub, dto.amount);
    if (!result) throw new NotFoundException('Savings goal not found');
    return result;
  }

  @Delete(':id')
  async remove(@Request() req, @Param('id') id: number) {
    const result = await this.savingsGoalsService.remove(id, req.user.sub);
    if (!result) throw new NotFoundException('Savings goal not found');
    return result;
  }
}
