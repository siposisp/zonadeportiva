import { jest } from '@jest/globals';

// Mockear bcrypt
const mockHash = jest.fn();
await jest.unstable_mockModule('bcrypt', () => ({
  default: { hash: mockHash }
}));

// Mockear el módulo antes de importarlo
const mockQuery = jest.fn();
await jest.unstable_mockModule('../../../database/connectionPostgreSQL.js', () => ({
  pool: { query: mockQuery }
}));

// Luego de hacer el mock, importas lo necesario
const { getUserByEmail, checkUserExists, setUserPassword } = await import('../../services/user.service.js');
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

describe('setUserPassword', () => {
  beforeEach(() => {
    mockQuery.mockReset();
    mockHash.mockReset();
  });

  it('debería cambiar la contraseña exitosamente', async () => {
    const email = 'test@mail.com';
    const newPassword = 'newPassword123';
    const hashedPassword = 'hashedPassword123';

    // Mock de bcrypt.hash
    mockHash.mockResolvedValueOnce(hashedPassword);
    
    // Mock de la query UPDATE exitosa
    mockQuery.mockResolvedValueOnce({ rowCount: 1 });

    const result = await setUserPassword(email, newPassword);

    expect(result).toBe(true);
    expect(mockHash).toHaveBeenCalledWith(newPassword, 12);
    expect(mockQuery).toHaveBeenCalledWith(
      'UPDATE users SET password_hash = $1 WHERE email = $2',
      [hashedPassword, email]
    );
  });

  it('debería retornar false si no se actualiza ninguna fila', async () => {
    const email = 'nonexistent@mail.com';
    const newPassword = 'newPassword123';
    const hashedPassword = 'hashedPassword123';

    mockHash.mockResolvedValueOnce(hashedPassword);
    // Mock de query que no afecta ninguna fila (usuario no existe)
    mockQuery.mockResolvedValueOnce({ rowCount: 0 });

    const result = await setUserPassword(email, newPassword);

    expect(result).toBe(false);
    expect(mockHash).toHaveBeenCalledWith(newPassword, 12);
    expect(mockQuery).toHaveBeenCalledWith(
      'UPDATE users SET password_hash = $1 WHERE email = $2',
      [hashedPassword, email]
    );
  });

  it('debería lanzar un error si bcrypt.hash falla', async () => {
    const email = 'test@mail.com';
    const newPassword = 'newPassword123';

    mockHash.mockRejectedValueOnce(new Error('Bcrypt error'));

    await expect(setUserPassword(email, newPassword)).rejects.toThrow('Bcrypt error');
    expect(mockHash).toHaveBeenCalledWith(newPassword, 12);
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it('debería lanzar un error si la query falla', async () => {
    const email = 'test@mail.com';
    const newPassword = 'newPassword123';
    const hashedPassword = 'hashedPassword123';

    mockHash.mockResolvedValueOnce(hashedPassword);
    mockQuery.mockRejectedValueOnce(new Error('DB Connection Error'));

    await expect(setUserPassword(email, newPassword)).rejects.toThrow('DB Connection Error');
    expect(mockHash).toHaveBeenCalledWith(newPassword, 12);
    expect(mockQuery).toHaveBeenCalledWith(
      'UPDATE users SET password_hash = $1 WHERE email = $2',
      [hashedPassword, email]
    );
  });

  it('debería manejar errores y hacer console.error', async () => {
    const email = 'test@mail.com';
    const newPassword = 'newPassword123';
    const hashedPassword = 'hashedPassword123';

    // Spy en console.error
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    mockHash.mockResolvedValueOnce(hashedPassword);
    const dbError = new Error('Database error');
    mockQuery.mockRejectedValueOnce(dbError);

    await expect(setUserPassword(email, newPassword)).rejects.toThrow('Database error');
    
    expect(consoleSpy).toHaveBeenCalledWith('Error al actualizar contraseña:', dbError);
    
    consoleSpy.mockRestore();
  });
});