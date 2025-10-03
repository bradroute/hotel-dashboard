import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../utils/supabaseClient';
import { getDefaultsFor } from '../utils/propertyDefaults';
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from '../utils/stripe';
import CardForm from '../components/CardForm';
import AddPropertyForm from '../components/AddPropertyForm';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';

const API_URL = process.env.REACT_APP_API_URL;

const US_TIMEZONES = [
  'America/New_York','America/Chicago','America/Denver','America/Los_Angeles',
  'America/Phoenix','America/Anchorage','Pacific/Honolulu',
];

const DEPARTMENT_LISTS = {
  hotel: [
    'Front Desk','Housekeeping','Maintenance','Room Service','Valet',
    'Concierge','Spa','Bellhop','Security','Events',
    'Laundry','IT','Engineering','Food & Beverage','Reservations',
  ],
  apartment: [
    'Maintenance','Leasing','Security','HOA','Janitorial','Parking',
    'Trash Services','Resident Services','Landscaping',
  ],
  condo: [
    'Maintenance','Concierge','Security','HOA','Janitorial','Parking',
    'Trash Services','Resident Services','Landscaping',
  ],
  restaurant: ['Kitchen','Waitstaff','Management','Bar','Host','Cleaning','Reservations'],
};

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  exit:    { opacity: 0, y: -16, transition: { duration: 0.18 } },
};

export default function SettingsPage() {
  const { hotelId } = useParams();
  const propertyId = hotelId;

  const [showAddPropertyForm, setShowAddPropertyForm] = useState(false);

  // Core state
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState({
    name: '', type: '', timezone: '',
    address: '', city: '', state: '', zip_code: '', phone_number: '',
  });
  const [departments, setDepartments] = useState([]);
  const [slaSettings, setSlaSettings] = useState([]);

  // Stripe/card state
  const [stripeCustomerId, setStripeCustomerId] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [defaultPm, setDefaultPm] = useState(null);
  const [showNewCardForm, setShowNewCardForm] = useState(false);

  // Save state
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  const resetDefaults = useCallback(async (newType) => {
    if (!propertyId || !newType) return;
    await supabase.from('department_settings').delete().eq('hotel_id', propertyId);

    const fullList = DEPARTMENT_LISTS[newType] || getDefaultsFor(newType);
    const defaults = getDefaultsFor(newType);
    const entries = fullList.map(dept => ({
      hotel_id: propertyId, department: dept, enabled: defaults.includes(dept),
    }));
    await supabase.from('department_settings').upsert(entries, { onConflict: ['hotel_id','department'] });
    setDepartments(entries);
  }, [propertyId]);

  // Load initial
  useEffect(() => {
    if (!propertyId) { setLoading(false); return; }
    setLoading(true);
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) throw new Error('Not authenticated');
        const uid = session.user.id;
        setUserId(uid);

        // Hotel profile
        const { data: hotelData, error: hotelErr } = await supabase
          .from('hotels')
          .select('name,type,timezone,address,city,state,zip_code,phone_number')
          .eq('id', propertyId)
          .single();
        if (hotelErr) throw hotelErr;
        setProfile({
          name: hotelData.name || '',
          type: hotelData.type || '',
          timezone: hotelData.timezone || '',
          address: hotelData.address || '',
          city: hotelData.city || '',
          state: hotelData.state || '',
          zip_code: hotelData.zip_code || '',
          phone_number: hotelData.phone_number || '',
        });

        // Departments
        const { data: deptData, error: deptErr } = await supabase
          .from('department_settings').select('department,enabled').eq('hotel_id', propertyId);
        if (deptErr) throw deptErr;
        if (!deptData || deptData.length === 0) await resetDefaults(hotelData.type);
        else setDepartments(deptData);

        // SLA
        const { data: slaData, error: slaErr } = await supabase
          .from('sla_settings')
          .select('department,ack_time_minutes,res_time_minutes,is_active')
          .eq('hotel_id', propertyId);
        if (slaErr) throw slaErr;
        const fullList = DEPARTMENT_LISTS[hotelData.type] || getDefaultsFor(hotelData.type);
        const existing = slaData.map(s => ({
          department: s.department, ack_time: s.ack_time_minutes, res_time: s.res_time_minutes, is_active: s.is_active,
        }));
        const complete = fullList.map(dept => {
          const found = existing.find(x => x.department === dept);
          return found || { department: dept, ack_time: 5, res_time: 30, is_active: false };
        });
        setSlaSettings(complete);

        // Stripe customer
        const customerRes = await fetch(`${API_URL}/api/get-or-create-customer`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: uid }),
        });
        if (!customerRes.ok) throw new Error(`Customer API error ${customerRes.status}`);
        const { customerId } = await customerRes.json();
        setStripeCustomerId(customerId);
      } catch (err) {
        console.error('SettingsPage load error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [propertyId, resetDefaults]);

  // Payment methods
  useEffect(() => {
    if (!stripeCustomerId) return;
    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/list-payment-methods/${stripeCustomerId}`);
        if (!res.ok) return;
        const { paymentMethods: methods, defaultPaymentMethodId } = await res.json();
        setPaymentMethods(methods || []);
        if (defaultPaymentMethodId) setDefaultPm(defaultPaymentMethodId);
      } catch (err) {
        console.error('Error loading payment methods:', err);
      }
    })();
  }, [stripeCustomerId]);

  useEffect(() => { stripePromise.then(s => console.log('✅ Stripe loaded:', !!s)); }, []);

  const handleProfileChange = (field, val) => {
    setProfile(p => ({ ...p, [field]: val }));
    if (field === 'type') resetDefaults(val);
  };

  const toggleDepartment = async (dept) => {
    if (!propertyId) return;
    const idx = departments.findIndex(d => d.department === dept);
    const current = idx >= 0 ? departments[idx].enabled : false;
    await supabase.from('department_settings').upsert(
      { hotel_id: propertyId, department: dept, enabled: !current },
      { onConflict: ['hotel_id','department'] }
    );
    setDepartments(d => d.map(x => x.department === dept ? { ...x, enabled: !current } : x));
  };

  const handleSlaChange = (dept, field, val) => {
    setSlaSettings(s => s.map(x => x.department === dept ? { ...x, [field]: val } : x));
  };

  const saveAll = async () => {
    if (!propertyId) return;
    setSaving(true); setSaveStatus('');
    try {
      await supabase.from('hotels').update({
        name: profile.name, type: profile.type, timezone: profile.timezone,
        address: profile.address, city: profile.city, state: profile.state,
        zip_code: profile.zip_code, phone_number: profile.phone_number,
      }).eq('id', propertyId);

      const slaPayload = slaSettings.map(s => ({
        hotel_id: propertyId, department: s.department,
        ack_time_minutes: s.ack_time, res_time_minutes: s.res_time, is_active: s.is_active,
      }));
      await supabase.from('sla_settings').upsert(slaPayload, { onConflict: ['hotel_id','department'] });

      setSaveStatus('All changes saved!');
    } catch (err) {
      console.error('Save error:', err);
      setSaveStatus('Save failed');
    } finally {
      setSaving(false);
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  if (loading) return <div className="min-h-dvh pt-24 px-6">Loading…</div>;
  if (error)   return <div className="min-h-dvh pt-24 px-6 text-red-600">Error: {error}</div>;

  const showList = DEPARTMENT_LISTS[profile.type] || getDefaultsFor(profile.type);

  return (
    <motion.main
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="relative min-h-dvh pt-24"
    >
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 pb-8">
        {/* Header + Add property CTA */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-operon-charcoal">
            {profile.name || 'Property'} <span className="text-gray-400 font-semibold">Settings</span>
          </h1>
          {showAddPropertyForm ? null : (
            <button
              onClick={() => setShowAddPropertyForm(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-operon-blue text-white px-4 py-2 hover:bg-blue-400"
            >
              + Add another property
            </button>
          )}
        </div>

        {/* Add Property form (inline card) */}
        {showAddPropertyForm && (
          <GlowCard className="mb-6 p-0">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-operon-charcoal">Add Property</h2>
                <button className="text-gray-500 hover:text-gray-800 text-xl" onClick={() => setShowAddPropertyForm(false)}>
                  ×
                </button>
              </div>
              <AddPropertyForm onClose={() => setShowAddPropertyForm(false)} />
            </div>
          </GlowCard>
        )}

        <Elements stripe={stripePromise}>
          <div className="space-y-6">
            {/* Property Profile */}
            <GlowCard>
              <SectionHeader title="Property Profile" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <LabeledInput label="Property Name">
                  <input
                    value={profile.name}
                    onChange={e => handleProfileChange('name', e.target.value)}
                    placeholder="Property Name"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-operon-blue"
                  />
                </LabeledInput>
                <LabeledInput label="Phone Number">
                  <input
                    value={profile.phone_number}
                    onChange={e => handleProfileChange('phone_number', e.target.value)}
                    placeholder="(555) 123-4567"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-operon-blue"
                  />
                </LabeledInput>

                <LabeledInput label="Property Type">
                  <select
                    value={profile.type}
                    onChange={e => handleProfileChange('type', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-operon-blue"
                  >
                    <option value="">Select Type</option>
                    <option value="hotel">Hotel</option>
                    <option value="apartment">Apartment</option>
                    <option value="condo">Condo</option>
                    <option value="restaurant">Restaurant</option>
                  </select>
                </LabeledInput>
                <LabeledInput label="Timezone">
                  <select
                    value={profile.timezone}
                    onChange={e => handleProfileChange('timezone', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-operon-blue"
                  >
                    <option value="">Select Timezone</option>
                    {US_TIMEZONES.map(z => <option key={z} value={z}>{z}</option>)}
                  </select>
                </LabeledInput>

                <LabeledInput label="Address" full>
                  <input
                    value={profile.address}
                    onChange={e => handleProfileChange('address', e.target.value)}
                    placeholder="Street address"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-operon-blue"
                  />
                </LabeledInput>

                <LabeledInput label="City">
                  <input
                    value={profile.city}
                    onChange={e => handleProfileChange('city', e.target.value)}
                    placeholder="City"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-operon-blue"
                  />
                </LabeledInput>
                <LabeledInput label="State">
                  <input
                    value={profile.state}
                    onChange={e => handleProfileChange('state', e.target.value)}
                    placeholder="State"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-operon-blue"
                  />
                </LabeledInput>
                <LabeledInput label="ZIP Code">
                  <input
                    value={profile.zip_code}
                    onChange={e => handleProfileChange('zip_code', e.target.value)}
                    placeholder="ZIP"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-operon-blue"
                  />
                </LabeledInput>
              </div>
            </GlowCard>

            {/* Payment Method */}
            <GlowCard>
              <SectionHeader title="Payment Method" />
              <div className="space-y-3">
                {paymentMethods.length === 0 && (
                  <div className="text-sm text-gray-500">No saved cards yet.</div>
                )}
                {paymentMethods.map(pm => (
                  <label key={pm.id} className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3">
                    <div className="text-sm">
                      <div className="font-medium text-operon-charcoal">
                        {pm.card.brand.toUpperCase()} •••• {pm.card.last4}
                      </div>
                      <div className="text-gray-500">
                        Expires {pm.card.exp_month}/{pm.card.exp_year}
                      </div>
                    </div>
                    <input
                      type="radio"
                      name="defaultPm"
                      className="h-5 w-5 accent-blue-500"
                      checked={defaultPm === pm.id}
                      onChange={async () => {
                        setDefaultPm(pm.id);
                        await fetch(`${API_URL}/api/set-default-payment-method`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ userId, paymentMethodId: pm.id }),
                        });
                      }}
                    />
                  </label>
                ))}
                {!showNewCardForm ? (
                  <button
                    className="text-operon-blue hover:underline text-sm"
                    onClick={() => setShowNewCardForm(true)}
                  >
                    + Add another card
                  </button>
                ) : (
                  <div className="mt-2">
                    <CardForm
                      customerId={stripeCustomerId}
                      onSuccess={async () => {
                        setShowNewCardForm(false);
                        const res = await fetch(`${API_URL}/api/list-payment-methods/${stripeCustomerId}`);
                        const { paymentMethods: methods, defaultPaymentMethodId } = await res.json();
                        setPaymentMethods(methods || []);
                        if (defaultPaymentMethodId) setDefaultPm(defaultPaymentMethodId);
                      }}
                    />
                  </div>
                )}
              </div>
            </GlowCard>

            {/* Department Settings */}
            <GlowCard>
              <SectionHeader title="Department Settings" subtitle="Enable the teams that receive requests." />
              <ul className="mt-2 space-y-2">
                {showList.map(dept => {
                  const enabled = departments.find(d => d.department === dept)?.enabled || false;
                  return (
                    <li key={dept} className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3">
                      <span className="text-operon-charcoal">{dept}</span>
                      <button
                        onClick={() => toggleDepartment(dept)}
                        className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors ${
                          enabled ? 'bg-operon-blue' : 'bg-gray-300'
                        }`}
                        aria-pressed={enabled}
                        aria-label={`Toggle ${dept}`}
                      >
                        <div
                          className={`bg-white w-6 h-6 rounded-full shadow transform transition-transform ${
                            enabled ? 'translate-x-6' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </GlowCard>

            {/* SLA Settings */}
            <GlowCard>
              <SectionHeader title="SLA Settings" subtitle="Targets for acknowledgement and resolution times." />
              <div className="mt-3 space-y-2">
                {showList.map(dept => {
                  const s = slaSettings.find(x => x.department === dept) || { ack_time: 5, res_time: 30, is_active: false };
                  return (
                    <div key={dept} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center rounded-lg border border-gray-200 px-4 py-3">
                      <span className="text-operon-charcoal font-medium">{dept}</span>
                      <NumberField
                        label="Ack (min)"
                        value={s.ack_time}
                        onChange={(v) => handleSlaChange(dept, 'ack_time', v)}
                      />
                      <NumberField
                        label="Resolve (min)"
                        value={s.res_time}
                        onChange={(v) => handleSlaChange(dept, 'res_time', v)}
                      />
                      <label className="inline-flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          className="h-4 w-4 accent-blue-500"
                          checked={s.is_active}
                          onChange={e => handleSlaChange(dept, 'is_active', e.target.checked)}
                        />
                        Active
                      </label>
                    </div>
                  );
                })}
              </div>
            </GlowCard>

            {/* Save bar */}
            <div className="sticky bottom-4">
              <div className="flex items-center justify-between gap-3 rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 px-4 py-3">
                <div className="text-sm text-gray-500">
                  {saveStatus ? <span className="text-emerald-600">{saveStatus}</span> : 'Review your changes and save.'}
                </div>
                <button
                  onClick={saveAll}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-lg bg-operon-blue text-white px-4 py-2 hover:bg-blue-400 disabled:opacity-60"
                >
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </Elements>
      </div>
    </motion.main>
  );
}

/* ---------- Small helpers ---------- */

function GlowCard({ children, className = '' }) {
  return (
    <div className={`relative ${className}`}>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-2xl blur opacity-60"
        style={{ background: 'linear-gradient(135deg, rgba(59,130,246,.30), rgba(34,211,238,.22))' }}
      />
      <section className="relative bg-white rounded-2xl shadow-2xl ring-1 ring-black/5 p-6">
        {children}
      </section>
    </div>
  );
}

function SectionHeader({ title, subtitle }) {
  return (
    <header className="mb-4">
      <h2 className="text-xl font-semibold text-operon-charcoal">{title}</h2>
      {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
    </header>
  );
}

function LabeledInput({ label, children, full }) {
  return (
    <label className={`flex flex-col ${full ? 'md:col-span-2' : ''}`}>
      <span className="text-sm text-gray-600 mb-1">{label}</span>
      {children}
    </label>
  );
}

function NumberField({ label, value, onChange }) {
  return (
    <label className="flex flex-col">
      <span className="text-sm text-gray-600 mb-1">{label}</span>
      <input
        type="number"
        min="0"
        value={value}
        onChange={(e) => onChange(+e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-operon-blue"
      />
    </label>
  );
}
