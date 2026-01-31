import { Test, TestingModule } from '@nestjs/testing';
import { SupplierService } from '../../suppliers/supplier.service';
import { SupplierController } from '../../suppliers/supplier.controller';
import { PrismaService } from '../../services/prisma.service';
import { SupplierModule } from '../../suppliers/supplier.module';

describe('SupplierModule', () => {
  let supplierService: SupplierService;
  let prismaService: PrismaService;
  let supplierController: SupplierController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [SupplierModule],
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
