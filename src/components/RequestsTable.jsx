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
          {requests.map((r) => {
            const priorityClass =
              r.priority.toLowerCase() === 'urgent'
                ? styles.priorityUrgent
                : r.priority.toLowerCase() === 'low'
                ? styles.priorityLow
                : styles.priorityNormal;

            const rowClass = [
              styles.row,
              r.is_vip ? styles.vipRow : '',
              r.is_staff ? styles.staffRow : '',
              'cursor-pointer transition',
            ].join(' ');

            return (
              <tr
                key={r.id}
                onClick={() => onRowClick(r.id)}
                className={rowClass}
              >
                <td>
                  {new Date(r.created_at).toLocaleString('en-US', {
                    timeZone: 'America/Chicago',
                    year: 'numeric',
                    month: 'numeric',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric',
                  })}
                </td>
                <td style={{ textAlign: 'center' }}>{r.room_number || '—'}</td>
                <td>
                  <div className="flex flex-col items-start">
                    <span>{r.from_phone}</span>
                    <div className="flex gap-1 mt-1">
                      {r.is_vip && <span className={styles.vipBadge}>VIP</span>}
                      {r.is_staff && <span className={styles.staffBadge}>STAFF</span>}
                    </div>
                  </div>
                </td>
                <td style={{ textAlign: 'center' }}>{r.department}</td>
                <td style={{ textAlign: 'center' }}>
                  <span className={priorityClass}>{r.priority.toUpperCase()}</span>
                </td>
                <td className={styles.messageCol}>{r.message}</td>
                <td>
                  <button
                    type="button"
                    className={`${styles.btn} ${styles.notesBtn}`}
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
                    <span className={styles.doneIcon} aria-label="acknowledged">✔️</span>
                  ) : (
                    <button
                      type="button"
                      className={`${styles.btn} ${styles.ackBtn}`}
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
                    <span className={styles.doneIcon} aria-label="completed">✔️</span>
                  ) : (
                    <button
                      type="button"
                      className={`${styles.btn} ${styles.completeBtn}`}
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
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
