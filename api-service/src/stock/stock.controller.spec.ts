/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { StockController } from './stock.controller';
import { StockService } from './stock.service';

describe('StockController', () => {
  let controller: StockController;
  let stockService: StockService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StockController],
      providers: [
        {
          provide: StockService,
          useValue: {
            fetchStock: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<StockController>(StockController);
    stockService = module.get<StockService>(StockService);
  });

  describe('getStock', () => {
    it('should return stock data when symbol is provided', async () => {
      const mockSymbol = 'TSLA';
      const mockData = { symbol: mockSymbol, price: 300 };

      (stockService.fetchStock as jest.Mock).mockResolvedValue(mockData);

      const result = await controller.getStock(mockSymbol);

      expect(stockService.fetchStock).toHaveBeenCalledWith(mockSymbol);
      expect(result).toEqual(mockData);
    });

    it('should return an error object when symbol is missing', async () => {
      const result = await controller.getStock('');

      expect(result).toEqual({ error: 'Missing ?q=symbol query param' });
    });
  });
});