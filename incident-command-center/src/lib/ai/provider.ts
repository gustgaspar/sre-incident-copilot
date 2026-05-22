import { google } from '@ai-sdk/google';
import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { LanguageModel } from 'ai';

/**
 * Retorna o modelo de IA com base nas chaves de API disponíveis no ambiente.
 * Implementa a estratégia de Fallback: Gemini -> OpenAI -> Claude
 */
export function getAIModel(): LanguageModel {
  // Prioridade 1: Gemini (Modelo Flash de última geração estável de baixíssimo custo e rápido)
  if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    console.log('[AI Provider] Usando Gemini (gemini-2.5-flash)');
    return google('gemini-2.5-flash');
  }
  
  // Prioridade 2: OpenAI (Modelo Mini de baixíssimo custo e rápido)
  if (process.env.OPENAI_API_KEY) {
    console.log('[AI Provider] Usando OpenAI (gpt-4o-mini)');
    return openai('gpt-4o-mini');
  }
  
  // Prioridade 3: Anthropic (Claude 3.5 Haiku, modelo mais barato e rápido da Anthropic)
  if (process.env.ANTHROPIC_API_KEY) {
    console.log('[AI Provider] Usando Anthropic (claude-3-5-haiku-latest)');
    return anthropic('claude-3-5-haiku-latest');
  }

  throw new Error(
    'Nenhuma API Key de IA configurada no .env. Por favor, adicione GOOGLE_GENERATIVE_AI_API_KEY, OPENAI_API_KEY ou ANTHROPIC_API_KEY.'
  );
}

/**
 * Retorna o modelo de Embeddings para uso no RAG.
 * Suporta Gemini e OpenAI (Anthropic geralmente usa provedores terceiros como Voyage para embeddings).
 */
export function getEmbeddingModel() {
  if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return google.textEmbeddingModel('gemini-embedding-2');
  }
  
  if (process.env.OPENAI_API_KEY) {
    return openai.embedding('text-embedding-3-small');
  }

  throw new Error(
    'Nenhuma API Key suportada para Embeddings configurada no .env (Adicione Google ou OpenAI).'
  );
}
