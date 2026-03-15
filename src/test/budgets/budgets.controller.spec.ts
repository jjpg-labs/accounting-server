import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from '../../auth/auth.guard';
import { BudgetsController } from '../../budgets/budgets.controller';
import { BudgetsService } from '../../budgets/budgets.service';

describe('BudgetsController', () => {
  let controller: BudgetsController;
  let service: BudgetsService;

  const mockBudgetsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockRequest = {
    user: { sub: 1 },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BudgetsController],
      providers: [{ provide: BudgetsService, useValue: mockBudgetsService }],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<BudgetsController>(BudgetsController);
    service = module.get<BudgetsService>(BudgetsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a budget', async () => {
    const dto = { name: 'Test' };
    mockBudgetsService.create.mockResolvedValue({ id: 1 });
    expect(await controller.create(mockRequest as any, dto as any)).toEqual({
      id: 1,
    });
    expect(service.create).toHaveBeenCalledWith(1, dto);
  });

  it('should find all budgets', async () => {
    mockBudgetsService.findAll.mockResolvedValue([]);
    expect(await controller.findAll(mockRequest as any)).toEqual([]);
  });

  it('should find one budget', async () => {
    mockBudgetsService.findOne.mockResolvedValue({ id: 1 });
    expect(await controller.findOne(mockRequest as any, 1)).toEqual({ id: 1 });
  });

  it('should update a budget', async () => {
    const updated = { id: 1, name: 'New' };
    mockBudgetsService.update.mockResolvedValue(updated);
    expect(await controller.update(mockRequest as any, 1, { name: 'New' } as any)).toEqual(updated);
    expect(service.update).toHaveBeenCalledWith(1, 1, { name: 'New' });
  });

  it('should throw NotFoundException when budget not found on update', async () => {
    mockBudgetsService.update.mockResolvedValue(null);
    await expect(controller.update(mockRequest as any, 1, {} as any)).rejects.toThrow('Budget not found');
  });

  it('should remove a budget', async () => {
    mockBudgetsService.remove.mockResolvedValue({ id: 1 });
    expect(await controller.remove(mockRequest as any, 1)).toEqual({ id: 1 });
  });
});
