// src/components/auth/AdminRoute.tsx

import React from 'react';

import { Navigate } from 'react-router-dom';
 
interface AdminRouteProps {

  children: React.ReactNode;

}
 
const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {

  const token = localStorage.getItem('authToken');

  const role = localStorage.getItem('userRole');
 
  if (!token) {

    return <Navigate to="/login" replace />;

  }
 
  if (role !== 'admin') {

    return <Navigate to="/dashboard" replace />;

  }
 
  return <>{children}</>;

};
 
export default AdminRoute;

 