import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { TwoFactorService } from './two-factor.service';

const mockUsersService = {
  getProfile: jest.fn(),
};

const mockTwoFactorService = {
  generateTwoFactorSecret: jest.fn(),
  generateQrCodeDataURL: jest.fn(),
  verifyTwoFactorToken: jest.fn(),
  enableTwoFactor: jest.fn(),
};

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: mockUsersService },
        { provide: TwoFactorService, useValue: mockTwoFactorService },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getProfile', () => {
    it('should call usersService.getProfile', async () => {
      const mockProfile = { id: '1', name: 'John' };
      mockUsersService.getProfile.mockResolvedValue(mockProfile);

      const result = await controller.getProfile('1');
      expect(result).toEqual(mockProfile);
      expect(service.getProfile).toHaveBeenCalledWith('1');
    });
  });
});
