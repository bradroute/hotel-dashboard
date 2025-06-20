// src/components/RequestNotes.jsx

import React, { useState } from 'react';
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
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
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
            notes.map((note) => (
              <li
                key={note.id}
                className="flex justify-between items-center bg-gray-100 px-3 py-2 rounded text-operon-charcoal"
              >
                <span>{note.content}</span>
                <button
                  onClick={() => handleDelete(note.id)}
                  className="text-red-500 hover:text-red-700 ml-3"
                  title="Delete note"
                >
                  ❌
                </button>
              </li>
            ))
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
      </div>
    </div>
  );
}
