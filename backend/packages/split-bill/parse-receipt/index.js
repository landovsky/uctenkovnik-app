const { VertexAI } = require('@google-cloud/vertexai');

function getCorsHeaders(env) {
  return {
    'Access-Control-Allow-Origin': env.CORS_ORIGIN || '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

const PROMPT = `Jsi expert na analýzu účtenek z restaurací. Dostáváš OCR výstup z Google Vision API.

Extrahuj strukturovanou tabulku položek z účtenky. Pro každou položku uveď:
- name: název položky česky (přelož pokud je v jiném jazyce)
- originalName: původní název z účtenky
- quantity: počet kusů (výchozí 1)
- unitPrice: jednotková cena (číslo)
- totalPrice: celková cena = quantity × unitPrice (číslo)

Dále extrahuj:
- restaurantName: název restaurace (pokud je na účtence)
- currency: měna (ISO 4217 kód, např. CZK, EUR, USD). Pokud není jasná, použij CZK.
- receiptTotal: celková částka na účtence

DŮLEŽITÉ:
- Rozliš jednotlivé položky od mezisoučtů a celkových součtů.
- Pokud je u položky uvedeno množství (např. 2x), správně ho rozpoznej.
- Neuvádej řádky jako "celkem", "součet", "DPH" jako položky.
- Vrať POUZE validní JSON, bez dalšího textu.

Vrať JSON ve formátu:
{
  "restaurantName": "...",
  "currency": "CZK",
  "receiptTotal": 0,
  "items": [{"name": "...", "originalName": "...", "quantity": 1, "unitPrice": 0, "totalPrice": 0}]
}`;

function createVertex(env) {
  const credentials = JSON.parse(Buffer.from(env.GOOGLE_CREDENTIALS_B64, 'base64').toString());
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
    const { fullText, annotations } = args;
    if (!fullText) {
      return { statusCode: 400, headers, body: { error: 'Missing fullText parameter' } };
    }

    const vertex = createVertex(args);
    const model = vertex.getGenerativeModel({
      model: 'gemini-2.5-flash-preview-05-20',
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.1,
      },
    });

    const userMessage = `OCR text:\n${fullText}\n\nOCR annotations (first 100):\n${JSON.stringify((annotations || []).slice(0, 100))}`;

    const result = await model.generateContent([
      { role: 'user', parts: [{ text: PROMPT + '\n\n' + userMessage }] },
    ]);

    const response = result.response;
    const text = response.candidates[0].content.parts[0].text;
    const parsed = JSON.parse(text);

    return { statusCode: 200, headers, body: parsed };
  } catch (err) {
    return { statusCode: 500, headers, body: { error: err.message } };
  }
}

exports.main = main;
