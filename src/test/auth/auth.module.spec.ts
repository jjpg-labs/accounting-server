import { Test, TestingModule } from '@nestjs/testing';
import { AuthModule } from '../../auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from '../../auth/constants';
import { AuthController } from '../../auth/auth.controller';
import { AuthService } from '../../auth/auth.service';
import { UserService } from '../../users/user.service';
import { PrismaService } from '../../services/prisma.service';

describe('AuthModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        AuthModule,
        JwtModule.register({
          secret: jwtConstants.secret,
          signOptions: { expiresIn: '60s' },
        }),
      ],
      controllers: [AuthController],
      providers: [AuthService, UserService, PrismaService],
    }).compile();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });
});
