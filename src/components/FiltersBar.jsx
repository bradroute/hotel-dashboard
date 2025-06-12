// src/components/FiltersBar.jsx

import React from 'react';
import styles from '../styles/Dashboard.module.css';

export default function FiltersBar({
  showActiveOnly,
  onToggleActive,
  selectedDepartment,
  onChangeDepartment,
  departmentOptions,
  selectedPriority,
  onChangePriority,
  priorityOptions,
  showUnacknowledgedOnly,
  onToggleUnacknowledged,
  searchText,
  onSearchChange,
  sortOrder,
  onSortOrderChange
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
          checked={showUnacknowledgedOnly}
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
            <option key={dept} value={dept}>{dept}</option>
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
          {priorityOptions.map((prio) => (
            <option key={prio} value={prio}>{prio}</option>
          ))}
        </select>
      </label>

      <label>
        Sort:{' '}
        <select
          className={styles.filterSelect}
          value={sortOrder}
          onChange={(e) => onSortOrderChange(e.target.value)}
        >
          <option value="desc">Newest → Oldest</option>
          <option value="asc">Oldest → Newest</option>
        </select>
      </label>

      <input
        type="text"
        className={styles.filterSearch}
        placeholder="Search message or phone..."
        value={searchText}
        onChange={(e) => onSearchChange(e.target.value)}
      />
    </div>
  );
}
