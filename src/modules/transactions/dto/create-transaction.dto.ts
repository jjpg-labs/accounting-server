import { IsNotEmpty, IsOptional, IsEnum, IsDateString } from "class-validator";

export class CreateTransactionDto {
  @IsOptional()
  description?: string;

  @IsNotEmpty()
  amount!: string; // enviar como string para evitar pérdida de precision

  @IsNotEmpty()
  @IsEnum(["INCOME", "EXPENSE"] as any)
  type!: "INCOME" | "EXPENSE";

  @IsOptional()
  @IsEnum(["CASH", "CARD", "TRANSFER", "OTHER"] as any)
  paymentMethod?: "CASH" | "CARD" | "TRANSFER" | "OTHER";

  @IsNotEmpty()
  @IsDateString()
  valueDate!: string;

  @IsOptional()
  supplierId?: number;

  @IsOptional()
  categoryId?: number;
} 
