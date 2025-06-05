// src/components/FiltersBar.jsx

import React from 'react';
import styles from '../styles/Dashboard.module.css';

/**
 * Props:
 *  - showActiveOnly (boolean)
 *  - onToggleActive (function)
 *  - selectedDepartment (string)
 *  - onChangeDepartment (function)
 *  - departmentOptions (array of strings)
 */
export default function FiltersBar({
  showActiveOnly,
  onToggleActive,
  selectedDepartment,
  onChangeDepartment,
  departmentOptions,
}) {
  return (
    <div className={styles.filterBar}>
      <label>
        <input
          type="checkbox"
          className={styles.filterCheckbox}
          checked={showActiveOnly}
          onChange={(e) => onToggleActive(e.target.checked)}
        />
        Show Active Only
      </label>

      <label>
        Department:{' '}
        <select
          className={styles.filterSelect}
          value={selectedDepartment}
          onChange={(e) => onChangeDepartment(e.target.value)}
        >
          <option value="All">All Departments</option>
          {departmentOptions.map((dept) => (
            <option key={dept} value={dept}>
              {dept.charAt(0).toUpperCase() + dept.slice(1)}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
