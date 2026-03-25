import { AccountType } from '@prisma/client';

export class CreateAccountDto {
  name: string;
  type?: AccountType;
  startingBalance?: number;
  marginBalance?: number;
  notes?: string;
}
