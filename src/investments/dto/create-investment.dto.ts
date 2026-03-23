import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateInvestmentDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  ticker: string;

  @IsString()
  @IsNotEmpty()
  shares: string;

  @IsString()
  @IsNotEmpty()
  currentPrice: string;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
