// src/components/RequestNotes.jsx

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from '../styles/Dashboard.module.css';

/**
 * Props:
 *  - requestId
 *  - notes (array of objects with .id and .content)
 *  - loading
 *  - error
 *  - onAddNote (function)
 *  - onDeleteNote (function)
 *  - onClose (function)
 */
const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.23 } },
  exit: { opacity: 0, scale: 0.96, y: -12, transition: { duration: 0.16 } }
};
const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.16 } },
  exit: { opacity: 0, transition: { duration: 0.16 } }
};
const noteVariants = {
  hidden: { opacity: 0, x: 16 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.18 } },
  exit: { opacity: 0, x: -16, transition: { duration: 0.14 } }
};

export default function RequestNotes({
  requestId,
  notes,
  loading,
  error,
  onAddNote,
  onDeleteNote,
  onClose,
}) {
  const [newNote, setNewNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    setSubmitting(true);
    setSubmitError('');
    try {
      await onAddNote(newNote.trim());
      setNewNote('');
    } catch (err) {
      setSubmitError(err.message || 'Failed to add note.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (noteId) => {
    if (!window.confirm('Delete this note?')) return;
    try {
      await onDeleteNote(noteId);
    } catch (err) {
      alert('Failed to delete note.');
    }
  };

  return (
    <AnimatePresence>
      {/* Overlay */}
      <motion.div
        className={styles.modalOverlay}
        variants={overlayVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        {/* Modal */}
        <motion.div
          className={styles.modalContent}
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <h2 className="text-xl font-semibold text-operon-charcoal mb-4">📝 Request Notes</h2>

          {error && <div className={styles.errorBanner}>{error}</div>}

          <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="Type a new note…"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="flex-grow border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-operon-blue text-operon-charcoal"
            />
            <button
              type="submit"
              disabled={submitting}
              className="bg-operon-blue text-white px-4 py-2 rounded hover:bg-blue-400 transition disabled:opacity-50"
            >
              Add Note
            </button>
          </form>

          {submitError && <div className={styles.errorBanner}>{submitError}</div>}

          <ul className="space-y-2 max-h-64 overflow-y-auto mb-4">
            {loading ? (
              <li>Loading…</li>
            ) : notes.length === 0 ? (
              <li className="text-gray-500 italic">No notes yet.</li>
            ) : (
              <AnimatePresence>
                {notes.map((note) => (
                  <motion.li
                    key={note.id}
                    className="flex justify-between items-center bg-gray-100 px-3 py-2 rounded text-operon-charcoal"
                    variants={noteVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    layout
                  >
                    <span>{note.content}</span>
                    <button
                      onClick={() => handleDelete(note.id)}
                      className="text-red-500 hover:text-red-700 ml-3"
                      title="Delete note"
                    >
                      ❌
                    </button>
                  </motion.li>
                ))}
              </AnimatePresence>
            )}
          </ul>

          <div className="flex justify-end mt-2">
            <button
              onClick={onClose}
              className="bg-gray-300 hover:bg-gray-400 text-operon-charcoal px-4 py-2 rounded font-medium transition"
            >
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
