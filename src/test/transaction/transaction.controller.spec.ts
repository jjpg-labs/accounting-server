import { Test, TestingModule } from '@nestjs/testing';
import { TransactionController } from '../../transaction/transaction.controller';
import { TransactionService } from '../../transaction/transaction.service';
import { Prisma, Transaction } from '@prisma/client';
import { Response } from 'express';
import { HttpStatus } from '@nestjs/common';

describe('TransactionController', () => {
  let controller: TransactionController;
  let service: TransactionService;
  let mockResponse: Partial<Response>;

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
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as Partial<Response>;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createTransaction', () => {
    it('should create a new transaction', async () => {
      const data: Prisma.TransactionCreateInput = {
        amount: 100,
        name: 'Test transaction',
        accountingBook: accountingBook,
        valueDate: new Date(),
        type: 'INCOME',
      };
      const result: Transaction = {
        id: 1,
        amount: 100,
        name: 'Test transaction',
        createdAt: new Date(),
        updatedAt: new Date(),
        type: 'INCOME',
        accountingBookId: 1,
        supplierId: null,
        valueDate: new Date(),
      };

      jest.spyOn(service, 'createTransaction').mockResolvedValue(result);
      await controller.createTransaction(data, mockResponse as Response);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CREATED);
      expect(mockResponse.json).toHaveBeenCalledWith(result);
    });

    it('should return bad request if transaction creation fails', async () => {
      const data: Prisma.TransactionCreateInput = {
        amount: 100,
        name: 'Test transaction',
        accountingBook: accountingBook,
        valueDate: new Date(),
        type: 'INCOME',
      };

      jest.spyOn(service, 'createTransaction').mockResolvedValue(null);
      await controller.createTransaction(data, mockResponse as Response);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Failed to create transaction' });
    });

    it('should return bad request if an unknown error occurs', async () => {
      const data: Prisma.TransactionCreateInput = {
        amount: 100,
        name: 'Test transaction',
        accountingBook: accountingBook,
        valueDate: new Date(),
        type: 'INCOME',
      };

      jest.spyOn(service, 'createTransaction').mockRejectedValue(new Error());
      await controller.createTransaction(data, mockResponse as Response);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Unknown error' });
    });
  });

  describe('updateTransaction', () => {
    it('should update a transaction', async () => {
      const data: Prisma.TransactionUncheckedUpdateInput = {
        id: 1,
        amount: 100,
        name: 'Test transaction',
        accountingBookId: 1,
        valueDate: new Date(),
        type: 'INCOME',
      };
      const result: Transaction = {
        id: 1,
        amount: 100,
        name: 'Test transaction',
        createdAt: new Date(),
        updatedAt: new Date(),
        type: 'INCOME',
        accountingBookId: 1,
        supplierId: null,
        valueDate: new Date(),
      };

      jest.spyOn(service, 'update').mockResolvedValue(result);
      await controller.updateTransaction(data, mockResponse as Response);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith(result);
    });

    it('should return bad request if transaction update fails', async () => {
      const data: Prisma.TransactionUncheckedUpdateInput = {
        id: 1,
        amount: 100,
        name: 'Test transaction',
        accountingBookId: 1,
        valueDate: new Date(),
        type: 'INCOME',
      };

      jest.spyOn(service, 'update').mockResolvedValue(null);
      await controller.updateTransaction(data, mockResponse as Response);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Failed to update transaction' });
    });

    it('should return bad request if an unknown error occurs', async () => {
      const data: Prisma.TransactionUncheckedUpdateInput = {
        id: 1,
        amount: 100,
        name: 'Test transaction',
        accountingBookId: 1,
        valueDate: new Date(),
        type: 'INCOME',
      };

      jest.spyOn(service, 'update').mockRejectedValue(new Error());
      await controller.updateTransaction(data, mockResponse as Response);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Unknown error' });
    });

    it('should return bad request if id is not a number', async () => {
      const data = { id: '1', amount: 100, name: 'Test transaction' };

      await controller.updateTransaction(data as Prisma.TransactionUncheckedUpdateInput, mockResponse as Response);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Transaction id is required' });
    });
  });

  describe('getTransaction', () => {
    it('should get a transaction', async () => {
      const id = 1;
      const result: Transaction = {
        id,
        amount: 100,
        name: 'Test transaction',
        createdAt: new Date(),
        updatedAt: new Date(),
        type: 'INCOME',
        accountingBookId: 1,
        supplierId: null,
        valueDate: new Date(),
      };

      jest.spyOn(service, 'get').mockResolvedValue(result);
      await controller.getTransaction(id, mockResponse as Response);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith(result);
    });

    it('should return not found if transaction does not exist', async () => {
      const id = 1;

      jest.spyOn(service, 'get').mockResolvedValue(null);
      await controller.getTransaction(id, mockResponse as Response);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Transaction not found' });
    });

    it('should return bad request if an unknown error occurs', async () => {
      const id = 1;

      jest.spyOn(service, 'get').mockRejectedValue(new Error());
      await controller.getTransaction(id, mockResponse as Response);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Unknown error' });
    });
  });

  describe('getTransactions', () => {
    it('should get all transactions', async () => {
      const accountingId = 1;
      const result: Transaction[] = [
        {
          id: 1,
          amount: 100,
          name: 'Test transaction',
          createdAt: new Date(),
          updatedAt: new Date(),
          type: 'INCOME',
          accountingBookId: 1,
          supplierId: null,
          valueDate: new Date(),
        },
      ];

      jest.spyOn(service, 'getAll').mockResolvedValue(result);
      await controller.getTransactions(accountingId, mockResponse as Response);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith(result);
    });

    it('should return not found if no transactions exist', async () => {
      const accountingId = 1;

      jest.spyOn(service, 'getAll').mockResolvedValue([]);
      await controller.getTransactions(accountingId, mockResponse as Response);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockResponse.json).toHaveBeenCalledWith([]);
    });

    it('should return bad request if an unknown error occurs', async () => {
      const accountingId = 1;

      jest.spyOn(service, 'getAll').mockRejectedValue(new Error());
      await controller.getTransactions(accountingId, mockResponse as Response);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Unknown error' });
    });
  });

  describe('deleteTransaction', () => {
    it('should delete a transaction', async () => {
      const id = 1;
      const result: Transaction = {
        id,
        amount: 100,
        name: 'Test transaction',
        createdAt: new Date(),
        updatedAt: new Date(),
        type: 'INCOME',
        accountingBookId: 1,
        supplierId: null,
        valueDate: new Date(),
      };

      jest.spyOn(service, 'delete').mockResolvedValue(result);
      await controller.deleteTransaction(id, mockResponse as Response);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith(result);
    });

    it('should return bad request if transaction deletion fails', async () => {
      const id = 1;

      jest.spyOn(service, 'delete').mockResolvedValue(null);
      await controller.deleteTransaction(id, mockResponse as Response);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Failed to delete transaction' });
    });

    it('should return bad request if an unknown error occurs', async () => {
      const id = 1;

      jest.spyOn(service, 'delete').mockRejectedValue(new Error());
      await controller.deleteTransaction(id, mockResponse as Response);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Unknown error' });
    });
  });
});
