const errorPayload = {
  error: "PaymentProcessorException: Limite de transação excedido. Contate o suporte da adquirente.",
  stack: "Error: PaymentProcessorException\n    at processPayment (/app/src/payment.ts:42:15)\n    at Object.charge (/app/src/checkout.ts:12:5)",
  service: "payment-api",
  timestamp: new Date().toISOString()
};

console.log("Simulando disparo de Webhook para a API...");

fetch('http://localhost:3000/api/webhook/alert', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(errorPayload)
})
.then(res => res.json())
.then(data => {
  console.log("Resposta do Webhook:");
  console.log(JSON.stringify(data, null, 2));
  if (data.success) {
    console.log("SUCESSO! Atualize a página do Dashboard para ver o incidente (http://localhost:3000).");
  } else {
    console.log("FALHA na IA! Verifique se você configurou a API Key no .env");
  }
})
.catch(err => console.error("Erro na requisição. O servidor Next.js está rodando (npm run dev)?", err));
