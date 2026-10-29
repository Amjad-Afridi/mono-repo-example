const test = require('node:test');
const assert = require('node:assert/strict');

const shared = require('./index.js');

test('shared API_URL is deployed-host friendly', () => {
  assert.equal(shared.API_URL, '/api');
});
