import { Test, TestingModule } from '@nestjs/testing';
import { TransactionController } from '../../transaction/transaction.controller';
import { TransactionService } from '../../transaction/transaction.service';
import { Prisma } from '@prisma/client';

describe('TransactionController', () => {
  let controller: TransactionController;
  let service: TransactionService;

  const mockTransactionService = {
    createTransaction: jest.fn((data: Prisma.TransactionCreateInput) => {
      return { id: 1, ...data };
    }),
    update: jest.fn((id: number, data: Prisma.TransactionUpdateInput) => {
      return { id, ...data };
    }),
    get: jest.fn((id: number) => {
      return { id, amount: 100, name: 'Test transaction' };
    }),
    getAll: jest.fn((accountingId: number) => {
      return [{ id: 1, amount: 100, name: 'Test transaction' }];
    }),
    delete: jest.fn((id: number) => {
      return { id, amount: 100, name: 'Test transaction' };
    }),
  };

  const accountingBook: Prisma.AccountingBookCreateNestedOneWithoutTransactionsInput =
    {
      create: {
        name: 'Test',
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: 1,
      },
    };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionController],
      providers: [
        {
          provide: TransactionService,
          useValue: mockTransactionService,
        },
      ],
    }).compile();

    controller = module.get<TransactionController>(TransactionController);
    service = module.get<TransactionService>(TransactionService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a transaction', async () => {
    const data: Prisma.TransactionCreateInput = {
      amount: 100,
      name: 'Test transaction',
      accountingBook,
      type: 'INCOME',
    };
    expect(await controller.createTransaction(data)).toEqual({
      id: 1,
      ...data,
    });
    expect(service.createTransaction).toHaveBeenCalledWith(data);
  });

  it('should update a transaction', async () => {
    const data: Prisma.TransactionUpdateInput = {
      amount: 200,
      name: 'Updated transaction',
    };
    expect(await controller.updateTransaction(1, data)).toEqual({
      id: 1,
      ...data,
    });
    expect(service.update).toHaveBeenCalledWith(1, data);
  });

  it('should get a transaction', async () => {
    expect(await controller.getTransaction(1)).toEqual({
      id: 1,
      amount: 100,
      name: 'Test transaction',
    });
    expect(service.get).toHaveBeenCalledWith(1);
  });

  it('should get all transactions', async () => {
    expect(await controller.getTransactions(1)).toEqual([
      { id: 1, amount: 100, name: 'Test transaction' },
    ]);
    expect(service.getAll).toHaveBeenCalledWith(1);
  });

  it('should delete a transaction', async () => {
    expect(await controller.deleteTransaction(1)).toEqual({
      id: 1,
      amount: 100,
      name: 'Test transaction',
    });
    expect(service.delete).toHaveBeenCalledWith(1);
  });
});
