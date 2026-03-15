#!/usr/bin/env node

/**
 * Test for the exchange-rate function.
 * Run: node test/test-exchange-rate.js
 */

const path = require('path');
const fn = require(path.join(__dirname, '..', 'packages', 'split-bill', 'exchange-rate', 'index.js'));

async function test(name, args, check) {
  try {
    const result = await fn.main(args);
    check(result);
    console.log(`✓ ${name}`);
  } catch (err) {
    console.error(`✗ ${name}: ${err.message}`);
    process.exitCode = 1;
  }
}

(async () => {
  await test('returns EUR rate', { currency: 'EUR' }, (r) => {
    if (r.statusCode !== 200) throw new Error(`Expected 200, got ${r.statusCode}`);
    if (typeof r.body.rate !== 'number') throw new Error('rate should be a number');
    if (r.body.rate < 20 || r.body.rate > 30) throw new Error(`EUR rate ${r.body.rate} seems wrong`);
    if (r.body.currency !== 'EUR') throw new Error(`Expected EUR, got ${r.body.currency}`);
  });

  await test('returns USD rate', { currency: 'USD' }, (r) => {
    if (r.statusCode !== 200) throw new Error(`Expected 200, got ${r.statusCode}`);
    if (typeof r.body.rate !== 'number') throw new Error('rate should be a number');
  });

  await test('handles lowercase currency', { currency: 'eur' }, (r) => {
    if (r.statusCode !== 200) throw new Error(`Expected 200, got ${r.statusCode}`);
  });

  await test('returns 404 for unknown currency', { currency: 'XXX' }, (r) => {
    if (r.statusCode !== 404) throw new Error(`Expected 404, got ${r.statusCode}`);
  });

  await test('returns 400 for missing currency', {}, (r) => {
    if (r.statusCode !== 400) throw new Error(`Expected 400, got ${r.statusCode}`);
  });

  await test('handles OPTIONS preflight', { __ow_method: 'options' }, (r) => {
    if (r.statusCode !== 204) throw new Error(`Expected 204, got ${r.statusCode}`);
    if (!r.headers['Access-Control-Allow-Origin']) throw new Error('Missing CORS header');
  });

  console.log('\nAll exchange-rate tests passed.');
})();
