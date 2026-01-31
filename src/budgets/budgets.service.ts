import { Injectable } from '@nestjs/common';
import { PrismaService } from '../services/prisma.service';
import { CreateBudgetDto } from './dto/create-budget.dto';

@Injectable()
export class BudgetsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, createBudgetDto: CreateBudgetDto) {
    return this.prisma.budget.create({
      data: {
        ...createBudgetDto,
        userId,
      },
    });
  }

  async findAll(userId: number) {
    return this.prisma.budget.findMany({
      where: { userId },
      include: { category: true },
    });
  }

  async findOne(id: number, userId: number) {
    return this.prisma.budget.findFirst({
      where: { id, userId },
      include: { category: true },
    });
  }

  async remove(id: number, userId: number) {
    return this.prisma.budget.deleteMany({
      where: { id, userId },
    });
  }
}
