/// src/pages/SettingsPage.jsx

import React, { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import Navbar from '../components/Navbar'; // ✅ make sure this path is correct

const DEPARTMENT_LIST = [
  'Front Desk', 'Housekeeping', 'Maintenance', 'Room Service', 'Valet',
  'Concierge', 'Spa', 'Bellhop', 'Security', 'Events',
  'Laundry', 'IT', 'Engineering', 'Food & Beverage', 'Reservations',
];

export default function SettingsPage() {
  const [hotelId, setHotelId] = useState(null);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  useEffect(() => {
    const fetchHotelAndSettings = async () => {
      setLoading(true);
      const {
        data: { session },
        error: sessionErr,
      } = await supabase.auth.getSession();
      if (sessionErr || !session?.user) {
        console.error('No active session');
        setLoading(false);
        return;
      }

      const { data: profile, error: profileErr } = await supabase
        .from('profiles')
        .select('hotel_id')
        .eq('id', session.user.id)
        .single();

      if (profileErr || !profile) {
        console.error('Could not load profile');
        setLoading(false);
        return;
      }

      const hotel_id = profile.hotel_id;
      setHotelId(hotel_id);

      const { data, error } = await supabase
        .from('department_settings')
        .select('department, enabled')
        .eq('hotel_id', hotel_id);

      if (error) {
        console.error('Error loading settings:', error.message);
        setLoading(false);
        return;
      }

      const map = {};
      data.forEach(({ department, enabled }) => {
        map[department] = enabled;
      });

      const defaultSettings = {};
      DEPARTMENT_LIST.forEach((dept) => {
        defaultSettings[dept] = map.hasOwnProperty(dept)
          ? map[dept]
          : ['Front Desk', 'Housekeeping', 'Maintenance', 'Room Service', 'Valet'].includes(dept);
      });

      setSettings(defaultSettings);
      setLoading(false);
    };

    fetchHotelAndSettings();
  }, []);

  const toggleDepartment = (dept) => {
    setSettings((prev) => ({ ...prev, [dept]: !prev[dept] }));
  };

  const saveSettings = async () => {
    setSaving(true);
    setSaveStatus('');

    if (!hotelId) {
      alert('Missing hotel ID. Cannot save.');
      console.error('No hotel ID found.');
      setSaving(false);
      return;
    }

    const updates = Object.entries(settings).map(([department, enabled]) => ({
      hotel_id: hotelId,
      department,
      enabled,
    }));

    const { error } = await supabase
      .from('department_settings')
      .upsert(updates, { onConflict: ['hotel_id', 'department'] });

    if (error) {
      console.error('Failed to save settings:', error);
      alert('Error: ' + error.message);
      setSaveStatus('Failed to save changes.');
    } else {
      setSaveStatus('Changes saved successfully!');
    }

    setSaving(false);
    setTimeout(() => setSaveStatus(''), 3000);
  };

  return (
    <>
      <Navbar />
      <div className="pt-28 pb-10 px-6 max-w-3xl mx-auto min-h-screen flex flex-col justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">
            Department Settings
          </h1>

          {loading ? (
            <p className="text-gray-600 text-center">Loading settings...</p>
          ) : (
            <div className="space-y-4">
              {DEPARTMENT_LIST.map((dept) => (
                <div
                  key={dept}
                  className="flex justify-between items-center p-4 bg-white border rounded shadow-sm"
                >
                  <span className="text-gray-800 font-medium">{dept}</span>
                  <button
                    onClick={() => toggleDepartment(dept)}
                    className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors duration-300 ${
                      settings[dept] ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${
                        settings[dept] ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              ))}

              <button
                onClick={saveSettings}
                disabled={saving}
                className={`mt-6 w-full bg-operon-blue text-white py-2 px-4 rounded ${
                  saving ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-500'
                }`}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>

              {saveStatus && (
                <p className="mt-4 text-sm text-center text-gray-700">
                  {saveStatus}
                </p>
              )}
            </div>
          )}
        </div>

        {hotelId && (
          <p className="mt-10 text-sm text-center text-gray-500">
            Hotel ID: {hotelId}
          </p>
        )}
      </div>
    </>
  );
}
