import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import { DailyReportsService } from '../../dailyReports/dailyReports.service';
import { PrismaService } from '../../services/prisma.service';

const USER_ID = 1;

describe('DailyReportsService', () => {
  let service: DailyReportsService;

  const mockPrismaService = {
    transaction: {
      aggregate: jest.fn(),
    },
    dailyReport: {
      upsert: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DailyReportsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<DailyReportsService>(DailyReportsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('closeDay', () => {
    it('should upsert a daily report', async () => {
      const date = '2023-01-01';
      const payload = { closingBalance: '100.00' };
      const bookId = 1;

      mockPrismaService.transaction.aggregate
        .mockResolvedValueOnce({ _sum: { amount: new Prisma.Decimal(50) } })
        .mockResolvedValueOnce({ _sum: { amount: new Prisma.Decimal(20) } });

      mockPrismaService.dailyReport.upsert.mockResolvedValue({ id: 1 });

      const result = await service.closeDay(bookId, date, payload);
      expect(result).toEqual({ id: 1 });
      expect(mockPrismaService.transaction.aggregate).toHaveBeenCalledTimes(2);
    });

    it('should handle closeDay with no transactions', async () => {
      const accountingBookId = 1;
      const date = '2023-01-01';
      mockPrismaService.transaction.aggregate.mockResolvedValue({
        _sum: { amount: null },
      });
      mockPrismaService.dailyReport.upsert.mockResolvedValue({});

      await service.closeDay(accountingBookId, date, { closingBalance: '0' });

      expect(mockPrismaService.dailyReport.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({
            totalIncome: expect.any(Prisma.Decimal),
            totalExpense: expect.any(Prisma.Decimal),
          }),
        }),
      );
    });
  });

  describe('getReport', () => {
    it('should return a report for user', async () => {
      const report = { id: 1, accountingBookId: 1, date: new Date() };
      mockPrismaService.dailyReport.findFirst.mockResolvedValue(report);
      expect(await service.getReport(1, '2023-01-01', USER_ID)).toEqual(report);
    });

    it('should return null if not found', async () => {
      mockPrismaService.dailyReport.findFirst.mockResolvedValue(null);
      expect(await service.getReport(1, '2023-01-01', USER_ID)).toBeNull();
    });
  });

  describe('getReports', () => {
    it('should return reports in range for user', async () => {
      const reports = [{ id: 1 }];
      mockPrismaService.dailyReport.findMany.mockResolvedValue(reports);
      expect(
        await service.getReports(1, '2023-01-01', '2023-01-02', USER_ID),
      ).toEqual(reports);
    });
  });
});
