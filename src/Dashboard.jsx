// Updated: unified Tailwind styling & modal overlay
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

  const handleAddNote = async (content) => {
    await addNote(currentRequestId, content);
    const updated = await getNotes(currentRequestId);
    setNotes(updated);
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
  if (error)   return <div className="p-6 text-lg text-red-600">Error: {error}</div>;

  return (
    <>
      <div className="min-h-screen bg-gray-50 p-6 space-y-10">
        <h1 className="text-4xl font-bold text-gray-800 flex items-center gap-2">
          <span role="img" aria-label="clipboard">📋</span> Hotel Request Dashboard
        </h1>

        <FiltersBar
          className="flex flex-wrap gap-4 items-center"
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

        <div className="overflow-x-auto">
          <RequestsTable
            requests={filtered}
            onAcknowledge={async id => { await acknowledgeRequest(id); fetchRequests(); }}
            onComplete={async id => { await completeRequest(id); fetchRequests(); }}
            onRowClick={id => navigate(`/request/${id}`)}
            onOpenNotes={openNotesModal}
          />
        </div>
      </div>

      {notesModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-md">
            <RequestNotes
              requestId={currentRequestId}
              notes={notes}
              loading={notesLoading}
              error={notesError}
              onAddNote={handleAddNote}
              onDeleteNote={handleDeleteNote}
              onClose={() => setNotesModalOpen(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}
