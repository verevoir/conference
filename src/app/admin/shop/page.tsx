'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/context/UserContext';
import {
  createSwagProduct,
  listSwagProducts,
  deleteSwagProduct,
} from '@/actions/shop';
import type { SerializedDocument } from '@/lib/serialization';
import btn from '@/styles/Button.module.css';
import form from '@/styles/Form.module.css';
import table from '@/styles/Table.module.css';

export default function ShopAdminPage() {
  const [products, setProducts] = useState<SerializedDocument[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('0');
  const [currency, setCurrency] = useState('GBP');
  const [stock, setStock] = useState('100');
  const { can } = useUser();

  const refresh = () => {
    listSwagProducts().then(setProducts);
  };

  useEffect(() => {
    refresh();
  }, []);

  const handleCreate = async () => {
    await createSwagProduct({
      name,
      description: description || undefined,
      price: parseFloat(price),
      currency,
      stock: parseInt(stock, 10),
    });
    setShowForm(false);
    setName('');
    setDescription('');
    refresh();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    await deleteSwagProduct(id);
    refresh();
  };

  if (!can('create')) return <p>Organiser access required.</p>;

  return (
    <div>
      <h1>Swag Products</h1>
      <button onClick={() => setShowForm(!showForm)} className={btn.primary}>
        {showForm ? 'Cancel' : 'New Product'}
      </button>

      {showForm && (
        <div style={{ marginTop: '1rem', maxWidth: 400 }}>
          <div className={form.field}>
            <label className={form.label}>Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={form.input}
              placeholder="Conference T-Shirt"
            />
          </div>
          <div className={form.field}>
            <label className={form.label}>Description</label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={form.input}
            />
          </div>
          <div className={form.field}>
            <label className={form.label}>Price</label>
            <input
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className={form.input}
            />
          </div>
          <div className={form.field}>
            <label className={form.label}>Currency</label>
            <input
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className={form.input}
            />
          </div>
          <div className={form.field}>
            <label className={form.label}>Stock</label>
            <input
              type="number"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              className={form.input}
            />
          </div>
          <button onClick={handleCreate} className={btn.primary}>
            Create Product
          </button>
        </div>
      )}

      {products.length > 0 && (
        <div className={table.tableWrapper} style={{ marginTop: '1.5rem' }}>
          <table className={table.table}>
            <thead>
              <tr>
                <th className={table.th}>Name</th>
                <th className={table.th}>Price</th>
                <th className={table.th}>Stock</th>
                <th className={table.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const d = p.data as Record<string, unknown>;
                return (
                  <tr key={p.id} className={table.tr}>
                    <td className={table.td}>{String(d.name)}</td>
                    <td className={table.td}>
                      {String(d.currency)} {String(d.price)}
                    </td>
                    <td className={table.td}>{String(d.stock ?? 0)}</td>
                    <td className={table.td}>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className={btn.danger}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
