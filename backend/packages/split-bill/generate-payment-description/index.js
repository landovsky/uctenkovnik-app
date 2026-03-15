const { GoogleGenerativeAI } = require('@google/generative-ai');

const PROMPT = `Vygeneruj krátký název účtenky pro bankovní převod.

Na základě názvu restaurace, typu položek a aktuálního času dne vytvoř stručný popis.

Pravidla:
- Max 40 znaků
- Pouze ASCII velká písmena, čísla, mezery, pomlčky (bez diakritiky)
- Stručný a výstižný — typ jídla + název podniku
- Vrať POUZE text popisu, nic jiného
- NIKDY nepřidávej jméno osoby

Příklady:
- "VECERE V PIZZERII ALGURIA"
- "OBED U FRANTISKA"
- "SNIDANE V CAFE IMPERIAL"
- "DRINK BAR HEMINGWAY"`;

async function main(args) {
  try {
    const { restaurantName, items, hour } = args;

    const genAI = new GoogleGenerativeAI(args.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: 'gemini-3-flash-preview',
      generationConfig: { temperature: 0.3, maxOutputTokens: 100 },
    });

    const itemNames = (items || []).map((i) => i.name || i.originalName).slice(0, 10).join(', ');
    const userMessage = `Restaurace: ${restaurantName || 'neznámá'}\nPoložky: ${itemNames || 'neznámé'}\nHodina: ${hour ?? new Date().getHours()}`;

    let title;
    try {
      const result = await model.generateContent(PROMPT + '\n\n' + userMessage);
      title = result.response.text().trim();
    } catch {
      const result = await model.generateContent(PROMPT + '\n\n' + userMessage);
      title = result.response.text().trim();
    }

    // Clean up: strip quotes, ensure uppercase ASCII only
    title = title.replace(/^["']|["']$/g, '').toUpperCase();
    title = title.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    title = title.replace(/[^A-Z0-9 \-]/g, '').slice(0, 40);

    return { statusCode: 200, body: { title } };
  } catch (err) {
    return { statusCode: 500, body: { error: err.message } };
  }
}

exports.main = main;
