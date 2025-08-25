import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(), // Optional if you test compare in controller
}));

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;
  let usersService: UsersService;

  const mockUser = {
    id: 1,
    username: 'testuser',
    password: 'hashedPassword',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            validateUser: jest.fn(),
            login: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
  });

  describe('register', () => {
    it('should register a user and return id and username', async () => {
      const dto = { username: 'testuser', password: 'testpass' };

      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed123');
      (usersService.create as jest.Mock).mockResolvedValue({
        id: 1,
        username: dto.username,
      });

      const result = await controller.register(dto);

      expect(bcrypt.hash).toHaveBeenCalledWith(dto.password, 10);
      expect(usersService.create).toHaveBeenCalledWith(dto.username, 'hashed123');
      expect(result).toEqual({ id: 1, username: dto.username });
    });
  });

  describe('login', () => {
    it('should return token if user is validated', async () => {
      const dto = { username: 'testuser', password: 'testpass' };

      (authService.validateUser as jest.Mock).mockResolvedValue(mockUser);
      (authService.login as jest.Mock).mockReturnValue({
        access_token: 'mockToken',
      });

      const result = await controller.login(dto);

      expect(authService.validateUser).toHaveBeenCalledWith(dto.username, dto.password);
      expect(result).toEqual({ access_token: 'mockToken' });
    });

    it('should throw UnauthorizedException if credentials are invalid', async () => {
      const dto = { username: 'invalid', password: 'wrong' };

      (authService.validateUser as jest.Mock).mockResolvedValue(null);

      await expect(controller.login(dto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('getPrivate', () => {
    it('should return greeting message with request', () => {
      const req = { user: { username: 'testuser' } };
      const result = controller.getPrivate(req);

      expect(result).toEqual({
        message: `Hello ${req}`,
      });
    });
  });
});
