import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../services/prisma.service';
import { TransactionService } from '../../transactions/transaction.service';
import { Prisma, Transaction } from '@prisma/client';

describe('TransactionService', () => {
  let service: TransactionService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TransactionService, PrismaService],
    }).compile();

    service = module.get<TransactionService>(TransactionService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  describe('update', () => {
    it('should update a transaction', async () => {
      const id = 1;
      const valueDate = new Date();
      const data: Prisma.TransactionUncheckedUpdateInput = {
        id,
        amount: new Prisma.Decimal(100),
        valueDate,
      };
      const updatedTransaction: Transaction = {
        id,
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
        valueDate,
      };

      jest
        .spyOn(prismaService.transaction, 'update')
        .mockResolvedValue(updatedTransaction);

      expect(await service.update(id, data)).toEqual(updatedTransaction);
    });

    it('should return null if transaction does not exist', async () => {
      const id = 1;
      const data: Prisma.TransactionUncheckedUpdateInput = {
        id,
        amount: new Prisma.Decimal(100),
        valueDate: new Date(),
      };

      jest.spyOn(prismaService.transaction, 'update').mockResolvedValue(null);

      await expect(service.update(id, data)).resolves.toBeNull();
    });

    it('should return null if transaction update fails', async () => {
      const id = 1;
      const data: Prisma.TransactionUncheckedUpdateInput = {
        id,
        amount: new Prisma.Decimal(100),
        valueDate: new Date(),
      };

      jest
        .spyOn(prismaService.transaction, 'update')
        .mockRejectedValue(new Error());

      expect(await service.update(id, data)).toBeNull();
    });
  });

  describe('createTransaction', () => {
    const accountingBook: Prisma.AccountingBookCreateNestedOneWithoutTransactionsInput =
      {
        create: {
          name: 'Test',
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 1,
        },
      };

    it('should create a new transaction', async () => {
      const valueDate = new Date();
      const data: Prisma.TransactionCreateInput = {
        amount: new Prisma.Decimal(100),
        accountingBook,
        type: 'INCOME',
        description: 'Test',
        valueDate,
      };
      const createdTransaction: Transaction = {
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
        valueDate,
      };

      jest
        .spyOn(prismaService.transaction, 'create')
        .mockResolvedValue(createdTransaction);

      expect(await service.createTransaction(data)).toEqual(createdTransaction);
    });

    it('should return null if transaction creation fails', async () => {
      const data: Prisma.TransactionCreateInput = {
        amount: new Prisma.Decimal(100),
        accountingBook,
        type: 'INCOME',
        description: 'Test',
        valueDate: new Date(),
      };

      jest.spyOn(prismaService.transaction, 'create').mockResolvedValue(null);

      await expect(service.createTransaction(data)).resolves.toBeNull();
    });

    it('should return null if an error occurs', async () => {
      const data: Prisma.TransactionCreateInput = {
        amount: new Prisma.Decimal(100),
        accountingBook,
        type: 'INCOME',
        description: 'Test',
        valueDate: new Date(),
      };

      jest
        .spyOn(prismaService.transaction, 'create')
        .mockRejectedValue(new Error());

      expect(await service.createTransaction(data)).toBeNull();
    });
  });

  describe('get', () => {
    it('should return a transaction by id', async () => {
      const id = 1;
      const transaction: Transaction = {
        id,
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
      };

      jest
        .spyOn(prismaService.transaction, 'findUnique')
        .mockResolvedValue(transaction);

      expect(await service.get(id)).toEqual(transaction);
    });

    it('should return null if transaction does not exist', async () => {
      const id = 1;

      jest
        .spyOn(prismaService.transaction, 'findUnique')
        .mockResolvedValue(null);

      expect(await service.get(id)).toBeNull();
    });

    it('should return null if an error occurs', async () => {
      const id = 1;

      jest
        .spyOn(prismaService.transaction, 'findUnique')
        .mockRejectedValue(new Error());

      expect(await service.get(id)).toBeNull();
    });
  });

  describe('getAll', () => {
    it('should return all transactions for a given accountingBookId', async () => {
      const accountingBookId = 1;
      const transactions: Transaction[] = [
        {
          id: 1,
          amount: new Prisma.Decimal(100),
          accountingBookId,
          createdAt: new Date(),
          updatedAt: new Date(),
          type: 'INCOME',
          supplierId: null,
          description: 'Test',
          paymentMethod: null,
          categoryId: null,
          dailyReportId: null,
          valueDate: new Date(),
        },
        {
          id: 2,
          amount: new Prisma.Decimal(200),
          accountingBookId,
          createdAt: new Date(),
          updatedAt: new Date(),
          type: 'EXPENSE',
          supplierId: null,
          description: 'Test 2',
          paymentMethod: null,
          categoryId: null,
          dailyReportId: null,
          valueDate: new Date(),
        },
      ];

      jest
        .spyOn(prismaService.transaction, 'findMany')
        .mockResolvedValue(transactions);

      expect(await service.getAll(accountingBookId)).toEqual(transactions);
    });

    it('should return an empty array if no transactions exist for the given accountingBookId', async () => {
      const accountingBookId = 1;

      jest.spyOn(prismaService.transaction, 'findMany').mockResolvedValue([]);

      expect(await service.getAll(accountingBookId)).toEqual([]);
    });

    it('should return an empty array if an error occurs', async () => {
      const accountingBookId = 1;

      jest
        .spyOn(prismaService.transaction, 'findMany')
        .mockRejectedValue(new Error());

      expect(await service.getAll(accountingBookId)).toEqual([]);
    });
  });

  describe('delete', () => {
    it('should delete a transaction by id', async () => {
      const id = 1;
      const deletedTransaction: Transaction = {
        id,
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
      };

      jest
        .spyOn(prismaService.transaction, 'delete')
        .mockResolvedValue(deletedTransaction);

      expect(await service.delete(id)).toEqual(deletedTransaction);
    });

    it('should return null if transaction does not exist', async () => {
      const id = 1;

      jest.spyOn(prismaService.transaction, 'delete').mockResolvedValue(null);

      await expect(service.delete(id)).resolves.toBeNull();
    });

    it('should return null if transaction deletion fails', async () => {
      const id = 1;

      jest
        .spyOn(prismaService.transaction, 'delete')
        .mockRejectedValue(new Error());

      expect(await service.delete(id)).toBeNull();
    });
  });
});
