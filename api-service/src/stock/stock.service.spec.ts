/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { StockService } from './stock.service';
import { RabbitmqClientService } from '../rabbitmq-client/rabbitmq-client.service';

describe('StockService', () => {
  let service: StockService;
  let rabbitService: RabbitmqClientService;

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
      ],
    }).compile();

    service = module.get<StockService>(StockService);
    rabbitService = module.get<RabbitmqClientService>(RabbitmqClientService);
  });

  describe('fetchStock', () => {
    it('should return result from RabbitmqClientService', async () => {
      const mockSymbol = 'AAPL';
      const mockResponse = { symbol: 'AAPL', price: 200 };

      (rabbitService.sendMessage as jest.Mock).mockResolvedValue(mockResponse);

      const result = await service.fetchStock(mockSymbol);

      expect(rabbitService.sendMessage).toHaveBeenCalledWith(
        'stock_symbol',
        mockSymbol,
      );
      expect(result).toEqual(mockResponse);
    });

    it('should log and return undefined if an error occurs', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const error = new Error('RabbitMQ error');

      (rabbitService.sendMessage as jest.Mock).mockRejectedValue(error);

      const result = await service.fetchStock('GOOG');

      expect(consoleSpy).toHaveBeenCalledWith(error);
      expect(result).toBeUndefined();
    });
  });
});
