import { Controller, Get, Query, UseGuards } from '@nestjs/common';
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
  getStock(@Query('q') symbol: string) {
    if (!symbol) {
      return { error: 'Missing ?q=symbol query param' };
    }
    return this.stockService.fetchStock(symbol);
  }
}
