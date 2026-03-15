import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './auth.guard';
import { Response } from 'express';
import { DecodedToken } from './auth.types';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
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
}
