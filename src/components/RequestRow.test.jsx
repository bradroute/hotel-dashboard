// src/components/RequestRow.test.jsx

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import RequestRow from './RequestRow';

// Helper to build a minimal request object
const makeRequest = ({
  id = 1,
  from = 'Alice',
  message = 'Test message',
  department = 'Housekeeping',
  priority = 'Urgent',
  created_at = new Date().toISOString(),
  acknowledged = false,
  completed = false,
} = {}) => ({
  id,
  from,
  message,
  department,
  priority,
  created_at,
  acknowledged,
  completed,
});

describe('RequestRow component', () => {
  test('renders all cells and priority badge class', () => {
    const req = makeRequest({ priority: 'Low' });
    const mockAck = jest.fn();
    const mockComplete = jest.fn();
    const mockRowClick = jest.fn();

    render(
      <table>
        <tbody>
          <RequestRow
            request={req}
            onAcknowledge={mockAck}
            onComplete={mockComplete}
            onRowClick={mockRowClick}
          />
        </tbody>
      </table>
    );

    // Check date cell (verify it contains the year from created_at)
    const dateCell = screen.getByText((content) => {
      return content.includes(new Date(req.created_at).getFullYear().toString());
    });
    expect(dateCell).toBeInTheDocument();

    // Check "from" cell
    expect(screen.getByText('Alice')).toBeInTheDocument();

    // Check department cell
    expect(screen.getByText('Housekeeping')).toBeInTheDocument();

    // Check priority badge content and CSS class
    const priorityBadge = screen.getByText('Low');
    expect(priorityBadge).toBeInTheDocument();
    expect(priorityBadge).toHaveClass('priorityLow');

    // Check message cell
    expect(screen.getByText('Test message')).toBeInTheDocument();

    // Because acknowledged=false and completed=false, both buttons should appear
    expect(
      screen.getByRole('button', { name: /acknowledge request/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /complete request/i })
    ).toBeInTheDocument();
  });

  test('buttons call callbacks and do not trigger row click', () => {
    const req = makeRequest({ acknowledged: false, completed: false });
    const mockAck = jest.fn();
    const mockComplete = jest.fn();
    const mockRowClick = jest.fn();

    render(
      <table>
        <tbody>
          <RequestRow
            request={req}
            onAcknowledge={mockAck}
            onComplete={mockComplete}
            onRowClick={mockRowClick}
          />
        </tbody>
      </table>
    );

    // Click "Acknowledge" button
    const ackBtn = screen.getByRole('button', { name: /acknowledge request/i });
    fireEvent.click(ackBtn);
    expect(mockAck).toHaveBeenCalledWith(req.id);
    expect(mockRowClick).not.toHaveBeenCalled();

    // Click "Complete" button
    const completeBtn = screen.getByRole('button', { name: /complete request/i });
    fireEvent.click(completeBtn);
    expect(mockComplete).toHaveBeenCalledWith(req.id);
    expect(mockRowClick).not.toHaveBeenCalled();
  });

  test('row click calls onRowClick when no buttons render', () => {
    const req = makeRequest({ acknowledged: true, completed: true });
    const mockAck = jest.fn();
    const mockComplete = jest.fn();
    const mockRowClick = jest.fn();

    render(
      <table>
        <tbody>
          <RequestRow
            request={req}
            onAcknowledge={mockAck}
            onComplete={mockComplete}
            onRowClick={mockRowClick}
          />
        </tbody>
      </table>
    );

    // The <tr> has role="button", so query by that
    const row = screen.getByRole('button', { name: /urgent/i });
    // "urgent" is part of the concatenated accessible name, so this finds the <tr>

    // Click the row directly
    fireEvent.click(row);
    expect(mockRowClick).toHaveBeenCalledWith(req.id);

    // No "Acknowledge" or "Complete" buttons should exist now
    expect(
      screen.queryByRole('button', { name: /acknowledge request/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /complete request/i })
    ).not.toBeInTheDocument();
  });
});
