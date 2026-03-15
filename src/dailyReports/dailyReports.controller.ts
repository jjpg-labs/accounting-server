import { Controller, Get, HttpStatus, Query, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
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
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const userId = req.user.sub;
      if (startDate && endDate) {
        const reports = await this.dailyReportsService.getReports(
          accountingBookId,
          startDate,
          endDate,
          userId,
        );
        return res.status(HttpStatus.OK).json(reports);
      } else if (date) {
        const report = await this.dailyReportsService.getReport(
          accountingBookId,
          date,
          userId,
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
