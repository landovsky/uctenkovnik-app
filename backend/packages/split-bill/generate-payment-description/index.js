const { GoogleGenerativeAI } = require('@google/generative-ai');

const PROMPT = `Vygeneruj krátký popis platby pro QR kód bankovního převodu.

Pravidla:
- Max 60 znaků
- Pouze ASCII velká písmena, čísla, mezery, pomlčky (bez diakritiky)
- Stručný a výstižný popis
- Vrať POUZE text popisu, nic jiného

Příklady:
- "VECERE V PASTA PIZZA - PODIL TOMAS"
- "OBED U FRANTISKA - ANNA"
- "RESTAURACE MLYNEC - PODIL PETR"`;

async function main(args) {
  try {
    const { restaurantName, participantName } = args;

    const genAI = new GoogleGenerativeAI(args.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: 'gemini-3-flash-preview',
      generationConfig: { temperature: 0.3, maxOutputTokens: 100 },
    });

    const userMessage = `Restaurace: ${restaurantName || 'neznámá'}\nOsoba: ${participantName || 'neznámá'}`;

    const result = await model.generateContent(PROMPT + '\n\n' + userMessage);
    let description = result.response.text().trim();
    // Clean up: strip quotes, ensure uppercase ASCII only
    description = description.replace(/^["']|["']$/g, '').toUpperCase();
    description = description.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    description = description.replace(/[^A-Z0-9 \-]/g, '').slice(0, 60);

    return { statusCode: 200, body: { description } };
  } catch (err) {
    return { statusCode: 500, body: { error: err.message } };
  }
}

exports.main = main;
