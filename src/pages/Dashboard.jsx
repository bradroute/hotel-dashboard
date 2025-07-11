import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
} from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
import styles from '../styles/Dashboard.module.css';
import { motion, AnimatePresence } from 'framer-motion';
import { BadgeAlert, BadgeCheck } from 'lucide-react';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.15 } },
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { hotelId } = useParams();

  const [hotel, setHotel] = useState(null);
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

  // Notes modal state
  const [notesModalOpen, setNotesModalOpen] = useState(false);
  const [currentRequestId, setCurrentRequestId] = useState(null);
  const [notes, setNotes] = useState([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [notesError, setNotesError] = useState('');
  const [newNote, setNewNote] = useState('');

  // Details modal state (inlined)
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [detailsRequest, setDetailsRequest] = useState(null);

  // Fetch hotel info
  const fetchHotel = useCallback(async () => {
    if (!hotelId) return;
    setLoading(true);
    setError('');
    try {
      const { data: h, error: e } = await supabase
        .from('hotels')
        .select('id,name,type')
        .eq('id', hotelId)
        .single();
      if (e) throw e;
      setHotel(h);
    } catch (err) {
      setError(err.message || 'Failed to fetch hotel.');
    } finally {
      setLoading(false);
    }
  }, [hotelId]);

  // Fetch enabled departments
  const fetchEnabledDepartments = useCallback(async () => {
    if (!hotelId) return;
    try {
      const { data: settings, error } = await supabase
        .from('department_settings')
        .select('department')
        .eq('hotel_id', hotelId)
        .eq('enabled', true);
      if (error) throw error;
      setDepartmentOptions(settings.map((d) => d.department));
    } catch (err) {
      console.error('Error fetching departments:', err);
    }
  }, [hotelId]);

  // Fetch requests
  const fetchRequests = useCallback(async () => {
    if (!hotelId) return;
    setLoading(true);
    setError('');
    try {
      const data = await getAllRequests(hotelId);
      setRequests(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  }, [hotelId]);

  useEffect(() => {
    if (!hotelId) return;
    fetchHotel();
    fetchEnabledDepartments();
    fetchRequests();
    const interval = setInterval(fetchRequests, 60000);
    return () => clearInterval(interval);
  }, [hotelId, fetchHotel, fetchEnabledDepartments, fetchRequests]);

  // Notes modal handlers
  const openNotesModal = async (id) => {
    setCurrentRequestId(id);
    setNotesLoading(true);
    setNotesError('');
    try {
      const data = await getNotes(id);
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
    await addNote(currentRequestId, newNote.trim());
    setNotes(await getNotes(currentRequestId));
    setNewNote('');
  };
  const handleDeleteNote = async (id) => {
    await deleteNote(currentRequestId, id);
    setNotes(await getNotes(currentRequestId));
  };

  // Details modal handler
  const openDetailsModal = (req) => {
    setDetailsRequest(req);
    setDetailsModalOpen(true);
  };

  const priorityOptions = ['Normal', 'Urgent', 'Low'];

  // Filter, search, sort
  const filtered = useMemo(() => {
    let list = [...requests];
    if (showActiveOnly) list = list.filter((r) => !r.completed);
    if (unacknowledgedOnly) list = list.filter((r) => !r.acknowledged);
    if (selectedDepartment !== 'All') list = list.filter((r) => r.department === selectedDepartment);
    if (selectedPriority !== 'All') list = list.filter(
      (r) => r.priority.toLowerCase() === selectedPriority.toLowerCase()
    );
    if (searchTerm.trim()) {
      list = list.filter(
        (r) =>
          r.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (r.from_phone && r.from_phone.includes(searchTerm)) ||
          (r.room_number && r.room_number.toString().includes(searchTerm))
      );
    }
    return list.sort((a, b) =>
      sortOrder === 'oldest'
        ? new Date(a.created_at) - new Date(b.created_at)
        : new Date(b.created_at) - new Date(a.created_at)
    );
  }, [
    requests,
    showActiveOnly,
    unacknowledgedOnly,
    selectedDepartment,
    selectedPriority,
    searchTerm,
    sortOrder,
  ]);

  if (!hotelId) return <div className="p-6 text-lg">No hotel selected.</div>;
  if (loading) return <div className="p-6 text-lg font-medium">Loading…</div>;
  if (error) return <div className="p-6 text-lg text-red-600">Error: {error}</div>;
  if (!hotel) return <div className="p-6 text-lg">Hotel not found.</div>;

  return (
    <>
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="min-h-screen bg-operon-background pt-24 px-6 flex flex-col items-center"
      >
        <div className={`${styles.container} max-w-6xl w-full`}>
          <h1 className="text-4xl font-bold text-operon-charcoal flex items-center gap-2 mb-6">
            <span role="img" aria-label="clipboard">
              📋
            </span>{' '}{hotel.name} Dashboard
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
              onAcknowledge={async (id) => { await acknowledgeRequest(id, hotelId); fetchRequests(); }}
              onComplete={async (id) => { await completeRequest(id, hotelId); fetchRequests(); }}
              onRowClick={(id) => navigate(`/request/${id}`)}
              onOpenNotes={openNotesModal}
              onOpenDetails={openDetailsModal}
            />
          </div>
        </div>
      </motion.div>

      {/* Notes Modal */}
      <AnimatePresence>
        {notesModalOpen && (
          <>
            <motion.div
              key="notes-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-50"
              onClick={() => setNotesModalOpen(false)}
            />
            <motion.div
              key="notes-modal"
              initial={{ opacity: 0, scale: 0.97, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 40 }}
              transition={{ duration: 0.18, delay: 0.05 }}
              className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.97, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97, y: 40 }}
                transition={{ duration: 0.18, delay: 0.05 }}
                className="bg-white p-6 rounded-2xl shadow-2xl w-11/12 md:w-3/4 lg:w-1/2 pointer-events-auto"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-operon-charcoal">📝 Request Notes</h2>
                  <button
                    onClick={() => setNotesModalOpen(false)}
                    className="text-gray-500 hover:text-gray-800 text-2xl leading-none"
                  >
                    ×
                  </button>
                </div>
                <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
                  {notesLoading && <p className="text-gray-600">Loading...</p>}
                  {notesError && <p className="text-red-600">{notesError}</p>}
                  {!notesLoading && notes.length === 0 && <p className="text-gray-500">No notes yet.</p>}
                  {notes.map((note) => (
                    <div key={note.id} className="flex justify-between items-center bg-gray-100 p-2 rounded">
                      <span className="text-operon-charcoal">{note.content}</span>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="text-red-500 hover:text-red-700 ml-2"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add a new note..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    className="flex-grow border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-operon-blue"
                  />
                  <button
                    onClick={handleAddNote}
                    className="bg-operon-blue text-white rounded px-4 py-2 hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  >
                    Add
                  </button>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Details Modal */}
      <AnimatePresence>
        {detailsModalOpen && detailsRequest && (
          <>
            <motion.div
              key="details-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-50"
              onClick={() => setDetailsModalOpen(false)}
            />
            <motion.div
              key="details-modal"
              initial={{ opacity: 0, scale: 0.97, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 40 }}
              transition={{ duration: 0.18, delay: 0.05 }}
              className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.97, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97, y: 40 }}
                transition={{ duration: 0.18, delay: 0.05 }}
                className="bg-white p-6 rounded-2xl shadow-2xl w-11/12 md:w-3/4 lg:w-1/2 pointer-events-auto"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-operon-charcoal">Request Details</h2>
                  <button
                    onClick={() => setDetailsModalOpen(false)}
                    className="text-gray-500 hover:text-gray-800 text-2xl leading-none"
                  >
                    ×
                  </button>
                </div>
                <div className="mt-4 space-y-3">
                  <div>
                    <span className="font-semibold">Summary: </span>
                    <span>{detailsRequest.summary || <em>No summary available</em>}</span>
                  </div>
                  <div>
                    <span className="font-semibold">Root Cause: </span>
                    <span>{detailsRequest.root_cause || <em>N/A</em>}</span>
                  </div>
                  <div>
                    <span className="font-semibold">Sentiment: </span>
                    <span className={
                      detailsRequest.sentiment === 'positive' ? 'text-green-600'
                        : detailsRequest.sentiment === 'negative' ? 'text-red-600'
                        : 'text-gray-700'
                    }>
                      {detailsRequest.sentiment || <em>N/A</em>}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold">AI Priority: </span>
                    <span className={
                      detailsRequest.priority === 'high' ? 'text-red-600'
                        : detailsRequest.priority === 'low' ? 'text-yellow-500'
                        : 'text-gray-700'
                    }>
                      {detailsRequest.priority}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold">Needs Management Attention: </span>
                    <span>
                      {detailsRequest.needs_attention ? (
                        <span className="inline-flex items-center text-red-600 font-bold">
                          <BadgeAlert className="w-4 h-4 mr-1" />Yes
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-green-600 font-bold">
                          <BadgeCheck className="w-4 h-4 mr-1" />No
                        </span>
                      )}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold">Original Message:</span>
                    <div className="bg-gray-100 rounded p-2 mt-1 text-gray-700">
                      {detailsRequest.message}
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
