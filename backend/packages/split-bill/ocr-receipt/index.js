const vision = require('@google-cloud/vision');

function getCorsHeaders(env) {
  return {
    'Access-Control-Allow-Origin': env.CORS_ORIGIN || '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

function createVisionClient(env) {
  const credentials = JSON.parse(Buffer.from(env.GOOGLE_CREDENTIALS_B64, 'base64').toString());
  return new vision.ImageAnnotatorClient({ credentials });
}

async function main(args) {
  const headers = getCorsHeaders(args);

  if (args.__ow_method === 'options') {
    return { statusCode: 204, headers };
  }

  try {
    const { image } = args;
    if (!image) {
      return { statusCode: 400, headers, body: { error: 'Missing image parameter' } };
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
      headers,
      body: { fullText, annotations },
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: { error: err.message },
    };
  }
}

exports.main = main;
