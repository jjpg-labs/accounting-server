import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesService } from '../../categories/categories.service';
import { PrismaService } from '../../services/prisma.service';

describe('CategoriesService', () => {
  let service: CategoriesService;

  const mockPrismaService = {
    category: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
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
    it('should create a category', async () => {
      const data = { name: 'Test', accountingBookId: 1 };
      mockPrismaService.category.create.mockResolvedValue(data);
      expect(await service.create(data)).toEqual(data);
    });
  });

  describe('findAll', () => {
    it('should find all categories for a book', async () => {
      const categories = [{ id: 1, name: 'Test', accountingBookId: 1 }];
      mockPrismaService.category.findMany.mockResolvedValue(categories);
      expect(await service.findAll(1)).toEqual(categories);
    });
  });

  describe('findOne', () => {
    it('should find one category', async () => {
      const category = { id: 1, name: 'Test', accountingBookId: 1 };
      mockPrismaService.category.findUnique.mockResolvedValue(category);
      expect(await service.findOne(1)).toEqual(category);
    });
  });

  describe('update', () => {
    it('should update a category', async () => {
      const data = { name: 'Updated' };
      const updated = { id: 1, name: 'Updated', accountingBookId: 1 };
      mockPrismaService.category.update.mockResolvedValue(updated);
      expect(await service.update(1, data)).toEqual(updated);
    });
  });

  describe('remove', () => {
    it('should remove a category', async () => {
      mockPrismaService.category.delete.mockResolvedValue({ id: 1 });
      expect(await service.remove(1)).toEqual({ id: 1 });
    });
  });
});
