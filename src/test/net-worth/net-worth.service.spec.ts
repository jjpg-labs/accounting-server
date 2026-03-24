import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import { NetWorthService } from '../../net-worth/net-worth.service';
import { PrismaService } from '../../services/prisma.service';

const mockPrismaService = {
  accountingBook: {
    findFirst: jest.fn(),
    findMany: jest.fn(),
  },
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
  investmentPosition: {
    findMany: jest.fn(),
  },
  account: {
    findMany: jest.fn(),
  },
  transaction: {
    groupBy: jest.fn(),
    aggregate: jest.fn(),
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
    it('should create an asset when book belongs to user', async () => {
      const dto = { name: 'Cuenta corriente', value: '5000', category: 'CASH' };
      const created = { id: 1, userId: 1, accountingBookId: 10, ...dto, value: new Prisma.Decimal('5000') };
      mockPrismaService.accountingBook.findFirst.mockResolvedValue({ id: 10 });
      mockPrismaService.asset.create.mockResolvedValue(created);

      const result = await service.createAsset(1, 10, dto as any);

      expect(result).toEqual(created);
      expect(mockPrismaService.asset.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ userId: 1, accountingBookId: 10, name: 'Cuenta corriente', category: 'CASH' }),
      });
    });

    it('should return null if book does not belong to user', async () => {
      mockPrismaService.accountingBook.findFirst.mockResolvedValue(null);

      const result = await service.createAsset(999, 10, { name: 'X', value: '100', category: 'CASH' } as any);

      expect(result).toBeNull();
      expect(mockPrismaService.asset.create).not.toHaveBeenCalled();
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
    it('should create a liability when book belongs to user', async () => {
      const dto = { name: 'Hipoteca', amount: '120000', category: 'MORTGAGE' };
      const created = { id: 1, userId: 1, accountingBookId: 10, ...dto, amount: new Prisma.Decimal('120000') };
      mockPrismaService.accountingBook.findFirst.mockResolvedValue({ id: 10 });
      mockPrismaService.liability.create.mockResolvedValue(created);

      const result = await service.createLiability(1, 10, dto as any);

      expect(result).toEqual(created);
      expect(mockPrismaService.liability.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ userId: 1, accountingBookId: 10, name: 'Hipoteca', category: 'MORTGAGE' }),
      });
    });

    it('should return null if book does not belong to user', async () => {
      mockPrismaService.accountingBook.findFirst.mockResolvedValue(null);

      const result = await service.createLiability(999, 10, { name: 'X', amount: '100', category: 'MORTGAGE' } as any);

      expect(result).toBeNull();
      expect(mockPrismaService.liability.create).not.toHaveBeenCalled();
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
    beforeEach(() => {
      // Default: no accounts
      mockPrismaService.account.findMany.mockResolvedValue([]);
    });

    it('should compute totals and net worth correctly', async () => {
      const assets = [
        { id: 1, value: new Prisma.Decimal('5000') },
        { id: 2, value: new Prisma.Decimal('15000') },
      ];
      const liabilities = [{ id: 1, amount: new Prisma.Decimal('8000') }];
      const investments = [{ currentPrice: new Prisma.Decimal('100'), shares: new Prisma.Decimal('10') }];
      mockPrismaService.asset.findMany.mockResolvedValue(assets);
      mockPrismaService.liability.findMany.mockResolvedValue(liabilities);
      mockPrismaService.investmentPosition.findMany.mockResolvedValue(investments);

      const result = await service.getSummary(10, 1);

      expect(result.totalAssets).toBe(21000); // 20000 assets + 1000 investments
      expect(result.totalLiabilities).toBe(8000);
      expect(result.netWorth).toBe(13000);
      expect(result.investmentTotal).toBe(1000);
      expect(result.accountsTotal).toBe(0);
      expect(result.assets).toEqual(assets);
      expect(result.liabilities).toEqual(liabilities);
    });

    it('should return zeros when book has no assets, liabilities or investments', async () => {
      mockPrismaService.asset.findMany.mockResolvedValue([]);
      mockPrismaService.liability.findMany.mockResolvedValue([]);
      mockPrismaService.investmentPosition.findMany.mockResolvedValue([]);

      const result = await service.getSummary(10, 1);

      expect(result).toEqual({ totalAssets: 0, totalLiabilities: 0, netWorth: 0, assets: [], liabilities: [], investmentTotal: 0, accounts: [], accountsTotal: 0 });
    });

    it('should return negative net worth when liabilities exceed assets', async () => {
      mockPrismaService.asset.findMany.mockResolvedValue([{ value: new Prisma.Decimal('1000') }]);
      mockPrismaService.liability.findMany.mockResolvedValue([{ amount: new Prisma.Decimal('5000') }]);
      mockPrismaService.investmentPosition.findMany.mockResolvedValue([]);

      const result = await service.getSummary(10, 1);

      expect(result.netWorth).toBe(-4000);
    });

    it('should include account balances in totalAssets', async () => {
      mockPrismaService.asset.findMany.mockResolvedValue([]);
      mockPrismaService.liability.findMany.mockResolvedValue([]);
      mockPrismaService.investmentPosition.findMany.mockResolvedValue([]);
      mockPrismaService.account.findMany.mockResolvedValue([
        { id: 1, name: 'ING', startingBalance: new Prisma.Decimal('1000') },
      ]);
      mockPrismaService.transaction.groupBy.mockResolvedValue([
        { type: 'INCOME', _sum: { amount: new Prisma.Decimal('500') } },
      ]);
      mockPrismaService.transaction.aggregate.mockResolvedValue({ _sum: { amount: null } });

      const result = await service.getSummary(10, 1);

      expect(result.accountsTotal).toBe(1500); // 1000 starting + 500 income
      expect(result.totalAssets).toBe(1500);
    });
  });
});
