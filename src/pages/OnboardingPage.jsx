// src/pages/OnboardingPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import Navbar from '../components/Navbar';
import { getDefaultsFor } from '../utils/propertyDefaults';

export default function OnboardingPage() {
  const [accountName, setAccountName] = useState('');
  const [propertyType, setPropertyType] = useState('hotel');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || !session.user) {
        navigate('/login');
      }
    })();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user.id;

      // 1) Update profile with account_name and property_type
      await supabase
        .from('profiles')
        .update({ account_name: accountName, property_type: propertyType })
        .eq('id', userId);

      // 2) Create hotel/property record using correct profile_id column
      const { data: hotel, error: hotelErr } = await supabase
        .from('hotels')
        .insert([{ profile_id: userId, type: propertyType, name: accountName }])
        .select('id')
        .single();
      if (hotelErr) throw hotelErr;

      const hotelId = hotel.id;

      // 3) Link hotel_id back to profile
      await supabase
        .from('profiles')
        .update({ hotel_id: hotelId })
        .eq('id', userId);

      // 4) Seed default department_settings
      const defaults = getDefaultsFor(propertyType);
      const seedData = defaults.map(dept => ({ hotel_id: hotelId, department: dept, enabled: true }));
      const { error: seedErr } = await supabase
        .from('department_settings')
        .insert(seedData);
      if (seedErr) throw seedErr;

      // 5) Navigate to dashboard
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Onboarding failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-operon-background pt-24 px-4 flex items-center justify-center">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-lg bg-white p-8 rounded-lg shadow-lg space-y-6"
        >
          <h1 className="text-2xl font-semibold text-operon-charcoal text-center">
            Welcome! Let’s set up your account
          </h1>

          {error && <p className="text-red-600 text-center">{error}</p>}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Account Name
            </label>
            <input
              type="text"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              placeholder="E.g. The Grand Hotel"
              required
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-operon-blue"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Property Type
            </label>
            <select
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-operon-blue"
            >
              <option value="hotel">Hotel</option>
              <option value="apartment">Apartment</option>
              <option value="condo">Condo</option>
              <option value="restaurant">Restaurant</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-operon-blue hover:bg-blue-400 text-white py-2 rounded font-medium transition disabled:opacity-50"
          >
            {loading ? 'Setting up…' : 'Get Started'}
          </button>
        </form>
      </div>
    </>
  );
}
