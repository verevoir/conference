import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockConnect = vi.fn();
const mockMigrate = vi.fn();

vi.mock('@verevoir/storage', () => ({
  PostgresAdapter: class {
    connect = mockConnect;
    migrate = mockMigrate;
  },
}));

vi.mock('@/server/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));

describe('ensureDb', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.resetModules();
  });

  async function loadEnsureDb() {
    const mod = await import('@/server/db');
    return mod.ensureDb;
  }

  it('calls connect then migrate on first call', async () => {
    const ensureDb = await loadEnsureDb();
    await ensureDb();
    expect(mockConnect).toHaveBeenCalledOnce();
    expect(mockMigrate).toHaveBeenCalledOnce();
  });

  it('returns the storage adapter', async () => {
    const ensureDb = await loadEnsureDb();
    const storage = await ensureDb();
    expect(storage).toHaveProperty('connect');
    expect(storage).toHaveProperty('migrate');
  });

  it('only initializes once (singleton)', async () => {
    const ensureDb = await loadEnsureDb();
    await ensureDb();
    await ensureDb();
    expect(mockConnect).toHaveBeenCalledOnce();
    expect(mockMigrate).toHaveBeenCalledOnce();
  });

  it('throws when connect fails (SSL, missing DB)', async () => {
    mockConnect.mockRejectedValue(new Error('no pg_hba.conf entry'));
    const ensureDb = await loadEnsureDb();
    await expect(ensureDb()).rejects.toThrow('no pg_hba.conf');
  });

  it('throws when migrate fails', async () => {
    mockMigrate.mockRejectedValue(new Error('relation does not exist'));
    const ensureDb = await loadEnsureDb();
    await expect(ensureDb()).rejects.toThrow('does not exist');
  });

  it('retries after a failed connect (initialized stays false)', async () => {
    mockConnect.mockRejectedValueOnce(new Error('ECONNREFUSED'));
    const ensureDb = await loadEnsureDb();

    await expect(ensureDb()).rejects.toThrow('ECONNREFUSED');
    expect(mockConnect).toHaveBeenCalledOnce();

    mockConnect.mockResolvedValue(undefined);
    await ensureDb();
    expect(mockConnect).toHaveBeenCalledTimes(2);
    expect(mockMigrate).toHaveBeenCalledOnce();
  });
});
