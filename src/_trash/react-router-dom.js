// src/__mocks__/react-router-dom.js

import React from 'react';

// Mock BrowserRouter, Routes, Route, Link, and useNavigate
export const BrowserRouter = ({ children }) => <>{children}</>;
export const Routes = ({ children }) => <>{children}</>;
export const Route = () => null;
export const Link = ({ children }) => <>{children}</>;

// useNavigate returns a no-op function
export const useNavigate = () => () => {};
