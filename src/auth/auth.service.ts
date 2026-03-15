import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../services/prisma.service';
import { UserService } from '../users/user.service';
import { SignInParams, SignInResponse } from './auth.types';

interface JwtPayload {
  sub: number;
  username: string;
}

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async signIn({ email, password }: SignInParams): Promise<SignInResponse> {
    const user = await this.userService.getByEmail(email);

    const passwordMatch = user && (await bcrypt.compare(password, user.password));
    if (!passwordMatch) {
      return { message: 'Unauthorized' };
    }

    const payload = { sub: user.id, username: user.email };
    const accessToken = await this.jwtService.signAsync(payload);
    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: '90d',
    });

    await this.prisma.refreshToken.create({
      data: {
        token: refreshToken,
        user: {
          connect: { id: user.id },
        },
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
      },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
      },
    };
  }

  async refreshTokens(refreshToken: string): Promise<SignInResponse> {
    try {
      const decoded = this.jwtService.verify<JwtPayload>(refreshToken);
      const payload = { sub: decoded.sub, username: decoded.username };

      await this.prisma.refreshToken.update({
        where: { token: refreshToken },
        data: { revoked: true },
      });

      const newAccessToken = await this.jwtService.signAsync(payload);
      const newRefreshToken = await this.jwtService.signAsync(payload, {
        expiresIn: '90d',
      });

      await this.prisma.refreshToken.create({
        data: {
          token: newRefreshToken,
          user: {
            connect: { id: decoded.sub },
          },
          expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
        },
      });

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        user: {
          id: decoded.sub,
          email: decoded.username,
        },
      };
    } catch {
      return { message: 'Invalid refresh token' };
    }
  }

  async logout(refreshToken: string): Promise<{ message: string } | void> {
    try {
      await this.prisma.refreshToken.update({
        where: { token: refreshToken },
        data: { revoked: true },
      });
    } catch (e) {
      if (e.code === 'P2025') {
        return;
      }

      return { message: 'Invalid refresh token' };
    }
  }
}
