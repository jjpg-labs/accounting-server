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
  getProfile(@Req() req: { user: DecodedToken }) {
    return {
      id: req.user.sub,
      email: req.user.username,
    };
  }
}
