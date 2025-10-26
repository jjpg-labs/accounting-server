import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../../users/user.service';
import { PrismaService } from '../../services/prisma.service';
import { UserController } from '../../users/user.controller';
import { UserModule } from '../../users/user.module';

describe('UserModule', () => {
  let userService: UserService;
  let prismaService: PrismaService;
  let userController: UserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [UserModule],
    }).compile();

    userService = module.get<UserService>(UserService);
    prismaService = module.get<PrismaService>(PrismaService);
    userController = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
    expect(prismaService).toBeDefined();
    expect(userController).toBeDefined();
  });
});
