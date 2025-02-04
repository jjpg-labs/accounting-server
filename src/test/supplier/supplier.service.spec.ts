import { Test, TestingModule } from '@nestjs/testing';
import { SupplierService } from '../../supplier/supplier.service';
import { PrismaService } from '../../services/prisma.service';
import { Prisma, Supplier } from '@prisma/client';

describe('SupplierService', () => {
  let service: SupplierService;
  let prisma: PrismaService;

  const user: Prisma.UserCreateNestedOneWithoutSuppliersInput = {
    connect: { id: 1 },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SupplierService, PrismaService],
    }).compile();

    service = module.get<SupplierService>(SupplierService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a supplier', async () => {
      const supplierData: Prisma.SupplierCreateInput = {
        name: 'Test Supplier',
        user,
      };
      const createdSupplier: Supplier = {
        id: 1,
        name: 'Test Supplier',
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(prisma.supplier, 'create').mockResolvedValue(createdSupplier);

      expect(await service.create(supplierData)).toEqual(createdSupplier);
    });
  });

  describe('update', () => {
    it('should update a supplier', async () => {
      const supplierData: Prisma.SupplierUpdateInput = {
        name: 'Updated Supplier',
      };
      const updatedSupplier: Supplier = {
        id: 1,
        name: 'Updated Supplier',
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(prisma.supplier, 'update').mockResolvedValue(updatedSupplier);

      expect(await service.update(1, supplierData)).toEqual(updatedSupplier);
    });
  });

  describe('get', () => {
    it('should return a supplier by id', async () => {
      const supplier: Supplier = {
        id: 1,
        name: 'Test Supplier',
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(prisma.supplier, 'findUnique').mockResolvedValue(supplier);

      expect(await service.get(1)).toEqual(supplier);
    });
  });

  describe('getAll', () => {
    it('should return all suppliers for a user', async () => {
      const suppliers: Supplier[] = [
        {
          id: 1,
          name: 'Supplier 1',
          userId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          name: 'Supplier 2',
          userId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      jest.spyOn(prisma.supplier, 'findMany').mockResolvedValue(suppliers);

      expect(await service.getAll(1)).toEqual(suppliers);
    });
  });

  describe('delete', () => {
    it('should delete a supplier by id', async () => {
      const supplier: Supplier = {
        id: 1,
        name: 'Test Supplier',
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(prisma.supplier, 'delete').mockResolvedValue(supplier);

      expect(await service.delete(1)).toEqual(supplier);
    });
  });
});
