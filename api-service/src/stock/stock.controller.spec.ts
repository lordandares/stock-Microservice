import { Test, TestingModule } from '@nestjs/testing';
import { StockController } from './stock.controller';
import { StockService } from './stock.service';

describe('StockController', () => {
  let controller: StockController;
  let stockService: StockService;

  const mockStockService = {
    fetchStock: jest.fn(),
    getUserStockHistory: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StockController],
      providers: [
        {
          provide: StockService,
          useValue: mockStockService,
        },
      ],
    }).compile();

    controller = module.get<StockController>(StockController);
    stockService = module.get<StockService>(StockService);
  });

  describe('getStock', () => {
    it('should return error if no symbol is provided', () => {
      const result = controller.getStock({ user: { userId: 1 } }, undefined);
      expect(result).toEqual({ error: 'Missing ?q=symbol query param' });
    });

    it('should call stockService.fetchStock with symbol and userId', () => {
      const mockReq = { user: { userId: 42 } };
      const symbol = 'AAPL';
      const mockResponse = { price: 200 };

      jest.spyOn(stockService, 'fetchStock').mockResolvedValue(mockResponse as any);

      const result = controller.getStock(mockReq, symbol);
      expect(stockService.fetchStock).toHaveBeenCalledWith(symbol, 42);
      expect(result).resolves.toEqual(mockResponse);
    });
  });

  describe('getHistoricalStock', () => {
    it('should return formatted stock history', async () => {
      const mockReq = { user: { id: 42 } };
      const mockHistory = [
        {
          date: '2025-08-24',
          symbol: 'AAPL',
          volume: 10000,
          open: 100,
          high: 110,
          low: 90,
          close: 105,
        },
      ];

      mockStockService.getUserStockHistory.mockResolvedValue(mockHistory);

      const result = await controller.getHistoricalStock(mockReq);

      expect(stockService.getUserStockHistory).toHaveBeenCalledWith(42);
      expect(result).toEqual([
        {
          date: '2025-08-24',
          name: 10000,
          symbol: 'AAPL',
          open: 100,
          high: 110,
          low: 90,
          close: 105,
        },
      ]);
    });
  });
});
