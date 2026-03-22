import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import { NetWorthService } from '../../net-worth/net-worth.service';
import { PrismaService } from '../../services/prisma.service';

const mockPrismaService = {
  asset: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  liability: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('NetWorthService', () => {
  let service: NetWorthService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NetWorthService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<NetWorthService>(NetWorthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Assets
  describe('createAsset', () => {
    it('should create an asset', async () => {
      const dto = { name: 'Cuenta corriente', value: '5000', category: 'CASH' };
      const created = { id: 1, userId: 1, ...dto, value: new Prisma.Decimal('5000') };
      mockPrismaService.asset.create.mockResolvedValue(created);

      const result = await service.createAsset(1, dto as any);

      expect(result).toEqual(created);
      expect(mockPrismaService.asset.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ userId: 1, name: 'Cuenta corriente', category: 'CASH' }),
      });
    });
  });

  describe('findAllAssets', () => {
    it('should return assets ordered by category', async () => {
      const assets = [{ id: 1 }, { id: 2 }];
      mockPrismaService.asset.findMany.mockResolvedValue(assets);

      const result = await service.findAllAssets(1);

      expect(result).toEqual(assets);
      expect(mockPrismaService.asset.findMany).toHaveBeenCalledWith({
        where: { userId: 1 },
        orderBy: { category: 'asc' },
      });
    });
  });

  describe('updateAsset', () => {
    it('should update and return the asset', async () => {
      const existing = { id: 1, userId: 1, name: 'Old', value: new Prisma.Decimal('1000') };
      const updated = { id: 1, userId: 1, name: 'New', value: new Prisma.Decimal('2000') };
      mockPrismaService.asset.findFirst.mockResolvedValue(existing);
      mockPrismaService.asset.update.mockResolvedValue(updated);

      const result = await service.updateAsset(1, 1, { name: 'New', value: '2000' });

      expect(result).toEqual(updated);
      expect(mockPrismaService.asset.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 1 } }),
      );
    });

    it('should return null if asset does not belong to user', async () => {
      mockPrismaService.asset.findFirst.mockResolvedValue(null);

      expect(await service.updateAsset(1, 999, { name: 'X' })).toBeNull();
      expect(mockPrismaService.asset.update).not.toHaveBeenCalled();
    });
  });

  describe('removeAsset', () => {
    it('should delete and return the asset', async () => {
      const asset = { id: 1, userId: 1 };
      mockPrismaService.asset.findFirst.mockResolvedValue(asset);
      mockPrismaService.asset.delete.mockResolvedValue(asset);

      expect(await service.removeAsset(1, 1)).toEqual(asset);
      expect(mockPrismaService.asset.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should return null if asset not found', async () => {
      mockPrismaService.asset.findFirst.mockResolvedValue(null);

      expect(await service.removeAsset(99, 1)).toBeNull();
      expect(mockPrismaService.asset.delete).not.toHaveBeenCalled();
    });
  });

  // Liabilities
  describe('createLiability', () => {
    it('should create a liability', async () => {
      const dto = { name: 'Hipoteca', amount: '120000', category: 'MORTGAGE' };
      const created = { id: 1, userId: 1, ...dto, amount: new Prisma.Decimal('120000') };
      mockPrismaService.liability.create.mockResolvedValue(created);

      const result = await service.createLiability(1, dto as any);

      expect(result).toEqual(created);
      expect(mockPrismaService.liability.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ userId: 1, name: 'Hipoteca', category: 'MORTGAGE' }),
      });
    });
  });

  describe('findAllLiabilities', () => {
    it('should return liabilities ordered by category', async () => {
      const liabilities = [{ id: 1 }];
      mockPrismaService.liability.findMany.mockResolvedValue(liabilities);

      const result = await service.findAllLiabilities(1);

      expect(result).toEqual(liabilities);
      expect(mockPrismaService.liability.findMany).toHaveBeenCalledWith({
        where: { userId: 1 },
        orderBy: { category: 'asc' },
      });
    });
  });

  describe('updateLiability', () => {
    it('should update and return the liability', async () => {
      const existing = { id: 1, userId: 1 };
      const updated = { id: 1, userId: 1, name: 'Updated' };
      mockPrismaService.liability.findFirst.mockResolvedValue(existing);
      mockPrismaService.liability.update.mockResolvedValue(updated);

      const result = await service.updateLiability(1, 1, { name: 'Updated' });

      expect(result).toEqual(updated);
    });

    it('should return null if liability does not belong to user', async () => {
      mockPrismaService.liability.findFirst.mockResolvedValue(null);

      expect(await service.updateLiability(1, 999, { name: 'X' })).toBeNull();
      expect(mockPrismaService.liability.update).not.toHaveBeenCalled();
    });
  });

  describe('removeLiability', () => {
    it('should delete and return the liability', async () => {
      const liability = { id: 1, userId: 1 };
      mockPrismaService.liability.findFirst.mockResolvedValue(liability);
      mockPrismaService.liability.delete.mockResolvedValue(liability);

      expect(await service.removeLiability(1, 1)).toEqual(liability);
      expect(mockPrismaService.liability.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should return null if liability not found', async () => {
      mockPrismaService.liability.findFirst.mockResolvedValue(null);

      expect(await service.removeLiability(99, 1)).toBeNull();
      expect(mockPrismaService.liability.delete).not.toHaveBeenCalled();
    });
  });

  // Summary
  describe('getSummary', () => {
    it('should compute totals and net worth correctly', async () => {
      const assets = [
        { id: 1, value: new Prisma.Decimal('5000') },
        { id: 2, value: new Prisma.Decimal('15000') },
      ];
      const liabilities = [{ id: 1, amount: new Prisma.Decimal('8000') }];
      mockPrismaService.asset.findMany.mockResolvedValue(assets);
      mockPrismaService.liability.findMany.mockResolvedValue(liabilities);

      const result = await service.getSummary(1);

      expect(result.totalAssets).toBe(20000);
      expect(result.totalLiabilities).toBe(8000);
      expect(result.netWorth).toBe(12000);
      expect(result.assets).toEqual(assets);
      expect(result.liabilities).toEqual(liabilities);
    });

    it('should return zeros when user has no assets or liabilities', async () => {
      mockPrismaService.asset.findMany.mockResolvedValue([]);
      mockPrismaService.liability.findMany.mockResolvedValue([]);

      const result = await service.getSummary(1);

      expect(result).toEqual({ totalAssets: 0, totalLiabilities: 0, netWorth: 0, assets: [], liabilities: [] });
    });

    it('should return negative net worth when liabilities exceed assets', async () => {
      mockPrismaService.asset.findMany.mockResolvedValue([{ value: new Prisma.Decimal('1000') }]);
      mockPrismaService.liability.findMany.mockResolvedValue([{ amount: new Prisma.Decimal('5000') }]);

      const result = await service.getSummary(1);

      expect(result.netWorth).toBe(-4000);
    });
  });
});
