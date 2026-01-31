import { Injectable } from '@nestjs/common';
import { Prisma, Supplier } from '@prisma/client';
import { PrismaService } from '../services/prisma.service';

@Injectable()
export class SupplierService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.SupplierCreateInput): Promise<Supplier> {
    try {
      return await this.prisma.supplier.create({
        data,
      });
    } catch {
      return null;
    }
  }

  async update(
    id: number,
    data: Prisma.SupplierUpdateInput,
  ): Promise<Supplier> {
    try {
      return await this.prisma.supplier.update({
        where: {
          id,
        },
        data,
      });
    } catch {
      return null;
    }
  }

  async get(id: number): Promise<Supplier> {
    try {
      return await this.prisma.supplier.findUnique({
        where: {
          id,
        },
      });
    } catch {
      return null;
    }
  }

  async getAll(userId: number): Promise<Supplier[]> {
    try {
      return await this.prisma.supplier.findMany({
        where: { userId },
      });
    } catch {
      return [];
    }
  }

  async delete(id: number): Promise<Supplier> {
    try {
      return await this.prisma.supplier.delete({
        where: { id },
      });
    } catch {
      return null;
    }
  }
}
