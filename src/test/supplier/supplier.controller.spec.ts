import { Test, TestingModule } from '@nestjs/testing';
import { SupplierController } from '../../supplier/supplier.controller';
import { SupplierService } from '../../supplier/supplier.service';
import { Prisma } from '@prisma/client';

describe('SupplierController', () => {
  let controller: SupplierController;
  let service: SupplierService;

  const user: Prisma.UserCreateNestedOneWithoutSuppliersInput = {
    connect: { id: 1 },
  };

  const mockSupplierService = {
    create: jest.fn((data: Prisma.SupplierCreateInput) => {
      return { id: Date.now(), ...data };
    }),
    update: jest.fn((id: number, data: Prisma.SupplierUpdateInput) => {
      return { id, ...data };
    }),
    get: jest.fn((id: number) => {
      return { id, name: 'Test Supplier' };
    }),
    getAll: jest.fn((userId: number) => {
      return [
        { id: 1, name: 'Supplier 1' },
        { id: 2, name: 'Supplier 2' },
      ];
    }),
    delete: jest.fn((id: number) => {
      return { id, name: 'Deleted Supplier' };
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SupplierController],
      providers: [
        {
          provide: SupplierService,
          useValue: mockSupplierService,
        },
      ],
    }).compile();

    controller = module.get<SupplierController>(SupplierController);
    service = module.get<SupplierService>(SupplierService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a supplier', async () => {
    const data: Prisma.SupplierCreateInput = { name: 'New Supplier', user };
    expect(await controller.createSupplier(data)).toEqual({
      id: expect.any(Number),
      ...data,
    });
    expect(service.create).toHaveBeenCalledWith(data);
  });

  it('should update a supplier', async () => {
    const data: Prisma.SupplierUpdateInput = { name: 'Updated Supplier' };
    const id = 1;
    expect(await controller.updateSupplier(id, data)).toEqual({
      id,
      ...data,
    });
    expect(service.update).toHaveBeenCalledWith(id, data);
  });

  it('should get a supplier', async () => {
    const id = 1;
    expect(await controller.getSupplier(id)).toEqual({
      id,
      name: 'Test Supplier',
    });
    expect(service.get).toHaveBeenCalledWith(id);
  });

  it('should get all suppliers', async () => {
    const userId = 1;
    expect(await controller.getSuppliers(userId)).toEqual([
      { id: 1, name: 'Supplier 1' },
      { id: 2, name: 'Supplier 2' },
    ]);
    expect(service.getAll).toHaveBeenCalledWith(userId);
  });

  it('should delete a supplier', async () => {
    const id = 1;
    expect(await controller.deleteSupplier(id)).toEqual({
      id,
      name: 'Deleted Supplier',
    });
    expect(service.delete).toHaveBeenCalledWith(id);
  });
});
