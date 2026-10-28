import { useEffect, useState } from 'react';
import shared from '@crud/shared';

const { API_URL, createEmptyItem } = shared;

export default function App() {
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

      if (!response.ok) {
        throw new Error('Request failed');
      }

      resetForm();
      loadItems();
    } catch (err) {
      setError('Could not save the item.');
    }
  }

  async function handleDelete(id) {
    try {
      const response = await fetch(`${API_URL}/items/${id}`, { method: 'DELETE' });

      if (!response.ok) {
        throw new Error('Delete failed');
      }

      setItems((current) => current.filter((item) => item.id !== id));

      if (editingId === id) {
        resetForm();
      }
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

  function resetForm() {
    setForm(createEmptyItem());
    setEditingId(null);
    setError('');
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <h1>Simple CRUD App</h1>
      </header>

      <main className="content">
        <section className="form-card">
          <h2>{editingId ? 'Edit item' : 'Create item'}</h2>

          <form onSubmit={handleSubmit}>
            <label>
              Title
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Enter title"
              />
            </label>

            <label>
              Description
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Optional description"
                rows="4"
              />
            </label>

            <label className="checkbox-row">
              <input
                type="checkbox"
                name="done"
                checked={form.done}
                onChange={handleChange}
              />
              Mark as done
            </label>

            {error && <p className="error-message">{error}</p>}

            <div className="button-row">
              <button type="submit">{editingId ? 'Save changes' : 'Add item'}</button>
              {editingId && (
                <button type="button" className="secondary" onClick={resetForm}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="list-card">
          <h2>Items</h2>

          {items.length === 0 ? (
            <p className="empty-state">No items yet.</p>
          ) : (
            <ul className="item-list">
              {items.map((item) => (
                <li key={item.id} className={`item ${item.done ? 'done' : ''}`}>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.description || 'No description provided'}</p>
                  </div>

                  <div className="item-actions">
                    <span className="status">{item.done ? 'Done' : 'Open'}</span>
                    <button type="button" onClick={() => startEdit(item)}>
                      Edit
                    </button>
                    <button type="button" className="danger" onClick={() => handleDelete(item.id)}>
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
