import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Body,
  Param,
  Delete,
  Request,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { PeriodicService } from './periodic.service';
import { CreateRecurringDto } from './dto/create-recurring.dto';
import { UpdateRecurringDto } from './dto/update-recurring.dto';
import { AuthGuard } from '../auth/auth.guard';

@Controller('periodic')
@UseGuards(AuthGuard)
export class PeriodicController {
  constructor(private readonly periodicService: PeriodicService) {}

  @Post()
  create(@Request() req, @Body() dto: CreateRecurringDto) {
    return this.periodicService.create(req.user.sub, dto);
  }

  @Get()
  findAll(@Request() req) {
    return this.periodicService.findAll(req.user.sub);
  }

  @Get('process')
  processNow(@Request() req) {
    return this.periodicService.processPending(req.user.sub);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: number) {
    return this.periodicService.findOne(id, req.user.sub);
  }

  @Put(':id')
  async update(@Request() req, @Param('id') id: number, @Body() dto: UpdateRecurringDto) {
    const result = await this.periodicService.update(id, req.user.sub, dto);
    if (!result) throw new NotFoundException('Recurring transaction not found');
    return result;
  }

  @Patch(':id/toggle')
  toggleActive(@Request() req, @Param('id') id: number) {
    return this.periodicService.toggleActive(id, req.user.sub);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: number) {
    return this.periodicService.remove(id, req.user.sub);
  }
}
