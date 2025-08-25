import { Injectable } from '@nestjs/common';
import { RabbitmqClientService } from '../rabbitmq-client/rabbitmq-client.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Stock } from './stock.entity';
import { Repository } from 'typeorm';

@Injectable()
export class StockService {
  constructor(
    private readonly rabbitService: RabbitmqClientService,
    @InjectRepository(Stock)
    private readonly stockRepository: Repository<Stock>,
  ) {}

  async fetchStock(symbol: string, userId: number): Promise<unknown> {
    try {
      const result: unknown = await this.rabbitService.sendMessage(
        'stock_symbol',
        { symbol, userId },
      );
      return result;
    } catch (error) {
      console.log(error);
    }
  }

  async getUserStockHistory(userId: number): Promise<Stock[]> {
    return this.stockRepository.find({
      where: { userId: userId },
      order: { date: 'DESC' },
    });
  }
}
