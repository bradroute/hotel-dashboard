// src/App.test.js

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

test('renders navigation links', () => {
  render(<App />);
  expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
  expect(screen.getByText(/analytics/i)).toBeInTheDocument();
});
