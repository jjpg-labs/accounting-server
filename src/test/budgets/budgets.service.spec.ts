import { Test, TestingModule } from '@nestjs/testing';
import { BudgetsService } from '../../budgets/budgets.service';
import { PrismaService } from '../../services/prisma.service';

describe('BudgetsService', () => {
  let service: BudgetsService;

  const mockPrismaService = {
    budget: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BudgetsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<BudgetsService>(BudgetsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a budget', async () => {
      const dto = { name: 'Test', amount: 100, startDate: new Date() };
      mockPrismaService.budget.create.mockResolvedValue({ id: 1, ...dto });
      expect(await service.create(1, dto as any)).toEqual({ id: 1, ...dto });
    });
  });

  describe('findAll', () => {
    it('should find all budgets for a user', async () => {
      const budgets = [{ id: 1, userId: 1 }];
      mockPrismaService.budget.findMany.mockResolvedValue(budgets);
      expect(await service.findAll(1)).toEqual(budgets);
    });
  });

  describe('findOne', () => {
    it('should find one budget', async () => {
      const budget = { id: 1, userId: 1 };
      mockPrismaService.budget.findFirst.mockResolvedValue(budget);
      expect(await service.findOne(1, 1)).toEqual(budget);
    });

    it('should return null if not found', async () => {
      mockPrismaService.budget.findFirst.mockResolvedValue(null);
      expect(await service.findOne(1, 1)).toBeNull();
    });
  });

  describe('remove', () => {
    it('should remove budgets and return result', async () => {
      const result = { count: 1 };
      mockPrismaService.budget.deleteMany.mockResolvedValue(result);
      expect(await service.remove(1, 1)).toEqual(result);
    });
  });
});
