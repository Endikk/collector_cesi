import { Test, TestingModule } from '@nestjs/testing';
import { TwoFactorService } from './two-factor.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

// Mock otplib (not easy to mock functional import, so we test the wrapper logic or mock the module)
// Since we use direct imports, jest.mock is needed.
jest.mock('otplib', () => ({
    generateSecret: jest.fn().mockReturnValue('mockSecret'),
    verifySync: jest.fn().mockReturnValue(true),
}));

jest.mock('qrcode', () => ({
    toDataURL: jest.fn().mockResolvedValue('data:image/png;base64,mockQRCode'),
}));

const mockPrismaService = {
    user: {
        update: jest.fn(),
    },
};

const mockConfigService = {
    get: jest.fn().mockReturnValue('Collector'),
};

describe('TwoFactorService', () => {
    let service: TwoFactorService;
    let prisma: PrismaService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TwoFactorService,
                { provide: PrismaService, useValue: mockPrismaService },
                { provide: ConfigService, useValue: mockConfigService },
            ],
        }).compile();

        service = module.get<TwoFactorService>(TwoFactorService);
        prisma = module.get<PrismaService>(PrismaService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('generateTwoFactorSecret', () => {
        it('should return secret and otpauthUrl', async () => {
            const result = await service.generateTwoFactorSecret('test@example.com');
            expect(result.secret).toBe('mockSecret');
            expect(result.otpauthUrl).toContain('otpauth://totp/');
            expect(result.otpauthUrl).toContain('secret=mockSecret');
        });
    });

    describe('generateQrCodeDataURL', () => {
        it('should return data URL', async () => {
            const result = await service.generateQrCodeDataURL('otpauth://...');
            expect(result).toBe('data:image/png;base64,mockQRCode');
        });
    });

    describe('verifyTwoFactorToken', () => {
        it('should return true if token is valid', () => {
            expect(service.verifyTwoFactorToken('123456', 'secret')).toBe(true);
        });
    });

    describe('enableTwoFactor', () => {
        it('should update user with 2FA secret', async () => {
            const mockUser = { id: '1', twoFactorEnabled: true };
            mockPrismaService.user.update.mockResolvedValue(mockUser);

            expect(await service.enableTwoFactor('1', 'secret')).toEqual(mockUser);
            expect(mockPrismaService.user.update).toHaveBeenCalledWith({
                where: { id: '1' },
                data: { twoFactorSecret: 'secret', twoFactorEnabled: true },
            });
        });
    });
});
