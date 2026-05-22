import { streamText, convertToModelMessages } from 'ai';
import { getAIModel } from '@/lib/ai/provider';
import { getIncidentById } from '@/lib/incident-store';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, incidentId } = await req.json();

  const incident = getIncidentById(incidentId);

  // Define o contexto (System Prompt) para a IA baseando-se nos dados reais do incidente e RAG
  const systemPrompt = `
    Você é um Engenheiro de SRE Sênior e está conduzindo uma "War Room" (sala de guerra) para resolver um incidente.
    Você e outro dev estão debruçados sobre o problema.

    DADOS DO INCIDENTE ATUAL:
    - Título: ${incident?.title || 'Desconhecido'}
    - Arquivos Suspeitos: ${incident?.aiAnalysis.suspectedFiles.join(', ') || 'Nenhum'}
    - Resumo da Causa Raiz: ${incident?.aiAnalysis.summary || 'Nenhum'}
    - Erro Original Reportado: ${JSON.stringify(incident?.originalError)}

    PLANO DE MITIGAÇÃO PROPOSTO PELA TRIAGEM AUTOMÁTICA:
    ${incident?.aiAnalysis.mitigationPlan}

    Responda em português, de forma técnica e direta, como um colega de trabalho sênior ajudando a debugar e resolver.
  `;

  // Sanitiza as mensagens recebidas da UI para garantir que o campo 'parts' exista,
  // evitando que o convertToModelMessages lance TypeError caso apenas o 'content' esteja presente.
  const sanitizedMessages = (messages || []).map((m: any) => ({
    ...m,
    parts: m.parts ?? [{ type: 'text', text: m.content || '' }]
  }));

  const result = streamText({
    model: getAIModel(),
    system: systemPrompt,
    messages: await convertToModelMessages(sanitizedMessages),
  });

  return result.toUIMessageStreamResponse();
}
