import { NextResponse } from 'next/server';
import { generateObject } from 'ai';
import { z } from 'zod';
import { getAIModel } from '@/lib/ai/provider';
import { searchCodebase } from '@/lib/rag/store';
import { addIncident, Incident } from '@/lib/incident-store';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const errorDescription = payload.message || payload.error || JSON.stringify(payload);

    console.log(`[Webhook] Recebido novo alerta: ${errorDescription}`);

    // 1. RAG: Buscar os arquivos mais prováveis de conterem o bug
    const relevantFiles = await searchCodebase(errorDescription, 2);
    const contextStr = relevantFiles.map(f => `--- Arquivo: ${f.filename} ---\n${f.content}\n`).join('\n');

    // 2. Chamar LLM para triagem estruturada
    const model = getAIModel();
    
    // Usamos generateObject para forçar a IA a nos devolver um JSON perfeito e tipado
    const { object: triageResult } = await generateObject({
      model,
      schema: z.object({
        title: z.string().describe('Um título curto e claro para o incidente.'),
        severity: z.enum(['low', 'medium', 'high', 'critical']).describe('Severidade baseada no impacto e código.'),
        summary: z.string().describe('Um resumo executivo sobre o problema e sua causa raiz provável.'),
        suspectedFiles: z.array(z.string()).describe('Lista dos nomes de arquivos suspeitos de conterem o bug.'),
        mitigationPlan: z.string().describe('Um plano de mitigação passo a passo (em markdown) para o engenheiro corrigir o problema.'),
      }),
      prompt: `
        Você é um Engenheiro de Confiabilidade (SRE) Sênior. Você acabou de receber um alerta crítico de produção.
        
        ALERTA DE PRODUÇÃO:
        ${errorDescription}
        
        ARQUIVOS RELEVANTES DO CÓDIGO FONTE (Recuperados via RAG):
        ${contextStr}
        
        Analise o erro e o código fonte. Identifique a causa raiz e sugira um plano de mitigação.
        Preencha os campos estruturados de forma profissional e objetiva.
      `,
    });

    console.log(`[Webhook] Triagem concluída pela IA: ${triageResult.title}`);

    // 3. Salvar o incidente
    const incident: Incident = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      status: 'open',
      originalError: payload,
      title: triageResult.title,
      severity: triageResult.severity,
      aiAnalysis: {
        summary: triageResult.summary,
        suspectedFiles: triageResult.suspectedFiles,
        mitigationPlan: triageResult.mitigationPlan
      }
    };

    addIncident(incident);

    return NextResponse.json({ success: true, incidentId: incident.id });
  } catch (error) {
    console.error('[Webhook] Falha no processamento:', error);
    return NextResponse.json({ success: false, error: 'Falha no processamento do alerta.' }, { status: 500 });
  }
}
