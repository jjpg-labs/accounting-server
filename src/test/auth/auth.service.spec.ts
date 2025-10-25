import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../../auth/auth.service';
import { UserService } from '../../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../services/prisma.service';
import { SignInParams } from 'src/auth/auth.types';

describe('AuthService', () => {
  let service: AuthService;
  let userService: UserService;
  let jwtService: JwtService;
  const signInParams: SignInParams = {
    email: 'test@test.com',
    password: 'password',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService, UserService, JwtService, PrismaService],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should signIn on valid user', async () => {
    const name = 'test';
    const id = 1;
    const createdAt = new Date();
    const updatedAt = new Date();
    const enabled = true;
    const isAdmin = false;
    const user = {
      password: signInParams.password,
      name,
      id,
      email: signInParams.email,
      createdAt,
      updatedAt,
      enabled,
      isAdmin,
    };
    jest.spyOn(userService, 'getByEmail').mockImplementation(async () => user);
    jest.spyOn(jwtService, 'signAsync').mockImplementation(async () => 'token');
    const result = await service.signIn(signInParams);
    expect(result).toBeDefined();
    expect(result).toEqual({
      accessToken: 'token',
      refreshToken: 'token',
      user: { id, email: signInParams.email },
    });
  });

  it('should return unauthorized message if user not found', async () => {
    jest.spyOn(userService, 'getByEmail').mockImplementation(async () => null);
    const result = await service.signIn(signInParams);
    expect(result).toEqual({ message: 'Unauthorized' });
  });

  it('should return unauthorized message if password is incorrect', async () => {
    const user = {
      password: 'wrongpassword',
      name: 'test',
      id: 1,
      email: 'test@test.com',
      createdAt: new Date(),
      updatedAt: new Date(),
      enabled: true,
      isAdmin: false,
    };
    jest.spyOn(userService, 'getByEmail').mockImplementation(async () => user);
    const result = await service.signIn(signInParams);

    expect(result).toEqual({ message: 'Unauthorized' });
  });
});
