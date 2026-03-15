import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../services/prisma.service';
import { AccountingBookService } from '../../accountingBooks/accountingBook.service';

const USER_ID = 1;

const makeBook = (overrides = {}) => ({
  id: 1,
  name: 'Test Book',
  userId: USER_ID,
  createdAt: new Date(),
  updatedAt: new Date(),
  isBusiness: false,
  ...overrides,
});

describe('AccountingBookService', () => {
  let service: AccountingBookService;

  const mockPrismaService = {
    accountingBook: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountingBookService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<AccountingBookService>(AccountingBookService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createAccountingBook', () => {
    it('should create a new accounting book', async () => {
      const book = makeBook();
      mockPrismaService.accountingBook.create.mockResolvedValue(book);
      expect(
        await service.createAccountingBook({ name: 'Test Book', userId: USER_ID }),
      ).toEqual(book);
    });

    it('should return null if an error occurs', async () => {
      mockPrismaService.accountingBook.create.mockRejectedValue(new Error());
      expect(
        await service.createAccountingBook({ name: 'Test Book', userId: USER_ID }),
      ).toBeNull();
    });
  });

  describe('getAll', () => {
    it('should return all accounting books for a user', async () => {
      const books = [makeBook()];
      mockPrismaService.accountingBook.findMany.mockResolvedValue(books);
      expect(await service.getAll(USER_ID)).toEqual(books);
      expect(mockPrismaService.accountingBook.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: USER_ID } }),
      );
    });
  });

  describe('get', () => {
    it('should return an accounting book by id and userId', async () => {
      const book = makeBook();
      mockPrismaService.accountingBook.findFirst.mockResolvedValue(book);
      expect(await service.get(1, USER_ID)).toEqual(book);
      expect(mockPrismaService.accountingBook.findFirst).toHaveBeenCalledWith({
        where: { id: 1, userId: USER_ID },
      });
    });

    it('should return null if not found', async () => {
      mockPrismaService.accountingBook.findFirst.mockResolvedValue(null);
      expect(await service.get(99, USER_ID)).toBeNull();
    });

    it('should return null if an error occurs', async () => {
      mockPrismaService.accountingBook.findFirst.mockRejectedValue(new Error());
      expect(await service.get(1, USER_ID)).toBeNull();
    });
  });

  describe('update', () => {
    it('should update if owned by user', async () => {
      const book = makeBook();
      mockPrismaService.accountingBook.findFirst.mockResolvedValue({ id: 1 });
      mockPrismaService.accountingBook.update.mockResolvedValue(book);
      expect(await service.update(1, { name: 'New Name' }, USER_ID)).toEqual(book);
    });

    it('should return null if not owned', async () => {
      mockPrismaService.accountingBook.findFirst.mockResolvedValue(null);
      expect(await service.update(1, { name: 'New Name' }, USER_ID)).toBeNull();
    });

    it('should return null if an error occurs', async () => {
      mockPrismaService.accountingBook.findFirst.mockRejectedValue(new Error());
      expect(await service.update(1, { name: 'New Name' }, USER_ID)).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete if owned by user', async () => {
      const book = makeBook();
      mockPrismaService.accountingBook.findFirst.mockResolvedValue({ id: 1 });
      mockPrismaService.accountingBook.delete.mockResolvedValue(book);
      expect(await service.delete(1, USER_ID)).toEqual(book);
    });

    it('should return null if not owned', async () => {
      mockPrismaService.accountingBook.findFirst.mockResolvedValue(null);
      expect(await service.delete(1, USER_ID)).toBeNull();
    });

    it('should return null if an error occurs', async () => {
      mockPrismaService.accountingBook.findFirst.mockRejectedValue(new Error());
      expect(await service.delete(1, USER_ID)).toBeNull();
    });
  });
});
