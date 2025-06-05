// src/components/RequestsTable.jsx

import React from 'react';
import styles from '../styles/Dashboard.module.css';
import RequestRow from './RequestRow';

/**
 * Props:
 *  - requests: array of request objects
 *  - onAcknowledge: function(id)
 *  - onComplete: function(id)
 *  - onRowClick: function(id)
 */
export default function RequestsTable({ requests, onAcknowledge, onComplete, onRowClick }) {
  return (
    <div className={styles.tableContainer}>
      <table className={styles.requestsTable}>
        <thead>
          <tr>
            <th scope="col">Created At</th>
            <th scope="col">From</th>
            <th scope="col">Department</th>
            <th scope="col">Priority</th>
            <th scope="col">Message</th>
            <th scope="col">Acknowledge</th>
            <th scope="col">Complete</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((r) => (
            <RequestRow
              key={r.id}
              request={r}
              onAcknowledge={onAcknowledge}
              onComplete={onComplete}
              onRowClick={onRowClick}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
