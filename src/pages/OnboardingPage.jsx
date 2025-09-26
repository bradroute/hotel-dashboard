import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import { getDefaultsFor } from '../utils/propertyDefaults';
import { motion } from 'framer-motion';

const US_TIMEZONES = [
  'America/New_York', 'America/Chicago', 'America/Denver',
  'America/Los_Angeles', 'America/Phoenix', 'America/Anchorage', 'Pacific/Honolulu'
];

const SHOW_GRID_BG = false;

const fade = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

export default function OnboardingPage() {
  const [profile, setProfile] = useState({
    accountName: '',
    type: 'hotel',
    timezone: '',
    phone_number: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
  });
  const [propertyCount, setPropertyCount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Prefill account name (from user metadata) + timezone (if in US list)
  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { navigate('/login'); return; }
      const metaName = session.user.user_metadata?.account_name || '';
      const browserTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      setProfile(prev => ({
        ...prev,
        accountName: prev.accountName || metaName,
        timezone: prev.timezone || (US_TIMEZONES.includes(browserTz) ? browserTz : ''),
      }));
    })();
  }, [navigate]);

  const handleChange = (field, value) =>
    setProfile(prev => ({ ...prev, [field]: value }));

  const canSubmit = useMemo(() => (
    profile.accountName.trim().length > 1 &&
    !!profile.type &&
    !!profile.timezone &&
    !!propertyCount &&
    !loading
  ), [profile, propertyCount, loading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    setError('');
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user.id;

      // Ensure profile exists
      await supabase.from('profiles').upsert({ id: userId }, { onConflict: 'id' });

      // Create the hotel
      const { data: hotel, error: hotelErr } = await supabase
        .from('hotels')
        .insert([{
          profile_id: userId,
          name: profile.accountName,
          type: profile.type,
          timezone: profile.timezone,
          phone_number: profile.phone_number || null,
          address: profile.address || null,
          city: profile.city || null,
          state: profile.state || null,
          zip_code: profile.zip_code || null
        }])
        .select('id')
        .single();
      if (hotelErr) throw hotelErr;

      const hotelId = hotel.id;

      // Save selection + count estimate on profile
      await supabase
        .from('profiles')
        .update({
          account_name: profile.accountName,
          property_type: profile.type,
          hotel_id: hotelId,
          property_count_estimate: propertyCount
        })
        .eq('id', userId);

      // ➜ Immediately go to Property Picker in "pending onboarding" mode.
      navigate('/property-picker?from=onboarding', { state: { onboarding: true }, replace: true });

      // Seed defaults in the background (don’t block navigation)
      const defaults = getDefaultsFor(profile.type);
      const deptSeed = (defaults || []).map(dept => ({
        hotel_id: hotelId, department: dept, enabled: true
      }));
      const slaSeed = (defaults || []).map(dept => ({
        hotel_id: hotelId, department: dept,
        ack_time_minutes: 5, res_time_minutes: 30, is_active: false
      }));
      Promise.allSettled([
        deptSeed.length ? supabase.from('department_settings').upsert(deptSeed, { onConflict: ['hotel_id','department'] }) : Promise.resolve(),
        slaSeed.length ? supabase.from('sla_settings').upsert(slaSeed, { onConflict: ['hotel_id','department'] }) : Promise.resolve(),
      ]).catch((e) => console.warn('Seeding defaults failed:', e));
    } catch (err) {
      console.error('Onboarding error:', err);
      setError(err.message || 'Onboarding failed');
      setLoading(false); // stay on page if we errored
      return;
    }
    // Do not setLoading(false) after navigate; we already left the page.
  };

  return (
    <main className="relative min-h-screen pt-24 overflow-hidden bg-operon-background">
      {/* background accents */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-48 -left-40 h-[34rem] w-[34rem] rounded-full blur-3xl"
        style={{ background: 'radial-gradient(closest-side, rgba(59,130,246,.25), transparent)' }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-56 -right-40 h-[38rem] w-[38rem] rounded-full blur-[90px]"
        style={{ background: 'radial-gradient(closest-side, rgba(34,211,238,.22), transparent)' }}
      />
      {SHOW_GRID_BG && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[.25]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(17,24,39,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(17,24,39,0.08) 1px, transparent 1px)',
            backgroundSize: '42px 42px, 42px 42px',
            maskImage: 'radial-gradient(ellipse at center, black 65%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(ellipse at center, black 65%, transparent 100%)',
          }}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Left: hero */}
          <motion.section variants={fade} initial="initial" animate="animate">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/20 bg-white/10 text-xs text-operon-muted tracking-wide mb-4">
              Step 1 of 1 • Property setup
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight text-operon-charcoal">
              Let’s set up your{' '}
              <span className="bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">first property</span>
            </h1>

            <p className="mt-4 text-[17px] text-operon-muted max-w-2xl leading-relaxed">
              This takes just a minute. We’ll pre-seed the right departments and SLA defaults based on your property type.
            </p>

            <ul className="mt-6 space-y-2">
              {['AI-ready from day one', 'Role-based access & audit trail', 'Change anytime in Settings'].map((t) => (
                <li key={t} className="flex items-center gap-3 text-sm text-operon-muted">
                  <span className="h-2 w-2 rounded-full bg-blue-400" /> {t}
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-wrap items-center gap-4 text-xs text-gray-500">
              <span className="inline-flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500" /> Secure by design
              </span>
              <span className="hidden sm:inline">•</span>
              <span className="inline-flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-blue-500" /> Live in minutes
              </span>
            </div>
          </motion.section>

          {/* Right: form card */}
          <motion.section variants={fade} initial="initial" animate="animate" transition={{ delay: 0.05 }} className="w-full">
            <div className="relative">
              <div
                aria-hidden="true"
                className="absolute -inset-0.5 rounded-2xl blur opacity-70"
                style={{ background: 'linear-gradient(135deg, rgba(59,130,246,.35), rgba(34,211,238,.25))' }}
              />
              <form onSubmit={handleSubmit} className="relative bg-white rounded-2xl shadow-2xl ring-1 ring-black/5 p-6 sm:p-8 max-w-lg mx-auto space-y-5">
                <h2 className="text-2xl font-semibold text-operon-charcoal text-center">Property details</h2>

                {error && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700" role="alert">
                    {error}
                  </div>
                )}

                {/* Name */}
                <label className="block">
                  <span className="block text-sm text-gray-600 mb-1">Account / Property Name</span>
                  <input
                    type="text"
                    placeholder="e.g., Hotel Crosby"
                    value={profile.accountName}
                    onChange={e => handleChange('accountName', e.target.value)}
                    className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-operon-blue"
                    required
                  />
                </label>

                {/* Type */}
                <label className="block">
                  <span className="block text-sm text-gray-600 mb-1">Property Type</span>
                  <select
                    value={profile.type}
                    onChange={e => handleChange('type', e.target.value)}
                    className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-operon-blue"
                    required
                  >
                    <option value="hotel">Hotel</option>
                    <option value="apartment">Apartment</option>
                    <option value="condo">Condo</option>
                    <option value="restaurant">Restaurant</option>
                  </select>
                </label>

                {/* Property count */}
                <label className="block">
                  <span className="block text-sm text-gray-600 mb-1">How many properties will you manage?</span>
                  <select
                    id="propertyCount"
                    name="propertyCount"
                    value={propertyCount}
                    onChange={e => setPropertyCount(e.target.value)}
                    className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-operon-blue"
                    required
                  >
                    <option value="">Select one</option>
                    <option value="1">1</option>
                    <option value="2-5">2–5</option>
                    <option value="6-10">6–10</option>
                    <option value="10+">10+</option>
                  </select>
                </label>

                {/* Timezone */}
                <label className="block">
                  <span className="block text-sm text-gray-600 mb-1">Timezone</span>
                  <select
                    value={profile.timezone}
                    onChange={e => handleChange('timezone', e.target.value)}
                    className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-operon-blue"
                    required
                  >
                    <option value="">Select Timezone</option>
                    {US_TIMEZONES.map(z => <option key={z} value={z}>{z}</option>)}
                  </select>
                </label>

                {/* Phone */}
                <label className="block">
                  <span className="block text-sm text-gray-600 mb-1">Property Phone (optional)</span>
                  <input
                    type="tel"
                    placeholder="(555) 123-4567"
                    value={profile.phone_number}
                    onChange={e => handleChange('phone_number', e.target.value)}
                    className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-operon-blue"
                  />
                </label>

                {/* Address */}
                <label className="block">
                  <span className="block text-sm text-gray-600 mb-1">Address (optional)</span>
                  <input
                    type="text"
                    placeholder="Street address"
                    value={profile.address}
                    onChange={e => handleChange('address', e.target.value)}
                    className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-operon-blue"
                  />
                </label>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <label className="block">
                    <span className="block text-sm text-gray-600 mb-1">City</span>
                    <input
                      type="text"
                      value={profile.city}
                      onChange={e => handleChange('city', e.target.value)}
                      className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-operon-blue"
                    />
                  </label>
                  <label className="block">
                    <span className="block text-sm text-gray-600 mb-1">State</span>
                    <input
                      type="text"
                      value={profile.state}
                      onChange={e => handleChange('state', e.target.value)}
                      className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-operon-blue"
                    />
                  </label>
                  <label className="block">
                    <span className="block text-sm text-gray-600 mb-1">ZIP</span>
                    <input
                      type="text"
                      value={profile.zip_code}
                      onChange={e => handleChange('zip_code', e.target.value)}
                      className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-operon-blue"
                    />
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="w-full bg-operon-blue hover:bg-blue-400 disabled:opacity-60 disabled:cursor-not-allowed text-white py-2.5 rounded-lg font-medium transition"
                >
                  {loading ? 'Setting up…' : 'Get Started'}
                </button>

                <p className="text-[12px] text-gray-500 text-center">
                  By continuing, you agree to our{' '}
                  <Link to="/terms" className="underline hover:text-operon-blue">Terms</Link> and{' '}
                  <Link to="/privacy-policy" className="underline hover:text-operon-blue">Privacy Policy</Link>.
                </p>
              </form>
            </div>
          </motion.section>
        </div>
      </div>
    </main>
  );
}
