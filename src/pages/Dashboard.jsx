// src/Dashboard.jsx

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
import FiltersBar from '../components/FiltersBar';
import RequestsTable from '../components/RequestsTable';
import Navbar from '../components/Navbar';
import styles from '../styles/Dashboard.module.css';

export default function Dashboard() {
  const [requests, setRequests] = useState([]);
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

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAllRequests();
      setRequests(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 60000);
    return () => clearInterval(interval);
  }, [fetchRequests]);

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
      const updated = await getNotes(currentRequestId);
      setNotes(updated);
      setNewNote('');
    } catch (err) {
      setNotesError(err.message || 'Unknown error adding note');
    }
  };

  const handleDeleteNote = async (noteId) => {
    await deleteNote(currentRequestId, noteId);
    const updated = await getNotes(currentRequestId);
    setNotes(updated);
  };

  const departmentOptions = ['Front Desk', 'Housekeeping', 'Maintenance', 'Room Service', 'Valet'];
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
    if (sortOrder === 'oldest') {
      result.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    } else {
      result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
    return result;
  }, [
    requests,
    showActiveOnly,
    unacknowledgedOnly,
    selectedDepartment,
    selectedPriority,
    sortOrder,
    searchTerm,
  ]);

  if (loading) return <div className="p-6 text-lg font-medium">Loading requests…</div>;
  if (error) return <div className="p-6 text-lg text-red-600">Error: {error}</div>;

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

          <div className="mt-4">
            <RequestsTable
              requests={filtered}
              onAcknowledge={async id => { await acknowledgeRequest(id); fetchRequests(); }}
              onComplete={async id => { await completeRequest(id); fetchRequests(); }}
              onRowClick={id => navigate(`/request/${id}`)}
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
              <button
                onClick={() => setNotesModalOpen(false)}
                className="text-gray-500 hover:text-gray-800 text-2xl leading-none"
                aria-label="Close notes modal"
              >
                &times;
              </button>
            </div>

            <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
              {notesLoading && <p className="text-gray-600">Loading...</p>}
              {notesError && <p className="text-red-600">{notesError}</p>}
              {!notesLoading && notes.length === 0 && <p className="text-gray-500">No notes yet.</p>}
              {!notesLoading && notes.map(note => (
                <div key={note.id} className="flex justify-between items-center bg-gray-100 p-2 rounded">
                  <span className="text-operon-charcoal">{note.content}</span>
                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    className="text-red-500 hover:text-red-700 ml-2"
                    aria-label="Delete note"
                  >
                    &times;
                  </button>
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
              <button
                onClick={handleAddNote}
                className="bg-operon-blue text-white rounded px-4 py-2 hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
