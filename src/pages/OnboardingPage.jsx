// src/pages/OnboardingPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import Navbar from '../components/Navbar';
import { getDefaultsFor } from '../utils/propertyDefaults';

const US_TIMEZONES = [
  'America/New_York', 'America/Chicago', 'America/Denver',
  'America/Los_Angeles', 'America/Phoenix', 'America/Anchorage', 'Pacific/Honolulu'
];

export default function OnboardingPage() {
  const [profile, setProfile] = useState({
    accountName: '',
    type: 'hotel',
    timezone: '',
    phone_number: '',
    address: '',
    city: '',
    state: '',
    zip_code: ''
  });
  const [propertyCount, setPropertyCount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) navigate('/login');
    })();
  }, [navigate]);

  const handleChange = (field, value) =>
    setProfile(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user.id;

      // Ensure profile exists
      await supabase.from('profiles').upsert({ id: userId }, { onConflict: 'id' });

      // Insert new hotel with full fields
      const { data: hotel, error: hotelErr } = await supabase
        .from('hotels')
        .insert([{
          profile_id: userId,
          name: profile.accountName,
          type: profile.type,
          timezone: profile.timezone,
          phone_number: profile.phone_number,
          address: profile.address,
          city: profile.city,
          state: profile.state,
          zip_code: profile.zip_code
        }])
        .select('id')
        .single();
      if (hotelErr) throw hotelErr;
      const hotelId = hotel.id;

      // Update profile record with property count estimate
      await supabase.from('profiles')
        .update({
          account_name: profile.accountName,
          property_type: profile.type,
          hotel_id: hotelId,
          property_count_estimate: propertyCount
        })
        .eq('id', userId);

      // Seed default departments and SLA
      const defaults = getDefaultsFor(profile.type);
      const deptSeed = defaults.map(dept => ({ hotel_id: hotelId, department: dept, enabled: true }));
      await supabase.from('department_settings').upsert(deptSeed, { onConflict: ['hotel_id','department'] });

      const slaSeed = defaults.map(dept => ({
        hotel_id: hotelId,
        department: dept,
        ack_time_minutes: 5,
        res_time_minutes: 30,
        is_active: false
      }));
      await supabase.from('sla_settings').upsert(slaSeed, { onConflict: ['hotel_id','department'] });

      navigate('/dashboard');
    } catch (err) {
      console.error('Onboarding error:', err);
      setError(err.message || 'Onboarding failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-operon-background pt-24 px-4 flex items-center justify-center">
        <form onSubmit={handleSubmit} className="w-full max-w-lg bg-white p-8 rounded-lg shadow-lg space-y-6">
          <h1 className="text-2xl font-semibold text-center text-operon-charcoal">
            Welcome! Let’s set up your property
          </h1>

          {error && <p className="text-red-600 text-center">{error}</p>}

          <input
            type="text"
            placeholder="Account Name"
            value={profile.accountName}
            onChange={e => handleChange('accountName', e.target.value)}
            required
            className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-operon-blue"
          />

          <select
            value={profile.type}
            onChange={e => handleChange('type', e.target.value)}
            required
            className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-operon-blue"
          >
            <option value="hotel">Hotel</option>
            <option value="apartment">Apartment</option>
            <option value="condo">Condo</option>
            <option value="restaurant">Restaurant</option>
          </select>

          {/* New: Property Count Dropdown */}
          <div>
            <label htmlFor="propertyCount" className="block text-sm font-medium text-gray-700">
              How many properties will you manage?
            </label>
            <select
              id="propertyCount"
              name="propertyCount"
              value={propertyCount}
              onChange={e => setPropertyCount(e.target.value)}
              required
              className="mt-1 block w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-operon-blue"
            >
              <option value="">Select one</option>
              <option value="1">1</option>
              <option value="2-5">2–5</option>
              <option value="6-10">6–10</option>
              <option value="10+">10+</option>
            </select>
          </div>

          <select
            value={profile.timezone}
            onChange={e => handleChange('timezone', e.target.value)}
            required
            className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-operon-blue"
          >
            <option value="">Select Timezone</option>
            {US_TIMEZONES.map(z => <option key={z} value={z}>{z}</option>)}
          </select>

          <input
            type="tel"
            placeholder="Phone Number"
            value={profile.phone_number}
            onChange={e => handleChange('phone_number', e.target.value)}
            className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-operon-blue"
          />

          <input
            type="text"
            placeholder="Address"
            value={profile.address}
            onChange={e => handleChange('address', e.target.value)}
            className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-operon-blue"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="City"
              value={profile.city}
              onChange={e => handleChange('city', e.target.value)}
              className="border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-operon-blue"
            />
            <input
              type="text"
              placeholder="State"
              value={profile.state}
              onChange={e => handleChange('state', e.target.value)}
              className="border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-operon-blue"
            />
            <input
              type="text"
              placeholder="ZIP Code"
              value={profile.zip_code}
              onChange={e => handleChange('zip_code', e.target.value)}
              className="border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-operon-blue"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !propertyCount}
            className="w-full bg-operon-blue text-white py-2 rounded font-medium hover:bg-blue-500 transition disabled:opacity-50"
          >
            {loading ? 'Setting up…' : 'Get Started'}
          </button>
        </form>
      </div>
    </>
  );
}
