/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { StockService } from './stock/stock.service';

describe('AppController', () => {
  let appController: AppController;
  let stockService: { fetchStock: jest.Mock };

  beforeEach(async () => {
    stockService = {
      fetchStock: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: StockService,
          useValue: stockService,
        },
      ],
    }).compile();

    appController = module.get<AppController>(AppController);
  });

  it('should be defined', () => {
    expect(appController).toBeDefined();
  });

  it('should call stockService.fetchStock with the correct symbol and return the result', async () => {
    const mockSymbol = 'AAPL';
    const mockResult = { symbol: 'AAPL', close: 123 };
    stockService.fetchStock.mockResolvedValue(mockResult);

    const result = await appController.handleStockRequest(mockSymbol);

    expect(stockService.fetchStock).toHaveBeenCalledWith(mockSymbol);
    expect(result).toEqual(mockResult);
  });
});
