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

  // Details modal state
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
      setDepartmentOptions(settings.map(d => d.department));
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
  const openNotesModal = async id => {
    setCurrentRequestId(id);
    setNotesLoading(true);
    setNotesError('');
    try {
      const data = await getNotes(id);
      setNotes(data);
      setNotesModalOpen(true);
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
  const handleDeleteNote = async id => {
    await deleteNote(currentRequestId, id);
    setNotes(await getNotes(currentRequestId));
  };

  // Details modal handler
  const openDetailsModal = req => {
    setDetailsRequest(req);
    setDetailsModalOpen(true);
  };

  const priorityOptions = ['Normal','Urgent','Low'];

  // Filter, search, sort
  const filtered = useMemo(() => {
    let list = [...requests];
    if (showActiveOnly) list = list.filter(r => !r.completed);
    if (unacknowledgedOnly) list = list.filter(r => !r.acknowledged);
    if (selectedDepartment !== 'All') list = list.filter(r => r.department === selectedDepartment);
    if (selectedPriority !== 'All') list = list.filter(r => r.priority.toLowerCase() === selectedPriority.toLowerCase());
    if (searchTerm.trim()) {
      list = list.filter(r =>
        r.message.toLowerCase().includes(searchTerm) ||
        (r.from_phone && r.from_phone.includes(searchTerm)) ||
        (r.room_number && r.room_number.includes(searchTerm))
      );
    }
    return list.sort((a,b) => sortOrder==='oldest'
      ? new Date(a.created_at)-new Date(b.created_at)
      : new Date(b.created_at)-new Date(a.created_at)
    );
  },[requests,showActiveOnly,unacknowledgedOnly,selectedDepartment,selectedPriority,searchTerm,sortOrder]);

  if (!hotelId) return <div className="p-6 text-lg">No hotel selected.</div>;
  if (loading)   return <div className="p-6 text-lg font-medium">Loading…</div>;
  if (error)     return <div className="p-6 text-lg text-red-600">Error: {error}</div>;
  if (!hotel)    return <div className="p-6 text-lg">Hotel not found.</div>;

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
            📋 {hotel.name} Dashboard
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
              onAcknowledge={async id => { await acknowledgeRequest(id,hotelId); fetchRequests(); }}
              onComplete={async id => { await completeRequest(id,hotelId); fetchRequests(); }}
              onRowClick={id=>navigate(`/request/${id}`)}
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
              initial={{opacity:0}}
              animate={{opacity:1}}
              exit={{opacity:0}}
              transition={{ duration:0.18 }}
              className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-50"
              onClick={()=>setNotesModalOpen(false)}
            />
            <motion.div
              key="notes-modal"
              initial={{opacity:0,scale:0.97,y:40}}
              animate={{opacity:1,scale:1,y:0}}
              exit={{opacity:0,scale:0.97,y:40}}
              transition={{duration:0.18,delay:0.05}}
              className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
            >
              <motion.div
                className={`${styles.modalPanel} bg-white p-6 rounded-2xl shadow-2xl w-11/12 md:w-3/4 lg:w-1/2 pointer-events-auto`}                initial={{opacity:0,scale:0.97,y:40}}
                animate={{opacity:1,scale:1,y:0}}
                exit={{opacity:0,scale:0.97,y:40}}
                transition={{duration:0.18,delay:0.05}}
              >
                {/* Header & content… */}
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
              initial={{opacity:0}}
              animate={{opacity:1}}
              exit={{opacity:0}}
              transition={{ duration:0.18 }}
              className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-50"
              onClick={()=>setDetailsModalOpen(false)}
            />
            <motion.div
              key="details-modal"
              initial={{opacity:0,scale:0.97,y:40}}
              animate={{opacity:1,scale:1,y:0}}
              exit={{opacity:0,scale:0.97,y:40}}
              transition={{duration:0.18,delay:0.05}}
              className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
            >
              <motion.div
                className={`${styles.modalPanel} bg-white p-6 rounded-2xl shadow-2xl w-11/12 md:w-3/4 lg:w-1/2 pointer-events-auto`}
                initial={{opacity:0,scale:0.97,y:40}}
                animate={{opacity:1,scale:1,y:0}}
                exit={{opacity:0,scale:0.97,y:40}}
                transition={{duration:0.18,delay:0.05}}
              >
                {/* Header & content… */}
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
