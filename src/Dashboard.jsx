// src/Dashboard.jsx

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './styles/Dashboard.module.css';
import {
  getAllRequests,
  acknowledgeRequest,
  completeRequest,
  getNotes,
  addNote,
  deleteNote,
} from './utils/api';
import FiltersBar from './components/FiltersBar';
import RequestsTable from './components/RequestsTable';
import RequestNotes from './components/RequestNotes';

export default function Dashboard() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters state
  const [showActiveOnly, setShowActiveOnly] = useState(true);
  const [unacknowledgedOnly, setUnacknowledgedOnly] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [selectedPriority, setSelectedPriority] = useState('All');
  const [sortOrder, setSortOrder] = useState('newest');
  const [searchTerm, setSearchTerm] = useState('');

  // Notes state
  const [notesModalOpen, setNotesModalOpen] = useState(false);
  const [currentRequestId, setCurrentRequestId] = useState(null);
  const [notes, setNotes] = useState([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [notesError, setNotesError] = useState('');

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
    const iv = setInterval(fetchRequests, 60_000);
    return () => clearInterval(iv);
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

  const handleAddNote = async (content) => {
    try {
      await addNote(currentRequestId, content);
      const updated = await getNotes(currentRequestId);
      setNotes(updated);
    } catch (err) {
      throw err;
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      await deleteNote(currentRequestId, noteId);
      const updated = await getNotes(currentRequestId);
      setNotes(updated);
    } catch (err) {
      throw err;
    }
  };

  const departmentOptions = [
    'Front Desk',
    'Housekeeping',
    'Maintenance',
    'Room Service',
    'Valet',
  ];

  const priorityOptions = ['Normal', 'Urgent', 'Low'];

  const filtered = useMemo(() => {
    let result = [...requests];
    if (showActiveOnly) result = result.filter((r) => !r.completed);
    if (unacknowledgedOnly) result = result.filter((r) => !r.acknowledged);
    if (selectedDepartment !== 'All')
      result = result.filter((r) => r.department === selectedDepartment);
    if (selectedPriority !== 'All')
      result = result.filter((r) => r.priority.toLowerCase() === selectedPriority.toLowerCase());
    if (searchTerm.trim()) {
      result = result.filter(
        (r) =>
          r.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.from_phone.includes(searchTerm)
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

  return (
    <div className={styles.container}>
      <h1>📋 Hotel Request Dashboard</h1>

      {error && (
        <div className={styles.errorBanner}>
          <p>Error: {error}</p>
        </div>
      )}

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

      {loading ? (
        <div className={styles.overlay}>
          <div className={styles.spinner} role="status" />
          <span>Loading requests…</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No {showActiveOnly ? 'active' : ''} requests right now 🎉</p>
        </div>
      ) : (
        <RequestsTable
          requests={filtered}
          onAcknowledge={async (id) => {
            await acknowledgeRequest(id);
            fetchRequests();
          }}
          onComplete={async (id) => {
            await completeRequest(id);
            fetchRequests();
          }}
          onRowClick={(id) => navigate(`/request/${id}`)}
          onOpenNotes={openNotesModal}
        />
      )}

      {notesModalOpen && (
        <RequestNotes
          requestId={currentRequestId}
          notes={notes}
          loading={notesLoading}
          error={notesError}
          onAddNote={handleAddNote}
          onDeleteNote={handleDeleteNote}
          onClose={() => setNotesModalOpen(false)}
        />
      )}
    </div>
  );
}
