// components/RequestNotes.jsx
import { useState, useEffect } from "react";

export default function RequestNotes({ requestId }) {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // fetch notes when component mounts or requestId changes
  useEffect(() => {
    fetch(`/requests/${requestId}/notes`)
      .then((r) => r.json())
      .then(setNotes);
  }, [requestId]);

  async function handleAddNote() {
    if (!newNote.trim()) return;
    const res = await fetch(`/requests/${requestId}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: newNote }),
    });
    const body = await res.json();
    if (body.success) {
      setNotes(body.notes);
      setNewNote("");
      setIsModalOpen(false);
    }
  }

  return (
    <div className="p-4 border rounded">
      <h4 className="font-semibold mb-2">Notes</h4>
      <ul className="mb-4">
        {notes.map((n, i) => (
          <li key={i} className="mb-1">{n}</li>
        ))}
      </ul>
      <button
        className="px-3 py-1 bg-blue-600 text-white rounded"
        onClick={() => setIsModalOpen(true)}
      >
        Add Note
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg w-80">
            <h5 className="font-medium mb-2">New Note</h5>
            <textarea
              className="w-full p-2 border rounded mb-4"
              rows={3}
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
            />
            <div className="flex justify-end space-x-2">
              <button onClick={() => setIsModalOpen(false)}>Cancel</button>
              <button
                className="px-3 py-1 bg-green-600 text-white rounded"
                onClick={handleAddNote}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
