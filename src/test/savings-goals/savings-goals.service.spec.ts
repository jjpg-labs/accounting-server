import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import { SavingsGoalsService } from '../../savings-goals/savings-goals.service';
import { PrismaService } from '../../services/prisma.service';

const mockPrismaService = {
  savingsGoal: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('SavingsGoalsService', () => {
  let service: SavingsGoalsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SavingsGoalsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<SavingsGoalsService>(SavingsGoalsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a savings goal', async () => {
      const dto = { name: 'Vacaciones', targetAmount: '1000' };
      const created = { id: 1, userId: 1, name: 'Vacaciones', targetAmount: new Prisma.Decimal('1000') };
      mockPrismaService.savingsGoal.create.mockResolvedValue(created);

      const result = await service.create(1, dto as any);

      expect(result).toEqual(created);
      expect(mockPrismaService.savingsGoal.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ userId: 1, name: 'Vacaciones' }),
      });
    });

    it('should set deadline to null when not provided', async () => {
      const dto = { name: 'Test', targetAmount: '500' };
      mockPrismaService.savingsGoal.create.mockResolvedValue({ id: 1 });

      await service.create(1, dto as any);

      expect(mockPrismaService.savingsGoal.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ deadline: null }),
      });
    });

    it('should parse deadline as Date when provided', async () => {
      const dto = { name: 'Test', targetAmount: '500', deadline: '2026-12-31' };
      mockPrismaService.savingsGoal.create.mockResolvedValue({ id: 1 });

      await service.create(1, dto as any);

      expect(mockPrismaService.savingsGoal.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ deadline: new Date('2026-12-31') }),
      });
    });
  });

  describe('findAll', () => {
    it('should return all goals for the user ordered by createdAt desc', async () => {
      const goals = [{ id: 2 }, { id: 1 }];
      mockPrismaService.savingsGoal.findMany.mockResolvedValue(goals);

      const result = await service.findAll(1);

      expect(result).toEqual(goals);
      expect(mockPrismaService.savingsGoal.findMany).toHaveBeenCalledWith({
        where: { userId: 1 },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('findOne', () => {
    it('should return the goal if found', async () => {
      const goal = { id: 1, userId: 1 };
      mockPrismaService.savingsGoal.findFirst.mockResolvedValue(goal);

      expect(await service.findOne(1, 1)).toEqual(goal);
    });

    it('should return null if not found', async () => {
      mockPrismaService.savingsGoal.findFirst.mockResolvedValue(null);

      expect(await service.findOne(99, 1)).toBeNull();
    });
  });

  describe('update', () => {
    it('should update and return the goal', async () => {
      const existing = { id: 1, userId: 1, name: 'Old' };
      const updated = { id: 1, userId: 1, name: 'New' };
      mockPrismaService.savingsGoal.findFirst.mockResolvedValue(existing);
      mockPrismaService.savingsGoal.update.mockResolvedValue(updated);

      const result = await service.update(1, 1, { name: 'New' });

      expect(result).toEqual(updated);
      expect(mockPrismaService.savingsGoal.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 1 }, data: { name: 'New' } }),
      );
    });

    it('should return null if goal does not belong to user', async () => {
      mockPrismaService.savingsGoal.findFirst.mockResolvedValue(null);

      const result = await service.update(1, 999, { name: 'New' });

      expect(result).toBeNull();
      expect(mockPrismaService.savingsGoal.update).not.toHaveBeenCalled();
    });
  });

  describe('contribute', () => {
    it('should add the contribution to currentAmount', async () => {
      const goal = {
        id: 1,
        userId: 1,
        currentAmount: new Prisma.Decimal('200'),
        targetAmount: new Prisma.Decimal('1000'),
      };
      const updated = { ...goal, currentAmount: new Prisma.Decimal('350'), completed: false };
      mockPrismaService.savingsGoal.findFirst.mockResolvedValue(goal);
      mockPrismaService.savingsGoal.update.mockResolvedValue(updated);

      const result = await service.contribute(1, 1, '150');

      expect(result).toEqual(updated);
      expect(mockPrismaService.savingsGoal.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { currentAmount: new Prisma.Decimal('350'), completed: false },
      });
    });

    it('should mark completed when currentAmount reaches targetAmount', async () => {
      const goal = {
        id: 1,
        userId: 1,
        currentAmount: new Prisma.Decimal('900'),
        targetAmount: new Prisma.Decimal('1000'),
      };
      mockPrismaService.savingsGoal.findFirst.mockResolvedValue(goal);
      mockPrismaService.savingsGoal.update.mockResolvedValue({ ...goal, completed: true });

      await service.contribute(1, 1, '100');

      expect(mockPrismaService.savingsGoal.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { currentAmount: new Prisma.Decimal('1000'), completed: true },
      });
    });

    it('should return null if goal not found', async () => {
      mockPrismaService.savingsGoal.findFirst.mockResolvedValue(null);

      expect(await service.contribute(1, 999, '100')).toBeNull();
      expect(mockPrismaService.savingsGoal.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete and return the goal', async () => {
      const goal = { id: 1, userId: 1 };
      mockPrismaService.savingsGoal.findFirst.mockResolvedValue(goal);
      mockPrismaService.savingsGoal.delete.mockResolvedValue(goal);

      expect(await service.remove(1, 1)).toEqual(goal);
      expect(mockPrismaService.savingsGoal.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should return null if goal not found', async () => {
      mockPrismaService.savingsGoal.findFirst.mockResolvedValue(null);

      expect(await service.remove(99, 1)).toBeNull();
      expect(mockPrismaService.savingsGoal.delete).not.toHaveBeenCalled();
    });
  });
});
