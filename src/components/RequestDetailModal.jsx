import React from 'react';
import RequestNotes from './RequestNotes';
import RequestHistory from './RequestHistory';

export default function RequestDetailsModal({ open, onClose, request }) {
  if (!open || !request) return null;

  return (
    <div
      aria-modal="true"
      role="dialog"
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl rounded-xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b px-5 py-3">
          <div>
            <div className="text-sm text-gray-500">Request #{request.id}</div>
            <h2 className="text-lg font-semibold">
              {request.department} · {request.priority?.toUpperCase?.()}
            </h2>
            <div className="text-xs text-gray-500">
              {new Date(request.created_at).toLocaleString()} • Room {request.room_number || '—'}
            </div>
          </div>
          <button
            className="rounded-md border px-3 py-1 text-sm hover:bg-gray-50"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <div className="grid gap-6 px-5 py-5 md:grid-cols-2">
          <section>
            <h3 className="mb-2 text-base font-semibold">Notes</h3>
            <RequestNotes requestId={request.id} />
          </section>

          <section>
            <h3 className="mb-2 text-base font-semibold">History</h3>
            <RequestHistory requestId={request.id} />
          </section>
        </div>
      </div>
    </div>
  );
}
