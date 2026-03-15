import { Injectable } from '@nestjs/common';
import { Prisma, Supplier } from '@prisma/client';
import { PrismaService } from '../services/prisma.service';

@Injectable()
export class SupplierService {
  constructor(private prisma: PrismaService) {}

  async create(
    userId: number,
    data: Prisma.SupplierUncheckedCreateInput,
  ): Promise<Supplier> {
    try {
      return await this.prisma.supplier.create({
        data: { ...data, userId },
      });
    } catch {
      return null;
    }
  }

  async update(
    id: number,
    data: Prisma.SupplierUpdateInput,
    userId: number,
  ): Promise<Supplier> {
    try {
      const existing = await this.prisma.supplier.findFirst({
        where: { id, userId },
        select: { id: true },
      });
      if (!existing) return null;
      return await this.prisma.supplier.update({ where: { id }, data });
    } catch {
      return null;
    }
  }

  async get(id: number, userId: number): Promise<Supplier> {
    try {
      return await this.prisma.supplier.findFirst({ where: { id, userId } });
    } catch {
      return null;
    }
  }

  async getAll(userId: number): Promise<Supplier[]> {
    try {
      return await this.prisma.supplier.findMany({ where: { userId } });
    } catch {
      return [];
    }
  }

  async delete(id: number, userId: number): Promise<Supplier> {
    try {
      const existing = await this.prisma.supplier.findFirst({
        where: { id, userId },
        select: { id: true },
      });
      if (!existing) return null;
      return await this.prisma.supplier.delete({ where: { id } });
    } catch {
      return null;
    }
  }
}
