import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { CategoriesController } from '../../categories/categories.controller';
import { CategoriesService } from '../../categories/categories.service';

describe('CategoriesController', () => {
  let controller: CategoriesController;

  const mockCategoriesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockResponse = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [
        { provide: CategoriesService, useValue: mockCategoriesService },
      ],
    }).compile();

    controller = module.get<CategoriesController>(CategoriesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a category', async () => {
      const dto = { name: 'Test', accountingBookId: 1 };
      mockCategoriesService.create.mockResolvedValue(dto);
      await controller.create(dto, mockResponse as any as Response);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CREATED);
      expect(mockResponse.json).toHaveBeenCalledWith(dto);
    });

    it('should return bad request on error', async () => {
      mockCategoriesService.create.mockRejectedValue(new Error());
      await controller.create({} as any, mockResponse as any as Response);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    });
  });

  describe('findAll', () => {
    it('should return categories', async () => {
      const result = [{ id: 1, name: 'Test' }];
      mockCategoriesService.findAll.mockResolvedValue(result);
      await controller.findAll(1, mockResponse as any as Response);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith(result);
    });

    it('should return bad request on error', async () => {
      mockCategoriesService.findAll.mockRejectedValue(new Error());
      await controller.findAll(1, mockResponse as any as Response);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    });
  });

  describe('findOne', () => {
    it('should return a category', async () => {
      const result = { id: 1, name: 'Test' };
      mockCategoriesService.findOne.mockResolvedValue(result);
      await controller.findOne(1, mockResponse as any as Response);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith(result);
    });

    it('should return not found if category does not exist', async () => {
      mockCategoriesService.findOne.mockResolvedValue(null);
      await controller.findOne(1, mockResponse as any as Response);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    });

    it('should return bad request on error', async () => {
      mockCategoriesService.findOne.mockRejectedValue(new Error());
      await controller.findOne(1, mockResponse as any as Response);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    });
  });

  describe('update', () => {
    it('should update a category', async () => {
      const result = { id: 1, name: 'Updated' };
      mockCategoriesService.update.mockResolvedValue(result);
      await controller.update(
        1,
        { name: 'Updated' },
        mockResponse as any as Response,
      );
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith(result);
    });

    it('should return bad request on error', async () => {
      mockCategoriesService.update.mockRejectedValue(new Error());
      await controller.update(1, {}, mockResponse as any as Response);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    });
  });

  describe('remove', () => {
    it('should delete a category', async () => {
      mockCategoriesService.remove.mockResolvedValue({ id: 1 });
      await controller.remove(1, mockResponse as any as Response);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Category deleted',
      });
    });

    it('should return bad request on error', async () => {
      mockCategoriesService.remove.mockRejectedValue(new Error());
      await controller.remove(1, mockResponse as any as Response);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    });
  });
});
