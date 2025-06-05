// src/Dashboard.test.jsx

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Dashboard from './Dashboard';

// Mock the API module
jest.mock('./utils/api', () => ({
  getRequests: jest.fn(),
  acknowledgeRequest: jest.fn(),
  completeRequest: jest.fn(),
}));

import { getRequests } from './utils/api';

describe('Dashboard component', () => {
  test('shows loading spinner initially', async () => {
    let resolveFetch;
    getRequests.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveFetch = resolve;
        })
    );

    render(<Dashboard />);

    expect(screen.getByText(/loading requests/i)).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument(); // spinner has role="status"

    resolveFetch([]);

    await waitFor(() => {
      expect(screen.queryByText(/loading requests/i)).not.toBeInTheDocument();
    });
  });
});
