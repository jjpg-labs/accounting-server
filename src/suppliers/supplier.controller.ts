import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Post,
  Put,
  Query,
  Res,
} from '@nestjs/common';
import { SupplierService } from './supplier.service';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

@Controller('supplier')
export class SupplierController {
  constructor(private readonly supplierService: SupplierService) {}

  @Post()
  async createSupplier(
    @Body() data: Prisma.SupplierCreateInput,
    @Res() res: Response,
  ) {
    try {
      const newSupplier = (await this.supplierService.create(data)) || {
        message: 'Supplier not created',
      };
      const status =
        'message' in newSupplier ? HttpStatus.BAD_REQUEST : HttpStatus.CREATED;
      res.status(status).json(newSupplier);
    } catch (error) {
      res.status(HttpStatus.BAD_REQUEST).json({ message: 'Unknown error' });
    }
  }

  @Put()
  async updateSupplier(
    @Body() data: Prisma.SupplierUncheckedUpdateInput,
    @Res() res: Response,
  ) {
    if (typeof data.id !== 'number') {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: 'Supplier id is required' });
    }

    try {
      const supplier = (await this.supplierService.update(data.id, data)) || {
        message: 'Supplier not updated',
      };
      const status =
        'message' in supplier ? HttpStatus.BAD_REQUEST : HttpStatus.OK;
      res.status(status).json(supplier);
    } catch (error) {
      res.status(HttpStatus.BAD_REQUEST).json({ message: 'Unknown error' });
    }
  }

  @Get()
  async getSupplier(@Query('id') id: number, @Res() res: Response) {
    try {
      const supplier = (await this.supplierService.get(id)) || {
        message: 'Supplier not found',
      };
      const status =
        'message' in supplier ? HttpStatus.NOT_FOUND : HttpStatus.OK;
      res.status(status).json(supplier);
    } catch (error) {
      res.status(HttpStatus.BAD_REQUEST).json({ message: 'Unknown error' });
    }
  }

  @Get('all')
  async getSuppliers(@Query('userId') userId: number, @Res() res: Response) {
    try {
      const suppliers = (await this.supplierService.getAll(userId)) || {
        message: 'Suppliers not found',
      };
      const status =
        'message' in suppliers ? HttpStatus.NOT_FOUND : HttpStatus.OK;
      res.status(status).json(suppliers);
    } catch (error) {
      res.status(HttpStatus.BAD_REQUEST).json({ message: 'Unknown error' });
    }
  }

  @Delete()
  async deleteSupplier(@Query() id: number, @Res() res: Response) {
    try {
      const supplier = (await this.supplierService.delete(id)) || {
        message: 'Supplier not found',
      };
      const status =
        'message' in supplier ? HttpStatus.NOT_FOUND : HttpStatus.OK;
      res.status(status).json(supplier);
    } catch (error) {
      res.status(HttpStatus.BAD_REQUEST).json({ message: 'Unknown error' });
    }
  }
}
