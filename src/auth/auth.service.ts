import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { SignInParams, SignInResponse } from './auth.types';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async signIn({ email, password }: SignInParams): Promise<SignInResponse> {
    const user = await this.userService.getByEmail(email);

    if (!user || user.password !== password) {
      return { message: 'Unauthorized' };
    }

    const payload = { sub: user.id, username: user.email };

    return {
      accessToken: await this.jwtService.signAsync(payload),
      refreshToken: await this.jwtService.signAsync(payload, {
        expiresIn: '90d',
      }),
      user: {
        id: user.id,
        email: user.email,
      },
    };
  }

  async refreshTokens(refreshToken: string): Promise<SignInResponse> {
    try {
      const decoded = this.jwtService.verify(refreshToken);
      const payload = { sub: decoded.sub, username: decoded.username };

      return {
        accessToken: await this.jwtService.signAsync(payload),
        refreshToken: await this.jwtService.signAsync(payload, {
          expiresIn: '90d',
        }),
        user: {
          id: decoded.sub,
          email: decoded.username,
        },
      };
    } catch (e) {
      return { message: 'Invalid refresh token' };
    }
  }
}
