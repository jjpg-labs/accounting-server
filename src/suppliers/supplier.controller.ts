import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Post,
  Put,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';
import { SupplierService } from './supplier.service';

@Controller('supplier')
export class SupplierController {
  constructor(private readonly supplierService: SupplierService) {}

  @Post()
  async createSupplier(
    @Body() data: Prisma.SupplierUncheckedCreateInput,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const newSupplier =
        (await this.supplierService.create(req.user.sub, data)) || {
          message: 'Supplier not created',
        };
      const status =
        'message' in newSupplier ? HttpStatus.BAD_REQUEST : HttpStatus.CREATED;
      res.status(status).json(newSupplier);
    } catch {
      res.status(HttpStatus.BAD_REQUEST).json({ message: 'Unknown error' });
    }
  }

  @Put()
  async updateSupplier(
    @Body() data: Prisma.SupplierUncheckedUpdateInput,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    if (typeof data.id !== 'number') {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: 'Supplier id is required' });
    }

    try {
      const supplier =
        (await this.supplierService.update(data.id, data, req.user.sub)) || {
          message: 'Supplier not updated',
        };
      const status =
        'message' in supplier ? HttpStatus.BAD_REQUEST : HttpStatus.OK;
      res.status(status).json(supplier);
    } catch {
      res.status(HttpStatus.BAD_REQUEST).json({ message: 'Unknown error' });
    }
  }

  @Get()
  async getSupplier(
    @Query('id') id: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const supplier =
        (await this.supplierService.get(id, req.user.sub)) || {
          message: 'Supplier not found',
        };
      const status =
        'message' in supplier ? HttpStatus.NOT_FOUND : HttpStatus.OK;
      res.status(status).json(supplier);
    } catch {
      res.status(HttpStatus.BAD_REQUEST).json({ message: 'Unknown error' });
    }
  }

  @Get('all')
  async getSuppliers(@Req() req: Request, @Res() res: Response) {
    try {
      const suppliers =
        (await this.supplierService.getAll(req.user.sub)) || {
          message: 'Suppliers not found',
        };
      const status =
        'message' in suppliers ? HttpStatus.NOT_FOUND : HttpStatus.OK;
      res.status(status).json(suppliers);
    } catch {
      res.status(HttpStatus.BAD_REQUEST).json({ message: 'Unknown error' });
    }
  }

  @Delete()
  async deleteSupplier(
    @Query('id') id: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const supplier =
        (await this.supplierService.delete(id, req.user.sub)) || {
          message: 'Supplier not found',
        };
      const status =
        'message' in supplier ? HttpStatus.NOT_FOUND : HttpStatus.OK;
      res.status(status).json(supplier);
    } catch {
      res.status(HttpStatus.BAD_REQUEST).json({ message: 'Unknown error' });
    }
  }
}
