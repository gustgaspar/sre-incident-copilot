const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function main() {
  const key = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!key) {
    console.error("GOOGLE_GENERATIVE_AI_API_KEY não encontrada no .env");
    return;
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.error) {
      console.error("Erro da API:", data.error);
      return;
    }

    console.log("Modelos Disponíveis:");
    const embedModels = data.models.filter(m => m.supportedGenerationMethods.includes('embedContent'));
    console.log("\n--- Modelos de Embedding ---");
    embedModels.forEach(m => console.log(`- ${m.name}`));

    const chatModels = data.models.filter(m => m.supportedGenerationMethods.includes('generateContent'));
    console.log("\n--- Modelos de Chat ---");
    chatModels.forEach(m => console.log(`- ${m.name}`));

  } catch (error) {
    console.error("Erro na requisição:", error);
  }
}

main();
