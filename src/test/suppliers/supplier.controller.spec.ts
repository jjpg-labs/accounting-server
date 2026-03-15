import { Test, TestingModule } from '@nestjs/testing';
import { SupplierController } from '../../suppliers/supplier.controller';
import { SupplierService } from '../../suppliers/supplier.service';
import { Prisma } from '@prisma/client';
import { Response } from 'express';
import { HttpStatus } from '@nestjs/common';

const USER_ID = 1;

describe('SupplierController', () => {
  let controller: SupplierController;
  let service: SupplierService;
  let mockResponse: Partial<Response>;
  const mockRequest = { user: { sub: USER_ID } };

  const mockSupplierService = {
    create: jest.fn((userId: number, data) => ({ id: 1, userId, ...data })),
    update: jest.fn((id: number, data, userId: number) => ({ id, userId, ...data })),
    get: jest.fn((id: number, userId: number) => ({ id, userId, name: 'Test Supplier' })),
    getAll: jest.fn((userId: number) => [
      { id: 1, name: 'Supplier 1', userId },
      { id: 2, name: 'Supplier 2', userId },
    ]),
    delete: jest.fn((id: number, userId: number) => ({ id, userId, name: 'Deleted Supplier' })),
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
      const data: Prisma.SupplierUncheckedCreateInput = { name: 'Test Supplier', userId: USER_ID };
      const result = mockSupplierService.create(USER_ID, data);
      await controller.createSupplier(data, mockRequest as any, mockResponse as Response);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CREATED);
      expect(mockResponse.json).toHaveBeenCalledWith(result);
      expect(mockSupplierService.create).toHaveBeenCalledWith(USER_ID, data);
    });

    it('should return bad request if create fails', async () => {
      jest.spyOn(service, 'create').mockRejectedValue(new Error());
      await controller.createSupplier({ name: 'Test' } as any, mockRequest as any, mockResponse as Response);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Unknown error' });
    });

    it('should return bad request if creation returns null', async () => {
      jest.spyOn(service, 'create').mockResolvedValue(null);
      await controller.createSupplier({ name: 'Test' } as any, mockRequest as any, mockResponse as Response);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Supplier not created' });
    });
  });

  describe('updateSupplier', () => {
    it('should update a supplier', async () => {
      const id = 1;
      const data: Prisma.SupplierUncheckedUpdateInput = { id, name: 'Test Supplier' };
      const result = mockSupplierService.update(id, data, USER_ID);
      await controller.updateSupplier(data, mockRequest as any, mockResponse as Response);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith(result);
      expect(mockSupplierService.update).toHaveBeenCalledWith(id, data, USER_ID);
    });

    it('should return bad request if id is not a number', async () => {
      await controller.updateSupplier(
        { id: '1', name: 'Test' } as any,
        mockRequest as any,
        mockResponse as Response,
      );
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Supplier id is required' });
    });

    it('should return bad request if update throws', async () => {
      jest.spyOn(service, 'update').mockRejectedValue(new Error());
      await controller.updateSupplier({ id: 1, name: 'Test' }, mockRequest as any, mockResponse as Response);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Unknown error' });
    });

    it('should return bad request if update returns null', async () => {
      jest.spyOn(service, 'update').mockResolvedValue(null);
      await controller.updateSupplier({ id: 1, name: 'Test' }, mockRequest as any, mockResponse as Response);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Supplier not updated' });
    });
  });

  describe('getSupplier', () => {
    it('should get a supplier', async () => {
      const id = 1;
      const result = mockSupplierService.get(id, USER_ID);
      await controller.getSupplier(id, mockRequest as any, mockResponse as Response);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith(result);
      expect(mockSupplierService.get).toHaveBeenCalledWith(id, USER_ID);
    });

    it('should return not found if supplier not found', async () => {
      jest.spyOn(service, 'get').mockResolvedValue(null);
      await controller.getSupplier(1, mockRequest as any, mockResponse as Response);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Supplier not found' });
    });

    it('should return bad request if an error occurs', async () => {
      jest.spyOn(service, 'get').mockRejectedValue(new Error());
      await controller.getSupplier(1, mockRequest as any, mockResponse as Response);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Unknown error' });
    });
  });

  describe('getSuppliers', () => {
    it('should get all suppliers', async () => {
      const result = mockSupplierService.getAll(USER_ID);
      await controller.getSuppliers(mockRequest as any, mockResponse as Response);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith(result);
      expect(mockSupplierService.getAll).toHaveBeenCalledWith(USER_ID);
    });

    it('should return not found if no suppliers found', async () => {
      jest.spyOn(service, 'getAll').mockResolvedValue(null);
      await controller.getSuppliers(mockRequest as any, mockResponse as Response);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Suppliers not found' });
    });

    it('should return bad request if an error occurs', async () => {
      jest.spyOn(service, 'getAll').mockRejectedValue(new Error());
      await controller.getSuppliers(mockRequest as any, mockResponse as Response);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Unknown error' });
    });
  });

  describe('deleteSupplier', () => {
    it('should delete a supplier', async () => {
      const id = 1;
      const result = mockSupplierService.delete(id, USER_ID);
      await controller.deleteSupplier(id, mockRequest as any, mockResponse as Response);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith(result);
      expect(mockSupplierService.delete).toHaveBeenCalledWith(id, USER_ID);
    });

    it('should return not found if supplier not found', async () => {
      jest.spyOn(service, 'delete').mockResolvedValue(null);
      await controller.deleteSupplier(1, mockRequest as any, mockResponse as Response);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Supplier not found' });
    });

    it('should return bad request if an error occurs', async () => {
      jest.spyOn(service, 'delete').mockRejectedValue(new Error());
      await controller.deleteSupplier(1, mockRequest as any, mockResponse as Response);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Unknown error' });
    });
  });
});
