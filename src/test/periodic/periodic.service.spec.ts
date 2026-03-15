import { Test, TestingModule } from '@nestjs/testing';
import { Frequency } from '@prisma/client';
import { PeriodicService } from '../../periodic/periodic.service';
import { PrismaService } from '../../services/prisma.service';

describe('PeriodicService', () => {
  let service: PeriodicService;

  const mockPrismaService = {
    recurringTransaction: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      deleteMany: jest.fn(),
      update: jest.fn(),
    },
    transaction: {
      create: jest.fn(),
    },
    accountingBook: {
      findFirst: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(mockPrismaService)),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PeriodicService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<PeriodicService>(PeriodicService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a recurring transaction if book is owned', async () => {
      const dto: any = {
        description: 'Test',
        amount: 100,
        startDate: new Date(),
        accountingBookId: 1,
      };
      mockPrismaService.accountingBook.findFirst.mockResolvedValue({ id: 1 });
      mockPrismaService.recurringTransaction.create.mockResolvedValue({
        id: 1,
        ...dto,
      });
      expect(await service.create(1, dto)).toEqual({ id: 1, ...dto });
    });

    it('should return null if book is not owned by user', async () => {
      const dto: any = {
        description: 'Test',
        amount: 100,
        startDate: new Date(),
        accountingBookId: 99,
      };
      mockPrismaService.accountingBook.findFirst.mockResolvedValue(null);
      expect(await service.create(1, dto)).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should find all for user', async () => {
      const list = [{ id: 1 }];
      mockPrismaService.recurringTransaction.findMany.mockResolvedValue(list);
      expect(await service.findAll(1)).toEqual(list);
    });
  });

  describe('findOne', () => {
    it('should find one', async () => {
      const rec = { id: 1, userId: 1 };
      mockPrismaService.recurringTransaction.findFirst.mockResolvedValue(rec);
      expect(await service.findOne(1, 1)).toEqual(rec);
    });
  });

  describe('remove', () => {
    it('should remove and return result', async () => {
      const result = { count: 1 };
      mockPrismaService.recurringTransaction.deleteMany.mockResolvedValue(
        result,
      );
      expect(await service.remove(1, 1)).toEqual(result);
    });
  });

  describe('processPending', () => {
    it('should process pending transactions', async () => {
      const pending = [
        {
          id: 1,
          description: 'Rec',
          amount: 100,
          type: 'EXPENSE',
          nextRunDate: new Date(),
          frequency: Frequency.MONTHLY,
          accountingBookId: 1,
        },
      ];
      mockPrismaService.recurringTransaction.findMany.mockResolvedValue(
        pending,
      );

      const result = await service.processPending(1);
      expect(result).toEqual({ processed: 1 });
      expect(mockPrismaService.transaction.create).toHaveBeenCalled();
      expect(mockPrismaService.recurringTransaction.update).toHaveBeenCalled();
    });
  });

  describe('handleCron', () => {
    it('should call processPending', async () => {
      const spy = jest
        .spyOn(service, 'processPending')
        .mockResolvedValue({ processed: 0 });
      await service.handleCron();
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('calculateNextDate', () => {
    it('should handle DAILY frequency', async () => {
      const pending = [
        {
          id: 1,
          description: 'Rec',
          amount: 100,
          type: 'EXPENSE',
          nextRunDate: new Date('2023-01-01'),
          frequency: Frequency.DAILY,
          accountingBookId: 1,
        },
      ];
      mockPrismaService.recurringTransaction.findMany.mockResolvedValue(
        pending,
      );
      await service.processPending();
      expect(
        mockPrismaService.recurringTransaction.update,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            nextRunDate: new Date('2023-01-02'),
          }),
        }),
      );
    });

    it('should handle WEEKLY frequency', async () => {
      const pending = [
        {
          id: 1,
          description: 'Rec',
          amount: 100,
          type: 'EXPENSE',
          nextRunDate: new Date('2023-01-01'),
          frequency: Frequency.WEEKLY,
          accountingBookId: 1,
        },
      ];
      mockPrismaService.recurringTransaction.findMany.mockResolvedValue(
        pending,
      );
      await service.processPending();
      expect(
        mockPrismaService.recurringTransaction.update,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            nextRunDate: new Date('2023-01-08'),
          }),
        }),
      );
    });

    it('should handle YEARLY frequency', async () => {
      const pending = [
        {
          id: 1,
          description: 'Rec',
          amount: 100,
          type: 'EXPENSE',
          nextRunDate: new Date('2023-01-01'),
          frequency: Frequency.YEARLY,
          accountingBookId: 1,
        },
      ];
      mockPrismaService.recurringTransaction.findMany.mockResolvedValue(
        pending,
      );
      await service.processPending();
      expect(
        mockPrismaService.recurringTransaction.update,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            nextRunDate: new Date('2024-01-01'),
          }),
        }),
      );
    });
  });
});
