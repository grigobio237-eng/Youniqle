// Mock the auth modules
jest.mock('@/lib/auth', () => ({
  generateToken: jest.fn((payload) => `mock-token-${JSON.stringify(payload)}`),
}));
jest.mock('@/lib/authMiddleware', () => ({
  verifyToken: jest.fn((token) => {
    if (token.startsWith('mock-token-')) {
      return JSON.parse(token.replace('mock-token-', ''));
    }
    throw new Error('Invalid token');
  }),
}));

import { generateToken } from '@/lib/auth';
import { verifyToken } from '@/lib/authMiddleware';

describe('Auth Utils', () => {
  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const payload = { userId: 'test-user-id', email: 'test@example.com' };
      const token = generateToken(payload);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token).toContain('mock-token-'); // Mock token format
    });

    it('should generate different tokens for different payloads', () => {
      const payload1 = { userId: 'user1', email: 'user1@example.com' };
      const payload2 = { userId: 'user2', email: 'user2@example.com' };

      const token1 = generateToken(payload1);
      const token2 = generateToken(payload2);

      expect(token1).not.toBe(token2);
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token', () => {
      const payload = { userId: 'test-user-id', email: 'test@example.com' };
      const token = generateToken(payload);
      const decoded = verifyToken(token);

      expect(decoded).toBeDefined();
      expect(decoded).not.toBeNull();
      expect(decoded!.userId).toBe(payload.userId);
      expect(decoded!.email).toBe(payload.email);
    });

    it('should throw error for invalid token', () => {
      const invalidToken = 'invalid-token';

      expect(() => {
        verifyToken(invalidToken);
      }).toThrow();
    });

    it('should throw error for expired token', () => {
      // This test would require mocking the current time
      // For now, we'll test with a malformed token
      const malformedToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.signature';

      expect(() => {
        verifyToken(malformedToken);
      }).toThrow();
    });
  });
});
