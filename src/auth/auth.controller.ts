import { Body, Controller, HttpCode, HttpStatus, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './auth.guard';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @Public()
  @Post('login')
  async signIn(@Body() signInDto: { email: string; pass: string }, @Res() res: Response) {
    const response = await this.authService.signIn(signInDto.email, signInDto.pass);

    const status = response ? HttpStatus.OK : HttpStatus.UNAUTHORIZED;

    return res.status(status).json(response);
  }
}
