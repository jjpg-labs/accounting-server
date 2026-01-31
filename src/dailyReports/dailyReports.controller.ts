import { Controller, Get, HttpStatus, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { DailyReportsService } from './dailyReports.service';

@Controller('daily-reports')
export class DailyReportsController {
  constructor(private readonly dailyReportsService: DailyReportsService) {}

  @Get()
  async getReport(
    @Query('accountingBookId') accountingBookId: number,
    @Query('date') date: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Res() res: Response,
  ) {
    try {
      if (startDate && endDate) {
        const reports = await this.dailyReportsService.getReports(
          accountingBookId,
          startDate,
          endDate,
        );
        return res.status(HttpStatus.OK).json(reports);
      } else if (date) {
        const report = await this.dailyReportsService.getReport(
          accountingBookId,
          date,
        );
        if (!report) {
          return res
            .status(HttpStatus.NOT_FOUND)
            .json({ message: 'Report not found' });
        }
        return res.status(HttpStatus.OK).json(report);
      } else {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json({ message: 'Invalid query parameters' });
      }
    } catch {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: 'Failed to fetch report(s)' });
    }
  }
}
