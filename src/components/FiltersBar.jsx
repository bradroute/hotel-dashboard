// src/components/FiltersBar.jsx

import React from 'react';
import styles from '../styles/Dashboard.module.css';

/**
 * Props:
 *  - showActiveOnly (boolean)
 *  - onToggleActive (function)
 *  - unacknowledgedOnly (boolean)
 *  - onToggleUnacknowledged (function)
 *  - selectedDepartment (string)
 *  - onChangeDepartment (function)
 *  - departmentOptions (array of strings)
 *  - selectedPriority (string)
 *  - onChangePriority (function)
 *  - priorityOptions (array of strings)
 *  - sortOrder (string)
 *  - onChangeSort (function)
 *  - searchTerm (string)
 *  - onChangeSearch (function)
 */
export default function FiltersBar({
  showActiveOnly,
  onToggleActive,
  unacknowledgedOnly,
  onToggleUnacknowledged,
  selectedDepartment,
  onChangeDepartment,
  departmentOptions,
  selectedPriority,
  onChangePriority,
  priorityOptions,
  sortOrder,
  onChangeSort,
  searchTerm,
  onChangeSearch
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
        <input
          type="checkbox"
          className={styles.filterCheckbox}
          checked={unacknowledgedOnly}
          onChange={(e) => onToggleUnacknowledged(e.target.checked)}
        />
        Unacknowledged Only
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
              {dept}
            </option>
          ))}
        </select>
      </label>

      <label>
        Priority:{' '}
        <select
          className={styles.filterSelect}
          value={selectedPriority}
          onChange={(e) => onChangePriority(e.target.value)}
        >
          <option value="All">All Priorities</option>
          {priorityOptions.map((priority) => (
            <option key={priority} value={priority}>
              {priority}
            </option>
          ))}
        </select>
      </label>

      <label>
        Sort:{' '}
        <select
          className={styles.filterSelect}
          value={sortOrder}
          onChange={(e) => onChangeSort(e.target.value)}
        >
          <option value="newest">Newest → Oldest</option>
          <option value="oldest">Oldest → Newest</option>
        </select>
      </label>

      <input
        type="text"
        placeholder="Search message or phone..."
        className={styles.filterSearch}
        value={searchTerm}
        onChange={(e) => onChangeSearch(e.target.value)}
      />
    </div>
  );
}
