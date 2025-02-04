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
  });
});
