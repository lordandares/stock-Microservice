import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { StockService } from './stock/stock.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [StockService],
})
export class AppModule {}
