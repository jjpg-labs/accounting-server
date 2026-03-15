import { Test, TestingModule } from '@nestjs/testing';
import { SupplierService } from '../../suppliers/supplier.service';
import { PrismaService } from '../../services/prisma.service';

const USER_ID = 1;

const makeSupplier = (overrides = {}) => ({
  id: 1,
  name: 'Test Supplier',
  userId: USER_ID,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe('SupplierService', () => {
  let service: SupplierService;

  const mockPrismaService = {
    supplier: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SupplierService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<SupplierService>(SupplierService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a supplier with userId injected', async () => {
      const supplier = makeSupplier();
      mockPrismaService.supplier.create.mockResolvedValue(supplier);
      expect(await service.create(USER_ID, { name: 'Test Supplier' } as any)).toEqual(supplier);
      expect(mockPrismaService.supplier.create).toHaveBeenCalledWith({
        data: { name: 'Test Supplier', userId: USER_ID },
      });
    });

    it('should return null if creation fails', async () => {
      mockPrismaService.supplier.create.mockRejectedValue(new Error());
      expect(await service.create(USER_ID, { name: 'Test Supplier' } as any)).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a supplier if owned by user', async () => {
      const supplier = makeSupplier({ name: 'Updated Supplier' });
      mockPrismaService.supplier.findFirst.mockResolvedValue({ id: 1 });
      mockPrismaService.supplier.update.mockResolvedValue(supplier);
      expect(await service.update(1, { name: 'Updated Supplier' }, USER_ID)).toEqual(supplier);
    });

    it('should return null if not owned by user', async () => {
      mockPrismaService.supplier.findFirst.mockResolvedValue(null);
      expect(await service.update(1, { name: 'Updated Supplier' }, USER_ID)).toBeNull();
    });

    it('should return null if an error occurs', async () => {
      mockPrismaService.supplier.findFirst.mockRejectedValue(new Error());
      expect(await service.update(1, { name: 'Updated Supplier' }, USER_ID)).toBeNull();
    });
  });

  describe('get', () => {
    it('should return a supplier by id and userId', async () => {
      const supplier = makeSupplier();
      mockPrismaService.supplier.findFirst.mockResolvedValue(supplier);
      expect(await service.get(1, USER_ID)).toEqual(supplier);
      expect(mockPrismaService.supplier.findFirst).toHaveBeenCalledWith({
        where: { id: 1, userId: USER_ID },
      });
    });

    it('should return null if not found', async () => {
      mockPrismaService.supplier.findFirst.mockResolvedValue(null);
      expect(await service.get(99, USER_ID)).toBeNull();
    });

    it('should return null if an error occurs', async () => {
      mockPrismaService.supplier.findFirst.mockRejectedValue(new Error());
      expect(await service.get(1, USER_ID)).toBeNull();
    });
  });

  describe('getAll', () => {
    it('should return all suppliers for a user', async () => {
      const suppliers = [makeSupplier()];
      mockPrismaService.supplier.findMany.mockResolvedValue(suppliers);
      expect(await service.getAll(USER_ID)).toEqual(suppliers);
    });

    it('should return an empty array if none found', async () => {
      mockPrismaService.supplier.findMany.mockResolvedValue([]);
      expect(await service.getAll(USER_ID)).toEqual([]);
    });

    it('should return an empty array if an error occurs', async () => {
      mockPrismaService.supplier.findMany.mockRejectedValue(new Error());
      expect(await service.getAll(USER_ID)).toEqual([]);
    });
  });

  describe('delete', () => {
    it('should delete a supplier if owned by user', async () => {
      const supplier = makeSupplier();
      mockPrismaService.supplier.findFirst.mockResolvedValue({ id: 1 });
      mockPrismaService.supplier.delete.mockResolvedValue(supplier);
      expect(await service.delete(1, USER_ID)).toEqual(supplier);
    });

    it('should return null if not owned by user', async () => {
      mockPrismaService.supplier.findFirst.mockResolvedValue(null);
      expect(await service.delete(1, USER_ID)).toBeNull();
    });

    it('should return null if an error occurs', async () => {
      mockPrismaService.supplier.findFirst.mockRejectedValue(new Error());
      expect(await service.delete(1, USER_ID)).toBeNull();
    });
  });
});
