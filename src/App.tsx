// src/App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { TimesheetProvider } from './context/TimesheetContext';
 
import Login from './components/auth/Login';
import Dashboard from './components/dashboard/dashboard';
import AdminDashboard from './components/admin/AdminDashboard';
import Callback from './components/callback/Callback';
 
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/auth/AdminRoute';
 
function App() {
  return (
<AuthProvider>
<TimesheetProvider>
<Router>
<Routes>
<Route path="/login" element={<Login />} />
<Route path="/login/callback" element={<Callback />} />
<Route
              path="/dashboard"
              element={
<ProtectedRoute>
<Dashboard />
</ProtectedRoute>
              }
            />
<Route
              path="/admin"
              element={
<AdminRoute>
<AdminDashboard />
</AdminRoute>
              }
            />
<Route
              path="/"
              element={
                localStorage.getItem('userRole') === 'admin'
                  ? <Navigate to="/admin" replace />
                  : <Navigate to="/dashboard" replace />
              }
            />
</Routes>
</Router>
</TimesheetProvider>
</AuthProvider>
  );
}
 
export default App;