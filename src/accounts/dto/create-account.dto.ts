import { AccountType } from '@prisma/client';

export class CreateAccountDto {
  name: string;
  type?: AccountType;
  startingBalance?: number;
  notes?: string;
}
