import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './auth.guard';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @Public()
  @Post('login')
  async signIn(@Body() signInDto: { email: string; pass: string }, @Res() res: Response) {
    const response = await this.authService.signIn({ email: signInDto.email, pass: signInDto.pass });

    const status = 'message' in response ? HttpStatus.UNAUTHORIZED : HttpStatus.OK;

    return res.status(status).json(response);
  }
}
