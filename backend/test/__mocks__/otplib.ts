// Mock for otplib — avoids ESM resolution issues with @scure/base and @noble/hashes
export const generateSecret = jest.fn().mockReturnValue('mockSecret');
export const verifySync = jest.fn().mockReturnValue(true);
export const authenticator = {
  generateSecret: jest.fn().mockReturnValue('mockSecret'),
  verify: jest.fn().mockReturnValue(true),
  generate: jest.fn().mockReturnValue('123456'),
  keyuri: jest.fn().mockReturnValue('otpauth://totp/test'),
};
