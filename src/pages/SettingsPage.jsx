import React, { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import Navbar from '../components/Navbar';

// Departments and US timezones
const DEPARTMENT_LIST = [
  'Front Desk','Housekeeping','Maintenance','Room Service','Valet',
  'Concierge','Spa','Bellhop','Security','Events',
  'Laundry','IT','Engineering','Food & Beverage','Reservations'
];
const US_TIMEZONES = [
  'America/New_York','America/Chicago','America/Denver',
  'America/Los_Angeles','America/Phoenix','America/Anchorage','Pacific/Honolulu'
];

export default function SettingsPage() {
  const [hotelId, setHotelId] = useState(null);
  const [profile, setProfile] = useState({
    name: '', type: '', timezone: '', address: '', city: '', state: '', zip_code: '', phone_number: ''
  });
  const [settings, setSettings] = useState({});
  const [slaSettings, setSlaSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { setLoading(false); return; }

      const { data: userProfile } = await supabase.from('profiles').select('hotel_id').eq('id', session.user.id).single();
      if (!userProfile) { setLoading(false); return; }
      const id = userProfile.hotel_id; setHotelId(id);

      const { data: hotelProfile } = await supabase
        .from('hotels')
        .select('name,type,timezone,address,city,state,zip_code,phone_number,departments_enabled')
        .eq('id', id)
        .single();
      if (hotelProfile) {
        setProfile({
          name: hotelProfile.name || '',
          type: hotelProfile.type || '',
          timezone: hotelProfile.timezone || '',
          address: hotelProfile.address || '',
          city: hotelProfile.city || '',
          state: hotelProfile.state || '',
          zip_code: hotelProfile.zip_code || '',
          phone_number: hotelProfile.phone_number || '',
        });
        if (Array.isArray(hotelProfile.departments_enabled)) {
          const pre = {};
          DEPARTMENT_LIST.forEach(d => { pre[d] = hotelProfile.departments_enabled.includes(d); });
          setSettings(pre);
        }
      }

      const { data: deptData } = await supabase.from('department_settings').select('department,enabled').eq('hotel_id', id);
      if (deptData) {
        const map = {};
        deptData.forEach(({ department, enabled }) => { map[department] = enabled; });
        const defaults = {};
        DEPARTMENT_LIST.forEach(d => { defaults[d] = map.hasOwnProperty(d) ? map[d] : ['Front Desk','Housekeeping','Maintenance','Room Service','Valet'].includes(d); });
        setSettings(defaults);
      }

      const { data: slaData } = await supabase.from('sla_settings').select('department,ack_time_minutes,res_time_minutes,is_active').eq('hotel_id', id);
      if (slaData) {
        const map = {};
        slaData.forEach(({ department, ack_time_minutes, res_time_minutes, is_active }) => {
          map[department] = { ack_time: ack_time_minutes, res_time: res_time_minutes, is_active };
        });
        DEPARTMENT_LIST.forEach(d => { if (!map[d]) map[d] = { ack_time: 5, res_time: 30, is_active: false }; });
        setSlaSettings(map);
      }

      setLoading(false);
    }
    load();
  }, []);

  const handleProfileChange = (field, value) => setProfile(prev => ({ ...prev, [field]: value }));
  const toggleDepartment = dept => setSettings(prev => ({ ...prev, [dept]: !prev[dept] }));
  const handleSlaChange = (dept, field, value) => setSlaSettings(prev => ({
    ...prev, [dept]: { ...prev[dept], [field]: value }
  }));

  const saveSettings = async () => {
    setSaving(true); setSaveStatus('');
    if (!hotelId) return;

    const deptEnabled = Object.keys(settings).filter(d => settings[d]);
    const { error: hotelErr } = await supabase.from('hotels').update({
      name: profile.name, type: profile.type, timezone: profile.timezone,
      address: profile.address, city: profile.city, state: profile.state,
      zip_code: profile.zip_code, phone_number: profile.phone_number,
      departments_enabled: deptEnabled
    }).eq('id', hotelId);
    if (hotelErr) { console.error(hotelErr); setSaveStatus('Failed to save profile'); setSaving(false); return; }

    const deptPayload = Object.entries(settings).map(([department, enabled]) => ({ hotel_id: hotelId, department, enabled }));
    const { error: deptErr } = await supabase.from('department_settings').upsert(deptPayload, { onConflict: ['hotel_id','department'] });
    if (deptErr) { console.error(deptErr); setSaveStatus('Failed department settings'); setSaving(false); return; }

    const slaPayload = Object.entries(slaSettings).map(([department, { ack_time, res_time, is_active }]) => ({
      hotel_id: hotelId, department, ack_time_minutes: ack_time, res_time_minutes: res_time, is_active
    }));
    const { error: slaErr } = await supabase.from('sla_settings').upsert(slaPayload, { onConflict: ['hotel_id','department'] });
    if (slaErr) { console.error(slaErr); setSaveStatus('Saved profile & departments, SLA failed'); }
    else setSaveStatus('All changes saved!');

    setSaving(false);
    setTimeout(() => setSaveStatus(''), 3000);
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <>
      <Navbar />
      <div className="pt-28 pb-10 px-6 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-6">Settings</h1>

        {/* Property Profile */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Property Profile</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input value={profile.name} onChange={e => handleProfileChange('name', e.target.value)} placeholder="Property Name" className="border p-2 rounded" />
            <select value={profile.type} onChange={e => handleProfileChange('type', e.target.value)} className="border p-2 rounded">
              <option value="">Select Property Type</option><option value="Hotel">Hotel</option><option value="Apartment">Apartment</option><option value="Condo">Condo</option><option value="Restaurant">Restaurant</option>
            </select>
            <select value={profile.timezone} onChange={e => handleProfileChange('timezone', e.target.value)} className="border p-2 rounded">
              <option value="">Select Timezone</option>{US_TIMEZONES.map(z => <option key={z} value={z}>{z}</option>)}
            </select>
            <input value={profile.phone_number} onChange={e => handleProfileChange('phone_number', e.target.value)} placeholder="Phone Number" className="border p-2 rounded" />
            <input value={profile.address} onChange={e => handleProfileChange('address', e.target.value)} placeholder="Address" className="border p-2 rounded" />
            <input value={profile.city} onChange={e => handleProfileChange('city', e.target.value)} placeholder="City" className="border p-2 rounded" />
            <input value={profile.state} onChange={e => handleProfileChange('state', e.target.value)} placeholder="State" className="border p-2 rounded" />
            <input value={profile.zip_code} onChange={e => handleProfileChange('zip_code', e.target.value)} placeholder="ZIP Code" className="border p-2 rounded" />
            <div>
            </div>
          </div>
        </div>

        {/* Department Settings */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Department Settings</h2>
          <div className="space-y-4">
            {DEPARTMENT_LIST.map(dept => (
              <div key={dept} className="flex justify-between items-center p-4 bg-white border rounded shadow-sm">
                <span className="font-medium">{dept}</span>
                <button onClick={() => toggleDepartment(dept)} className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors ${settings[dept] ? 'bg-blue-600' : 'bg-gray-300'}`}>
                  <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform ${settings[dept] ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* SLA Settings */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">SLA Settings</h2>
          <div className="space-y-6">
            {DEPARTMENT_LIST.map(dept => (
              <div key={dept} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center p-4 bg-white border rounded">
                <span className="font-medium">{dept}</span>
                <div>
                  <label className="block text-sm">Ack (min)</label>
                  <input type="number" min="0" value={slaSettings[dept].ack_time} onChange={e => handleSlaChange(dept,'ack_time',Number(e.target.value))} className="border p-1 rounded w-full" />
                </div>
                <div>
                  <label className="block text-sm">Res. (min)</label>
                  <input type="number" min="0" value={slaSettings[dept].res_time} onChange={e => handleSlaChange(dept,'res_time',Number(e.target.value))} className="border p-1 rounded w-full" />
                </div>
                <div className="flex items-center">
                  <label className="mr-2 text-sm">Active</label>
                  <input type="checkbox" checked={slaSettings[dept].is_active} onChange={e => handleSlaChange(dept,'is_active',e.target.checked)} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Save Changes */}
        <div className="text-center mb-6">
          <button onClick={saveSettings} disabled={saving} className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-500 disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          {saveStatus && <p className="mt-2 text-gray-700">{saveStatus}</p>}
        </div>

        {hotelId && <p className="text-center text-sm text-gray-500">Hotel ID: {hotelId}</p>}
      </div>
    </>
  );
}
