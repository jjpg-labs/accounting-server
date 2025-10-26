import { Injectable } from '@nestjs/common';
import { PrismaService } from '../services/prisma.service';
import { Prisma, Supplier } from '@prisma/client';

@Injectable()
export class SupplierService {
  constructor(private prisma: PrismaService) { }

  async create(data: Prisma.SupplierCreateInput): Promise<Supplier> {
    try {
      return await this.prisma.supplier.create({
        data,
      });
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
      return null;
    }
  }

  async getAll(userId: number): Promise<Supplier[]> {
    try {
      return await this.prisma.supplier.findMany({
        where: { userId },
      });
    } catch (error) {
      return [];
    }
  }

  async delete(id: number): Promise<Supplier> {
    try {
      return await this.prisma.supplier.delete({
        where: { id },
      });
    } catch (error) {
      return null;
    }
  }
}
