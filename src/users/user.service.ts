import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../services/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async createUser(data: CreateUserDto): Promise<User | null> {
    try {
      const hashedPassword = await bcrypt.hash(data.password, 10);
      return await this.prisma.user.create({
        data: {
          name: data.name,
          email: data.email,
          password: hashedPassword,
          enabled: true,
          isAdmin: false,
          updatedAt: new Date(),
        },
      });
    } catch {
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
    } catch {
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
    } catch {
      return null;
    }
  }

  async getAll(): Promise<User[]> {
    try {
      return await this.prisma.user.findMany();
    } catch {
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
    } catch {
      return null;
    }
  }

  async delete(id: number): Promise<User | null> {
    try {
      return await this.prisma.user.delete({
        where: {
          id,
        },
      });
    } catch {
      return null;
    }
  }
}
