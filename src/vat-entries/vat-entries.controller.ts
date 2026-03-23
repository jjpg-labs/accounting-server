import { Controller, Get, Post, Body, Query, Req, Res, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { VatEntriesService } from './vat-entries.service';
import { UpsertVatEntryDto } from './dto/upsert-vat-entry.dto';

@Controller('vat-entries')
export class VatEntriesController {
  constructor(private readonly vatEntriesService: VatEntriesService) {}

  @Get()
  async getMonthEntries(
    @Query('accountingBookId') accountingBookId: string,
    @Query('year') year: string,
    @Query('month') month: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    if (!accountingBookId || !year || !month) {
      return res.status(HttpStatus.BAD_REQUEST).json({ message: 'Missing required params' });
    }
    try {
      const entries = await this.vatEntriesService.getMonthEntries(
        Number(accountingBookId),
        Number(year),
        Number(month),
        req.user.sub,
      );
      return res.status(HttpStatus.OK).json(entries);
    } catch {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
    }
  }

  @Post()
  async upsertEntry(
    @Body() dto: UpsertVatEntryDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const entry = await this.vatEntriesService.upsertEntry(
        Number(dto.accountingBookId),
        req.user.sub,
        dto.date,
        dto.vat21 ?? '0',
        dto.vat10 ?? '0',
        dto.vat4 ?? '0',
      );
      if (!entry) return res.status(HttpStatus.FORBIDDEN).json({ message: 'Book not found or access denied' });
      return res.status(HttpStatus.OK).json(entry);
    } catch {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
    }
  }
}
