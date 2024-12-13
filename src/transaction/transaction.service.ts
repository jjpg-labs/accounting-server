import { Injectable } from '@nestjs/common';
import { Prisma, Transaction } from '@prisma/client';
import { PrismaService } from '../services/prisma.service';

@Injectable()
export class TransactionService {
	constructor(private prisma: PrismaService) { }

	async createTransaction(data: Prisma.TransactionCreateInput): Promise<Transaction | null> {
		return this.prisma.transaction.create({
			data,
		});
	}

	async update(
		id: number,
		data: Prisma.TransactionUpdateInput
	): Promise<Transaction | null> {
		return this.prisma.transaction.update({
			where: {
				id,
			},
			data,
		});
	}

	async get(id: number): Promise<Transaction | null> {
		return this.prisma.transaction.findUnique({
			where: {
				id,
			},
		});
	}

	async getAll(accountingBookId: number): Promise<Transaction[]> {
		return this.prisma.transaction.findMany({
			where: {
				accountingBookId: accountingBookId,
			},
		});
	}

	async delete(id: number): Promise<Transaction | null> {
		return this.prisma.transaction.delete({
			where: {
				id
			},
		});
	}
}
