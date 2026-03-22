import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '../services/prisma.service';
import { UserService } from '../users/user.service';
import { MailService } from '../mail/mail.service';
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
    private mailService: MailService,
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

  async forgotPassword(email: string): Promise<void> {
    const user = await this.userService.getByEmail(email);
    if (!user) return; // Never reveal if email exists

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await this.prisma.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt,
      },
    });

    await this.mailService.sendPasswordReset(user.email, token);
  }

  async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<{ message: string } | void> {
    const resetToken = await this.prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken || resetToken.used || resetToken.expiresAt < new Date()) {
      return { message: 'Invalid or expired token' };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: resetToken.userId },
        data: { password: hashedPassword },
      }),
      this.prisma.passwordResetToken.update({
        where: { token },
        data: { used: true },
      }),
      this.prisma.refreshToken.updateMany({
        where: { userId: resetToken.userId },
        data: { revoked: true },
      }),
    ]);
  }
}
