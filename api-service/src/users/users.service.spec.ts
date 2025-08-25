/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('UsersService', () => {
  let service: UsersService;
  let repository: jest.Mocked<Repository<User>>;

  const mockUser = {
    id: 1,
    username: 'testuser',
    password: 'hashedPassword',
  } as User;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get(getRepositoryToken(User));
  });

  describe('findOne', () => {
    it('should return a user if found', async () => {
      repository.findOne.mockResolvedValue(mockUser);

      const result = await service.findOne('testuser');
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { username: 'testuser' },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return undefined if user not found', async () => {
      repository.findOne.mockResolvedValue(undefined);

      const result = await service.findOne('notfound');
      expect(result).toBeUndefined();
    });
  });

  describe('create', () => {
    it('should create and save a user', async () => {
      repository.create.mockReturnValue(mockUser);
      repository.save.mockResolvedValue(mockUser);

      const result = await service.create('testuser', 'hashedPassword');
      expect(repository.create).toHaveBeenCalledWith({
        username: 'testuser',
        password: 'hashedPassword',
      });
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(repository.save).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockUser);
    });
  });
});
