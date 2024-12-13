import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../../auth/auth.service';
import { UserService } from '../../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../services/prisma.service';

describe('AuthService', () => {
  let service: AuthService;
  let userService: UserService;
  let jwtService: JwtService;

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
    const password = 'password';
    const name = 'test';
    const id = 1;
    const email = 'test@test.com';
    const createdAt = new Date();
    const updatedAt = new Date();
    const enabled = true;
    const isAdmin = false;
    const user = { password, name, id, email, createdAt, updatedAt, enabled, isAdmin };
    jest.spyOn(userService, 'getByEmail').mockImplementation(async () => user);
    jest.spyOn(jwtService, 'signAsync').mockImplementation(async () => 'token');
    const result = await service.signIn(email, password);
    expect(result).toBeDefined();
    expect(result).toEqual({ access_token: 'token' });
  });

  it('should return null if user not found', async () => {
    jest.spyOn(userService, 'getByEmail').mockImplementation(async () => null);
    const result = await service.signIn('test@test.com', 'password');
    expect(result).toBeNull();
  });

  it('should return null if password is incorrect', async () => {
    const user = { password: 'wrongpassword', name: 'test', id: 1, email: 'test@test.com', createdAt: new Date(), updatedAt: new Date(), enabled: true, isAdmin: false };
    jest.spyOn(userService, 'getByEmail').mockImplementation(async () => user);
    const result = await service.signIn('test@test.com', 'password');
    expect(result).toBeNull();
  });
});
