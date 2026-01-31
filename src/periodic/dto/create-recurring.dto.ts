import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Frequency, TransactionType, PaymentMethod } from '@prisma/client';

export class CreateRecurringDto {
  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  amount: number;

  @IsEnum(TransactionType)
  type: TransactionType;

  @IsEnum(Frequency)
  frequency: Frequency;

  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @IsDateString()
  startDate: string;

  @IsNumber()
  accountingBookId: number;

  @IsOptional()
  @IsNumber()
  categoryId?: number;
}
