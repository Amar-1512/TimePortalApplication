// src/components/auth/ProtectedRoute.tsx

import React from 'react';

import { Navigate, useLocation } from 'react-router-dom';
 
interface ProtectedRouteProps {

  children: React.ReactNode;

}
 
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {

  const token = localStorage.getItem('authToken');

  const role = localStorage.getItem('userRole');

  const location = useLocation();
 
  if (!token) {

    return <Navigate to="/login" replace />;

  }
 
  // Redirect to correct dashboard if route doesn't match role

  if (role === 'admin' && location.pathname !== '/admin') {

    return <Navigate to="/admin" replace />;

  }
 
  if (role === 'user' && location.pathname !== '/dashboard') {

    return <Navigate to="/dashboard" replace />;

  }
 
  return <>{children}</>;

};
 
export default ProtectedRoute;

 