import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { LiabilityCategory } from '@prisma/client';

export class CreateLiabilityDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  amount: string;

  @IsEnum(LiabilityCategory)
  category: LiabilityCategory;

  @IsString()
  @IsOptional()
  notes?: string;
}
