// src/components/RequestRow.jsx

import React from 'react';
import styles from '../styles/Dashboard.module.css';

/**
 * Props:
 *  - request: { id, from, message, department, priority, created_at, acknowledged, completed }
 *  - onAcknowledge: function(id)
 *  - onComplete: function(id)
 *  - onRowClick: function(id)
 */
export default function RequestRow({ request, onAcknowledge, onComplete, onRowClick }) {
  const { id, from, message, department, priority, created_at, acknowledged, completed } = request;

  // Determine CSS class based on priority
  let priorityClass = '';
  if (priority.toLowerCase() === 'urgent') {
    priorityClass = styles.priorityUrgent;
  } else if (priority.toLowerCase() === 'normal') {
    priorityClass = styles.priorityNormal;
  } else if (priority.toLowerCase() === 'low') {
    priorityClass = styles.priorityLow;
  }

  // Format created_at in Central Time (America/Chicago)
  const createdAtCentral = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Chicago',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
  }).format(new Date(created_at));

  return (
    <tr
      role="button"
      tabIndex={0}
      onClick={() => onRowClick(id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onRowClick(id);
        }
      }}
    >
      <td>{createdAtCentral}</td>
      <td>{from}</td>
      <td>{department}</td>
      <td>
        <span className={priorityClass}>{priority}</span>
      </td>
      <td>{message}</td>
      <td>
        {acknowledged ? (
          <span className={styles.doneIcon} aria-label="Acknowledged">
            ✅
          </span>
        ) : (
          <button
            className={styles.ackBtn}
            aria-label="Acknowledge request"
            onClick={(e) => {
              e.stopPropagation();
              onAcknowledge(id);
            }}
          >
            Acknowledge
          </button>
        )}
      </td>
      <td>
        {completed ? (
          <span className={styles.doneIcon} aria-label="Completed">
            ✅
          </span>
        ) : (
          <button
            className={styles.completeBtn}
            aria-label="Complete request"
            onClick={(e) => {
              e.stopPropagation();
              onComplete(id);
            }}
          >
            Complete
          </button>
        )}
      </td>
    </tr>
  );
}
