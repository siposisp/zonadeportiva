import { jest } from '@jest/globals';

// Mockear el módulo antes de importarlo
const mockQuery = jest.fn();
await jest.unstable_mockModule('../../../database/connectionPostgreSQL.js', () => ({
  pool: { query: mockQuery }
}));

// Luego de hacer el mock, importas lo necesario
const { getUserByEmail, checkUserExists } = await import('../../services/user.service.js');
const { pool } = await import('../../../database/connectionPostgreSQL.js');

describe('getUserByEmail', () => {
  beforeEach(() => {
    mockQuery.mockReset();
  });

  it('debería retornar un usuario si existe', async () => {
    const mockUser = { id: 1, email: 'test@mail.com', role: 'customer' };
    mockQuery.mockResolvedValueOnce({ rows: [mockUser] });

    const result = await getUserByEmail('test@mail.com');
    expect(result).toEqual(mockUser);
    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining('SELECT * FROM users WHERE email = $1'),
      ['test@mail.com']
    );
  });

  it('debería retornar null si no se encuentra el usuario', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const result = await getUserByEmail('notfound@mail.com');
    expect(result).toBeNull();
  });

  it('debería lanzar un error si la query falla', async () => {
    mockQuery.mockRejectedValueOnce(new Error('DB Error'));
    await expect(getUserByEmail('fail@mail.com')).rejects.toThrow('DB Error');
  });
});

describe('checkUserExists', () => {
  beforeEach(() => {
    mockQuery.mockReset();
  });

  it('debería retornar true si el usuario existe', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ id: 1 }] });

    const result = await checkUserExists(1);
    expect(result).toBe(true);
  });

  it('debería retornar false si el usuario no existe', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const result = await checkUserExists(999);
    expect(result).toBe(false);
  });

  it('debería lanzar un error si la query falla', async () => {
    mockQuery.mockRejectedValueOnce(new Error('DB Down'));
    await expect(checkUserExists(1)).rejects.toThrow('DB Down');
  });
});