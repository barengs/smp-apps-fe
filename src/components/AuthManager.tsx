import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { selectIsAuthenticated, selectExpirationTime } from '@/store/slices/authSlice';
import { logOut } from '@/store/authActions';
import * as toast from '@/utils/toast';

let logoutTimer: NodeJS.Timeout;

const AuthManager: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const expirationTime = useSelector(selectExpirationTime);

  useEffect(() => {
    if (isAuthenticated && expirationTime) {
      const remainingTime = expirationTime - Date.now();
      if (remainingTime <= 0) {
        dispatch(logOut());
        toast.showError('Sesi Anda telah berakhir. Silakan login kembali.');
        navigate('/login');
      } else {
        logoutTimer = setTimeout(() => {
          dispatch(logOut());
          toast.showError('Sesi Anda telah berakhir karena tidak ada aktivitas. Silakan login kembali.');
          navigate('/login');
        }, remainingTime);
      }
    } else {
      clearTimeout(logoutTimer);
    }

    return () => {
      clearTimeout(logoutTimer);
    };
  }, [isAuthenticated, expirationTime, dispatch, navigate]);

  return <>{children}</>;
};

export default AuthManager;