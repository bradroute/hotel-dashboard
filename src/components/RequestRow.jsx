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
  const { id, from, message, department, priority, created_at, acknowledged, completed } = request;

  // Map priority value to the corresponding CSS class
  let priorityClass = '';
  if (priority.toLowerCase() === 'urgent') {
    priorityClass = styles.priorityUrgent;
  } else if (priority.toLowerCase() === 'normal') {
    priorityClass = styles.priorityNormal;
  } else if (priority.toLowerCase() === 'low') {
    priorityClass = styles.priorityLow;
  }

  return (
    <tr>
      <td>{new Date(created_at).toLocaleString()}</td>
      <td>{from}</td>
      <td>{department}</td>
      <td>
        {/* Wrap the priority text in a span with the matching class */}
        <span className={priorityClass}>{priority}</span>
      </td>
      <td>{message}</td>
      <td>
        {acknowledged ? (
          <span className={styles.doneIcon}>✅</span>
        ) : (
          <button
            className={styles.ackBtn}
            aria-label="Acknowledge request"
            onClick={() => onAcknowledge(id)}
          >
            Acknowledge
          </button>
        )}
      </td>
      <td>
        {completed ? (
          <span className={styles.doneIcon}>✅</span>
        ) : (
          <button
            className={styles.completeBtn}
            aria-label="Complete request"
            onClick={() => onComplete(id)}
          >
            Complete
          </button>
        )}
      </td>
    </tr>
  );
}
