import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class RabbitmqClientService {
  constructor(@Inject('STOCK_SERVICE') private readonly client: ClientProxy) {}

  async sendMessage<T>(pattern: string, data: T): Promise<T> {
    return await lastValueFrom(this.client.send<T>(pattern, data));
  }
}
