import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../app.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module';
import { AccountingBookModule } from '../accountingBooks/accountingBook.module';
import { AppController } from '../app.controller';
import { AppService } from '../app.service';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from '../auth/auth.guard';

describe('AppModule', () => {
  let app: TestingModule;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          load: [() => ({})], // Mock configuration
        }),
        AppModule,
        AuthModule,
        AccountingBookModule,
      ],
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: APP_GUARD,
          useClass: AuthGuard,
        },
      ],
    }).compile();
  });

  it('should compile the module', () => {
    const appModule = app.get<AppModule>(AppModule);
    expect(appModule).toBeDefined();
  });

  it('should have AppController', () => {
    const appController = app.get<AppController>(AppController);
    expect(appController).toBeDefined();
  });

  it('should have AppService', () => {
    const appService = app.get<AppService>(AppService);
    expect(appService).toBeDefined();
  });
});
