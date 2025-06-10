// src/components/RequestsTable.jsx

import React from 'react';
import styles from '../styles/Dashboard.module.css';

/**
 * Props:
 *  - requests: array of request objects
 *  - onAcknowledge: function(id)
 *  - onComplete: function(id)
 *  - onRowClick: function(id)
 */
export default function RequestsTable({
  requests,
  onAcknowledge,
  onComplete,
  onRowClick,
}) {
  return (
    <div className={styles.tableContainer}>
      <table className={styles.requestsTable}>
        <thead>
          <tr>
            <th>Created At</th>
            <th>From</th>
            <th>Department</th>
            <th>Priority</th>
            <th>Message</th>
            <th>Acknowledge</th>
            <th>Complete</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((r) => (
            <tr
              key={r.id}
              onClick={() => onRowClick(r.id)}
              style={{ cursor: 'pointer' }}
            >
              <td>{new Date(r.created_at).toLocaleString()}</td>
              <td>{r.from_phone}</td>
              <td>{r.department}</td>
              <td>{r.priority}</td>
              <td>{r.message}</td>
              <td>
                {r.acknowledged ? (
                  <span role="img" aria-label="acknowledged">✔️</span>
                ) : (
                  <button
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
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onComplete(r.id);
                  }}
                >
                  Complete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
