const CNB_URL = 'https://www.cnb.cz/cs/financni-trhy/devizovy-trh/kurzy-devizoveho-trhu/kurzy-devizoveho-trhu/denni_kurz.txt';

let cache = { data: null, date: null };

function getCorsHeaders(env) {
  return {
    'Access-Control-Allow-Origin': env.CORS_ORIGIN || '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

function parseCnbRates(text) {
  const lines = text.trim().split('\n');
  // Line 0: date header, Line 1: column headers, Line 2+: data
  const dateMatch = lines[0].match(/(\d{2}\.\d{2}\.\d{4})/);
  const date = dateMatch ? dateMatch[1] : '';

  const rates = {};
  for (let i = 2; i < lines.length; i++) {
    const parts = lines[i].split('|');
    if (parts.length < 5) continue;
    // země|měna|množství|kód|kurz
    const code = parts[3].trim();
    const quantity = parseInt(parts[2].trim(), 10);
    const rate = parseFloat(parts[4].trim().replace(',', '.'));
    rates[code] = rate / quantity;
  }

  return { date, rates };
}

async function main(args) {
  const headers = getCorsHeaders(args);

  if (args.__ow_method === 'options') {
    return { statusCode: 204, headers };
  }

  try {
    const { currency } = args;
    if (!currency) {
      return { statusCode: 400, headers, body: { error: 'Missing currency parameter' } };
    }

    const code = currency.toUpperCase();
    const today = new Date().toISOString().split('T')[0];

    if (!cache.data || cache.date !== today) {
      const response = await fetch(CNB_URL);
      const text = await response.text();
      cache = { data: parseCnbRates(text), date: today };
    }

    const rate = cache.data.rates[code];
    if (!rate) {
      return { statusCode: 404, headers, body: { error: `Currency ${code} not found` } };
    }

    return {
      statusCode: 200,
      headers,
      body: { rate, date: cache.data.date, currency: code },
    };
  } catch (err) {
    return { statusCode: 500, headers, body: { error: err.message } };
  }
}

exports.main = main;
