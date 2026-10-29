const test = require('node:test');
const assert = require('node:assert/strict');

const app = require('./app');

let server;
let baseUrl;

test.before(async () => {
  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

test.after(() => server.close());

test('GET /health returns ok', async () => {
  const response = await fetch(`${baseUrl}/health`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: 'ok' });
});

test('items CRUD flow', async () => {
  const created = await fetch(`${baseUrl}/api/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: '  Test item  ', description: 'desc' }),
  });
  assert.equal(created.status, 201);
  const item = await created.json();
  assert.equal(item.title, 'Test item');

  const updated = await fetch(`${baseUrl}/api/items/${item.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Renamed', done: true }),
  });
  assert.equal(updated.status, 200);
  assert.equal((await updated.json()).done, true);

  const deleted = await fetch(`${baseUrl}/api/items/${item.id}`, { method: 'DELETE' });
  assert.equal(deleted.status, 200);

  const missing = await fetch(`${baseUrl}/api/items/${item.id}`);
  assert.equal(missing.status, 404);
});

test('POST /api/items rejects a missing title', async () => {
  const response = await fetch(`${baseUrl}/api/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ description: 'no title' }),
  });
  assert.equal(response.status, 400);
});

test('unknown /api routes return JSON 404', async () => {
  const response = await fetch(`${baseUrl}/api/nope`);
  assert.equal(response.status, 404);
  assert.deepEqual(await response.json(), { message: 'Not found' });
});
