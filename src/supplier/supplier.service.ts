import { Injectable } from '@nestjs/common';
import { PrismaService } from '../services/prisma.service';
import { Prisma, Supplier } from '@prisma/client';

@Injectable()
export class SupplierService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.SupplierCreateInput): Promise<Supplier> {
    return this.prisma.supplier.create({
      data,
    });
  }

  async update(
    id: number,
    data: Prisma.SupplierUpdateInput,
  ): Promise<Supplier> {
    return this.prisma.supplier.update({
      where: { id },
      data,
    });
  }

  async get(id: number): Promise<Supplier> {
    return this.prisma.supplier.findUnique({
      where: { id },
    });
  }

  async getAll(userId: number): Promise<Supplier[]> {
    return this.prisma.supplier.findMany({
      where: { userId },
    });
  }

  async delete(id: number): Promise<Supplier> {
    return this.prisma.supplier.delete({
      where: { id },
    });
  }
}
