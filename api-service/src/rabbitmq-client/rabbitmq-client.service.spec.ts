import { Test, TestingModule } from '@nestjs/testing';
import { RabbitmqClientService } from './rabbitmq-client.service';
import { ClientProxy } from '@nestjs/microservices';
import { of } from 'rxjs';

describe('RabbitmqClientService', () => {
  let service: RabbitmqClientService;
  let clientProxyMock: ClientProxy;

  beforeEach(async () => {
    clientProxyMock = {
      send: jest.fn(),
    } as unknown as ClientProxy;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RabbitmqClientService,
        {
          provide: 'STOCK_SERVICE',
          useValue: clientProxyMock,
        },
      ],
    }).compile();

    service = module.get<RabbitmqClientService>(RabbitmqClientService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendMessage', () => {
    it('should send a message using ClientProxy and return result', async () => {
      const pattern = 'test-pattern';
      const data = { key: 'value' };
      const expectedResponse = { success: true };

      jest.spyOn(clientProxyMock, 'send').mockReturnValue(of(expectedResponse));

      const result = await service.sendMessage(pattern, data);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(clientProxyMock.send).toHaveBeenCalledWith(pattern, data);
      expect(result).toEqual(expectedResponse);
    });
  });
});
