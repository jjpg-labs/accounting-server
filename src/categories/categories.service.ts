import { Injectable } from '@nestjs/common';
import { PrismaService } from '../services/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, data: Prisma.CategoryUncheckedCreateInput) {
    try {
      const book = await this.prisma.accountingBook.findFirst({
        where: { id: data.accountingBookId as number, userId },
        select: { id: true },
      });
      if (!book) return null;
      return await this.prisma.category.create({ data });
    } catch {
      return null;
    }
  }

  async findAll(accountingBookId: number, userId: number) {
    try {
      return await this.prisma.category.findMany({
        where: { accountingBookId, accountingBook: { userId } },
      });
    } catch {
      return [];
    }
  }

  async findOne(id: number, userId: number) {
    try {
      return await this.prisma.category.findFirst({
        where: { id, accountingBook: { userId } },
      });
    } catch {
      return null;
    }
  }

  async update(
    id: number,
    data: Prisma.CategoryUncheckedUpdateInput,
    userId: number,
  ) {
    try {
      const existing = await this.prisma.category.findFirst({
        where: { id, accountingBook: { userId } },
        select: { id: true },
      });
      if (!existing) return null;
      return await this.prisma.category.update({ where: { id }, data });
    } catch {
      return null;
    }
  }

  async remove(id: number, userId: number) {
    try {
      const existing = await this.prisma.category.findFirst({
        where: { id, accountingBook: { userId } },
        select: { id: true },
      });
      if (!existing) return null;
      return await this.prisma.category.delete({ where: { id } });
    } catch {
      return null;
    }
  }
}
