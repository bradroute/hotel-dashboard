// src/components/RequestsTable.jsx

import React from 'react';
import styles from '../styles/Dashboard.module.css';

export default function RequestsTable({
  requests,
  onAcknowledge,
  onComplete,
  onRowClick,
  onOpenNotes,
}) {
  return (
    <div className={styles.tableContainer}>
      <table className={styles.requestsTable}>
        <thead>
          <tr>
            <th>Created At</th>
            <th>Room</th>
            <th>From</th>
            <th>Department</th>
            <th>Priority</th>
            <th>Message</th>
            <th>Notes</th>
            <th>Acknowledge</th>
            <th>Complete</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((r) => (
            <tr
              key={r.id}
              onClick={() => onRowClick(r.id)}
              className={styles.row}
            >
              <td>{new Date(r.created_at).toLocaleString()}</td>
              <td>{r.room_number ? r.room_number : '—'}</td>
              <td>{r.from_phone}</td>
              <td>{r.department}</td>
              <td>
                <span
                  className={
                    r.priority.toLowerCase() === 'urgent'
                      ? styles.priorityUrgent
                      : r.priority.toLowerCase() === 'low'
                      ? styles.priorityLow
                      : styles.priorityNormal
                  }
                >
                  {r.priority.toUpperCase()}
                </span>
              </td>
              <td>{r.message}</td>
              <td>
                <button
                  className={styles.notesBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenNotes(r.id);
                  }}
                >
                  📝 Notes
                </button>
              </td>
              <td>
                {r.acknowledged ? (
                  <span className={styles.doneIcon} aria-label="acknowledged">
                    ✔️
                  </span>
                ) : (
                  <button
                    className={styles.ackBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      onAcknowledge(r.id);
                    }}
                  >
                    Acknowledge
                  </button>
                )}
              </td>
              <td>
                {r.completed ? (
                  <span className={styles.doneIcon} aria-label="completed">
                    ✔️
                  </span>
                ) : (
                  <button
                    className={styles.completeBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      onComplete(r.id);
                    }}
                  >
                    Complete
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
