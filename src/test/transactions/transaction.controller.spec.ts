import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Prisma, Transaction } from '@prisma/client';
import { Request, Response } from 'express';
import { TransactionController } from '../../transactions/transaction.controller';
import { TransactionService } from '../../transactions/transaction.service';

describe('TransactionController', () => {
  let controller: TransactionController;
  let service: TransactionService;
  let mockResponse: Partial<Response>;
  let mockRequest: Partial<Request>;

  const mockTransactionService = {
    createTransaction: jest.fn(),
    update: jest.fn(),
    get: jest.fn(),
    getAll: jest.fn(),
    delete: jest.fn(),
    getMetrics: jest.fn(),
  };

  const makeTransaction = (overrides: Partial<Transaction> = {}): Transaction => ({
    id: 1,
    amount: new Prisma.Decimal(100),
    description: 'Test transaction',
    createdAt: new Date(),
    updatedAt: new Date(),
    type: 'INCOME',
    accountingBookId: 1,
    supplierId: null,
    categoryId: null,
    paymentMethod: null,
    dailyReportId: null,
    valueDate: new Date(),
    accountId: null,
    toAccountId: null,
    ...overrides,
  });

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

    mockRequest = {
      user: { sub: 1, username: 'test@example.com' },
    } as Partial<Request>;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createTransaction', () => {
    const data: Prisma.TransactionUncheckedCreateInput = {
      amount: new Prisma.Decimal(100),
      description: 'Test transaction',
      accountingBookId: 1,
      valueDate: new Date(),
      type: 'INCOME',
    };

    it('should create a new transaction', async () => {
      const result = makeTransaction();
      jest.spyOn(service, 'createTransaction').mockResolvedValue(result);

      await controller.createTransaction(
        data,
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CREATED);
      expect(mockResponse.json).toHaveBeenCalledWith(result);
    });

    it('should return bad request if accounting book does not belong to user', async () => {
      jest.spyOn(service, 'createTransaction').mockResolvedValue(null);

      await controller.createTransaction(
        data,
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Failed to create transaction',
      });
    });

    it('should return bad request if an unknown error occurs', async () => {
      jest.spyOn(service, 'createTransaction').mockRejectedValue(new Error());

      await controller.createTransaction(
        data,
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Unknown error',
      });
    });
  });

  describe('updateTransaction', () => {
    const data: Prisma.TransactionUncheckedUpdateInput = {
      id: 1,
      amount: 100,
      description: 'Test transaction',
      accountingBookId: 1,
      valueDate: new Date(),
      type: 'INCOME',
    };

    it('should update a transaction', async () => {
      const result = makeTransaction();
      jest.spyOn(service, 'update').mockResolvedValue(result);

      await controller.updateTransaction(
        data,
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith(result);
    });

    it('should return bad request when transaction does not belong to user', async () => {
      jest.spyOn(service, 'update').mockResolvedValue(null);

      await controller.updateTransaction(
        data,
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Failed to update transaction',
      });
    });

    it('should return bad request if an unknown error occurs', async () => {
      jest.spyOn(service, 'update').mockRejectedValue(new Error());

      await controller.updateTransaction(
        data,
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Unknown error',
      });
    });

    it('should return bad request if id is not a number', async () => {
      const badData = { id: '1', amount: 100 };

      await controller.updateTransaction(
        badData as Prisma.TransactionUncheckedUpdateInput,
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Transaction id is required',
      });
    });
  });

  describe('getTransaction', () => {
    it('should get a transaction belonging to user', async () => {
      const result = makeTransaction();
      jest.spyOn(service, 'get').mockResolvedValue(result);

      await controller.getTransaction(
        1,
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith(result);
    });

    it('should return not found when transaction does not belong to user', async () => {
      jest.spyOn(service, 'get').mockResolvedValue(null);

      await controller.getTransaction(
        1,
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Transaction not found',
      });
    });

    it('should return bad request if an unknown error occurs', async () => {
      jest.spyOn(service, 'get').mockRejectedValue(new Error());

      await controller.getTransaction(
        1,
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Unknown error',
      });
    });
  });

  describe('getTransactions', () => {
    it('should get all transactions for user', async () => {
      const result: Transaction[] = [makeTransaction()];
      jest.spyOn(service, 'getAll').mockResolvedValue(result);

      await controller.getTransactions(
        1,
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith(result);
    });

    it('should return not found if no transactions exist for user', async () => {
      jest.spyOn(service, 'getAll').mockResolvedValue([]);

      await controller.getTransactions(
        1,
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockResponse.json).toHaveBeenCalledWith([]);
    });

    it('should return bad request if an unknown error occurs', async () => {
      jest.spyOn(service, 'getAll').mockRejectedValue(new Error());

      await controller.getTransactions(
        1,
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Unknown error',
      });
    });
  });

  describe('deleteTransaction', () => {
    it('should delete a transaction belonging to user', async () => {
      const result = makeTransaction();
      jest.spyOn(service, 'delete').mockResolvedValue(result);

      await controller.deleteTransaction(
        1,
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith(result);
    });

    it('should return bad request when transaction does not belong to user', async () => {
      jest.spyOn(service, 'delete').mockResolvedValue(null);

      await controller.deleteTransaction(
        1,
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Failed to delete transaction',
      });
    });

    it('should return bad request if an unknown error occurs', async () => {
      jest.spyOn(service, 'delete').mockRejectedValue(new Error());

      await controller.deleteTransaction(
        1,
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Unknown error',
      });
    });
  });

  describe('getMetrics', () => {
    it('should get metrics for user', async () => {
      const metrics = { totalIncome: 1000, totalExpense: 400, netRevenue: 600 };
      jest.spyOn(service, 'getMetrics').mockResolvedValue(metrics);

      await controller.getMetrics(
        1,
        '2023-01-01',
        '2023-01-31',
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith(metrics);
    });

    it('should return bad request on failure', async () => {
      jest.spyOn(service, 'getMetrics').mockRejectedValue(new Error());

      await controller.getMetrics(
        1,
        '2023-01-01',
        '2023-01-31',
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    });
  });
});
