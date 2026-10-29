const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const { randomUUID } = require('crypto');

const app = express();
const corsOrigin = process.env.CORS_ORIGIN;
const webDistDir = process.env.WEB_DIST_DIR || path.join(__dirname, '..', 'web', 'dist');

const items = [
  {
    id: '1',
    title: 'Buy groceries',
    description: 'Milk, bread, and eggs',
    done: false,
  },
  {
    id: '2',
    title: 'Finish CRUD app',
    description: 'Create the full flow with edit and delete',
    done: true,
  },
];

app.disable('x-powered-by');
app.set('trust proxy', 1);
// CORS_ORIGIN is a comma-separated allowlist; unset allows any origin.
app.use(cors(corsOrigin ? { origin: corsOrigin.split(',').map((origin) => origin.trim()) } : undefined));
app.use(express.json({ limit: '100kb' }));

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/items', (req, res) => {
  res.json(items);
});

app.get('/api/items/:id', (req, res) => {
  const item = items.find((entry) => entry.id === req.params.id);

  if (!item) {
    return res.status(404).json({ message: 'Item not found' });
  }

  res.json(item);
});

app.post('/api/items', (req, res) => {
  const { title, description, done } = req.body || {};

  if (!title || typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ message: 'Title is required' });
  }

  const newItem = {
    id: randomUUID(),
    title: title.trim(),
    description: typeof description === 'string' ? description.trim() : '',
    done: Boolean(done),
  };

  items.unshift(newItem);
  res.status(201).json(newItem);
});

app.put('/api/items/:id', (req, res) => {
  const { title, description, done } = req.body || {};
  const itemIndex = items.findIndex((entry) => entry.id === req.params.id);

  if (itemIndex === -1) {
    return res.status(404).json({ message: 'Item not found' });
  }

  if (!title || typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ message: 'Title is required' });
  }

  items[itemIndex] = {
    ...items[itemIndex],
    title: title.trim(),
    description: typeof description === 'string' ? description.trim() : '',
    done: Boolean(done),
  };

  res.json(items[itemIndex]);
});

app.delete('/api/items/:id', (req, res) => {
  const itemIndex = items.findIndex((entry) => entry.id === req.params.id);

  if (itemIndex === -1) {
    return res.status(404).json({ message: 'Item not found' });
  }

  const [deletedItem] = items.splice(itemIndex, 1);
  res.json({ message: 'Item deleted', item: deletedItem });
});

app.use('/api', (req, res) => {
  res.status(404).json({ message: 'Not found' });
});

// In production the API also serves the built React app (single deployable).
if (fs.existsSync(webDistDir)) {
  app.use(express.static(webDistDir, { index: false, maxAge: '1h' }));

  app.get('*', (req, res) => {
    res.sendFile(path.join(webDistDir, 'index.html'));
  });
}

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.expose ? err.message : 'Internal server error' });
});

module.exports = app;
