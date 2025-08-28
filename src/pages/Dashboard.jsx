import React, { useEffect, useState, useMemo, useCallback } from 'react';
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
import { BadgeAlert, BadgeCheck, RefreshCw } from 'lucide-react';

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  exit:    { opacity: 0, y: -16, transition: { duration: 0.18 } },
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { hotelId } = useParams();

  const [hotel, setHotel] = useState(null);
  const [requests, setRequests] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastRefreshed, setLastRefreshed] = useState(null);

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

  // Details modal state
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [detailsRequest, setDetailsRequest] = useState(null);

  // Fetch hotel info
  const fetchHotel = useCallback(async () => {
    if (!hotelId) return;
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
      setRequests(data || []);
      setLastRefreshed(new Date());
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
    const interval = setInterval(fetchRequests, 60000); // auto-refresh each minute
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

  // Derived metrics
  const metrics = useMemo(() => {
    const active = requests.filter((r) => !r.completed);
    const unacked = active.filter((r) => !r.acknowledged);
    const urgent = active.filter((r) => {
      const p = (r.priority || '').toLowerCase();
      return p === 'urgent' || p === 'high';
    });
    const todayStr = new Date().toDateString();
    const today = active.filter((r) => new Date(r.created_at).toDateString() === todayStr);
    return {
      total: requests.length,
      active: active.length,
      unacknowledged: unacked.length,
      urgent: urgent.length,
      today: today.length,
    };
  }, [requests]);

  // Filtering, search, sort
  const filtered = useMemo(() => {
    let list = [...requests];
    if (showActiveOnly) list = list.filter((r) => !r.completed);
    if (unacknowledgedOnly) list = list.filter((r) => !r.acknowledged);
    if (selectedDepartment !== 'All') list = list.filter((r) => r.department === selectedDepartment);
    if (selectedPriority !== 'All')
      list = list.filter((r) => (r.priority || '').toLowerCase() === selectedPriority.toLowerCase());
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (r) =>
          (r.message || '').toLowerCase().includes(q) ||
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

  if (!hotelId) {
    return <div className="min-h-dvh pt-24 bg-operon-background px-6">No property selected.</div>;
  }
  if (error) {
    return (
      <div className="min-h-dvh pt-24 bg-operon-background px-6">
        <div className="max-w-5xl mx-auto">
          <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 p-4">
            <div className="font-semibold">Something went wrong</div>
            <div className="text-sm mt-1">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <motion.main
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        // Match Terms: dvh height, horizontal clip only, orbs scroll with page, seam fix
        className="relative min-h-dvh bg-operon-background pt-24 overflow-x-clip"
      >
        {/* background accents (scroll with page) */}
        {/* Removed the global top-left orb — we place a local orb behind KPI #1 instead */}
        <div
          aria-hidden="true"
          className="
            pointer-events-none absolute bottom-[-14rem] right-0
            h-[38rem] w-[38rem] rounded-full blur-[90px]
          "
          style={{ background: 'radial-gradient(closest-side, rgba(34,211,238,.22), transparent)' }}
        />

        <div className={`${styles.container} w-full max-w-7xl mx-auto px-4 sm:px-6 pb-8`}>
          {/* Header row */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-operon-charcoal">
                {hotel?.name || 'Property'} <span className="text-gray-400 font-semibold">Dashboard</span>
              </h1>
              <div className="text-xs text-gray-500 mt-1">
                {lastRefreshed ? `Last updated ${lastRefreshed.toLocaleTimeString()}` : 'Loading…'}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={fetchRequests}
                className="inline-flex items-center gap-2 rounded-lg bg-operon-blue text-white px-3 py-2 text-sm hover:bg-blue-400"
                title="Refresh"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
            </div>
          </div>

          {/* KPI tiles with local orb behind the first block */}
          <div className="relative mb-6">
            {/* orb behind KPI #1 */}
            <div
              aria-hidden="true"
              className="
                pointer-events-none absolute -z-10
                -top-8 -left-6 sm:-top-10 sm:-left-8
                h-72 w-72 sm:h-80 sm:w-80 rounded-full blur-3xl
              "
              style={{
                background: 'radial-gradient(closest-side, rgba(59,130,246,.28), transparent)',
              }}
            />
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
              {[
                { label: 'Active', value: metrics.active },
                { label: 'Unacknowledged', value: metrics.unacknowledged },
                { label: 'Urgent', value: metrics.urgent },
                { label: 'Today', value: metrics.today },
                { label: 'All', value: metrics.total },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="rounded-xl bg-white shadow-lg ring-1 ring-black/5 p-4 text-center relative"
                >
                  <div className="text-2xl font-bold text-operon-charcoal">{value}</div>
                  <div className="text-xs text-gray-500 mt-1">{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Glassy card: Filters + Table */}
          <div className="relative">
            {/* glow ring (kept inside bounds to avoid horizontal scrollbars) */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-2xl blur opacity-60"
              style={{ background: 'linear-gradient(135deg, rgba(59,130,246,.30), rgba(34,211,238,.22))' }}
            />
            <div className="relative bg-white rounded-2xl shadow-2xl ring-1 ring-black/5">
              {/* Controls */}
              <div className="p-4 sm:p-5 border-b">
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
                  priorityOptions={['Normal', 'Urgent', 'Low']}
                  sortOrder={sortOrder}
                  onChangeSort={setSortOrder}
                  searchTerm={searchTerm}
                  onChangeSearch={setSearchTerm}
                />
              </div>

              {/* Table */}
              <div className="p-0 sm:p-2">
                {loading ? (
                  <div className="p-6">
                    <div className="space-y-3">
                      {[0,1,2,3,4].map(i => (
                        <div key={i} className="h-12 rounded bg-gray-100 animate-pulse" />
                      ))}
                    </div>
                  </div>
                ) : (
                  <RequestsTable
                    requests={filtered}
                    onAcknowledge={async (id) => { await acknowledgeRequest(id, hotelId); fetchRequests(); }}
                    onComplete={async (id) => { await completeRequest(id, hotelId); fetchRequests(); }}
                    onRowClick={(id) => navigate(`/request/${id}`)}
                    onOpenNotes={openNotesModal}
                    onOpenDetails={openDetailsModal}
                  />
                )}
                {!loading && filtered.length === 0 && (
                  <div className="p-10 text-center text-sm text-gray-500">
                    No requests match your filters.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.main>

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
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
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
              <div className="relative pointer-events-auto w-11/12 md:w-3/4 lg:w-1/2">
                {/* glow (kept inside bounds) */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 rounded-2xl blur opacity-60"
                  style={{ background: 'linear-gradient(135deg, rgba(59,130,246,.30), rgba(34,211,238,.22))' }}
                />
                <div className="relative bg-white p-6 rounded-2xl shadow-2xl min-h-[320px]">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-operon-charcoal">📝 Request Notes</h2>
                    <button
                      onClick={() => setNotesModalOpen(false)}
                      className="text-gray-500 hover:text-gray-800 text-2xl leading-none"
                      aria-label="Close"
                    >
                      ×
                    </button>
                  </div>
                  <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
                    {notesLoading && <p className="text-gray-600">Loading…</p>}
                    {notesError && <p className="text-red-600">{notesError}</p>}
                    {!notesLoading && notes.length === 0 && <p className="text-gray-500">No notes yet.</p>}
                    {notes.map((note) => (
                      <div key={note.id} className="flex justify-between items-center bg-gray-100 p-2 rounded">
                        <span className="text-operon-charcoal">{note.content}</span>
                        <button
                          onClick={() => handleDeleteNote(note.id)}
                          className="text-red-500 hover:text-red-700 ml-2"
                          aria-label="Delete note"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add a new note…"
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
                </div>
              </div>
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
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
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
              <div className="relative pointer-events-auto w-11/12 md:w-3/4 lg:w-1/2">
                {/* glow (kept inside bounds) */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 rounded-2xl blur opacity-60"
                  style={{ background: 'linear-gradient(135deg, rgba(59,130,246,.30), rgba(34,211,238,.22))' }}
                />
                <div className="relative bg-white p-6 rounded-2xl shadow-2xl min-h-[320px]">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-operon-charcoal">Request Details</h2>
                    <button
                      onClick={() => setDetailsModalOpen(false)}
                      className="text-gray-500 hover:text-gray-800 text-2xl leading-none"
                      aria-label="Close"
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
                      <span
                        className={
                          detailsRequest.sentiment === 'positive' ? 'text-green-600'
                          : detailsRequest.sentiment === 'negative' ? 'text-red-600'
                          : 'text-gray-700'
                        }
                      >
                        {detailsRequest.sentiment || <em>N/A</em>}
                      </span>
                    </div>
                    <div>
                      <span className="font-semibold">AI Priority: </span>
                      <span
                        className={
                          (detailsRequest.priority || '').toLowerCase() === 'high' ? 'text-red-600'
                          : (detailsRequest.priority || '').toLowerCase() === 'low' ? 'text-yellow-500'
                          : 'text-gray-700'
                        }
                      >
                        {detailsRequest.priority || <em>N/A</em>}
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
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
