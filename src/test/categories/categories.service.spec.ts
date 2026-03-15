import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesService } from '../../categories/categories.service';
import { PrismaService } from '../../services/prisma.service';

const USER_ID = 1;

describe('CategoriesService', () => {
  let service: CategoriesService;

  const mockPrismaService = {
    accountingBook: {
      findFirst: jest.fn(),
    },
    category: {
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
        CategoriesService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a category when book is owned by user', async () => {
      const data = { name: 'Test', accountingBookId: 1 };
      mockPrismaService.accountingBook.findFirst.mockResolvedValue({ id: 1 });
      mockPrismaService.category.create.mockResolvedValue(data);
      expect(await service.create(USER_ID, data)).toEqual(data);
    });

    it('should return null if book is not owned by user', async () => {
      mockPrismaService.accountingBook.findFirst.mockResolvedValue(null);
      expect(
        await service.create(USER_ID, { name: 'Test', accountingBookId: 99 }),
      ).toBeNull();
    });

    it('should return null on error', async () => {
      mockPrismaService.accountingBook.findFirst.mockRejectedValue(new Error());
      expect(
        await service.create(USER_ID, { name: 'Test', accountingBookId: 1 }),
      ).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should find all categories for a book owned by user', async () => {
      const categories = [{ id: 1, name: 'Test', accountingBookId: 1 }];
      mockPrismaService.category.findMany.mockResolvedValue(categories);
      expect(await service.findAll(1, USER_ID)).toEqual(categories);
    });

    it('should return empty array on error', async () => {
      mockPrismaService.category.findMany.mockRejectedValue(new Error());
      expect(await service.findAll(1, USER_ID)).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should find one category owned by user', async () => {
      const category = { id: 1, name: 'Test', accountingBookId: 1 };
      mockPrismaService.category.findFirst.mockResolvedValue(category);
      expect(await service.findOne(1, USER_ID)).toEqual(category);
    });

    it('should return null if not found', async () => {
      mockPrismaService.category.findFirst.mockResolvedValue(null);
      expect(await service.findOne(99, USER_ID)).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a category if owned by user', async () => {
      const updated = { id: 1, name: 'Updated', accountingBookId: 1 };
      mockPrismaService.category.findFirst.mockResolvedValue({ id: 1 });
      mockPrismaService.category.update.mockResolvedValue(updated);
      expect(await service.update(1, { name: 'Updated' }, USER_ID)).toEqual(updated);
    });

    it('should return null if not owned by user', async () => {
      mockPrismaService.category.findFirst.mockResolvedValue(null);
      expect(await service.update(1, { name: 'Updated' }, USER_ID)).toBeNull();
    });

    it('should return null on error', async () => {
      mockPrismaService.category.findFirst.mockRejectedValue(new Error());
      expect(await service.update(1, { name: 'Updated' }, USER_ID)).toBeNull();
    });
  });

  describe('remove', () => {
    it('should remove a category if owned by user', async () => {
      mockPrismaService.category.findFirst.mockResolvedValue({ id: 1 });
      mockPrismaService.category.delete.mockResolvedValue({ id: 1 });
      expect(await service.remove(1, USER_ID)).toEqual({ id: 1 });
    });

    it('should return null if not owned by user', async () => {
      mockPrismaService.category.findFirst.mockResolvedValue(null);
      expect(await service.remove(1, USER_ID)).toBeNull();
    });

    it('should return null on error', async () => {
      mockPrismaService.category.findFirst.mockRejectedValue(new Error());
      expect(await service.remove(1, USER_ID)).toBeNull();
    });
  });
});
