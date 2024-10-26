import { Injectable } from "@nestjs/common";
import { Prisma, User } from "@prisma/client";
import { PrismaService } from "src/services/prisma.service";

@Injectable()
export class UserService {
	constructor(private prisma: PrismaService) { }


	async createUser(
		data: Prisma.UserCreateInput
	): Promise<User | null> {
		return this.prisma.user.create({
			data: {
				...data,
				enabled: true,
				updatedAt: new Date()
			}
		});
	}

	async get(
		id: number
	): Promise<User | null> {
		const numericId = Number(id);
		return this.prisma.user.findUnique({
			where: {
				id: numericId
			}
		});
	}

	async update(
		id: number,
		data: Prisma.UserUpdateInput
	): Promise<User | null> {
		const numericId = Number(id);
		return this.prisma.user.update({
			where: {
				id: numericId
			},
			data
		});
	}
}