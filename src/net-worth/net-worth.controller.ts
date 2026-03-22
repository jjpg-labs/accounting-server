import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Req } from '@nestjs/common';
import { NetWorthService } from './net-worth.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { CreateLiabilityDto } from './dto/create-liability.dto';

@Controller('net-worth')
export class NetWorthController {
  constructor(private readonly netWorthService: NetWorthService) {}

  @Get()
  getSummary(@Req() req) {
    return this.netWorthService.getSummary(req.user.sub);
  }

  // Assets
  @Post('assets')
  createAsset(@Req() req, @Body() dto: CreateAssetDto) {
    return this.netWorthService.createAsset(req.user.sub, dto);
  }

  @Put('assets/:id')
  updateAsset(@Req() req, @Param('id', ParseIntPipe) id: number, @Body() dto: Partial<CreateAssetDto>) {
    return this.netWorthService.updateAsset(id, req.user.sub, dto);
  }

  @Delete('assets/:id')
  removeAsset(@Req() req, @Param('id', ParseIntPipe) id: number) {
    return this.netWorthService.removeAsset(id, req.user.sub);
  }

  // Liabilities
  @Post('liabilities')
  createLiability(@Req() req, @Body() dto: CreateLiabilityDto) {
    return this.netWorthService.createLiability(req.user.sub, dto);
  }

  @Put('liabilities/:id')
  updateLiability(@Req() req, @Param('id', ParseIntPipe) id: number, @Body() dto: Partial<CreateLiabilityDto>) {
    return this.netWorthService.updateLiability(id, req.user.sub, dto);
  }

  @Delete('liabilities/:id')
  removeLiability(@Req() req, @Param('id', ParseIntPipe) id: number) {
    return this.netWorthService.removeLiability(id, req.user.sub);
  }
}
