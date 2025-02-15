import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from '../services/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) { }

  async createUser(data: Prisma.UserCreateInput): Promise<User | null> {
    try {
      return await this.prisma.user.create({
        data: {
          ...data,
          enabled: true,
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      return null;
    }
  }

  async get(id: number): Promise<User | null> {
    try {
      return await this.prisma.user.findUnique({
        where: {
          id,
        },
      });
    } catch (error) {
      return null;
    }
  }

  async getByEmail(email: string): Promise<User | null> {
    try {
      return await this.prisma.user.findUnique({
        where: {
          email,
        },
      });
    } catch (error) {
      return null;
    }
  }

  async getAll(): Promise<User[]> {
    try {
      return await this.prisma.user.findMany();
    } catch (error) {
      return [];
    }
  }

  async update(id: number, data: Prisma.UserUpdateInput): Promise<User | null> {
    try {
      return await this.prisma.user.update({
        where: {
          id,
        },
        data,
      });
    } catch (error) {
      return null;
    }
  }

  async delete(id: number): Promise<User | null> {
    try {
      return await this.prisma.user.delete({
        where: {
          id,
        }
      });
    } catch (error) {
      return null;
    }
  }
}
