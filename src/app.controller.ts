import { Body, Controller, Get, HttpStatus, Post, Res, SetMetadata } from '@nestjs/common';
import { AppService } from './app.service';
import { MailService } from './mail/mail.service';
import { Response } from 'express';
import { Public } from './auth/auth.guard';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

class ContactDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(10)
  message: string;
}

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly mailService: MailService,
  ) {}

  @Get()
  @SetMetadata('isPublic', true)
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  @SetMetadata('isPublic', true)
  getHealth(): { status: string; timestamp: string } {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  @Public()
  @Post('contact')
  async contact(@Body() body: ContactDto, @Res() res: Response) {
    try {
      await this.mailService.sendContactMessage(body.name, body.email, body.message);
      return res.status(HttpStatus.OK).json({ success: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: message });
    }
  }
}
