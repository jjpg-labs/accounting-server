import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { DailyReportsController } from '../../dailyReports/dailyReports.controller';
import { DailyReportsService } from '../../dailyReports/dailyReports.service';

const USER_ID = 1;

describe('DailyReportsController', () => {
  let controller: DailyReportsController;

  const mockDailyReportsService = {
    getReport: jest.fn(),
    getReports: jest.fn(),
    closeDay: jest.fn(),
  };

  const mockResponse = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };

  const mockRequest = { user: { sub: USER_ID } };

  beforeEach(async () => {
    jest.clearAllMocks();
    mockResponse.status.mockReturnThis();
    mockResponse.json.mockReturnThis();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DailyReportsController],
      providers: [
        { provide: DailyReportsService, useValue: mockDailyReportsService },
      ],
    }).compile();

    controller = module.get<DailyReportsController>(DailyReportsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getReport', () => {
    it('should return reports list if range provided', async () => {
      const reports = [{ id: 1 }];
      mockDailyReportsService.getReports.mockResolvedValue(reports);
      await controller.getReport(
        1,
        '',
        '2023-01-01',
        '2023-01-02',
        mockRequest as any,
        mockResponse as any as Response,
      );
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith(reports);
    });

    it('should return single report if date provided', async () => {
      const report = { id: 1 };
      mockDailyReportsService.getReport.mockResolvedValue(report);
      await controller.getReport(
        1,
        '2023-01-01',
        '',
        '',
        mockRequest as any,
        mockResponse as any as Response,
      );
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith(report);
    });

    it('should return 404 if report not found', async () => {
      mockDailyReportsService.getReport.mockResolvedValue(null);
      await controller.getReport(
        1,
        '2023-01-01',
        '',
        '',
        mockRequest as any,
        mockResponse as any as Response,
      );
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    });

    it('should return bad request for invalid params', async () => {
      await controller.getReport(
        1,
        '',
        '',
        '',
        mockRequest as any,
        mockResponse as any as Response,
      );
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    });

    it('should return bad request on service error', async () => {
      mockDailyReportsService.getReports.mockRejectedValue(new Error());
      await controller.getReport(
        1,
        '',
        '2023-01-01',
        '2023-01-02',
        mockRequest as any,
        mockResponse as any as Response,
      );
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    });
  });

  describe('closeDay', () => {
    const closeBody = {
      accountingBookId: 1,
      date: '2023-01-01',
      closingBalance: '100.00',
    };

    it('should close the day and return the report', async () => {
      const report = { id: 1 };
      mockDailyReportsService.closeDay.mockResolvedValue(report);
      await controller.closeDay(closeBody, mockRequest as any, mockResponse as any as Response);
      expect(mockDailyReportsService.closeDay).toHaveBeenCalledWith(1, USER_ID, '2023-01-01', { closingBalance: '100.00' });
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith(report);
    });

    it('should return 403 when service returns null (ownership check failed)', async () => {
      mockDailyReportsService.closeDay.mockResolvedValue(null);
      await controller.closeDay(closeBody, mockRequest as any, mockResponse as any as Response);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
    });

    it('should return 400 on service error', async () => {
      mockDailyReportsService.closeDay.mockRejectedValue(new Error());
      await controller.closeDay(closeBody, mockRequest as any, mockResponse as any as Response);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    });
  });
});
