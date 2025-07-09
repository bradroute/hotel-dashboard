// src/pages/SettingsPage.jsx
import React, {
  useEffect,
  useState,
  useCallback,
  useContext
} from 'react';
import { supabase } from '../utils/supabaseClient';
import { getDefaultsFor } from '../utils/propertyDefaults';
import Navbar from '../components/Navbar';
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from '../utils/stripe';
import CardForm from '../components/CardForm';
import { PropertyContext } from '../contexts/PropertyContext';

// Base URL of your backend (set in Vercel as REACT_APP_API_URL)
const API_URL = process.env.REACT_APP_API_URL;

const US_TIMEZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Phoenix',
  'America/Anchorage',
  'Pacific/Honolulu',
];

const DEPARTMENT_LISTS = {
  hotel: [
    'Front Desk','Housekeeping','Maintenance','Room Service','Valet',
    'Concierge','Spa','Bellhop','Security','Events',
    'Laundry','IT','Engineering','Food & Beverage','Reservations',
  ],
  apartment: [
    'Maintenance','Leasing','Security',
    'HOA','Janitorial','Parking','Trash Services','Resident Services','Landscaping',
  ],
  condo: [
    'Maintenance','Concierge','Security',
    'HOA','Janitorial','Parking','Trash Services','Resident Services','Landscaping',
  ],
  restaurant: [
    'Kitchen','Waitstaff','Management',
    'Bar','Host','Cleaning','Reservations',
  ],
};

export default function SettingsPage() {
  const { currentProperty } = useContext(PropertyContext);
  const propertyId = currentProperty?.id;

  // Core state
  const [userId, setUserId]           = useState(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [profile, setProfile]         = useState({
    name: '', type: '', timezone: '', address: '',
    city: '', state: '', zip_code: '', phone_number: '',
  });
  const [departments, setDepartments] = useState([]);
  const [slaSettings, setSlaSettings] = useState([]);

  // Stripe/card state
  const [stripeCustomerId, setStripeCustomerId] = useState(null);
  const [paymentMethods, setPaymentMethods]     = useState([]);
  const [defaultPm, setDefaultPm]               = useState(null);
  const [showNewCardForm, setShowNewCardForm]   = useState(false);

  // Save state
  const [saving, setSaving]         = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  // Reset department defaults helper
  const resetDefaults = useCallback(async (newType) => {
    if (!propertyId || !newType) return;
    await supabase
      .from('department_settings')
      .delete()
      .eq('hotel_id', propertyId);

    const fullList = DEPARTMENT_LISTS[newType] || getDefaultsFor(newType);
    const defaults = getDefaultsFor(newType);
    const entries = fullList.map(dept => ({
      hotel_id: propertyId,
      department: dept,
      enabled: defaults.includes(dept),
    }));
    await supabase
      .from('department_settings')
      .upsert(entries, { onConflict: ['hotel_id','department'] });
    setDepartments(entries);
  }, [propertyId]);

  // Load initial data when property changes
  useEffect(() => {
    if (!propertyId) return;
    async function loadData() {
      try {
        // Auth & session
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) throw new Error('Not authenticated');
        const uid = session.user.id;
        setUserId(uid);

        // Hotel details
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

        // Department settings
        const { data: deptData, error: deptErr } = await supabase
          .from('department_settings')
          .select('department,enabled')
          .eq('hotel_id', propertyId);
        if (deptErr) throw deptErr;
        if (!deptData || deptData.length === 0) {
          await resetDefaults(hotelData.type);
        } else {
          setDepartments(deptData);
        }

        // SLA settings
        const { data: slaData, error: slaErr } = await supabase
          .from('sla_settings')
          .select('department,ack_time_minutes,res_time_minutes,is_active')
          .eq('hotel_id', propertyId);
        if (slaErr) throw slaErr;
        const fullList = DEPARTMENT_LISTS[hotelData.type] || getDefaultsFor(hotelData.type);
        const existing = slaData.map(s => ({
          department: s.department,
          ack_time:  s.ack_time_minutes,
          res_time:  s.res_time_minutes,
          is_active: s.is_active,
        }));
        const complete = fullList.map(dept => {
          const found = existing.find(x => x.department === dept);
          return found || { department: dept, ack_time: 5, res_time: 30, is_active: false };
        });
        setSlaSettings(complete);

        // Ensure Stripe customer exists via POST
        const customerRes = await fetch(
          `${API_URL}/api/get-or-create-customer`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: uid }),
          }
        );
        if (!customerRes.ok) {
          const text = await customerRes.text();
          throw new Error(`Customer API error ${customerRes.status}: ${text}`);
        }
        const { customerId } = await customerRes.json();
        setStripeCustomerId(customerId);

      } catch (err) {
        console.error('SettingsPage load error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [propertyId, resetDefaults]);

  // Load payment methods
  useEffect(() => {
    async function loadCards() {
      if (!stripeCustomerId) return;
      try {
        const res = await fetch(`${API_URL}/api/list-payment-methods/${stripeCustomerId}`);
        if (!res.ok) {
          console.error('Payment methods API error', res.status);
          return;
        }
        const { paymentMethods: methods } = await res.json();
        setPaymentMethods(methods);
      } catch (err) {
        console.error('Error loading payment methods:', err);
      }
    }
    loadCards();
  }, [stripeCustomerId]);

  // Stripe lib loaded
  useEffect(() => {
    stripePromise.then(s => console.log('✅ Stripe loaded:', !!s));
  }, []);

  // Handlers
  const handleProfileChange = (field, val) => {
    setProfile(p => ({ ...p, [field]: val }));
    if (field === 'type') resetDefaults(val);
  };

  const toggleDepartment = async (dept) => {
    if (!propertyId) return;
    const idx = departments.findIndex(d => d.department === dept);
    const current = idx >= 0 ? departments[idx].enabled : false;
    await supabase
      .from('department_settings')
      .upsert(
        { hotel_id: propertyId, department: dept, enabled: !current },
        { onConflict: ['hotel_id','department'] }
      );
    setDepartments(d =>
      d.map(x => x.department === dept ? { ...x, enabled: !current } : x)
    );
  };

  const handleSlaChange = (dept, field, val) => {
    setSlaSettings(s =>
      s.map(x => x.department === dept ? { ...x, [field]: val } : x)
    );
  };

  const saveAll = async () => {
    if (!propertyId) return;
    setSaving(true);
    setSaveStatus('');
    try {
      // Update hotel record
      await supabase.from('hotels').update({
        name: profile.name,
        type: profile.type,
        timezone: profile.timezone,
        address: profile.address,
        city: profile.city,
        state: profile.state,
        zip_code: profile.zip_code,
        phone_number: profile.phone_number,
      }).eq('id', propertyId);

      // Upsert SLA settings
      const slaPayload = slaSettings.map(s => ({
        hotel_id: propertyId,
        department: s.department,
        ack_time_minutes: s.ack_time,
        res_time_minutes: s.res_time,
        is_active: s.is_active,
      }));
      await supabase.from('sla_settings').upsert(slaPayload, {
        onConflict: ['hotel_id','department'],
      });

      setSaveStatus('All changes saved!');
    } catch (err) {
      console.error('Save error:', err);
      setSaveStatus('Save failed');
    } finally {
      setSaving(false);
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error)   return <div className="p-4 text-red-600">Error: {error}</div>;

  const showList = DEPARTMENT_LISTS[profile.type] || getDefaultsFor(profile.type);

  return (
    <>
      <Navbar />
      <Elements stripe={stripePromise}>
        <div className="pt-24 max-w-3xl mx-auto p-6 space-y-8">

          {/* Property Profile */}
          <section>
            <h2 className="text-xl font-semibold">Property Profile</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <input
                value={profile.name}
                onChange={e => handleProfileChange('name', e.target.value)}
                placeholder="Property Name"
                className="border p-2 rounded"
              />
              <input
                value={profile.phone_number}
                onChange={e => handleProfileChange('phone_number', e.target.value)}
                placeholder="Phone Number"
                className="border p-2 rounded"
              />
              <select
                value={profile.type}
                onChange={e => handleProfileChange('type', e.target.value)}
                className="border p-2 rounded"
              >
                <option value="">Select Type</option>
                <option value="hotel">Hotel</option>
                <option value="apartment">Apartment</option>
                <option value="condo">Condo</option>
                <option value="restaurant">Restaurant</option>
              </select>
              <select
                value={profile.timezone}
                onChange={e => handleProfileChange('timezone', e.target.value)}
                className="border p-2 rounded"
              >
                <option value="">Timezone</option>
                {US_TIMEZONES.map(z => (
                  <option key={z} value={z}>{z}</option>
                ))}
              </select>
              <input
                value={profile.address}
                onChange={e => handleProfileChange('address', e.target.value)}
                placeholder="Address"
                className="border p-2 rounded"
              />
              <input
                value={profile.city}
                onChange={e => handleProfileChange('city', e.target.value)}
                placeholder="City"
                className="border p-2 rounded"
              />
              <input
                value={profile.state}
                onChange={e => handleProfileChange('state', e.target.value)}
                placeholder="State"
                className="border p-2 rounded"
              />
              <input
                value={profile.zip_code}
                onChange={e => handleProfileChange('zip_code', e.target.value)}
                placeholder="ZIP Code"
                className="border p-2 rounded"
              />
            </div>
          </section>

          {/* Payment Methods */}
          <section>
            <h2 className="text-xl font-semibold">Payment Method</h2>
            <div className="mt-4 space-y-2">
              {paymentMethods.map(pm => (
                <label key={pm.id} className="flex items-center bg-white p-3 rounded shadow">
                  <input
                    type="radio"
                    name="defaultPm"
                    className="form-radio h-5 w-5 text-operon-blue"
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
                  <span className="ml-3">
                    {pm.card.brand.toUpperCase()} •••• {pm.card.last4} exp {pm.card.exp_month}/{pm.card.exp_year}
                  </span>
                </label>
              ))}
              {!showNewCardForm && (
                <button
                  className="text-operon-blue underline mt-1"
                  onClick={() => setShowNewCardForm(true)}
                >
                  + Add another card
                </button>
              )}
              {showNewCardForm && (
                <CardForm
                  customerId={stripeCustomerId}
                  onSuccess={async () => {
                    setShowNewCardForm(false);
                    const res = await fetch(`${API_URL}/api/list-payment-methods/${stripeCustomerId}`);
                    const { paymentMethods: methods } = await res.json();
                    setPaymentMethods(methods);
                  }}
                />
              )}
            </div>
          </section>

          {/* Department Settings */}
          <section>
            <h2 className="text-xl font-semibold">Department Settings</h2>
            <ul className="mt-4 space-y-2">
              {showList.map(dept => {
                const enabled = departments.find(d => d.department === dept)?.enabled || false;
                return (
                  <li key={dept} className="flex justify-between items-center bg-white p-3 rounded shadow">
                    <span>{dept}</span>
                    <button
                      onClick={() => toggleDepartment(dept)}
                      className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors ${enabled ? 'bg-operon-blue' : 'bg-gray-300'}`}
                    >
                      <div className={`bg-white w-6 h-6 rounded-full shadow transform transition-transform ${enabled ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>

          {/* SLA Settings */}
          <section>
            <h2 className="text-xl font-semibold">SLA Settings</h2>
            <div className="mt-4 space-y-2">
              {showList.map(dept => {
                const s = slaSettings.find(x => x.department === dept) || { ack_time: 5, res_time: 30, is_active: false };
                return (
                  <div key={dept} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center bg-white p-3 rounded shadow">
                    <span>{dept}</span>
                    <input
                      type="number"
                      min="0"
                      value={s.ack_time}
                      onChange={e => handleSlaChange(dept, 'ack_time', +e.target.value)}
                      placeholder="Ack min"
                      className="border p-1 rounded"
                    />
                    <input
                      type="number"
                      min="0"
                      value={s.res_time}
                      onChange={e => handleSlaChange(dept, 'res_time', +e.target.value)}
                      placeholder="Res min"
                      className="border p-1 rounded"
                    />
                    <input
                      type="checkbox"
                      checked={s.is_active}
                      onChange={e => handleSlaChange(dept, 'is_active', e.target.checked)}
                    />
                  </div>
                );
              })}
            </div>
          </section>

          {/* Save All */}
          <button
            onClick={saveAll}
            disabled={saving}
            className="w-full bg-operon-blue text-white py-2 rounded disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
          {saveStatus && <p className="text-center text-green-600 mt-2">{saveStatus}</p>}

        </div>
      </Elements>
    </>
  );
}
