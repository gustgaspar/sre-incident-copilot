import { db } from './database';

export async function processPayment(userId: string, amount: number, paymentMethodId: string) {
  // Simula verificação no banco de dados
  const user = await db.user.findById(userId);

  if (!user) {
    throw new Error('Usuário não encontrado para processar pagamento');
  }

  // Simulação de regra de negócio falhando (BUG INTENCIONAL)
  // O processador de pagamento falha se o amount for maior que 5000 por limite de segurança não tratado.
  if (amount > 5000) {
    throw new Error('PaymentProcessorException: Limite de transação excedido. Contate o suporte da adquirente.');
  }

  // Simula chamada externa
  return { status: 'success', transactionId: 'txn_' + Date.now() };
}
