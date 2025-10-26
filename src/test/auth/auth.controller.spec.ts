import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../../auth/auth.controller';
import { AuthService } from '../../auth/auth.service';
import { UserService } from '../../users/user.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../services/prisma.service';
import { Response } from 'express';
import { HttpStatus } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;
  let mockResponse: Partial<Response>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [AuthService, UserService, JwtService, PrismaService],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as Partial<Response>;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('signIn', () => {
    it('should signIn on valid user', async () => {
      const result = {
        accessToken: 'token',
        refreshToken: 'token',
      };

      jest.spyOn(authService, 'signIn').mockImplementation(async () => result);

      await controller.signIn(
        { email: 'test@test.com', password: 'password' },
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith(result);
    });

    it('should return UNAUTHORIZED on invalid user', async () => {
      const result = {
        message: 'Unauthorized',
      };

      jest.spyOn(authService, 'signIn').mockImplementation(async () => result);

      await controller.signIn(
        { email: 'invalid@test.com', password: 'wrongpassword' },
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith(result);
    });
  });

  describe('getProfile', () => {
    it('should return user profile on getProfile', () => {
      const mockUser = {
        sub: '123',
        username: 'test@test.com',
      };
      const req = { user: mockUser };

      const result = controller.getProfile(
        req as any,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({
        id: '123',
        email: 'test@test.com',
      });
    });

    it('should return UNAUTHORIZED if user id is missing', () => {
      const mockUser = {
        sub: null,
        username: 'test@test.com',
      };
      const req = { user: mockUser };

      controller.getProfile(req as any, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Unauthorized',
      });
    });
  });

  describe('refreshTokens', () => {
    it('should refresh tokens on valid refresh token', async () => {
      const result = {
        accessToken: 'newAccessToken',
        refreshToken: 'newRefreshToken',
        user: { id: 1, email: 'test@test.com' },
      };

      jest
        .spyOn(authService, 'refreshTokens')
        .mockImplementation(async () => result);

      await controller.refreshTokens(
        { refreshToken: 'valid-refresh-token' },
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith(result);
    });

    it('should return INVALID refresh token message on invalid token', async () => {
      const result = {
        message: 'Invalid refresh token',
      };

      jest
        .spyOn(authService, 'refreshTokens')
        .mockImplementation(async () => result);

      await controller.refreshTokens(
        { refreshToken: 'invalid-refresh-token' },
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
      expect(mockResponse.json).toHaveBeenCalledWith(result);
    });
  });
});
