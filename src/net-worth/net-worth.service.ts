import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../services/prisma.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { CreateLiabilityDto } from './dto/create-liability.dto';

@Injectable()
export class NetWorthService {
  constructor(private prisma: PrismaService) {}

  // Assets
  async createAsset(userId: number, dto: CreateAssetDto) {
    return this.prisma.asset.create({
      data: { userId, name: dto.name, value: new Prisma.Decimal(dto.value), category: dto.category, notes: dto.notes },
    });
  }

  async findAllAssets(userId: number) {
    return this.prisma.asset.findMany({ where: { userId }, orderBy: { category: 'asc' } });
  }

  async updateAsset(id: number, userId: number, dto: Partial<CreateAssetDto>) {
    const asset = await this.prisma.asset.findFirst({ where: { id, userId } });
    if (!asset) return null;
    return this.prisma.asset.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.value && { value: new Prisma.Decimal(dto.value) }),
        ...(dto.category && { category: dto.category }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
      },
    });
  }

  async removeAsset(id: number, userId: number) {
    const asset = await this.prisma.asset.findFirst({ where: { id, userId } });
    if (!asset) return null;
    return this.prisma.asset.delete({ where: { id } });
  }

  // Liabilities
  async createLiability(userId: number, dto: CreateLiabilityDto) {
    return this.prisma.liability.create({
      data: { userId, name: dto.name, amount: new Prisma.Decimal(dto.amount), category: dto.category, notes: dto.notes },
    });
  }

  async findAllLiabilities(userId: number) {
    return this.prisma.liability.findMany({ where: { userId }, orderBy: { category: 'asc' } });
  }

  async updateLiability(id: number, userId: number, dto: Partial<CreateLiabilityDto>) {
    const liability = await this.prisma.liability.findFirst({ where: { id, userId } });
    if (!liability) return null;
    return this.prisma.liability.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.amount && { amount: new Prisma.Decimal(dto.amount) }),
        ...(dto.category && { category: dto.category }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
      },
    });
  }

  async removeLiability(id: number, userId: number) {
    const liability = await this.prisma.liability.findFirst({ where: { id, userId } });
    if (!liability) return null;
    return this.prisma.liability.delete({ where: { id } });
  }

  // Summary
  async getSummary(userId: number) {
    const [assets, liabilities] = await Promise.all([
      this.prisma.asset.findMany({ where: { userId }, orderBy: { category: 'asc' } }),
      this.prisma.liability.findMany({ where: { userId }, orderBy: { category: 'asc' } }),
    ]);

    const totalAssets = assets.reduce((s, a) => s + Number(a.value), 0);
    const totalLiabilities = liabilities.reduce((s, l) => s + Number(l.amount), 0);

    return { totalAssets, totalLiabilities, netWorth: totalAssets - totalLiabilities, assets, liabilities };
  }
}
