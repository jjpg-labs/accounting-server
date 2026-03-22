import { Body, Controller, Delete, Get, NotFoundException, Param, ParseIntPipe, Post, Put, Req } from '@nestjs/common';
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
  async updateAsset(@Req() req, @Param('id', ParseIntPipe) id: number, @Body() dto: Partial<CreateAssetDto>) {
    const result = await this.netWorthService.updateAsset(id, req.user.sub, dto);
    if (!result) throw new NotFoundException('Asset not found');
    return result;
  }

  @Delete('assets/:id')
  async removeAsset(@Req() req, @Param('id', ParseIntPipe) id: number) {
    const result = await this.netWorthService.removeAsset(id, req.user.sub);
    if (!result) throw new NotFoundException('Asset not found');
    return result;
  }

  // Liabilities
  @Post('liabilities')
  createLiability(@Req() req, @Body() dto: CreateLiabilityDto) {
    return this.netWorthService.createLiability(req.user.sub, dto);
  }

  @Put('liabilities/:id')
  async updateLiability(@Req() req, @Param('id', ParseIntPipe) id: number, @Body() dto: Partial<CreateLiabilityDto>) {
    const result = await this.netWorthService.updateLiability(id, req.user.sub, dto);
    if (!result) throw new NotFoundException('Liability not found');
    return result;
  }

  @Delete('liabilities/:id')
  async removeLiability(@Req() req, @Param('id', ParseIntPipe) id: number) {
    const result = await this.netWorthService.removeLiability(id, req.user.sub);
    if (!result) throw new NotFoundException('Liability not found');
    return result;
  }
}
