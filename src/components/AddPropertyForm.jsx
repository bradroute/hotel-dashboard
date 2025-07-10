import React, { useState, useContext } from 'react';
import { PropertyContext } from '../contexts/PropertyContext';
import { motion } from 'framer-motion';

const formVariants = {
  initial: { opacity: 0, scale: 0.97, y: 32 },
  animate: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] } },
  exit: { opacity: 0, scale: 0.97, y: 24, transition: { duration: 0.18 } },
};

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
    <motion.form
      onSubmit={handleSubmit}
      variants={formVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-4 p-4 bg-white rounded shadow"
    >
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
      {/* --- Timezone Dropdown --- */}
      <select
        required
        value={form.timezone}
        onChange={handleChange('timezone')}
        className="w-full border p-2 rounded"
      >
        <option value="">Select Timezone</option>
        <option value="America/New_York">Eastern Time (America/New_York)</option>
        <option value="America/Chicago">Central Time (America/Chicago)</option>
        <option value="America/Denver">Mountain Time (America/Denver)</option>
        <option value="America/Los_Angeles">Pacific Time (America/Los_Angeles)</option>
        <option value="America/Phoenix">Arizona (America/Phoenix)</option>
        <option value="America/Anchorage">Alaska (America/Anchorage)</option>
        <option value="Pacific/Honolulu">Hawaii (Pacific/Honolulu)</option>
      </select>
      {/* --- End Timezone Dropdown --- */}
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
    </motion.form>
  );
}
