import { Module } from '@nestjs/common';
import { StockController } from './stock.controller';
import { StockService } from './stock.service';
import { RabbitmqClientModule } from '../rabbitmq-client/rabbitmq-client.module';

@Module({
  imports: [RabbitmqClientModule],
  controllers: [StockController],
  providers: [StockService],
})
export class StockModule {}
