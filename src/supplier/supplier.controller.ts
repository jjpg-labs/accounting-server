import { Body, Controller, Delete, Get, Post, Put, Query } from '@nestjs/common';
import { SupplierService } from './supplier.service';
import { Prisma, Supplier } from '@prisma/client';

@Controller('supplier')
export class SupplierController {
	constructor(
		private readonly supplierService: SupplierService
	) { }

	@Post()
	async createSupplier(
		@Body() data: Prisma.SupplierCreateInput
	): Promise<Supplier> {
		return this.supplierService.create(data);
	}

	@Put()
	async updateSupplier(
		@Query('id') id: number,
		@Body() data: Prisma.SupplierUpdateInput
	): Promise<Supplier> {
		return this.supplierService.update(id, data);
	}

	@Get()
	async getSupplier(
		@Query('id') id: number
	): Promise<Supplier> {
		return this.supplierService.get(id);
	}

	@Get('all')
	async getSuppliers(
		@Query('userId') userId: number
	): Promise<Supplier[]> {
		return this.supplierService.getAll(userId);
	}

	@Delete()
	async deleteSupplier(
		@Query() id: number
	): Promise<Supplier> {
		return this.supplierService.delete(id);
	}
}
