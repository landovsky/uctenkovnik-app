const vision = require('@google-cloud/vision');

function parseCredentials(b64) {
  const raw = Buffer.from(b64, 'base64').toString();
  return JSON.parse(raw.replace(/[\n\r\t]/g, (ch) => ch === '\n' ? '\\n' : ch === '\r' ? '\\r' : '\\t'));
}

function createVisionClient(env) {
  const credentials = parseCredentials(env.GOOGLE_CREDENTIALS_B64);
  return new vision.ImageAnnotatorClient({ credentials });
}

async function main(args) {
  try {
    const { image } = args;
    if (!image) {
      return { statusCode: 400, body: { error: 'Missing image parameter' } };
    }

    const client = createVisionClient(args);
    const request = {
      image: { content: image },
      features: [{ type: 'DOCUMENT_TEXT_DETECTION' }],
    };

    const [result] = await client.annotateImage(request);
    const fullText = result.fullTextAnnotation?.text || '';
    const annotations = (result.textAnnotations || []).slice(1).map((a) => ({
      text: a.description,
      boundingBox: a.boundingPoly?.vertices || [],
    }));

    return {
      statusCode: 200,
      body: { fullText, annotations },
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: { error: err.message },
    };
  }
}

exports.main = main;
