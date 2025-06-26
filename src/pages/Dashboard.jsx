// src/pages/Dashboard.jsx
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getAllRequests,
  acknowledgeRequest,
  completeRequest,
  getNotes,
  addNote,
  deleteNote,
} from '../utils/api';
import { supabase } from '../utils/supabaseClient';
import FiltersBar from '../components/FiltersBar';
import RequestsTable from '../components/RequestsTable';
import Navbar from '../components/Navbar';
import styles from '../styles/Dashboard.module.css';

export default function Dashboard() {
  const [hotelId, setHotelId] = useState(null);
  const [requests, setRequests] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  // 1) Fetch user profile for hotel_id and auth guard
  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate('/login');
        return;
      }
      const userId = session.user.id;

      // use maybeSingle so "no row" returns data=null, status=406 instead of throwing
      const { data: profile, error: profileErr, status } = await supabase
        .from('profiles')
        .select('hotel_id')
        .eq('id', userId)
        .maybeSingle();

      // if it errored for any reason *other* than "no rows", bail
      if (profileErr && status !== 406) {
        console.error('Error fetching profile:', profileErr);
        navigate('/login');
        return;
      }

      // if there's no profile or no hotel_id, send to onboarding
      if (!profile?.hotel_id) {
        navigate('/onboarding');
        return;
      }

      setHotelId(profile.hotel_id);
    })();
  }, [navigate]);

  // 2) Fetch enabled departments for this hotel
  const fetchEnabledDepartments = useCallback(async () => {
    if (!hotelId) return;
    const { data: settings, error } = await supabase
      .from('department_settings')
      .select('department')
      .eq('hotel_id', hotelId)
      .eq('enabled', true);
    if (error) {
      console.error('Error fetching departments:', error);
      return;
    }
    setDepartmentOptions(settings.map(d => d.department));
  }, [hotelId]);

  // 3) Fetch requests for this hotel
  const fetchRequests = useCallback(async () => {
    if (!hotelId) return;
    setLoading(true);
    setError('');
    try {
      const data = await getAllRequests(); // assumes server filters by authenticated hotel
      setRequests(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  }, [hotelId]);

  // 4) On mount and when hotelId changes, load data
  useEffect(() => {
    if (hotelId) {
      fetchEnabledDepartments();
      fetchRequests();
      const interval = setInterval(fetchRequests, 60000);
      return () => clearInterval(interval);
    }
  }, [hotelId, fetchEnabledDepartments, fetchRequests]);

  // 5) Notes modal handlers
  const openNotesModal = async (requestId) => {
    setCurrentRequestId(requestId);
    setNotesLoading(true);
    setNotesError('');
    try {
      const data = await getNotes(requestId);
      setNotes(data);
      setNotesModalOpen(true);
    } catch (err) {
      setNotesError(err.message || 'Failed to load notes');
    } finally {
      setNotesLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    try {
      await addNote(currentRequestId, newNote.trim());
      setNotes(await getNotes(currentRequestId));
      setNewNote('');
    } catch (err) {
      setNotesError(err.message || 'Unknown error adding note');
    }
  };

  const handleDeleteNote = async (noteId) => {
    await deleteNote(currentRequestId, noteId);
    setNotes(await getNotes(currentRequestId));
  };

  const priorityOptions = ['Normal', 'Urgent', 'Low'];

  // 6) Apply filters, search, and sorting
  const filtered = useMemo(() => {
    let result = [...requests];
    if (showActiveOnly) result = result.filter(r => !r.completed);
    if (unacknowledgedOnly) result = result.filter(r => !r.acknowledged);
    if (selectedDepartment !== 'All') result = result.filter(r => r.department === selectedDepartment);
    if (selectedPriority !== 'All') {
      result = result.filter(r => r.priority.toLowerCase() === selectedPriority.toLowerCase());
    }
    if (searchTerm.trim()) {
      result = result.filter(r =>
        r.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.from_phone && r.from_phone.includes(searchTerm)) ||
        (r.room_number && r.room_number.toString().includes(searchTerm))
      );
    }
    result.sort((a, b) => sortOrder === 'oldest'
      ? new Date(a.created_at) - new Date(b.created_at)
      : new Date(b.created_at) - new Date(a.created_at)
    );
    return result;
  }, [requests, showActiveOnly, unacknowledgedOnly, selectedDepartment, selectedPriority, sortOrder, searchTerm]);

  if (loading) return <div className="p-6 text-lg font-medium">Loading requests…</div>;
  if (error)   return <div className="p-6 text-lg text-red-600">Error: {error}</div>;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-operon-background pt-24 px-6 flex flex-col items-center">
        <div className={`${styles.container} max-w-6xl w-full`}>
          <h1 className="text-4xl font-bold text-operon-charcoal flex items-center gap-2 mb-6">
            <span role="img" aria-label="clipboard">📋</span> Hotel Request Dashboard
          </h1>

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
              onAcknowledge={async (id) => { await acknowledgeRequest(id); fetchRequests(); }}
              onComplete={async   (id) => { await completeRequest(id);   fetchRequests(); }}
              onRowClick={(id) => navigate(`/request/${id}`)}
              onOpenNotes={openNotesModal}
            />
          </div>
        </div>
      </div>

      {notesModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-2xl w-11/12 md:w-3/4 lg:w-1/2">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-operon-charcoal">📝 Request Notes</h2>
              <button onClick={() => setNotesModalOpen(false)} className="text-gray-500 hover:text-gray-800 text-2xl leading-none" aria-label="Close notes modal">×</button>
            </div>

            <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
              {notesLoading && <p className="text-gray-600">Loading...</p>}
              {notesError   && <p className="text-red-600">{notesError}</p>}
              {!notesLoading && notes.length === 0 && <p className="text-gray-500">No notes yet.</p>}
              {notes.map(note => (
                <div key={note.id} className="flex justify-between items-center bg-gray-100 p-2 rounded">
                  <span className="text-operon-charcoal">{note.content}</span>
                  <button onClick={() => handleDeleteNote(note.id)} className="text-red-500 hover:text-red-700 ml-2" aria-label="Delete note">×</button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add a new note..."
                value={newNote}
                onChange={e => setNewNote(e.target.value)}
                className="flex-grow border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-operon-blue"
              />
              <button onClick={handleAddNote} className="bg-operon-blue text-white rounded px-4 py-2 hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-300">
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
