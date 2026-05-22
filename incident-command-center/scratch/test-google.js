const { google } = require('@ai-sdk/google');
const { generateText } = require('ai');
const path = require('path');

// Carrega as variáveis de ambiente do arquivo .env manualmente para o script de teste
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function main() {
  console.log("Testando conexão com a API do Google Gemini...");
  console.log("API Key presente:", !!process.env.GOOGLE_GENERATIVE_AI_API_KEY);
  
  const models = [
    'gemini-1.5-flash',
    'gemini-1.5-pro',
    'gemini-2.5-flash',
    'gemini-2.0-flash-exp'
  ];

  for (const modelName of models) {
    try {
      console.log(`\nTestando modelo: ${modelName}...`);
      const { text } = await generateText({
        model: google(modelName),
        prompt: 'Olá, responda apenas: Gemini funcionando!',
      });
      console.log(`-> SUCESSO com ${modelName}:`, text.trim());
      break;
    } catch (error) {
      console.error(`-> FALHA com ${modelName}:`, error.message || error);
    }
  }
}

main();
