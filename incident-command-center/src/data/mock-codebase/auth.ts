export async function verifyToken(token: string) {
  if (!token) {
    throw new Error('Token não fornecido');
  }

  // Simula validação de token JWT
  if (token === 'expired_token') {
    throw new Error('Token expirado');
  }

  if (token !== 'valid_secret_token') {
    throw new Error('Assinatura de token inválida');
  }

  return { userId: 'usr_123', role: 'admin' };
}

export async function login(email: string, passwordHash: string) {
  // Simula busca no banco
  if (email === 'test@example.com' && passwordHash === 'hash123') {
    return { token: 'valid_secret_token' };
  }
  throw new Error('Credenciais inválidas');
}
