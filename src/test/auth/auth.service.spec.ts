import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../../auth/auth.service';
import { UserService } from '../../users/user.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../services/prisma.service';
import { MailService } from '../../mail/mail.service';
import { SignInParams } from 'src/auth/auth.types';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let userService: UserService;
  let jwtService: JwtService;
  let prismaService: PrismaService;
  const signInParams: SignInParams = {
    email: 'test@test.com',
    password: 'password',
  };

  beforeEach(async () => {
    const mockMailService = { sendPasswordReset: jest.fn() };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        UserService,
        JwtService,
        PrismaService,
        { provide: MailService, useValue: mockMailService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signIn', () => {
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
      jest
        .spyOn(userService, 'getByEmail')
        .mockImplementation(async () => user);
      jest
        .spyOn(jwtService, 'signAsync')
        .mockImplementation(async () => 'token');
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      jest.spyOn(prismaService.refreshToken, 'create').mockResolvedValue(null);

      const result = await service.signIn(signInParams);
      expect(result).toBeDefined();
      expect(result).toEqual({
        accessToken: 'token',
        refreshToken: 'token',
        user: { id, email: signInParams.email },
      });
    });

    it('should return unauthorized message if user not found', async () => {
      jest
        .spyOn(userService, 'getByEmail')
        .mockImplementation(async () => null);
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
      jest
        .spyOn(userService, 'getByEmail')
        .mockImplementation(async () => user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      const result = await service.signIn(signInParams);

      expect(result).toEqual({ message: 'Unauthorized' });
    });
  });

  describe('refreshTokens', () => {
    it('should refresh tokens on valid refresh token', async () => {
      const decodedToken = {
        sub: 1,
        username: 'test@test.com',
      };
      jest.spyOn(jwtService, 'verify').mockImplementation(() => decodedToken);
      jest
        .spyOn(jwtService, 'signAsync')
        .mockImplementation(async () => 'token');

      jest.spyOn(prismaService.refreshToken, 'update').mockResolvedValue(null);
      jest.spyOn(prismaService.refreshToken, 'create').mockResolvedValue(null);

      const result = await service.refreshTokens('valid-refresh-token');
      expect(result).toEqual({
        accessToken: 'token',
        refreshToken: 'token',
        user: { id: 1, email: 'test@test.com' },
      });
    });

    it('should return invalid refresh token message on invalid token', async () => {
      jest.spyOn(jwtService, 'verify').mockImplementation(() => {
        throw new Error('Invalid token');
      });
      const result = await service.refreshTokens('invalid-refresh-token');
      expect(result).toEqual({ message: 'Invalid refresh token' });
    });
  });

  describe('logout', () => {
    it('should logout successfully on valid refresh token', async () => {
      jest.spyOn(prismaService.refreshToken, 'update').mockResolvedValue(null);
      const result = await service.logout('valid-refresh-token');
      expect(result).toBeUndefined();
    });

    it('should return invalid refresh token message on non-existing token', async () => {
      const error: any = new Error('Record to update not found.');
      error.code = 'P2025';
      jest.spyOn(prismaService.refreshToken, 'update').mockRejectedValue(error);
      const result = await service.logout('non-existing-refresh-token');
      expect(result).toBeUndefined();
    });

    it('should return invalid refresh token message on other errors', async () => {
      const error: any = new Error('Some other error');
      error.code = 'SOME_OTHER_CODE';
      jest.spyOn(prismaService.refreshToken, 'update').mockRejectedValue(error);
      const result = await service.logout('valid-refresh-token');
      expect(result).toEqual({ message: 'Invalid refresh token' });
    });
  });
});
