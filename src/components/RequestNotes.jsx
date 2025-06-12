// src/components/RequestNotes.jsx
import React, { useEffect, useState } from 'react';
import { getNotes, addNote } from '../utils/api';

export default function RequestNotes({ requestId, onClose }) {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getNotes(requestId)
      .then(data => setNotes(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [requestId]);

  const handleAdd = async () => {
    if (!newNote.trim()) return;
    setLoading(true);
    try {
      const { note } = await addNote(requestId, newNote.trim());
      setNotes([note, ...notes]);
      setNewNote('');
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-96 p-4">
        <h2 className="text-xl mb-2">Notes for Request {requestId}</h2>
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
          onClick={onClose}
        >
          ✕
        </button>
        <div className="mb-4">
          <textarea
            rows={3}
            className="w-full border rounded p-2"
            placeholder="Type a note…"
            value={newNote}
            onChange={e => setNewNote(e.target.value)}
          />
          <button
            className="mt-2 bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
            onClick={handleAdd}
            disabled={loading}
          >
            Add Note
          </button>
        </div>
        <div className="max-h-60 overflow-y-auto">
          {loading && <p>Loading…</p>}
          {!loading && notes.length === 0 && <p className="text-gray-500">No notes yet.</p>}
          <ul className="space-y-2">
            {notes.map(n => (
              <li key={n.id} className="border-b pb-1">{n.content}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
