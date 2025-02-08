import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) { }

  async signIn(
    email: string,
    pass: string,
  ): Promise<{ access_token: string } | { message: string }> {
    const user = await this.userService.getByEmail(email);

    if (!user || user.password !== pass) {
      return { message: 'Unauthorized' };
    }

    const payload = { sub: user.id, username: user.email };

    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
