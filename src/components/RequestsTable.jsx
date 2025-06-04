// src/components/RequestsTable.jsx

import React from 'react';
import styles from '../styles/Dashboard.module.css';
import RequestRow from './RequestRow';

/**
 * Props:
 *  - requests: array of request objects
 *  - onAcknowledge: function(id)
 *  - onComplete: function(id)
 */
export default function RequestsTable({ requests, onAcknowledge, onComplete }) {
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
            <RequestRow
              key={r.id}
              request={r}
              onAcknowledge={onAcknowledge}
              onComplete={onComplete}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
