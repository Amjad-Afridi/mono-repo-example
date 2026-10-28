const { useEffect, useState } = React;

const API_URL = 'http://localhost:4000/api';

function createEmptyItem() {
  return { id: '', title: '', description: '', done: false };
}

function App() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(createEmptyItem());
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  async function loadItems() {
    try {
      const response = await fetch(`${API_URL}/items`);
      const data = await response.json();
      setItems(data);
      setError('');
    } catch (err) {
      setError('Unable to load items right now.');
    }
  }

  useEffect(() => {
    loadItems();
  }, []);

  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.title.trim()) {
      setError('Title is required.');
      return;
    }

    const payload = {
      title: form.title,
      description: form.description,
      done: form.done,
    };

    try {
      const response = await fetch(
        editingId ? `${API_URL}/items/${editingId}` : `${API_URL}/items`,
        {
          method: editingId ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) throw new Error('Request failed');

      setForm(createEmptyItem());
      setEditingId(null);
      loadItems();
    } catch (err) {
      setError('Could not save the item.');
    }
  }

  async function handleDelete(id) {
    try {
      const response = await fetch(`${API_URL}/items/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Delete failed');
      if (editingId === id) {
        setEditingId(null);
        setForm(createEmptyItem());
      }
      loadItems();
    } catch (err) {
      setError('Unable to delete item.');
    }
  }

  function startEdit(item) {
    setEditingId(item.id);
    setForm({
      id: item.id,
      title: item.title,
      description: item.description,
      done: item.done,
    });
    setError('');
  }

  return React.createElement(
    'div',
    { className: 'app' },
    React.createElement(
      'section',
      { className: 'card' },
      React.createElement('h1', null, 'CRUD App'),
      React.createElement(
        'form',
        { onSubmit: handleSubmit },
        React.createElement(
          'label',
          null,
          'Title',
          React.createElement('input', {
            type: 'text',
            name: 'title',
            value: form.title,
            onChange: handleChange,
            placeholder: 'Enter title',
          })
        ),
        React.createElement(
          'label',
          null,
          'Description',
          React.createElement('textarea', {
            name: 'description',
            value: form.description,
            onChange: handleChange,
            rows: 4,
            placeholder: 'Optional description',
          })
        ),
        React.createElement(
          'label',
          { style: { flexDirection: 'row', alignItems: 'center', gap: '10px' } },
          React.createElement('input', {
            type: 'checkbox',
            name: 'done',
            checked: form.done,
            onChange: handleChange,
          }),
          'Mark as done'
        ),
        error ? React.createElement('p', { className: 'error' }, error) : null,
        React.createElement(
          'div',
          { style: { display: 'flex', gap: '10px' } },
          React.createElement('button', { type: 'submit' }, editingId ? 'Save changes' : 'Add item'),
          editingId
            ? React.createElement(
                'button',
                { type: 'button', className: 'secondary', onClick: () => { setEditingId(null); setForm(createEmptyItem()); setError(''); } },
                'Cancel'
              )
            : null
        )
      )
    ),
    React.createElement(
      'section',
      { className: 'card' },
      React.createElement('h2', null, 'Items'),
      items.length === 0
        ? React.createElement('p', null, 'No items yet.')
        : React.createElement(
            'ul',
            { className: 'item-list' },
            items.map((item) =>
              React.createElement(
                'li',
                { key: item.id, className: 'item' },
                React.createElement(
                  'div',
                  null,
                  React.createElement('h3', null, item.title),
                  React.createElement('p', null, item.description || 'No description provided')
                ),
                React.createElement(
                  'div',
                  { className: 'item-actions' },
                  React.createElement('span', { className: 'status' }, item.done ? 'Done' : 'Open'),
                  React.createElement('button', { type: 'button', onClick: () => startEdit(item) }, 'Edit'),
                  React.createElement('button', { type: 'button', className: 'danger', onClick: () => handleDelete(item.id) }, 'Delete')
                )
              )
            )
          )
    )
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App));
