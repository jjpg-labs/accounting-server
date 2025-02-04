import { Test, TestingModule } from '@nestjs/testing';
import { AccountingBookController } from '../../accountingBook/accountingBook.controller';
import { AccountingBookService } from '../../accountingBook/accountingBook.service';
import { Prisma, AccountingBook } from '@prisma/client';

describe('AccountingBookController', () => {
  let controller: AccountingBookController;
  let service: AccountingBookService;
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

      expect(await controller.createAccountingBook(data)).toEqual(result);
      expect(service.createAccountingBook).toHaveBeenCalledWith(data);
    });

    it('should return null if creation fails', async () => {
      const data: Prisma.AccountingBookCreateInput = {
        name: 'Test Book',
        user,
      };

      jest.spyOn(service, 'createAccountingBook').mockResolvedValue(null);

      expect(await controller.createAccountingBook(data)).toBeNull();
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

      expect(await controller.getAccountingBook(id)).toEqual(result);
      expect(service.get).toHaveBeenCalledWith(id);
    });

    it('should return null if no accounting book is found', async () => {
      const id = 1;

      jest.spyOn(service, 'get').mockResolvedValue(null);

      expect(await controller.getAccountingBook(id)).toBeNull();
      expect(service.get).toHaveBeenCalledWith(id);
    });
  });

  describe('updateAccountingBook', () => {
    it('should update an accounting book', async () => {
      const id = 1;
      const data: Prisma.AccountingBookUpdateInput = { name: 'Test Book' };
      const result: AccountingBook = {
        id,
        name: 'Test Book',
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: 1,
        isBusiness: false,
      };

      jest.spyOn(service, 'update').mockResolvedValue(result);

      expect(await controller.updateAccountingBook(id, data)).toEqual(result);
      expect(service.update).toHaveBeenCalledWith(id, data);
    });

    it('should return null if update fails', async () => {
      const id = 1;
      const data: Prisma.AccountingBookUpdateInput = { name: 'Test Book' };

      jest.spyOn(service, 'update').mockResolvedValue(null);

      expect(await controller.updateAccountingBook(id, data)).toBeNull();
      expect(service.update).toHaveBeenCalledWith(id, data);
    });
  });
});
