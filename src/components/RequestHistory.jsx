import { useEffect, useState } from 'react';
import { getRequestHistory } from '../utils/api';

const LABEL = {
  created: 'Created',
  acknowledged: 'Acknowledged',
  completed: 'Completed',
  reopened: 'Reopened',
  cancelled: 'Cancelled',
  priority_changed: 'Priority changed',
  department_changed: 'Department changed',
  note_added: 'Note added',
  field_changed: 'Fields updated',
};

function line(r) {
  if (r.action === 'priority_changed') return `Priority: ${r.from_priority} → ${r.to_priority}`;
  if (r.action === 'department_changed') return `Department: ${r.from_department} → ${r.to_department}`;
  if (r.action === 'note_added') return `Note: ${r.note?.slice(0, 140)}`;
  if (r.action === 'field_changed') {
    const keys = r.metadata && r.metadata.patch ? Object.keys(r.metadata.patch) : [];
    return `Updated: ${keys.join(', ')}`;
  }
  if (r.action === 'acknowledged') return 'Acknowledged';
  if (r.action === 'completed') return 'Completed';
  if (r.action === 'reopened') return 'Reopened';
  if (r.action === 'cancelled') return 'Cancelled';
  if (r.action === 'created') return 'Request created';
  return r.action;
}

export default function RequestHistory({ requestId }) {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const data = await getRequestHistory(requestId);
        setRows(data);
      } catch (e) {
        console.error('Failed to load request history:', e);
      }
    }
    load();
  }, [requestId]);

  return (
    <div className="space-y-2">
      {rows.map((r) => (
        <div key={r.id} className="rounded-lg border p-3">
          <div className="text-sm font-medium">{LABEL[r.action] || r.action}</div>
          <div className="text-sm text-gray-600">{line(r)}</div>
          <div className="text-xs text-gray-500 mt-1">
            {new Date(r.created_at).toLocaleString()} · {r.actor_label || 'System'}
          </div>
        </div>
      ))}
      {!rows.length && <div className="text-sm text-gray-500">No history yet.</div>}
    </div>
  );
}
