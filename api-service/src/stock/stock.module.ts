import { Module } from '@nestjs/common';
import { StockController } from './stock.controller';
import { StockService } from './stock.service';
import { RabbitmqClientModule } from '../rabbitmq-client/rabbitmq-client.module';
import { Stock } from './stock.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Stock]), RabbitmqClientModule],
  controllers: [StockController],
  providers: [StockService],
})
export class StockModule {}
