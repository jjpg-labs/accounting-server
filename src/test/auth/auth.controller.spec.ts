import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../../auth/auth.controller';
import { AuthService } from '../../auth/auth.service';
import { UserService } from '../../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../services/prisma.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [AuthService, UserService, JwtService, PrismaService],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should signIn on valid user', async () => {
    const result = {
      access_token: 'token',
    };

    jest.spyOn(authService, 'signIn').mockImplementation(async () => result);

    expect(
      await controller.signIn({ email: 'test@test.com', pass: 'password' }),
    ).toBe(result);
  });
});
