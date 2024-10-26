import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserController } from './user/controllers/user.controller';
import { ConfigModule } from '@nestjs/config';
import configuration from 'config/configuration';
import { UserService } from './user/services/user.service';
import { PrismaService } from './services/prisma.service';
import { AccountingBookService } from './accountingBook/services/accountingBook.service';
import { AccountingBookController } from './accountingBook/controllers/accountingBook.controller';

@Module({
  imports: [ConfigModule.forRoot({
    load: [configuration]
  })],
  controllers: [AppController, UserController, AccountingBookController],
  providers: [AppService, PrismaService, UserService, AccountingBookService],
})
export class AppModule { }
