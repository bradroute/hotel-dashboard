// src/components/FiltersBar.test.jsx

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import FiltersBar from './FiltersBar';

describe('FiltersBar component', () => {
  const departments = ['Housekeeping', 'Maintenance', 'Front Desk'];

  test('renders checkbox and dropdown with correct options', () => {
    // Create mock callback functions
    const mockToggle = jest.fn();
    const mockChangeDept = jest.fn();

    // Render FiltersBar with props
    render(
      <FiltersBar
        showActiveOnly={false}
        onToggleActive={mockToggle}
        selectedDepartment="All"
        onChangeDepartment={mockChangeDept}
        departmentOptions={departments}
      />
    );

    // Verify checkbox exists and is unchecked
    const checkbox = screen.getByRole('checkbox', { name: /show active only/i });
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).not.toBeChecked();

    // Verify dropdown exists with "All Departments" as default
    const dropdown = screen.getByRole('combobox', { name: /department/i });
    expect(dropdown).toBeInTheDocument();
    expect(dropdown).toHaveValue('All');

    // Verify each department option appears
    departments.forEach((dept) => {
      expect(screen.getByRole('option', { name: dept })).toBeInTheDocument();
    });
  });

  test('calls callbacks when checkbox and dropdown change', () => {
    const mockToggle = jest.fn();
    const mockChangeDept = jest.fn();

    render(
      <FiltersBar
        showActiveOnly={false}
        onToggleActive={mockToggle}
        selectedDepartment="All"
        onChangeDepartment={mockChangeDept}
        departmentOptions={departments}
      />
    );

    // Toggle the checkbox
    const checkbox = screen.getByRole('checkbox', { name: /show active only/i });
    fireEvent.click(checkbox);
    expect(mockToggle).toHaveBeenCalledWith(true);

    // Change the dropdown value
    const dropdown = screen.getByRole('combobox', { name: /department/i });
    fireEvent.change(dropdown, { target: { value: departments[1] } });
    expect(mockChangeDept).toHaveBeenCalledWith(departments[1]);
  });
});
