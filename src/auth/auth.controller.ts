import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './auth.guard';

@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService) { }

	@Public()
	@HttpCode(200)
	@Post('login')
	async signIn(@Body() signInDto: { email: string; pass: string }) {
		return await this.authService.signIn(signInDto.email, signInDto.pass);
	}
}
