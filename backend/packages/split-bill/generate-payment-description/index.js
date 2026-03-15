const { VertexAI } = require('@google-cloud/vertexai');

function getCorsHeaders(env) {
  return {
    'Access-Control-Allow-Origin': env.CORS_ORIGIN || '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

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

function createVertex(env) {
  const credentials = JSON.parse(env.GOOGLE_CREDENTIALS);
  return new VertexAI({
    project: env.GOOGLE_PROJECT_ID || credentials.project_id,
    location: env.GOOGLE_LOCATION || 'us-central1',
    googleAuthOptions: { credentials },
  });
}

async function main(args) {
  const headers = getCorsHeaders(args);

  if (args.__ow_method === 'options') {
    return { statusCode: 204, headers };
  }

  try {
    const { restaurantName, participantName } = args;

    const vertex = createVertex(args);
    const model = vertex.getGenerativeModel({
      model: 'gemini-2.5-flash-preview-05-20',
      generationConfig: { temperature: 0.3, maxOutputTokens: 100 },
    });

    const userMessage = `Restaurace: ${restaurantName || 'neznámá'}\nOsoba: ${participantName || 'neznámá'}`;

    const result = await model.generateContent([
      { role: 'user', parts: [{ text: PROMPT + '\n\n' + userMessage }] },
    ]);

    let description = result.response.candidates[0].content.parts[0].text.trim();
    // Clean up: strip quotes, ensure uppercase ASCII only
    description = description.replace(/^["']|["']$/g, '').toUpperCase();
    description = description.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    description = description.replace(/[^A-Z0-9 \-]/g, '').slice(0, 60);

    return { statusCode: 200, headers, body: { description } };
  } catch (err) {
    return { statusCode: 500, headers, body: { error: err.message } };
  }
}

exports.main = main;
