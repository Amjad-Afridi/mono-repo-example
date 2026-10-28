const express = require('express');
const path = require('path');
const cors = require('cors');
const { randomUUID } = require('crypto');
const { API_URL } = require('@crud/shared');

const app = express();
const PORT = 4000;
const webDir = path.join(__dirname, '..', 'web');

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

app.use(cors());
app.use(express.json());
app.use(express.static(webDir));

app.get('/', (req, res) => {
  res.sendFile(path.join(webDir, 'index.html'));
});

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

app.listen(PORT, () => {
  console.log(`API running on ${API_URL}`);
});
