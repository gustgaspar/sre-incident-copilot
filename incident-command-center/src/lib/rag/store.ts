import { embedMany, embed } from 'ai';
import { getEmbeddingModel } from '../ai/provider';
import fs from 'fs';
import path from 'path';

export interface CodeFile {
  filename: string;
  content: string;
  embedding?: number[];
}

// In-memory store para os embeddings dos códigos mockados
let vectorStore: CodeFile[] = [];

// Função matemática simples para calcular similaridade de cosseno
function cosineSimilarity(a: number[], b: number[]) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Lê os arquivos do mock-codebase, gera embeddings e os armazena em memória.
 * Deve ser chamado na inicialização ou no primeiro uso.
 */
export async function initializeVectorStore() {
  if (vectorStore.length > 0) return; // Já inicializado

  console.log('[RAG] Inicializando In-Memory Vector Store...');
  const dirPath = path.join(process.cwd(), 'src', 'data', 'mock-codebase');
  const files = fs.readdirSync(dirPath);

  const codeFiles: CodeFile[] = files.map(file => ({
    filename: file,
    content: fs.readFileSync(path.join(dirPath, file), 'utf-8'),
  }));

  try {
    const model = getEmbeddingModel();
    const { embeddings } = await embedMany({
      model,
      values: codeFiles.map(f => `File: ${f.filename}\nContent:\n${f.content}`),
    });

    vectorStore = codeFiles.map((file, i) => ({
      ...file,
      embedding: embeddings[i],
    }));

    console.log(`[RAG] Vector Store inicializado com sucesso (${vectorStore.length} arquivos).`);
  } catch (error) {
    console.error('[RAG] Erro ao inicializar embeddings. Verifique as chaves de API no .env.', error);
    // Para evitar que a aplicação quebre totalmente se não houver chave
    vectorStore = codeFiles; 
  }
}

/**
 * Busca o arquivo mais relevante para a query informada (geralmente o stack trace do erro).
 */
export async function searchCodebase(query: string, topK: number = 1): Promise<CodeFile[]> {
  await initializeVectorStore();

  if (vectorStore.length === 0 || !vectorStore[0].embedding) {
      console.warn('[RAG] Embeddings não disponíveis. Retornando os primeiros arquivos como fallback.');
      return vectorStore.slice(0, topK);
  }

  try {
    const { embedding: queryEmbedding } = await embed({
      model: getEmbeddingModel(),
      value: query,
    });

    const results = vectorStore
      .map(file => ({
        ...file,
        similarity: cosineSimilarity(queryEmbedding, file.embedding!),
      }))
      .sort((a, b) => b.similarity - a.similarity);

    return results.slice(0, topK);
  } catch (e) {
    console.error('[RAG] Erro na busca vetorial', e);
    return vectorStore.slice(0, topK); // Fallback
  }
}
