import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryAdapter } from '@verevoir/storage';

const mockEnsureDb = vi.fn();

vi.mock('@/server/db', () => ({
  ensureDb: (...args: unknown[]) => mockEnsureDb(...args),
}));

describe('getRoleStore', () => {
  let memoryAdapter: InstanceType<typeof MemoryAdapter>;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    memoryAdapter = new MemoryAdapter();
    mockEnsureDb.mockResolvedValue(memoryAdapter);
  });

  async function loadGetRoleStore() {
    const mod = await import('@/server/roles');
    return mod.getRoleStore;
  }

  it('returns a role store backed by the database', async () => {
    const getRoleStore = await loadGetRoleStore();
    const store = await getRoleStore();
    expect(store).toHaveProperty('getRoles');
    expect(store).toHaveProperty('setRoles');
    expect(typeof store.getRoles).toBe('function');
    expect(typeof store.setRoles).toBe('function');
  });

  it('seed admin gets organiser role', async () => {
    const getRoleStore = await loadGetRoleStore();
    const store = await getRoleStore();
    const roles = await store.getRoles('google-114823947');
    expect(roles).toEqual(['organiser']);
  });

  it('non-seed user gets empty roles', async () => {
    const getRoleStore = await loadGetRoleStore();
    const store = await getRoleStore();
    const roles = await store.getRoles('unknown-user');
    expect(roles).toEqual([]);
  });

  it('throws when ensureDb fails', async () => {
    mockEnsureDb.mockRejectedValue(new Error('connection refused'));
    const getRoleStore = await loadGetRoleStore();
    await expect(getRoleStore()).rejects.toThrow('connection refused');
  });

  it('singleton — returns same store', async () => {
    const getRoleStore = await loadGetRoleStore();
    const store1 = await getRoleStore();
    const store2 = await getRoleStore();
    expect(store1).toBe(store2);
    expect(mockEnsureDb).toHaveBeenCalledOnce();
  });
});
