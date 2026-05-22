const { google } = require('@ai-sdk/google');
const { generateText, embed } = require('ai');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function main() {
  console.log("Testando Gemini 2.5 Flash e gemini-embedding-2...");
  try {
    const { text } = await generateText({
      model: google('gemini-2.5-flash'),
      prompt: 'Olá, responda apenas: Gemini 2.5 funcionando!',
    });
    console.log("-> Chat:", text.trim());
    
    console.log("-> Testando gemini-embedding-2...");
    const { embedding } = await embed({
      model: google.textEmbeddingModel('gemini-embedding-2'),
      value: 'Teste de embedding',
    });
    console.log("-> Embedding gerado! Tamanho do vetor:", embedding.length);
  } catch (error) {
    console.error("Erro:", error);
  }
}

main();
