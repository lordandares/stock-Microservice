/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { StockService } from './stock.service';
import { RabbitmqClientService } from '../rabbitmq-client/rabbitmq-client.service';
import { Repository } from 'typeorm';
import { Stock } from './stock.entity';
import { User } from '../users/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('StockService', () => {
  let service: StockService;
  let rabbitService: RabbitmqClientService;
  let stockRepository: jest.Mocked<Repository<Stock>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StockService,
        {
          provide: RabbitmqClientService,
          useValue: {
            sendMessage: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Stock),
          useValue: {
            find: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<StockService>(StockService);
    rabbitService = module.get<RabbitmqClientService>(RabbitmqClientService);
    stockRepository = module.get(getRepositoryToken(Stock));
  });

  describe('fetchStock', () => {
    it('should return result from RabbitmqClientService', async () => {
      const mockSymbol = 'AAPL';
      const userId = 1;
      const mockResponse = { symbol: 'AAPL', price: 200 };

      (rabbitService.sendMessage as jest.Mock).mockResolvedValue(mockResponse);

      const result = await service.fetchStock(mockSymbol, userId);

      expect(rabbitService.sendMessage).toHaveBeenCalledWith('stock_symbol', {
        symbol: mockSymbol,
        userId,
      });
      expect(result).toEqual(mockResponse);
    });

    it('should log and return undefined if an error occurs', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const error = new Error('RabbitMQ error');

      (rabbitService.sendMessage as jest.Mock).mockRejectedValue(error);

      const result = await service.fetchStock('GOOG', 1);

      expect(consoleSpy).toHaveBeenCalledWith(error);
      expect(result).toBeUndefined();

      consoleSpy.mockRestore();
    });
  });

  describe('getUserStockHistory', () => {
    it('should return user stock history ordered by date desc', async () => {
      const mockUserId = 123;
      const mockHistory: Stock[] = [
        {
          id: 1,
          symbol: 'AAPL',
          date: '2025-08-24',
          time: '14:00:00',
          open: 100,
          high: 110,
          low: 90,
          close: 105,
          volume: 10000,
          userId: mockUserId,
          user: new User(),
          dateCreated: new Date(),
        },
      ];

      (stockRepository.find as jest.Mock).mockResolvedValue(mockHistory);

      const result = await service.getUserStockHistory(mockUserId);

      expect(stockRepository.find).toHaveBeenCalledWith({
        where: { userId: mockUserId },
        order: { date: 'DESC' },
      });
      expect(result).toEqual(mockHistory);
    });
  });
});
