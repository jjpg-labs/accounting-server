import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../services/prisma.service';
import { CreateSavingsGoalDto } from './dto/create-savings-goal.dto';

@Injectable()
export class SavingsGoalsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, dto: CreateSavingsGoalDto) {
    return this.prisma.savingsGoal.create({
      data: {
        userId,
        name: dto.name,
        targetAmount: new Prisma.Decimal(dto.targetAmount),
        deadline: dto.deadline ? new Date(dto.deadline) : null,
        notes: dto.notes,
      },
    });
  }

  async findAll(userId: number) {
    return this.prisma.savingsGoal.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number, userId: number) {
    return this.prisma.savingsGoal.findFirst({ where: { id, userId } });
  }

  async update(id: number, userId: number, dto: Partial<CreateSavingsGoalDto>) {
    const goal = await this.prisma.savingsGoal.findFirst({ where: { id, userId } });
    if (!goal) return null;
    return this.prisma.savingsGoal.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.targetAmount && { targetAmount: new Prisma.Decimal(dto.targetAmount) }),
        ...(dto.deadline !== undefined && { deadline: dto.deadline ? new Date(dto.deadline) : null }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
      },
    });
  }

  async contribute(id: number, userId: number, amount: string) {
    const goal = await this.prisma.savingsGoal.findFirst({ where: { id, userId } });
    if (!goal) return null;

    const newAmount = goal.currentAmount.add(new Prisma.Decimal(amount));
    const completed = newAmount.gte(goal.targetAmount);

    return this.prisma.savingsGoal.update({
      where: { id },
      data: {
        currentAmount: newAmount,
        completed,
      },
    });
  }

  async remove(id: number, userId: number) {
    const goal = await this.prisma.savingsGoal.findFirst({ where: { id, userId } });
    if (!goal) return null;
    return this.prisma.savingsGoal.delete({ where: { id } });
  }
}
