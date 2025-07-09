// src/components/AddPropertyForm.jsx
import React, { useState, useContext } from 'react';
import { PropertyContext } from '../contexts/PropertyContext';

export default function AddPropertyForm({ onClose }) {
  const { addProperty } = useContext(PropertyContext);
  const [form, setForm] = useState({
    name:     '',
    type:     'hotel',
    timezone: '',
    address:  '',
    city:     '',
    state:    '',
    zip_code: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleChange = (field) => (e) =>
    setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await addProperty(form);
      onClose?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white rounded shadow">
      {error && <p className="text-red-600">{error}</p>}
      <input
        required placeholder="Property Name"
        value={form.name} onChange={handleChange('name')}
        className="w-full border p-2 rounded"
      />
      <select
        required value={form.type} onChange={handleChange('type')}
        className="w-full border p-2 rounded"
      >
        <option value="hotel">Hotel</option>
        <option value="apartment">Apartment</option>
        <option value="condo">Condo</option>
        <option value="restaurant">Restaurant</option>
      </select>
      <input
        required placeholder="Timezone"
        value={form.timezone} onChange={handleChange('timezone')}
        className="w-full border p-2 rounded"
      />
      <input
        placeholder="Address"
        value={form.address} onChange={handleChange('address')}
        className="w-full border p-2 rounded"
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <input
          placeholder="City"
          value={form.city} onChange={handleChange('city')}
          className="border p-2 rounded"
        />
        <input
          placeholder="State"
          value={form.state} onChange={handleChange('state')}
          className="border p-2 rounded"
        />
        <input
          placeholder="ZIP Code"
          value={form.zip_code} onChange={handleChange('zip_code')}
          className="border p-2 rounded"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-operon-blue text-white p-2 rounded disabled:opacity-50"
      >
        {loading ? 'Adding…' : 'Add Property'}
      </button>
    </form>
  );
}
