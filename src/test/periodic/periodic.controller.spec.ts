import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from '../../auth/auth.guard';
import { PeriodicController } from '../../periodic/periodic.controller';
import { PeriodicService } from '../../periodic/periodic.service';

describe('PeriodicController', () => {
  let controller: PeriodicController;

  const mockPeriodicService = {
    create: jest.fn(),
    findAll: jest.fn(),
    processPending: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  const mockRequest = {
    user: { sub: 1 },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PeriodicController],
      providers: [{ provide: PeriodicService, useValue: mockPeriodicService }],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<PeriodicController>(PeriodicController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a recurring transaction', async () => {
    const dto = { description: 'Test' };
    mockPeriodicService.create.mockResolvedValue({ id: 1 });
    expect(await controller.create(mockRequest as any, dto as any)).toEqual({
      id: 1,
    });
  });

  it('should find all', async () => {
    mockPeriodicService.findAll.mockResolvedValue([]);
    expect(await controller.findAll(mockRequest as any)).toEqual([]);
  });

  it('should process pending', async () => {
    mockPeriodicService.processPending.mockResolvedValue({ processed: 1 });
    expect(await controller.processNow(mockRequest as any)).toEqual({
      processed: 1,
    });
  });

  it('should find one', async () => {
    mockPeriodicService.findOne.mockResolvedValue({ id: 1 });
    expect(await controller.findOne(mockRequest as any, 1)).toEqual({ id: 1 });
  });

  it('should remove', async () => {
    mockPeriodicService.remove.mockResolvedValue({ count: 1 });
    expect(await controller.remove(mockRequest as any, 1)).toEqual({
      count: 1,
    });
  });
});
