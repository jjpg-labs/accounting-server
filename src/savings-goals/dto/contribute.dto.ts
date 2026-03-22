import { IsNotEmpty, IsString } from 'class-validator';

export class ContributeDto {
  @IsString()
  @IsNotEmpty()
  amount: string;
}
