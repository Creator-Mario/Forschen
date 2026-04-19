import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('authOptions credentials authorize', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('uses the fresh user lookup so production login sees the latest account state', async () => {
    const compare = vi.fn().mockResolvedValue(true);
    const getUserByEmailFresh = vi.fn().mockResolvedValue({
      id: 'u1',
      email: 'alice@example.com',
      name: 'Alice',
      role: 'USER',
      status: 'active',
      active: true,
      password: 'hashed-password',
    });

    vi.doMock('@/lib/db', () => ({ getUserByEmailFresh }));
    vi.doMock('bcryptjs', () => ({ default: { compare } }));
    vi.doMock('@/lib/auth-secret', () => ({ authSecret: 'test-secret' }));

    const { authOptions } = await import('@/lib/auth');
    const credentialsProvider = authOptions.providers?.[0] as {
      authorize: (credentials: { email: string; password: string }) => Promise<unknown>;
    };

    const user = await credentialsProvider.authorize({
      email: ' Alice@Example.com ',
      password: 'pw',
    });

    expect(getUserByEmailFresh).toHaveBeenCalledWith('alice@example.com');
    expect(compare).toHaveBeenCalledWith('pw', 'hashed-password');
    expect(user).toMatchObject({
      id: 'u1',
      email: 'alice@example.com',
      name: 'Alice',
      role: 'USER',
    });
  });
});
