import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RabbitmqClientService } from './rabbitmq-client.service';
import { STOCK_SERVICE } from './constants';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: STOCK_SERVICE,
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://guest:guest@rabbitmq:5672'],
          queue: 'main_queue',
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
  ],
  providers: [RabbitmqClientService],
  exports: [RabbitmqClientService],
})
export class RabbitmqClientModule {}
