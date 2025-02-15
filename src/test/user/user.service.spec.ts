import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../services/prisma.service';
import { UserService } from '../../user/user.service';
import { Prisma, User } from '@prisma/client';

describe('UserService', () => {
  let service: UserService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService, PrismaService],
    }).compile();

    service = module.get<UserService>(UserService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getByEmail', () => {
    it('should return a user if found', async () => {
      const email = 'test@example.com';
      const user: User = {
        id: 1,
        name: 'Test',
        email,
        password: 'password',
        enabled: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        isAdmin: false,
      };

      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(user);

      expect(await service.getByEmail(email)).toEqual(user);
    });

    it('should return null if no user is found', async () => {
      const email = 'notfound@example.com';

      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

      expect(await service.getByEmail(email)).toBeNull();
    });

    it('should return null if an error occured', async () => {
      const email = 'error@example.com';

      jest.spyOn(prismaService.user, 'findUnique').mockRejectedValue(new Error());

      expect(await service.getByEmail(email)).toBeNull();
    })
  });

  describe('createUser', () => {
    it('should create and return a user', async () => {
      const data: Prisma.UserCreateInput = {
        name: 'Test',
        email: 'test@example.com',
        password: 'password',
      };
      const user: User = {
        id: 1,
        name: 'Test',
        email: 'test@example.com',
        password: 'password',
        enabled: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        isAdmin: false,
      };

      jest.spyOn(prismaService.user, 'create').mockResolvedValue(user);

      expect(await service.createUser(data)).toEqual(user);
    });

    it('should return null if user creation fails', async () => {
      const data: Prisma.UserCreateInput = {
        name: 'Test',
        email: 'test@example.com',
        password: 'password',
      };

      jest.spyOn(prismaService.user, 'create').mockResolvedValue(null);

      expect(await service.createUser(data)).toBeNull();
    });

    it('should return null if an error occurs', async () => {
      const data: Prisma.UserCreateInput = {
        name: 'Test',
        email: 'error@example.com',
        password: 'password',
      };

      jest.spyOn(prismaService.user, 'create').mockRejectedValue(new Error());

      expect(await service.createUser(data)).toBeNull();
    });
  });

  describe('get', () => {
    it('should return a user if found', async () => {
      const id = 1;
      const user: User = {
        id,
        name: 'Test',
        email: 'test@example.com',
        password: 'password',
        enabled: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        isAdmin: false,
      };

      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(user);

      expect(await service.get(id)).toEqual(user);
    });

    it('should return null if no user is found', async () => {
      const id = 2;

      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

      expect(await service.get(id)).toBeNull();
    });

    it('should return null if an error occurs', async () => {
      const id = 3;

      jest.spyOn(prismaService.user, 'findUnique').mockRejectedValue(new Error());

      expect(await service.get(id)).toBeNull();
    });
  });

  describe('getAll', () => {
    it('should return an array of users', async () => {
      const users: User[] = [
        {
          id: 1,
          name: 'Test1',
          email: 'test1@example.com',
          password: 'password',
          enabled: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          isAdmin: false,
        },
        {
          id: 2,
          name: 'Test2',
          email: 'test2@example.com',
          password: 'password',
          enabled: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          isAdmin: false,
        },
      ];

      jest.spyOn(prismaService.user, 'findMany').mockResolvedValue(users);

      expect(await service.getAll()).toEqual(users);
    });

    it('should return an empty array if no users are found', async () => {
      jest.spyOn(prismaService.user, 'findMany').mockResolvedValue([]);

      expect(await service.getAll()).toEqual([]);
    });

    it('should return an empty array if an error occurs', async () => {
      jest.spyOn(prismaService.user, 'findMany').mockRejectedValue(new Error());

      expect(await service.getAll()).toEqual([]);
    });
  });

  describe('update', () => {
    it('should update and return the user', async () => {
      const id = 1;
      const data: Prisma.UserUpdateInput = { name: 'Updated Test' };
      const user: User = {
        id,
        name: 'Updated Test',
        email: 'test@example.com',
        password: 'password',
        enabled: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        isAdmin: false,
      };

      jest.spyOn(prismaService.user, 'update').mockResolvedValue(user);

      expect(await service.update(id, data)).toEqual(user);
    });

    it('should return null if user update fails', async () => {
      const id = 1;
      const data: Prisma.UserUpdateInput = { name: 'Updated Test' };

      jest.spyOn(prismaService.user, 'update').mockResolvedValue(null);

      expect(await service.update(id, data)).toBeNull();
    });

    it('should return null if an error occurs', async () => {
      const id = 1;
      const data: Prisma.UserUpdateInput = { name: 'Updated Test' };

      jest.spyOn(prismaService.user, 'update').mockRejectedValue(new Error());

      expect(await service.update(id, data)).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete and return the user', async () => {
      const id = 1;
      const user: User = {
        id,
        name: 'Test',
        email: 'deleted@example.com',
        password: 'password',
        enabled: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        isAdmin: false,
      };

      jest.spyOn(prismaService.user, 'delete').mockResolvedValue(user);

      expect(await service.delete(id)).toEqual(user);
    });

    it('should return null if user deletion fails', async () => {
      const id = 1;

      jest.spyOn(prismaService.user, 'delete').mockResolvedValue(null);

      expect(await service.delete(id)).toBeNull();
    });

    it('should return null if an error occurs', async () => {
      const id = 1;

      jest.spyOn(prismaService.user, 'delete').mockRejectedValue(new Error());

      expect(await service.delete(id)).toBeNull();
    });
  });
});
