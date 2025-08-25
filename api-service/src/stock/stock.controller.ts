import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { StockService } from './stock.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('stock')
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Get()
  getStock(@Query('q') symbol: string) {
    if (!symbol) {
      return { error: 'Missing ?q=symbol query param' };
    }
    return this.stockService.fetchStock(symbol);
  }
}
