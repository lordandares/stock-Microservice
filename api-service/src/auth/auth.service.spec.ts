/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;

  const mockUser = {
    id: 1,
    username: 'testuser',
    password: 'hashedPassword',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mockToken'),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should return the user if password is correct', async () => {
    (usersService.findOne as jest.Mock).mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const result = await service.validateUser('testuser', 'plainPassword');

    expect(usersService.findOne).toHaveBeenCalledWith('testuser');
    expect(bcrypt.compare).toHaveBeenCalledWith(
      'plainPassword',
      'hashedPassword',
    );
    expect(result).toEqual(mockUser);
  });

  it('should return null if password is incorrect', async () => {
    (usersService.findOne as jest.Mock).mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    const result = await service.validateUser('testuser', 'wrongPassword');

    expect(result).toBeNull();
  });

  it('should return null if user not found', async () => {
    (usersService.findOne as jest.Mock).mockResolvedValue(undefined);

    const result = await service.validateUser('unknown', 'password');

    expect(result).toBeNull();
  });
});
