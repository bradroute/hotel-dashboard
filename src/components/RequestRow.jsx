// src/components/RequestRow.jsx

import React from 'react';
import styles from '../styles/Dashboard.module.css';

/**
 * Props:
 *  - request: { id, from, message, department, priority, created_at, acknowledged, completed }
 *  - onAcknowledge: function(id)
 *  - onComplete: function(id)
 */
export default function RequestRow({ request, onAcknowledge, onComplete }) {
  return (
    <tr>
      <td>{new Date(request.created_at).toLocaleString()}</td>
      <td>{request.from}</td>
      <td>{request.department}</td>
      <td>{request.priority}</td>
      <td>{request.message}</td>
      <td>
        {request.acknowledged ? (
          <span className={styles.doneIcon}>✅</span>
        ) : (
          <button
            className={styles.ackBtn}
            onClick={() => onAcknowledge(request.id)}
          >
            Acknowledge
          </button>
        )}
      </td>
      <td>
        {request.completed ? (
          <span className={styles.doneIcon}>✅</span>
        ) : (
          <button
            className={styles.completeBtn}
            onClick={() => onComplete(request.id)}
          >
            Complete
          </button>
        )}
      </td>
    </tr>
  );
}
