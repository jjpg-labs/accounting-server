import { Test, TestingModule } from '@nestjs/testing';
import { SupplierService } from '../../supplier/supplier.service';
import { SupplierController } from '../../supplier/supplier.controller';
import { PrismaService } from '../../services/prisma.service';
import { TransactionModule } from '../../supplier/supplier.module';

describe('TransactionModule', () => {
	let supplierService: SupplierService;
	let prismaService: PrismaService;
	let supplierController: SupplierController;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [TransactionModule],
		}).compile();

		supplierService = module.get<SupplierService>(SupplierService);
		prismaService = module.get<PrismaService>(PrismaService);
		supplierController = module.get<SupplierController>(SupplierController);
	});

	it('should be defined', () => {
		expect(supplierService).toBeDefined();
		expect(prismaService).toBeDefined();
		expect(supplierController).toBeDefined();
	});
});