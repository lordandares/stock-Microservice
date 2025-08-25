/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { StockService } from './stock.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Stock')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('stock')
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Get()
  @ApiQuery({
    name: 'q',
    required: true,
    description: 'Stock symbol to look up',
  })
  @ApiResponse({
    status: 200,
    description: 'Stock data retrieved successfully.',
  })
  @ApiResponse({ status: 400, description: 'Missing query parameter.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  getStock(@Request() req, @Query('q') symbol: string) {
    if (!symbol) {
      return { error: 'Missing ?q=symbol query param' };
    }
    const userId = req.user.userId;
    return this.stockService.fetchStock(symbol, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('history')
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'User stock history.' })
  async getHistoricalStock(@Request() req) {
    const userId = req.user.id;
    const history = await this.stockService.getUserStockHistory(userId);

    return history.map((entry) => ({
      date: entry.date,
      name: entry.volume,
      symbol: entry.symbol,
      open: entry.open,
      high: entry.high,
      low: entry.low,
      close: entry.close,
    }));
  }
}
