import { Test, TestingModule } from '@nestjs/testing';
import { AccountingBookController } from '../../accountingBook/accountingBook.controller';
import { AccountingBookService } from '../../accountingBook/accountingBook.service';
import { Prisma, AccountingBook } from '@prisma/client';
import { Response } from 'express';
import { HttpStatus } from '@nestjs/common';

describe('AccountingBookController', () => {
  let controller: AccountingBookController;
  let service: AccountingBookService;
  let mockResponse: Partial<Response>;
  const user: Prisma.UserCreateNestedOneWithoutAccountingBooksInput = {
    connect: { id: 1 },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccountingBookController],
      providers: [
        {
          provide: AccountingBookService,
          useValue: {
            createAccountingBook: jest
              .fn()
              .mockResolvedValue({ id: 1, name: 'Test Book' }),
            get: jest.fn().mockResolvedValue({ id: 1, name: 'Test Book' }),
            update: jest.fn().mockResolvedValue({ id: 1, name: 'Test Book' }),
          },
        },
      ],
    }).compile();

    controller = module.get<AccountingBookController>(AccountingBookController);
    service = module.get<AccountingBookService>(AccountingBookService);
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as Partial<Response>;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createAccountingBook', () => {
    it('should create a new accounting book', async () => {
      const data: Prisma.AccountingBookCreateInput = {
        name: 'Test Book',
        user,
      };
      const result: AccountingBook = {
        id: 1,
        name: 'Test Book',
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: 1,
        isBusiness: false,
      };

      jest.spyOn(service, 'createAccountingBook').mockResolvedValue(result);
      await controller.createAccountingBook(data, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CREATED);
      expect(mockResponse.json).toHaveBeenCalledWith(result);
      expect(service.createAccountingBook).toHaveBeenCalledWith(data);
    });

    it('should return null if creation fails', async () => {
      const data: Prisma.AccountingBookCreateInput = {
        name: 'Test Book',
        user,
      };

      jest.spyOn(service, 'createAccountingBook').mockResolvedValue(null);
      await controller.createAccountingBook(data, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Accounting book not created' });
      expect(service.createAccountingBook).toHaveBeenCalledWith(data);
    });

    it('should return BAD_REQUEST status if an error occurs', async () => {
      const data: Prisma.AccountingBookCreateInput = {
        name: 'Test Book',
        user,
      };

      jest.spyOn(service, 'createAccountingBook').mockRejectedValue(new Error());
      await controller.createAccountingBook(data, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'An error occurred' });
      expect(service.createAccountingBook).toHaveBeenCalledWith(data);
    });
  });

  describe('getAccountingBook', () => {
    it('should return an accounting book', async () => {
      const id = 1;
      const result: AccountingBook = {
        id,
        name: 'Test Book',
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: 1,
        isBusiness: false,
      };

      jest.spyOn(service, 'get').mockResolvedValue(result);
      await controller.getAccountingBook(id, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith(result);
      expect(service.get).toHaveBeenCalledWith(id);
    });

    it('should return NOT_FOUND status if no accounting book is found', async () => {
      const id = 1;

      jest.spyOn(service, 'get').mockResolvedValue(null);
      await controller.getAccountingBook(id, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Accounting book not found' });
      expect(service.get).toHaveBeenCalledWith(id);
    });

    it('should return BAD_REQUEST status if an error occurs', async () => {
      const id = 1;

      jest.spyOn(service, 'get').mockRejectedValue(new Error());
      await controller.getAccountingBook(id, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'An error occurred' });
      expect(service.get).toHaveBeenCalledWith
    });
  });

  describe('updateAccountingBook', () => {
    it('should update an accounting book', async () => {
      const id = 1;
      const data: Prisma.AccountingBookUncheckedUpdateInput = { id: id, name: 'Test Book' };
      const result: AccountingBook = {
        id,
        name: 'Test Book',
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: 1,
        isBusiness: false,
      };

      jest.spyOn(service, 'update').mockResolvedValue(result);
      await controller.updateAccountingBook(data, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith(result);
      expect(service.update).toHaveBeenCalledWith(id, data);
    });

    it('should return BAD_REQUEST status if id is not a number', async () => {
      const data = { id: '1', name: 'Test Book' };

      await controller.updateAccountingBook(data as Prisma.AccountingBookUncheckedUpdateInput, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Accounting book id is required' });
    });

    it('should return BAD_REQUEST status if update fails', async () => {
      const id = 1;
      const data: Prisma.AccountingBookUncheckedUpdateInput = { id: 2, name: 'Test Book' };

      jest.spyOn(service, 'update').mockResolvedValue(null);
      await controller.updateAccountingBook(data, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Accounting book not updated' });
      expect(service.update).toHaveBeenCalledWith(data.id, data);
    });

    it('should return BAD_REQUEST status if an error occurs', async () => {
      const id = 1;
      const data: Prisma.AccountingBookUncheckedUpdateInput = { id, name: 'Test Book' };

      jest.spyOn(service, 'update').mockRejectedValue(new Error());
      await controller.updateAccountingBook(data, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'An error occurred' });
      expect(service.update).toHaveBeenCalledWith(id, data);
    });
  });
});
