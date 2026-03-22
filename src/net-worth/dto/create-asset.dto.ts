import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { AssetCategory } from '@prisma/client';

export class CreateAssetDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  value: string;

  @IsEnum(AssetCategory)
  category: AssetCategory;

  @IsString()
  @IsOptional()
  notes?: string;
}
