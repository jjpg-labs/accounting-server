import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../services/prisma.service';
import { AccountingBookService } from '../../accountingBook/accountingBook.service';
import { Prisma, AccountingBook } from '@prisma/client';

describe('AccountingBookService', () => {
  let service: AccountingBookService;
  let prisma: PrismaService;
  const user: Prisma.UserCreateNestedOneWithoutAccountingBooksInput = {
    connect: { id: 1 },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AccountingBookService, PrismaService],
    }).compile();

    service = module.get<AccountingBookService>(AccountingBookService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
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

      jest.spyOn(prisma.accountingBook, 'create').mockResolvedValue(result);

      expect(await service.createAccountingBook(data)).toEqual(result);
    });
  });

  describe('get', () => {
    it('should return an accounting book by id', async () => {
      const id = 1;
      const result: AccountingBook = {
        id: 1,
        name: 'Test Book',
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: 1,
        isBusiness: false,
      };

      jest.spyOn(prisma.accountingBook, 'findUnique').mockResolvedValue(result);

      expect(await service.get(id)).toEqual(result);
    });

    it('should return null if accounting book not found', async () => {
      const id = 1;

      jest.spyOn(prisma.accountingBook, 'findUnique').mockResolvedValue(null);

      expect(await service.get(id)).toBeNull();
    });
  });

  describe('update', () => {
    it('should update an accounting book', async () => {
      const id = 1;
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

      jest.spyOn(prisma.accountingBook, 'update').mockResolvedValue(result);

      expect(await service.update(id, data)).toEqual(result);
    });
  });
});
