/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { StockService } from './stock/stock.service';

@Controller()
export class AppController {
  constructor(private readonly stockService: StockService) {}

  @MessagePattern('stock_symbol')
  async handleStockRequest(payload: { symbol: string; userId: number }) {
    const { symbol, userId } = payload;

    // You can now use both `symbol` and `userId`
    const stock = await this.stockService.fetchStock(symbol, userId);

    return {
      userId,
      ...stock,
    };
  }
}
