import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from '../../auth/auth.guard';
import { NetWorthController } from '../../net-worth/net-worth.controller';
import { NetWorthService } from '../../net-worth/net-worth.service';

const mockNetWorthService = {
  getSummary: jest.fn(),
  createAsset: jest.fn(),
  updateAsset: jest.fn(),
  removeAsset: jest.fn(),
  createLiability: jest.fn(),
  updateLiability: jest.fn(),
  removeLiability: jest.fn(),
};

const mockRequest = { user: { sub: 1 } };

describe('NetWorthController', () => {
  let controller: NetWorthController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NetWorthController],
      providers: [{ provide: NetWorthService, useValue: mockNetWorthService }],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<NetWorthController>(NetWorthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getSummary', () => {
    it('should return the net worth summary', async () => {
      const summary = { totalAssets: 20000, totalLiabilities: 8000, netWorth: 12000, assets: [], liabilities: [] };
      mockNetWorthService.getSummary.mockResolvedValue(summary);

      expect(await controller.getSummary(mockRequest as any)).toEqual(summary);
      expect(mockNetWorthService.getSummary).toHaveBeenCalledWith(1);
    });
  });

  // Assets
  describe('createAsset', () => {
    it('should create an asset', async () => {
      const dto = { name: 'Cuenta', value: '5000', category: 'CASH' };
      mockNetWorthService.createAsset.mockResolvedValue({ id: 1, ...dto });

      const result = await controller.createAsset(mockRequest as any, dto as any);

      expect(result).toEqual({ id: 1, ...dto });
      expect(mockNetWorthService.createAsset).toHaveBeenCalledWith(1, dto);
    });
  });

  describe('updateAsset', () => {
    it('should update an asset', async () => {
      const updated = { id: 1, name: 'Updated' };
      mockNetWorthService.updateAsset.mockResolvedValue(updated);

      const result = await controller.updateAsset(mockRequest as any, 1, { name: 'Updated' } as any);

      expect(result).toEqual(updated);
      expect(mockNetWorthService.updateAsset).toHaveBeenCalledWith(1, 1, { name: 'Updated' });
    });

    it('should throw NotFoundException when asset not found', async () => {
      mockNetWorthService.updateAsset.mockResolvedValue(null);

      await expect(controller.updateAsset(mockRequest as any, 99, {} as any)).rejects.toThrow(NotFoundException);
    });
  });

  describe('removeAsset', () => {
    it('should delete an asset', async () => {
      mockNetWorthService.removeAsset.mockResolvedValue({ id: 1 });

      expect(await controller.removeAsset(mockRequest as any, 1)).toEqual({ id: 1 });
      expect(mockNetWorthService.removeAsset).toHaveBeenCalledWith(1, 1);
    });

    it('should throw NotFoundException when asset not found', async () => {
      mockNetWorthService.removeAsset.mockResolvedValue(null);

      await expect(controller.removeAsset(mockRequest as any, 99)).rejects.toThrow(NotFoundException);
    });
  });

  // Liabilities
  describe('createLiability', () => {
    it('should create a liability', async () => {
      const dto = { name: 'Hipoteca', amount: '120000', category: 'MORTGAGE' };
      mockNetWorthService.createLiability.mockResolvedValue({ id: 1, ...dto });

      const result = await controller.createLiability(mockRequest as any, dto as any);

      expect(result).toEqual({ id: 1, ...dto });
      expect(mockNetWorthService.createLiability).toHaveBeenCalledWith(1, dto);
    });
  });

  describe('updateLiability', () => {
    it('should update a liability', async () => {
      const updated = { id: 1, name: 'Updated' };
      mockNetWorthService.updateLiability.mockResolvedValue(updated);

      const result = await controller.updateLiability(mockRequest as any, 1, { name: 'Updated' } as any);

      expect(result).toEqual(updated);
      expect(mockNetWorthService.updateLiability).toHaveBeenCalledWith(1, 1, { name: 'Updated' });
    });

    it('should throw NotFoundException when liability not found', async () => {
      mockNetWorthService.updateLiability.mockResolvedValue(null);

      await expect(controller.updateLiability(mockRequest as any, 99, {} as any)).rejects.toThrow(NotFoundException);
    });
  });

  describe('removeLiability', () => {
    it('should delete a liability', async () => {
      mockNetWorthService.removeLiability.mockResolvedValue({ id: 1 });

      expect(await controller.removeLiability(mockRequest as any, 1)).toEqual({ id: 1 });
      expect(mockNetWorthService.removeLiability).toHaveBeenCalledWith(1, 1);
    });

    it('should throw NotFoundException when liability not found', async () => {
      mockNetWorthService.removeLiability.mockResolvedValue(null);

      await expect(controller.removeLiability(mockRequest as any, 99)).rejects.toThrow(NotFoundException);
    });
  });
});
