import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { StockService } from './stock/stock.service';

@Controller()
export class AppController {
  constructor(private readonly stockService: StockService) {}

  @MessagePattern('stock_symbol') // Message key
  async handleStockRequest(symbol: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return await this.stockService.fetchStock(symbol);
  }
}
