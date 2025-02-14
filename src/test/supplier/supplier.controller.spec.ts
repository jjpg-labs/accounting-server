import { Test, TestingModule } from '@nestjs/testing';
import { SupplierController } from '../../supplier/supplier.controller';
import { SupplierService } from '../../supplier/supplier.service';
import { Prisma } from '@prisma/client';
import { Response } from 'express';
import { HttpStatus } from '@nestjs/common';

describe('SupplierController', () => {
  let controller: SupplierController;
  let service: SupplierService;
  let mockResponse: Partial<Response>;

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
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as Partial<Response>;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createSupplier', () => {
    it('should create a new supplier', async () => {
      const data: Prisma.SupplierCreateInput = {
        name: 'Test Supplier',
        user,
      };
      const result = mockSupplierService.create(data);

      await controller.createSupplier(data, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CREATED);
      expect(mockResponse.json).toHaveBeenCalledWith(result);
      expect(mockSupplierService.create).toHaveBeenCalledWith(data);
    });

    it('should return bad request if supplier create fails', async () => {
      const data: Prisma.SupplierCreateInput = {
        name: 'Test Supplier',
        user,
      };

      jest.spyOn(service, 'create').mockRejectedValue(new Error());
      await controller.createSupplier(data, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Unknown error' });
    });

    it('should return null if creation fails', async () => {
      const data: Prisma.SupplierCreateInput = {
        name: 'Test Supplier',
        user,
      };

      jest.spyOn(service, 'create').mockResolvedValue(null);
      await controller.createSupplier(data, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Supplier not created' });
    });
  });

  describe('updateSupplier', () => {
    it('should update a supplier', async () => {
      const id = 1;
      const data: Prisma.SupplierUncheckedUpdateInput = { id, name: 'Test Supplier' };
      const result = mockSupplierService.update(id, data);

      await controller.updateSupplier(data, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith(result);
      expect(mockSupplierService.update).toHaveBeenCalledWith(id, data);
    });

    it('should return bad request if supplier id is not a number', async () => {
      const data = { id: '1', name: 'Test Supplier' };

      await controller.updateSupplier(data as Prisma.UserUncheckedUpdateInput, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Supplier id is required' });
    });

    it('should return bad request if supplier update fails', async () => {
      const id = 1;
      const data: Prisma.SupplierUncheckedUpdateInput = { id, name: 'Test Supplier' };

      jest.spyOn(service, 'update').mockRejectedValue(new Error());
      await controller.updateSupplier(data, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Unknown error' });
    });

    it('should return null if update fails', async () => {
      const id = 1;
      const data: Prisma.SupplierUncheckedUpdateInput = { id, name: 'Test Supplier' };

      jest.spyOn(service, 'update').mockResolvedValue(null);
      await controller.updateSupplier(data, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Supplier not updated' });
    });
  });

  describe('getSupplier', () => {
    it('should get a supplier', async () => {
      const id = 1;
      const result = mockSupplierService.get(id);

      await controller.getSupplier(id, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith(result);
      expect(mockSupplierService.get).toHaveBeenCalledWith(id);
    });

    it('should return not found if supplier not found', async () => {
      const id = 1;

      jest.spyOn(service, 'get').mockResolvedValue(null);
      await controller.getSupplier(id, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Supplier not found' });
    });

    it('should return bad request if an error occurs', async () => {
      const id = 1;

      jest.spyOn(service, 'get').mockRejectedValue(new Error());
      await controller.getSupplier(id, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Unknown error' });
    });
  });

  describe('getAllSuppliers', () => {
    it('should get all suppliers', async () => {
      const userId = 1;
      const result = mockSupplierService.getAll(userId);

      await controller.getSuppliers(userId, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith(result);
      expect(mockSupplierService.getAll).toHaveBeenCalledWith(userId);
    });

    it('should return not found if no suppliers found', async () => {
      const userId = 1;

      jest.spyOn(service, 'getAll').mockResolvedValue(null);
      await controller.getSuppliers(userId, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Suppliers not found' });
    });

    it('should return bad request if an error occurs', async () => {
      const userId = 1;

      jest.spyOn(service, 'getAll').mockRejectedValue(new Error());
      await controller.getSuppliers(userId, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Unknown error' });
    });
  });

  describe('deleteSupplier', () => {
    it('should delete a supplier', async () => {
      const id = 1;
      const result = mockSupplierService.delete(id);

      await controller.deleteSupplier(id, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith(result);
      expect(mockSupplierService.delete).toHaveBeenCalledWith(id);
    });

    it('should return not found if supplier not found', async () => {
      const id = 1;

      jest.spyOn(service, 'delete').mockResolvedValue(null);
      await controller.deleteSupplier(id, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Supplier not found' });
    });

    it('should return bad request if an error occurs', async () => {
      const id = 1;

      jest.spyOn(service, 'delete').mockRejectedValue(new Error());
      await controller.deleteSupplier(id, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Unknown error' });
    });
  });
});
