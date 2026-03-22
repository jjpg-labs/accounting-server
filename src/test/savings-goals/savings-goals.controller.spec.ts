import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from '../../auth/auth.guard';
import { SavingsGoalsController } from '../../savings-goals/savings-goals.controller';
import { SavingsGoalsService } from '../../savings-goals/savings-goals.service';

const mockSavingsGoalsService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  contribute: jest.fn(),
  remove: jest.fn(),
};

const mockRequest = { user: { sub: 1 } };

describe('SavingsGoalsController', () => {
  let controller: SavingsGoalsController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SavingsGoalsController],
      providers: [{ provide: SavingsGoalsService, useValue: mockSavingsGoalsService }],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<SavingsGoalsController>(SavingsGoalsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a savings goal', async () => {
      const dto = { name: 'Vacaciones', targetAmount: '1000' };
      mockSavingsGoalsService.create.mockResolvedValue({ id: 1, ...dto });

      const result = await controller.create(mockRequest as any, dto as any);

      expect(result).toEqual({ id: 1, ...dto });
      expect(mockSavingsGoalsService.create).toHaveBeenCalledWith(1, dto);
    });
  });

  describe('findAll', () => {
    it('should return all goals', async () => {
      mockSavingsGoalsService.findAll.mockResolvedValue([{ id: 1 }]);

      expect(await controller.findAll(mockRequest as any)).toEqual([{ id: 1 }]);
      expect(mockSavingsGoalsService.findAll).toHaveBeenCalledWith(1);
    });
  });

  describe('findOne', () => {
    it('should return the goal', async () => {
      mockSavingsGoalsService.findOne.mockResolvedValue({ id: 1 });

      expect(await controller.findOne(mockRequest as any, 1)).toEqual({ id: 1 });
    });

    it('should throw NotFoundException when goal not found', async () => {
      mockSavingsGoalsService.findOne.mockResolvedValue(null);

      await expect(controller.findOne(mockRequest as any, 99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update and return the goal', async () => {
      const updated = { id: 1, name: 'New Name' };
      mockSavingsGoalsService.update.mockResolvedValue(updated);

      const result = await controller.update(mockRequest as any, 1, { name: 'New Name' } as any);

      expect(result).toEqual(updated);
      expect(mockSavingsGoalsService.update).toHaveBeenCalledWith(1, 1, { name: 'New Name' });
    });

    it('should throw NotFoundException when goal not found', async () => {
      mockSavingsGoalsService.update.mockResolvedValue(null);

      await expect(controller.update(mockRequest as any, 99, {} as any)).rejects.toThrow(NotFoundException);
    });
  });

  describe('contribute', () => {
    it('should contribute and return updated goal', async () => {
      const updated = { id: 1, currentAmount: '350' };
      mockSavingsGoalsService.contribute.mockResolvedValue(updated);

      const result = await controller.contribute(mockRequest as any, 1, { amount: '150' });

      expect(result).toEqual(updated);
      expect(mockSavingsGoalsService.contribute).toHaveBeenCalledWith(1, 1, '150');
    });

    it('should throw NotFoundException when goal not found', async () => {
      mockSavingsGoalsService.contribute.mockResolvedValue(null);

      await expect(controller.contribute(mockRequest as any, 99, { amount: '50' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove and return the goal', async () => {
      mockSavingsGoalsService.remove.mockResolvedValue({ id: 1 });

      expect(await controller.remove(mockRequest as any, 1)).toEqual({ id: 1 });
      expect(mockSavingsGoalsService.remove).toHaveBeenCalledWith(1, 1);
    });

    it('should throw NotFoundException when goal not found', async () => {
      mockSavingsGoalsService.remove.mockResolvedValue(null);

      await expect(controller.remove(mockRequest as any, 99)).rejects.toThrow(NotFoundException);
    });
  });
});
