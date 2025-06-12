// src/components/RequestNotes.jsx

import React, { useState } from 'react';
import styles from '../styles/Dashboard.module.css';

/**
 * Props:
 *  - requestId
 *  - notes (array of strings)
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
        <h2 className={styles.modalTitle}>📝 Request Notes</h2>

        {error && <div className={styles.errorBanner}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.noteForm}>
          <input
            type="text"
            placeholder="Type a new note…"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            className={styles.noteInput}
          />
          <button type="submit" disabled={submitting} className={styles.addNoteButton}>
            Add Note
          </button>
        </form>

        {submitError && <div className={styles.errorBanner}>{submitError}</div>}

        <ul className={styles.notesList}>
          {loading ? (
            <li>Loading…</li>
          ) : notes.length === 0 ? (
            <li className={styles.emptyNotes}>No notes yet.</li>
          ) : (
            notes.map((note) => (
              <li key={note.id} className={styles.noteItem}>
                <span>{note.content}</span>
                <button
                  onClick={() => handleDelete(note.id)}
                  className={styles.deleteButton}
                  title="Delete note"
                >
                  ❌
                </button>
              </li>
            ))
          )}
        </ul>

        <div className={styles.modalActions}>
          <button onClick={onClose} className={styles.closeButton}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
