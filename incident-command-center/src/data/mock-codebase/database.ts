// Simula um ORM como Prisma ou Drizzle
export const db = {
  user: {
    findById: async (id: string) => {
      // Retorna usuário apenas se for o ID de teste, falha nos demais para simular inconsistência
      if (id === 'usr_123') {
        return { id: 'usr_123', name: 'John Doe', email: 'john@example.com' };
      }
      // Outros usuários não encontrados no banco mockado
      return null;
    }
  },
  connect: async () => {
    // Simula tempo de conexão
    console.log('Conectado ao banco de dados com sucesso.');
    return true;
  }
}
