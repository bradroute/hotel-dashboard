import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
    const iv = setInterval(fetchRequests, 60000);
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

  const departmentOptions = ['Front Desk', 'Housekeeping', 'Maintenance', 'Room Service', 'Valet'];
  const priorityOptions = ['Normal', 'Urgent', 'Low'];

  const filtered = useMemo(() => {
    let result = [...requests];
    if (showActiveOnly) result = result.filter((r) => !r.completed);
    if (unacknowledgedOnly) result = result.filter((r) => !r.acknowledged);
    if (selectedDepartment !== 'All')
      result = result.filter((r) => r.department === selectedDepartment);
    if (selectedPriority !== 'All')
      result = result.filter(
        (r) => r.priority.toLowerCase() === selectedPriority.toLowerCase()
      );
    if (searchTerm.trim()) {
      result = result.filter(
        (r) =>
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

  return (
    <div className="p-6 min-h-screen bg-gray-100 space-y-6">
      <h1 className="text-2xl font-semibold flex items-center gap-2">
        <span role="img" aria-label="clipboard">📋</span> Hotel Request Dashboard
      </h1>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded mb-4 font-bold">
          Error: {error}
        </div>
      )}

      <FiltersBar
        className="flex flex-wrap gap-4 mb-6 items-center"
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
        <div className="flex items-center justify-center p-6">
          <div className="animate-spin h-10 w-10 border-4 border-gray-200 border-t-blue-500 rounded-full mr-4" role="status" />
          <span>Loading requests…</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-6 text-center text-gray-600 text-lg">
          No {showActiveOnly ? 'active' : ''} requests right now 🎉
        </div>
      ) : (
        <div className="overflow-x-auto">
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
        </div>
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
