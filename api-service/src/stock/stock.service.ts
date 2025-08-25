import { Injectable } from '@nestjs/common';
import { RabbitmqClientService } from '../rabbitmq-client/rabbitmq-client.service';

@Injectable()
export class StockService {
  constructor(private readonly rabbitService: RabbitmqClientService) {}

  async fetchStock(symbol: string): Promise<unknown> {
    try {
      const result: unknown = await this.rabbitService.sendMessage(
        'stock_symbol',
        symbol,
      );
      return result;
    } catch (error) {
      console.log(error);
    }
  }
}
