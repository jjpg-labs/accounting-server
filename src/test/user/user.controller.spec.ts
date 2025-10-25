import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from '../../user/user.controller';
import { UserService } from '../../user/user.service';
import { Prisma, User } from '@prisma/client';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Response } from 'express';

let logSpy: jest.SpyInstance;
let errorSpy: jest.SpyInstance;
let warnSpy: jest.SpyInstance;

describe('UserController', () => {
  const testUser = {
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
    password: 'password',
  };
  const testUser2 = {
    id: 2,
    email: 'test2@example.com',
    name: 'Test User 2',
    password: 'password',
  };
  const testUserUpdate = {
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
    password: 'password',
  };
  const testUsers = [testUser, testUser2];

  let app: INestApplication;
  let userService = {
    createUser: jest
      .fn()
      .mockImplementation((data: Prisma.UserCreateInput) =>
        Promise.resolve({ id: 1, ...data }),
      ),
    get: jest
      .fn()
      .mockImplementation((id: number) =>
        Promise.resolve({ id, email: 'test@example.com' }),
      ),
    getByEmail: jest
      .fn()
      .mockImplementation((email: string) => Promise.resolve({ id: 1, email })),
    update: jest
      .fn()
      .mockImplementation((id: number, data: Prisma.UserUpdateInput) =>
        Promise.resolve({ id, ...data }),
      ),
    getAll: jest.fn().mockImplementation(() => Promise.resolve([testUser])),
    delete: jest.fn().mockImplementation(() => Promise.resolve(testUser)),
  };
  let controller: UserController;
  let mockResponse: Partial<Response>;

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
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as Partial<Response>;
  });

  beforeEach(() => {
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
    errorSpy.mockRestore();
    warnSpy.mockRestore();
  });

  describe('User creation', () => {
    const userData: Prisma.UserCreateInput = {
      email: 'test@example.com',
      name: 'Test User',
      password: 'password',
    };

    it('should create an user', async () => {
      jest
        .spyOn(userService, 'createUser')
        .mockImplementation(async () => testUser);
      await controller.createUser(userData, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CREATED);
      expect(mockResponse.json).toHaveBeenCalledWith(testUser);
    });

    it('should return a bad request status', async () => {
      jest
        .spyOn(userService, 'createUser')
        .mockImplementation(async () => null);
      await controller.createUser(userData, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Could not create user',
      });
    });

    it('should return an unknown error status', async () => {
      jest.spyOn(userService, 'createUser').mockImplementation(async () => {
        throw new Error();
      });
      await controller.createUser(userData, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Unknown error',
      });
    });
  });

  describe('Retrieve user', () => {
    it('should retrieve an user by id', async () => {
      jest.spyOn(userService, 'get').mockImplementation(async () => testUser);
      await controller.getUser(mockResponse as Response, 1);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith(testUser);
    });

    it('should retrieve an user by email', async () => {
      jest
        .spyOn(userService, 'getByEmail')
        .mockImplementation(async () => testUser);
      await controller.getUser(
        mockResponse as Response,
        null,
        'test@example.com',
      );

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith(testUser);
    });

    it('should return a no content status if user not found by email', async () => {
      jest
        .spyOn(userService, 'getByEmail')
        .mockImplementation(async () => null);
      await controller.getUser(
        mockResponse as Response,
        null,
        'tet@example.com',
      );

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NO_CONTENT);
      expect(mockResponse.json).toHaveBeenCalledWith(null);
    });

    it('should return a bad response status if not id and email', async () => {
      await controller.getUser(mockResponse as Response, null, null);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Invalid user ID or email',
      });
    });

    it('should return a no content status', async () => {
      jest.spyOn(userService, 'get').mockImplementation(async () => null);
      await controller.getUser(mockResponse as Response, 1);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NO_CONTENT);
      expect(mockResponse.json).toHaveBeenCalledWith(null);
    });

    it('should return an unknown error status', async () => {
      jest.spyOn(userService, 'get').mockImplementation(async () => {
        throw new Error();
      });
      await controller.getUser(mockResponse as Response, 1);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Unknown error',
      });
    });

    it('should retrieve all users', async () => {
      jest
        .spyOn(userService, 'getAll')
        .mockImplementation(async () => testUsers);
      await controller.getUsers(mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith(testUsers);
    });

    it('should return an unknown error status', async () => {
      jest.spyOn(userService, 'getAll').mockImplementation(async () => {
        throw new Error();
      });
      await controller.getUsers(mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Unknown error',
      });
    });

    it('should return a no content status', async () => {
      jest.spyOn(userService, 'getAll').mockImplementation(async () => []);
      await controller.getUsers(mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NO_CONTENT);
      expect(mockResponse.json).toHaveBeenCalledWith([]);
    });
  });

  describe('Update user', () => {
    const updateData: Prisma.UserUpdateInput = { name: 'Updated User' };

    it('should update an user', async () => {
      jest
        .spyOn(userService, 'update')
        .mockImplementation(async () => testUserUpdate);
      await controller.updateUser(updateData, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith(testUserUpdate);
    });

    it('should return a bad request status', async () => {
      jest.spyOn(userService, 'update').mockImplementation(async () => null);
      await controller.updateUser(updateData, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Could not update user',
      });
    });

    it('should return an unknown error status', async () => {
      jest.spyOn(userService, 'update').mockImplementation(async () => {
        throw new Error();
      });
      await controller.updateUser(updateData, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Unknown error',
      });
    });
  });

  describe('Delete user', () => {
    it('should delete an user', async () => {
      jest
        .spyOn(userService, 'delete')
        .mockImplementation(async () => testUser);
      await controller.deleteUser(1, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith(testUser);
    });

    it('should return a bad response status if id is not a number', async () => {
      await controller.deleteUser(null, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Invalid user ID',
      });
    });

    it('should return a bad request status', async () => {
      jest.spyOn(userService, 'delete').mockImplementation(async () => null);
      await controller.deleteUser(1, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Could not delete user',
      });
    });

    it('should return an unknown error status', async () => {
      jest.spyOn(userService, 'delete').mockImplementation(async () => {
        throw new Error();
      });
      await controller.deleteUser(1, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Unknown error',
      });
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
