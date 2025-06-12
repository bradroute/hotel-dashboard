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
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showActiveOnly, setShowActiveOnly] = useState(true);
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [selectedPriority, setSelectedPriority] = useState('All');
  const [showUnacknowledgedOnly, setShowUnacknowledgedOnly] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');

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

  const departmentOptions = ['Valet', 'Room Service', 'Maintenance', 'Housekeeping', 'Front Desk'];
  const priorityOptions = ['Low', 'Normal', 'Urgent'];

  const filtered = useMemo(() => {
    return requests
      .filter((r) => (showActiveOnly ? !r.completed : true))
      .filter((r) => (selectedDepartment === 'All' ? true : r.department === selectedDepartment))
      .filter((r) => (selectedPriority === 'All' ? true : r.priority === selectedPriority))
      .filter((r) => (showUnacknowledgedOnly ? !r.acknowledged : true))
      .filter((r) => {
        const keyword = searchText.trim().toLowerCase();
        return (
          keyword === '' ||
          r.message.toLowerCase().includes(keyword) ||
          (r.from_phone && r.from_phone.toLowerCase().includes(keyword))
        );
      })
      .sort((a, b) => {
        const dateA = new Date(a.created_at);
        const dateB = new Date(b.created_at);
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      });
  }, [
    requests,
    showActiveOnly,
    selectedDepartment,
    selectedPriority,
    showUnacknowledgedOnly,
    searchText,
    sortOrder,
  ]);

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
        selectedPriority={selectedPriority}
        onChangePriority={setSelectedPriority}
        priorityOptions={priorityOptions}
        showUnacknowledgedOnly={showUnacknowledgedOnly}
        onToggleUnacknowledged={setShowUnacknowledgedOnly}
        searchText={searchText}
        onSearchChange={setSearchText}
        sortOrder={sortOrder}
        onSortOrderChange={setSortOrder}
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
          onClose={() => setNotesModalOpen(false)}
        />
      )}
    </div>
  );
}
