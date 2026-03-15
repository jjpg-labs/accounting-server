import { Test, TestingModule } from '@nestjs/testing';
import { Prisma, Transaction } from '@prisma/client';
import { PrismaService } from '../../services/prisma.service';
import { TransactionService } from '../../transactions/transaction.service';

const USER_ID = 1;

const makeTransaction = (overrides: Partial<Transaction> = {}): Transaction => ({
  id: 1,
  amount: new Prisma.Decimal(100),
  accountingBookId: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
  type: 'INCOME',
  supplierId: null,
  description: 'Test',
  paymentMethod: null,
  categoryId: null,
  dailyReportId: null,
  valueDate: new Date(),
  ...overrides,
});

describe('TransactionService', () => {
  let service: TransactionService;
  let prismaService: PrismaService;
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TransactionService, PrismaService],
    }).compile();

    service = module.get<TransactionService>(TransactionService);
    prismaService = module.get<PrismaService>(PrismaService);
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  describe('createTransaction', () => {
    const data: Prisma.TransactionUncheckedCreateInput = {
      amount: new Prisma.Decimal(100),
      accountingBookId: 1,
      type: 'INCOME',
      description: 'Test',
      valueDate: new Date(),
    };

    it('should create a new transaction when book belongs to user', async () => {
      const expected = makeTransaction();
      jest
        .spyOn(prismaService.accountingBook, 'findFirst')
        .mockResolvedValue({ id: 1 } as any);
      jest
        .spyOn(prismaService.transaction, 'create')
        .mockResolvedValue(expected);

      expect(await service.createTransaction(data, USER_ID)).toEqual(expected);
    });

    it('should return null when accounting book does not belong to user', async () => {
      jest
        .spyOn(prismaService.accountingBook, 'findFirst')
        .mockResolvedValue(null);

      expect(await service.createTransaction(data, USER_ID)).toBeNull();
    });

    it('should return null if an error occurs', async () => {
      jest
        .spyOn(prismaService.accountingBook, 'findFirst')
        .mockResolvedValue({ id: 1 } as any);
      jest
        .spyOn(prismaService.transaction, 'create')
        .mockRejectedValue(new Error());

      expect(await service.createTransaction(data, USER_ID)).toBeNull();
    });
  });

  describe('update', () => {
    const data: Prisma.TransactionUncheckedUpdateInput = {
      id: 1,
      amount: new Prisma.Decimal(100),
      valueDate: new Date(),
    };

    it('should update a transaction when it belongs to user', async () => {
      const updated = makeTransaction();
      jest
        .spyOn(prismaService.transaction, 'findFirst')
        .mockResolvedValue({ id: 1 } as any);
      jest
        .spyOn(prismaService.transaction, 'update')
        .mockResolvedValue(updated);

      expect(await service.update(1, data, USER_ID)).toEqual(updated);
    });

    it('should return null when transaction does not belong to user', async () => {
      jest
        .spyOn(prismaService.transaction, 'findFirst')
        .mockResolvedValue(null);

      expect(await service.update(1, data, USER_ID)).toBeNull();
    });

    it('should return null if transaction update fails', async () => {
      jest
        .spyOn(prismaService.transaction, 'findFirst')
        .mockResolvedValue({ id: 1 } as any);
      jest
        .spyOn(prismaService.transaction, 'update')
        .mockRejectedValue(new Error());

      expect(await service.update(1, data, USER_ID)).toBeNull();
    });
  });

  describe('get', () => {
    it('should return a transaction belonging to user', async () => {
      const transaction = makeTransaction();
      jest
        .spyOn(prismaService.transaction, 'findFirst')
        .mockResolvedValue(transaction);

      expect(await service.get(1, USER_ID)).toEqual(transaction);
    });

    it('should return null when transaction does not belong to user', async () => {
      jest
        .spyOn(prismaService.transaction, 'findFirst')
        .mockResolvedValue(null);

      expect(await service.get(1, USER_ID)).toBeNull();
    });

    it('should return null if an error occurs', async () => {
      jest
        .spyOn(prismaService.transaction, 'findFirst')
        .mockRejectedValue(new Error());

      expect(await service.get(1, USER_ID)).toBeNull();
    });
  });

  describe('getAll', () => {
    it('should return all transactions for a given accountingBookId belonging to user', async () => {
      const transactions: Transaction[] = [
        makeTransaction({ id: 1 }),
        makeTransaction({ id: 2, amount: new Prisma.Decimal(200), type: 'EXPENSE' }),
      ];
      jest
        .spyOn(prismaService.transaction, 'findMany')
        .mockResolvedValue(transactions);

      expect(await service.getAll(1, USER_ID)).toEqual(transactions);
    });

    it('should return an empty array if no transactions match', async () => {
      jest.spyOn(prismaService.transaction, 'findMany').mockResolvedValue([]);

      expect(await service.getAll(1, USER_ID)).toEqual([]);
    });

    it('should return an empty array if an error occurs', async () => {
      jest
        .spyOn(prismaService.transaction, 'findMany')
        .mockRejectedValue(new Error());

      expect(await service.getAll(1, USER_ID)).toEqual([]);
    });
  });

  describe('delete', () => {
    it('should delete a transaction belonging to user', async () => {
      const deleted = makeTransaction();
      jest
        .spyOn(prismaService.transaction, 'findFirst')
        .mockResolvedValue({ id: 1 } as any);
      jest
        .spyOn(prismaService.transaction, 'delete')
        .mockResolvedValue(deleted);

      expect(await service.delete(1, USER_ID)).toEqual(deleted);
    });

    it('should return null when transaction does not belong to user', async () => {
      jest
        .spyOn(prismaService.transaction, 'findFirst')
        .mockResolvedValue(null);

      expect(await service.delete(1, USER_ID)).toBeNull();
    });

    it('should return null if transaction deletion fails', async () => {
      jest
        .spyOn(prismaService.transaction, 'findFirst')
        .mockResolvedValue({ id: 1 } as any);
      jest
        .spyOn(prismaService.transaction, 'delete')
        .mockRejectedValue(new Error());

      expect(await service.delete(1, USER_ID)).toBeNull();
    });
  });

  describe('getMetrics', () => {
    it('should return metrics for an accounting book belonging to user', async () => {
      const metrics = [
        { type: 'INCOME', _sum: { amount: new Prisma.Decimal(1000) } },
        { type: 'EXPENSE', _sum: { amount: new Prisma.Decimal(400) } },
      ];
      jest
        .spyOn(prismaService.transaction as any, 'groupBy')
        .mockResolvedValue(metrics as any);

      const result = await service.getMetrics(1, USER_ID);
      expect(result).toEqual({
        totalIncome: 1000,
        totalExpense: 400,
        netRevenue: 600,
      });
    });

    it('should handle date filters', async () => {
      const startDate = '2023-01-01';
      const endDate = '2023-12-31';
      jest
        .spyOn(prismaService.transaction as any, 'groupBy')
        .mockResolvedValue([]);

      await service.getMetrics(1, USER_ID, startDate, endDate);
      expect(prismaService.transaction.groupBy).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            valueDate: {
              gte: new Date(startDate),
              lte: new Date(endDate),
            },
          }),
        }),
      );
    });

    it('should return zeros on error', async () => {
      jest
        .spyOn(prismaService.transaction as any, 'groupBy')
        .mockRejectedValue(new Error());

      const result = await service.getMetrics(1, USER_ID);
      expect(result).toEqual({ totalIncome: 0, totalExpense: 0, netRevenue: 0 });
    });

    it('should handle mixed income and expense and zeros', async () => {
      const metrics = [
        { type: 'INCOME', _sum: { amount: null } },
        { type: 'EXPENSE', _sum: { amount: new Prisma.Decimal(100) } },
        { type: 'OTHER', _sum: { amount: new Prisma.Decimal(50) } },
      ];
      (
        jest.spyOn(prismaService.transaction as any, 'groupBy') as any
      ).mockResolvedValue(metrics as any);

      const result = await service.getMetrics(1, USER_ID);
      expect(result).toEqual({
        totalIncome: 0,
        totalExpense: 100,
        netRevenue: -100,
      });
    });

    it('should handle EXPENSE amount null', async () => {
      const metrics = [{ type: 'EXPENSE', _sum: { amount: null } }];
      (
        jest.spyOn(prismaService.transaction as any, 'groupBy') as any
      ).mockResolvedValue(metrics as any);

      const result = await service.getMetrics(1, USER_ID);
      expect(result.totalExpense).toBe(0);
    });
  });
});
