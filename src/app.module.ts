import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import configuration from '../config/configuration';
import { AuthModule } from './auth/auth.module';
import { AccountingBookModule } from './accountingBooks/accountingBook.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth/auth.guard';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { TransactionModule } from './transactions/transaction.module';
import { ScheduleModule } from '@nestjs/schedule';
import { BudgetsModule } from './budgets/budgets.module';
import { PeriodicModule } from './periodic/periodic.module';
import { CategoriesModule } from './categories/categories.module';
import { DailyReportsModule } from './dailyReports/dailyReports.module';
import { SupplierModule } from './suppliers/supplier.module';
import { UserModule } from './users/user.module';
import { MailModule } from './mail/mail.module';
import { SavingsGoalsModule } from './savings-goals/savings-goals.module';
import { NetWorthModule } from './net-worth/net-worth.module';
import { InvestmentsModule } from './investments/investments.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
    }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    AuthModule,
    AccountingBookModule,
    TransactionModule,
    ScheduleModule.forRoot(),
    BudgetsModule,
    PeriodicModule,
    CategoriesModule,
    DailyReportsModule,
    SupplierModule,
    UserModule,
    MailModule,
    SavingsGoalsModule,
    NetWorthModule,
    InvestmentsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
