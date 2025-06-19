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
    <div className={styles.tableContainer} style={{ overflowX: 'auto' }}>
      <table className={styles.requestsTable} style={{ width: '100%' }}>
        <thead>
          <tr>
            <th style={{ width: '150px', whiteSpace: 'nowrap' }}>Created At</th>
            <th style={{ width: '70px', whiteSpace: 'nowrap' }}>Room</th>
            <th style={{ minWidth: '160px', whiteSpace: 'nowrap' }}>From</th>
            <th style={{ whiteSpace: 'nowrap' }}>Department</th>
            <th style={{ width: '100px', whiteSpace: 'nowrap' }}>Priority</th>
            <th className={styles.messageCol} style={{ minWidth: '300px' }}>Message</th>
            <th style={{ width: '90px', whiteSpace: 'nowrap' }}>Notes</th>
            <th style={{ width: '130px', whiteSpace: 'nowrap' }}>Acknowledge</th>
            <th style={{ width: '100px', whiteSpace: 'nowrap' }}>Complete</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((r) => (
            <tr
              key={r.id}
              onClick={() => onRowClick(r.id)}
              className={`${styles.row} ${r.is_vip ? styles.vipRow : ''}`}
            >
              <td>{new Date(r.created_at).toLocaleString()}</td>
              <td>{r.room_number || '—'}</td>
              <td>
                {r.from_phone}
                {r.is_vip && <span className={styles.vipBadge}>⭐ VIP</span>}
              </td>
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
              <td className={styles.messageCol} style={{ wordBreak: 'break-word' }}>
                {r.message}
              </td>
              <td>
                <button
                  className={styles.notesBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenNotes(r.id);
                  }}
                >
                  Notes
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
