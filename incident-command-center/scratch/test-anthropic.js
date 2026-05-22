const { anthropic } = require('@ai-sdk/anthropic');
const { generateText } = require('ai');
const path = require('path');

// Carrega as variáveis de ambiente do arquivo .env manualmente para o script de teste
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const models = [
  'claude-3-5-sonnet-20241022',
  'claude-3-5-haiku-20241022',
  'claude-3-haiku-20240307'
];

async function main() {
  console.log("Testando conexão com a API da Anthropic...");
  console.log("API Key presente:", !!process.env.ANTHROPIC_API_KEY);
  
  for (const modelName of models) {
    try {
      console.log(`\nTestando modelo: ${modelName}...`);
      const { text } = await generateText({
        model: anthropic(modelName),
        prompt: 'Olá, responda apenas: Anthropic funcionando!',
      });
      console.log(`-> SUCESSO com ${modelName}:`, text.trim());
      break; // Para no primeiro que funcionar!
    } catch (error) {
      console.error(`-> FALHA com ${modelName}:`, error.message || error);
    }
  }
}

main();
