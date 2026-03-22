import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { Public } from './auth.guard';
import { Response } from 'express';
import { DecodedToken } from './auth.types';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('login')
  async signIn(
    @Body() signInDto: { email: string; password: string },
    @Res() res: Response,
  ) {
    const response = await this.authService.signIn({
      email: signInDto.email,
      password: signInDto.password,
    });

    const status =
      'message' in response ? HttpStatus.BAD_REQUEST : HttpStatus.OK;

    return res.status(status).json(response);
  }

  @Get('me')
  getProfile(@Req() req: { user: DecodedToken }, @Res() res: Response) {
    const user = {
      id: req.user.sub,
      email: req.user.username,
    };

    if (!user.id) {
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json({ message: 'Unauthorized' });
    }

    return res.status(HttpStatus.OK).json(user);
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('refresh')
  async refreshTokens(
    @Body() refreshTokenDto: { refreshToken: string },
    @Res() res: Response,
  ) {
    const response = await this.authService.refreshTokens(
      refreshTokenDto.refreshToken,
    );

    const status =
      'message' in response ? HttpStatus.UNAUTHORIZED : HttpStatus.OK;

    return res.status(status).json(response);
  }

  @Post('logout')
  async logout(
    @Body() refreshTokenDto: { refreshToken: string },
    @Res() res: Response,
  ) {
    const response = await this.authService.logout(
      refreshTokenDto.refreshToken,
    );
    if (response && 'message' in response) {
      return res.status(HttpStatus.BAD_REQUEST).json(response);
    }

    return res
      .status(HttpStatus.OK)
      .json({ message: 'Logged out successfully' });
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('forgot-password')
  async forgotPassword(
    @Body() body: ForgotPasswordDto,
    @Res() res: Response,
  ) {
    await this.authService.forgotPassword(body.email);
    return res
      .status(HttpStatus.OK)
      .json({ message: 'If that email is registered, a reset link has been sent' });
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('reset-password')
  async resetPassword(
    @Body() body: ResetPasswordDto,
    @Res() res: Response,
  ) {
    const result = await this.authService.resetPassword(body.token, body.newPassword);
    if (result && 'message' in result) {
      return res.status(HttpStatus.BAD_REQUEST).json(result);
    }
    return res.status(HttpStatus.OK).json({ message: 'Password updated successfully' });
  }
}
