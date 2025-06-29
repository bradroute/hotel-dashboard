// src/pages/SettingsPage.jsx
import React, { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { getDefaultsFor } from '../utils/propertyDefaults';
import Navbar from '../components/Navbar';

const US_TIMEZONES = [
  'America/New_York','America/Chicago','America/Denver',
  'America/Los_Angeles','America/Phoenix','America/Anchorage','Pacific/Honolulu'
];

// Full department lists by property type
const DEPARTMENT_LISTS = {
  hotel: [
    'Front Desk','Housekeeping','Maintenance','Room Service','Valet',
    'Concierge','Spa','Bellhop','Security','Events',
    'Laundry','IT','Engineering','Food & Beverage','Reservations'
  ],
  apartment: [
    'Maintenance','Leasing','Security',
    'HOA','Janitorial','Parking','Trash Services','Resident Services','Landscaping'
  ],
  condo: [
    'Maintenance','Concierge','Security',
    'HOA','Janitorial','Parking','Trash Services','Resident Services','Landscaping'
  ],
  restaurant: [
    'Kitchen','Waitstaff','Management',
    'Bar','Host','Cleaning','Reservations'
  ]
};

export default function SettingsPage() {
  const [hotelId, setHotelId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [profile, setProfile] = useState({
    name: '', type: '', timezone: '', address: '', city: '', state: '', zip_code: '', phone_number: ''
  });
  const [departments, setDepartments] = useState([]);
  const [slaSettings, setSlaSettings] = useState([]);

  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  // Load profile, departments, and SLA settings
  useEffect(() => {
    async function load() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) throw new Error('Not authenticated');
        const userId = session.user.id;

        const { data: prof } = await supabase
          .from('profiles').select('hotel_id').eq('id', userId).single();
        if (!prof) throw new Error('Profile not found');
        setHotelId(prof.hotel_id);

        const { data: hotel } = await supabase
          .from('hotels')
          .select('name,type,timezone,address,city,state,zip_code,phone_number')
          .eq('id', prof.hotel_id)
          .single();
        setProfile({
          name: hotel.name || '',
          type: hotel.type || '',
          timezone: hotel.timezone || '',
          address: hotel.address || '',
          city: hotel.city || '',
          state: hotel.state || '',
          zip_code: hotel.zip_code || '',
          phone_number: hotel.phone_number || ''
        });

        const { data: deptData, error: deptErr } = await supabase
          .from('department_settings')
          .select('department,enabled')
          .eq('hotel_id', prof.hotel_id);
        if (deptErr) throw deptErr;
        setDepartments(deptData || []);

        const { data: slaData, error: slaErr } = await supabase
          .from('sla_settings')
          .select('department,ack_time_minutes,res_time_minutes,is_active')
          .eq('hotel_id', prof.hotel_id);
        if (slaErr) throw slaErr;
        setSlaSettings(
          slaData.map(s => ({
            department: s.department,
            ack_time: s.ack_time_minutes,
            res_time: s.res_time_minutes,
            is_active: s.is_active
          }))
        );
      } catch (e) {
        console.error(e);
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Seed default departments on type change
  useEffect(() => {
    async function resetDefaults() {
      if (!hotelId || !profile.type) return;
      const defaults = getDefaultsFor(profile.type);
      const entries = defaults.map(dept => ({ hotel_id: hotelId, department: dept, enabled: true }));
      await supabase.from('department_settings').upsert(entries, { onConflict: ['hotel_id','department'] });
      setDepartments(entries);
    }
    resetDefaults();
  }, [profile.type, hotelId]);

  const handleProfileChange = (field, value) =>
    setProfile(prev => ({ ...prev, [field]: value }));

  const toggleDepartment = async (department) => {
    const idx = departments.findIndex(d => d.department === department);
    const current = idx >= 0 ? departments[idx].enabled : false;

    await supabase
      .from('department_settings')
      .upsert({ hotel_id: hotelId, department, enabled: !current }, { onConflict: ['hotel_id','department'] });

    if (idx >= 0) {
      setDepartments(departments.map(d =>
        d.department === department ? { ...d, enabled: !current } : d
      ));
    } else {
      setDepartments([...departments, { department, enabled: !current }]);
    }
  };

  const handleSlaChange = (department, field, value) =>
    setSlaSettings(prev => prev.map(s =>
      s.department === department ? { ...s, [field]: value } : s
    ));

  const saveAll = async () => {
    if (!hotelId) return;
    setSaving(true);
    setSaveStatus('');
    try {
      await supabase
        .from('hotels')
        .update({
          name: profile.name,
          type: profile.type,
          timezone: profile.timezone,
          address: profile.address,
          city: profile.city,
          state: profile.state,
          zip_code: profile.zip_code,
          phone_number: profile.phone_number
        })
        .eq('id', hotelId);

      const slaPayload = slaSettings.map(s => ({
        hotel_id: hotelId,
        department: s.department,
        ack_time_minutes: s.ack_time,
        res_time_minutes: s.res_time,
        is_active: s.is_active
      }));
      await supabase.from('sla_settings').upsert(slaPayload, { onConflict: ['hotel_id','department'] });

      setSaveStatus('All changes saved!');
    } catch (e) {
      console.error(e);
      setSaveStatus('Save failed');
    } finally {
      setSaving(false);
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-600">Error: {error}</div>;

  // Determine full list for this type, fallback to defaults
  const showList = DEPARTMENT_LISTS[profile.type] || getDefaultsFor(profile.type);

  return (
    <>
      <Navbar />
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
              {US_TIMEZONES.map(z => <option key={z} value={z}>{z}</option>)}
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

        {/* Department Settings */}
        <section>
          <h2 className="text-xl font-semibold">Department Settings</h2>
          <ul className="mt-4 space-y-2">
            {showList.map(department => {
              const enabled = departments.find(d => d.department === department)?.enabled || false;
              return (
                <li key={department} className="flex justify-between items-center bg-white p-3 rounded shadow">
                  <span>{department}</span>
                  <button
                    onClick={() => toggleDepartment(department)}
                    className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors ${
                      enabled ? 'bg-operon-blue' : 'bg-gray-300'
                    }`}
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
        </section>

        {/* SLA Settings */}
        <section>
          <h2 className="text-xl font-semibold">SLA Settings</h2>
          <div className="mt-4 space-y-2">
            {showList.map(department => {
              const sla = slaSettings.find(s => s.department === department) || { ack_time: 5, res_time: 30, is_active: false };
              return (
                <div
                  key={department}
                  className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center bg-white p-3 rounded shadow"
                >
                  <span>{department}</span>
                  <input
                    type="number"
                    min="0"
                    value={sla.ack_time}
                    onChange={e => handleSlaChange(department, 'ack_time', Number(e.target.value))}
                    placeholder="Ack min"
                    className="border p-1 rounded"
                  />
                  <input
                    type="number"
                    min="0"
                    value={sla.res_time}
                    onChange={e => handleSlaChange(department, 'res_time', Number(e.target.value))}
                    placeholder="Res min"
                    className="border p-1 rounded"
                  />
                  <input
                    type="checkbox"
                    checked={sla.is_active}
                    onChange={e => handleSlaChange(department, 'is_active', e.target.checked)}
                  />
                </div>
              );
            })}
          </div>
        </section>

        <button
          onClick={saveAll}
          disabled={saving}
          className="w-full bg-operon-blue text-white py-2 rounded disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
        {saveStatus && <p className="text-center text-green-600 mt-2">{saveStatus}</p>}
      </div>
    </>
  );
}
