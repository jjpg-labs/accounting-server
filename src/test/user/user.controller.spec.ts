import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from '../../user/user.controller';
import { UserService } from '../../user/user.service';
import { Prisma, User } from '@prisma/client';
import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';

describe('UserController', () => {
	const testUser = { id: 1, email: 'test@example.com', name: 'Test User', password: 'password' };
	const testUser2 = { id: 2, email: 'test2@example.com', name: 'Test User 2', password: 'password' };
	const testUserUpdate = { id: 1, email: 'test@example.com', name: 'Test User', password: 'password' };
	const testUsers = [testUser, testUser2];

	let app: INestApplication;
	let userService = {
		createUser: jest.fn().mockImplementation((data: Prisma.UserCreateInput) => Promise.resolve({ id: 1, ...data })),
		get: jest.fn().mockImplementation((id: number) => Promise.resolve({ id, email: 'test@example.com' })),
		getByEmail: jest.fn().mockImplementation((email: string) => Promise.resolve({ id: 1, email })),
		update: jest.fn().mockImplementation((id: number, data: Prisma.UserUpdateInput) => Promise.resolve({ id, ...data })),
		getAll: jest.fn().mockImplementation(() => Promise.resolve([testUser])),
	};
	let controller: UserController;

	beforeAll(async () => {
		const moduleRef: TestingModule = await Test.createTestingModule({
			controllers: [UserController],
			providers: [
				{
					provide: UserService,
					useValue: userService,
				},
			],
		}).compile();

		app = moduleRef.createNestApplication();
		await app.init();
		controller = moduleRef.get<UserController>(UserController);
	});

	it('/POST user', async () => {
		const userData: Prisma.UserCreateInput = { email: 'test@example.com', name: 'Test User', password: 'password' };

		jest.spyOn(userService, 'createUser').mockImplementation(async () => testUser);

		expect(await controller.createUser(userData)).toBe(testUser);
	});

	it('/GET user by id', async () => {
		jest.spyOn(userService, 'get').mockImplementation(async () => testUser);

		expect(await controller.getUser(1)).toBe(testUser);
	});

	it('/GET user by email', async () => {
		jest.spyOn(userService, 'getByEmail').mockImplementation(async () => testUser);

		expect(await controller.getUser(null, 'test@example.com')).toBe(testUser);
	});

	it('/PUT user', async () => {
		const updateData: Prisma.UserUpdateInput = { name: 'Updated User' };

		jest.spyOn(userService, 'update').mockImplementation(async () => testUserUpdate);

		expect(await controller.updateUser(1, updateData)).toBe(testUserUpdate);
	});

	it('/GET users', async () => {
		jest.spyOn(userService, 'getAll').mockImplementation(async () => testUsers);

		expect(await controller.getUsers()).toBe(testUsers);
	});

	afterAll(async () => {
		await app.close();
	});
});