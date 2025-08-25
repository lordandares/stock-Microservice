/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { StockService } from './stock.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Stock } from './stock.entity';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('StockService', () => {
  let service: StockService;
  let cache: { get: jest.Mock; set: jest.Mock };
  let stockRepo: { save: jest.Mock };

  beforeEach(async () => {
    cache = {
      get: jest.fn(),
      set: jest.fn(),
    };

    stockRepo = {
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StockService,
        {
          provide: CACHE_MANAGER,
          useValue: cache,
        },
        {
          provide: getRepositoryToken(Stock),
          useValue: stockRepo,
        },
      ],
    }).compile();

    service = module.get<StockService>(StockService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return cached data if present', async () => {
    const mockData = { symbol: 'AAPL', price: 123 };
    cache.get.mockResolvedValue(mockData);

    const result = await service.fetchStock('AAPL');
    expect(cache.get).toHaveBeenCalledWith('stock:AAPL');
    expect(result).toEqual(mockData);
  });

  it('should fetch from API, cache it, and save to DB if not cached', async () => {
    cache.get.mockResolvedValue(undefined);

    const apiResponse = {
      data: `Symbol,Date,Time,Open,High,Low,Close,Volume\nAAPL.US,2025-08-22,22:00:15,226.17,229.09,225.41,227.76,42477811`,
    };

    mockedAxios.get.mockResolvedValue(apiResponse as any);

    await service.fetchStock('AAPL');

    expect(mockedAxios.get).toHaveBeenCalledWith(
      `https://stooq.com/q/l/?s=AAPL&f=sd2t2ohlcv&h&e=csv`,
    );

    expect(cache.set).toHaveBeenCalledWith(
      'stock:AAPL',
      {
        symbol: 'AAPL.US',
        date: '2025-08-22',
        time: '22:00:15',
        open: 226.17,
        high: 229.09,
        low: 225.41,
        close: 227.76,
        volume: 42477811,
      },
      60,
    );

    expect(stockRepo.save).toHaveBeenCalledWith({
      symbol: 'AAPL.US',
      date: '2025-08-22',
      time: '22:00:15',
      open: 226.17,
      high: 229.09,
      low: 225.41,
      close: 227.76,
      volume: 42477811,
    });
  });
});
