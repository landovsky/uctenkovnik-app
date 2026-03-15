const { GoogleGenerativeAI } = require('@google/generative-ai');

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

async function main(args) {
  try {
    const { fullText, annotations } = args;
    if (!fullText) {
      return { statusCode: 400, body: { error: 'Missing fullText parameter' } };
    }

    const genAI = new GoogleGenerativeAI(args.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: 'gemini-3-flash-preview',
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.1,
      },
    });

    const userMessage = `OCR text:\n${fullText}\n\nOCR annotations (first 100):\n${JSON.stringify((annotations || []).slice(0, 100))}`;

    const result = await model.generateContent(PROMPT + '\n\n' + userMessage);
    const text = result.response.text();
    const parsed = JSON.parse(text);

    return { statusCode: 200, body: parsed };
  } catch (err) {
    return { statusCode: 500, body: { error: err.message } };
  }
}

exports.main = main;
