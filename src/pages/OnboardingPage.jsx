// src/pages/Dashboard.jsx
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import FiltersBar from '../components/FiltersBar';
import RequestsTable from '../components/RequestsTable';
import Navbar from '../components/Navbar';
import styles from '../styles/Dashboard.module.css';

export default function Dashboard() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [departmentOptions, setDepartmentOptions] = useState([]);

  const [showActiveOnly, setShowActiveOnly] = useState(true);
  const [unacknowledgedOnly, setUnacknowledgedOnly] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [selectedPriority, setSelectedPriority] = useState('All');
  const [sortOrder, setSortOrder] = useState('newest');
  const [searchTerm, setSearchTerm] = useState('');

  const [notesModalOpen, setNotesModalOpen] = useState(false);
  const [currentRequestId, setCurrentRequestId] = useState(null);
  const [notes, setNotes] = useState([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [notesError, setNotesError] = useState('');
  const [newNote, setNewNote] = useState('');

  const navigate = useNavigate();
  const [hotelId, setHotelId] = useState(null);

  // Fetch user profile to get hotel_id
  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return navigate('/login');
      const userId = session.user.id;
      const { data: profile } = await supabase
        .from('profiles')
        .select('hotel_id')
        .eq('id', userId)
        .single();
      if (!profile?.hotel_id) return navigate('/onboarding');
      setHotelId(profile.hotel_id);
    })();
  }, [navigate]);

  // Fetch enabled departments
  const fetchEnabledDepartments = useCallback(async () => {
    if (!hotelId) return;
    const { data: settings } = await supabase
      .from('department_settings')
      .select('department')
      .eq('hotel_id', hotelId)
      .eq('enabled', true);
    setDepartmentOptions(settings.map(d => d.department));
  }, [hotelId]);

  // Fetch all requests for this hotel
  const fetchRequests = useCallback(async () => {
    if (!hotelId) return;
    setLoading(true);
    setError('');
    try {
      const { data, error } = await supabase
        .from('requests')
        .select('*')
        .eq('hotel_id', hotelId);
      if (error) throw error;
      setRequests(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  }, [hotelId]);

  useEffect(() => {
    if (hotelId) {
      fetchEnabledDepartments();
      fetchRequests();
      const interval = setInterval(fetchRequests, 60000);
      return () => clearInterval(interval);
    }
  }, [hotelId, fetchEnabledDepartments, fetchRequests]);

  // Notes modal handlers omitted for brevity; unchanged
  // ... (existing openNotesModal, handleAddNote, handleDeleteNote)

  const priorityOptions = ['Normal', 'Urgent', 'Low'];

  const filtered = useMemo(() => {
    let result = [...requests];
    if (showActiveOnly) result = result.filter(r => !r.completed);
    if (unacknowledgedOnly) result = result.filter(r => !r.acknowledged);
    if (selectedDepartment !== 'All') result = result.filter(r => r.department === selectedDepartment);
    if (selectedPriority !== 'All') result = result.filter(
      r => r.priority.toLowerCase() === selectedPriority.toLowerCase()
    );
    if (searchTerm.trim()) {
      result = result.filter(r =>
        r.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.from_phone && r.from_phone.includes(searchTerm)) ||
        (r.room_number && r.room_number.toString().includes(searchTerm))
      );
    }
    result.sort((a, b) => {
      return sortOrder === 'oldest'
        ? new Date(a.created_at) - new Date(b.created_at)
        : new Date(b.created_at) - new Date(a.created_at);
    });
    return result;
  }, [requests, showActiveOnly, unacknowledgedOnly, selectedDepartment, selectedPriority, sortOrder, searchTerm]);

  if (loading) return <div className="p-6 text-lg font-medium">Loading requests…</div>;
  if (error) return <div className="p-6 text-lg text-red-600">Error: {error}</div>;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-operon-background pt-24 px-6 flex flex-col items-center">
        <FiltersBar
            showActiveOnly={showActiveOnly}
            onToggleActive={setShowActiveOnly}
            unacknowledgedOnly={unacknowledgedOnly}
            onToggleUnacknowledged={setUnacknowledgedOnly}
            selectedDepartment={selectedDepartment}
            onChangeDepartment={setSelectedDepartment}
            departmentOptions={departmentOptions}
            selectedPriority={selectedPriority}
            onChangePriority={setSelectedPriority}
            priorityOptions={priorityOptions}
            sortOrder={sortOrder}
            onChangeSort={setSortOrder}
            searchTerm={searchTerm}
            onChangeSearch={setSearchTerm}
          />
          <div className="mt-4 w-full">
            <RequestsTable
              requests={filtered}
              onAcknowledge={async id => { await acknowledgeRequest(id); fetchRequests(); }}
              onComplete={async id => { await completeRequest(id); fetchRequests(); }}
              onRowClick={id => navigate(`/request/${id}`)}
              onOpenNotes={openNotesModal}
            />
          </div>
      </div>
      {/* Notes modal unchanged */}
    </>
  );
}
