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
} from './utils/api';
import FiltersBar from './components/FiltersBar';
import RequestsTable from './components/RequestsTable';
import RequestNotes from './components/RequestNotes';

export default function Dashboard() {
  const [requests, setRequests]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');

  // Filters state
  const [showActiveOnly, setShowActiveOnly]       = useState(true);
  const [selectedDepartment, setSelectedDepartment] = useState('All');

  // Notes modal state
  const [notesModalOpen, setNotesModalOpen]       = useState(false);
  const [currentRequestId, setCurrentRequestId]   = useState(null);
  const [notes, setNotes]                         = useState([]);
  const [notesLoading, setNotesLoading]           = useState(false);
  const [notesError, setNotesError]               = useState('');

  const navigate = useNavigate();

  // Fetch all requests
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

  // Notes handlers
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
      // re-load
      const updated = await getNotes(currentRequestId);
      setNotes(updated);
    } catch (err) {
      // bubble up to RequestNotes form
      throw err;
    }
  };

  // Table data + filters
  const departmentOptions = useMemo(() => {
    const deps = requests.map((r) => r.department || 'General');
    return ['All', ...Array.from(new Set(deps))];
  }, [requests]);

  const filtered = useMemo(() => {
    return requests
      .filter((r) => (showActiveOnly ? !r.completed : true))
      .filter((r) => (selectedDepartment === 'All' ? true : r.department === selectedDepartment));
  }, [requests, showActiveOnly, selectedDepartment]);

  return (
    <div className={styles.container}>
      <h1>📋 Hotel Request Dashboard</h1>

      {error && <div className={styles.errorBanner}><p>Error: {error}</p></div>}

      <FiltersBar
        showActiveOnly={showActiveOnly}
        onToggleActive={setShowActiveOnly}
        selectedDepartment={selectedDepartment}
        onChangeDepartment={setSelectedDepartment}
        departmentOptions={departmentOptions}
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
          onOpenNotes={openNotesModal}        // << new prop
        />
      )}

      {notesModalOpen && (
        <RequestNotes
          requestId={currentRequestId}
          notes={notes}
          loading={notesLoading}
          error={notesError}
          onAddNote={handleAddNote}
          onClose={() => setNotesModalOpen(false)}
        />
      )}
    </div>
  );
}
