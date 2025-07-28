import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
import { selectIsAuthenticated } from '../store/slices/authSlice';
import { RootState } from '../store';

const ProtectedRoute: React.FC = () => {
  const isAuthenticated = useSelector((state: RootState) => selectIsAuthenticated(state));

  if (!isAuthenticated) {
    // Alihkan ke halaman utama jika tidak terotentikasi
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;