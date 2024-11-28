import { Body, Controller, Get, Post, Put, Query } from "@nestjs/common"
import { UserService } from "../services/user.service";
import { Prisma, User } from "@prisma/client";

@Controller('user')
export class UserController {
	constructor(
		private readonly userService: UserService
	) { }

	@Post()
	async createUser(
		@Body() data: Prisma.UserCreateInput
	): Promise<User | null> {
		return this.userService.createUser(data);
	}

	@Get()
	async getUser(
		@Query('id') id?: number,
		@Query('email') email?: string
	): Promise<User | null> {
		if (id) return this.userService.get(id);
		if (email) return this.userService.getByEmail(email);
	}

	@Put()
	async updateUser(
		@Query('id') id: number,
		@Body() data: Prisma.UserUpdateInput
	): Promise<User | null> {
		return this.userService.update(id, data);
	}
}