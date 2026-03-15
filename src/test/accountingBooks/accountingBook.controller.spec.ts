import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AccountingBook } from '@prisma/client';
import { Response } from 'express';
import { AccountingBookController } from '../../accountingBooks/accountingBook.controller';
import { AccountingBookService } from '../../accountingBooks/accountingBook.service';

const USER_ID = 1;

const makeBook = (): AccountingBook => ({
  id: 1,
  name: 'Test Book',
  createdAt: new Date(),
  updatedAt: new Date(),
  userId: USER_ID,
  isBusiness: false,
});

describe('AccountingBookController', () => {
  let controller: AccountingBookController;
  let service: AccountingBookService;
  let mockResponse: Partial<Response>;
  const mockRequest = { user: { sub: USER_ID } };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccountingBookController],
      providers: [
        {
          provide: AccountingBookService,
          useValue: {
            createAccountingBook: jest.fn().mockResolvedValue(makeBook()),
            get: jest.fn().mockResolvedValue(makeBook()),
            update: jest.fn().mockResolvedValue(makeBook()),
            delete: jest.fn().mockResolvedValue(makeBook()),
            getAll: jest.fn().mockResolvedValue([makeBook()]),
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
      const result = makeBook();
      jest.spyOn(service, 'createAccountingBook').mockResolvedValue(result);
      await controller.createAccountingBook(
        { name: 'Test Book' } as any,
        mockRequest as any,
        mockResponse as Response,
      );
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CREATED);
      expect(mockResponse.json).toHaveBeenCalledWith(result);
      expect(service.createAccountingBook).toHaveBeenCalledWith({
        name: 'Test Book',
        userId: USER_ID,
      });
    });

    it('should return BAD_REQUEST if creation fails', async () => {
      jest.spyOn(service, 'createAccountingBook').mockResolvedValue(null);
      await controller.createAccountingBook(
        { name: 'Test Book' } as any,
        mockRequest as any,
        mockResponse as Response,
      );
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Accounting book not created',
      });
    });

    it('should return BAD_REQUEST on exception', async () => {
      jest.spyOn(service, 'createAccountingBook').mockRejectedValue(new Error());
      await controller.createAccountingBook(
        { name: 'Test Book' } as any,
        mockRequest as any,
        mockResponse as Response,
      );
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'An error occurred' });
    });
  });

  describe('getAccountingBooks', () => {
    it('should return all accounting books for user', async () => {
      const books = [makeBook()];
      jest.spyOn(service, 'getAll').mockResolvedValue(books);
      await controller.getAccountingBooks(mockRequest as any, mockResponse as Response);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith(books);
      expect(service.getAll).toHaveBeenCalledWith(USER_ID);
    });

    it('should return BAD_REQUEST on failure', async () => {
      jest.spyOn(service, 'getAll').mockRejectedValue(new Error());
      await controller.getAccountingBooks(mockRequest as any, mockResponse as Response);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    });
  });

  describe('getAccountingBook', () => {
    it('should return an accounting book', async () => {
      const result = makeBook();
      jest.spyOn(service, 'get').mockResolvedValue(result);
      await controller.getAccountingBook(1, mockRequest as any, mockResponse as Response);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith(result);
      expect(service.get).toHaveBeenCalledWith(1, USER_ID);
    });

    it('should return NOT_FOUND if not found', async () => {
      jest.spyOn(service, 'get').mockResolvedValue(null);
      await controller.getAccountingBook(1, mockRequest as any, mockResponse as Response);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Accounting book not found',
      });
    });

    it('should return BAD_REQUEST on exception', async () => {
      jest.spyOn(service, 'get').mockRejectedValue(new Error());
      await controller.getAccountingBook(1, mockRequest as any, mockResponse as Response);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'An error occurred' });
    });
  });

  describe('updateAccountingBook', () => {
    it('should update an accounting book', async () => {
      const result = makeBook();
      jest.spyOn(service, 'update').mockResolvedValue(result);
      await controller.updateAccountingBook(
        { id: 1, name: 'New Name' },
        mockRequest as any,
        mockResponse as Response,
      );
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith(result);
      expect(service.update).toHaveBeenCalledWith(1, { id: 1, name: 'New Name' }, USER_ID);
    });

    it('should return BAD_REQUEST if id is not a number', async () => {
      await controller.updateAccountingBook(
        { id: '1', name: 'Test' } as any,
        mockRequest as any,
        mockResponse as Response,
      );
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Accounting book id is required',
      });
    });

    it('should return BAD_REQUEST if update returns null', async () => {
      jest.spyOn(service, 'update').mockResolvedValue(null);
      await controller.updateAccountingBook(
        { id: 1, name: 'Test' },
        mockRequest as any,
        mockResponse as Response,
      );
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Accounting book not updated',
      });
    });

    it('should return BAD_REQUEST on exception', async () => {
      jest.spyOn(service, 'update').mockRejectedValue(new Error());
      await controller.updateAccountingBook(
        { id: 1, name: 'Test' },
        mockRequest as any,
        mockResponse as Response,
      );
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'An error occurred' });
    });
  });

  describe('deleteAccountingBook', () => {
    it('should delete an accounting book', async () => {
      const result = makeBook();
      jest.spyOn(service, 'delete').mockResolvedValue(result);
      await controller.deleteAccountingBook(1, mockRequest as any, mockResponse as Response);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith(result);
      expect(service.delete).toHaveBeenCalledWith(1, USER_ID);
    });

    it('should return BAD_REQUEST if delete returns null', async () => {
      jest.spyOn(service, 'delete').mockResolvedValue(null);
      await controller.deleteAccountingBook(1, mockRequest as any, mockResponse as Response);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Accounting book not deleted',
      });
    });

    it('should return BAD_REQUEST on exception', async () => {
      jest.spyOn(service, 'delete').mockRejectedValue(new Error());
      await controller.deleteAccountingBook(1, mockRequest as any, mockResponse as Response);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'An error occurred' });
    });
  });
});
