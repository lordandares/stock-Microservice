import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import axios from 'axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Stock } from './stock.entity';

@Injectable()
export class StockService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @InjectRepository(Stock)
    private stockRepository: Repository<Stock>,
  ) {}

  async fetchStock(symbol: string, userId: number): Promise<any> {
    const key = `stock:${symbol}`;

    // Try retrieving from cache
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const cached = await this.cacheManager.get(key);
    console.log(cached);
    if (cached) {
      console.log('Returning from cache');
      return cached;
    }

    // Fetch fresh data
    console.log('Fetching from API');
    const response = await axios.get<string>(
      `https://stooq.com/q/l/?s=${symbol}&f=sd2t2ohlcv&h&e=csv`,
    );
    const lines = response.data.trim().split('\n');
    const values = lines[1].split(',');

    const stockData: Partial<Stock> = {
      symbol: values[0],
      date: values[1],
      time: values[2],
      open: Number(values[3]),
      high: Number(values[4]),
      low: Number(values[5]),
      close: Number(values[6]),
      volume: Number(values[7]),
      userId,
    };

    // Cache the data for 5 seconds
    console.log('Caching data...');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    await this.cacheManager.set(key, stockData, 60);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    console.log('Cached:', await this.cacheManager.get(key));
    await this.saveStock(stockData);

    return stockData;
  }

  async saveStock(data: Partial<Stock>) {
    return this.stockRepository.save(data);
  }
}
