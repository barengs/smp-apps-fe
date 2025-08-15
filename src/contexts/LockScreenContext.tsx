import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '@/store/slices/authSlice';

const LOCK_TIMEOUT = 30 * 60 * 1000; // 30 menit

interface LockScreenContextType {
  isLocked: boolean;
  lockScreen: () => void;
  unlockScreen: () => void;
}

const LockScreenContext = createContext<LockScreenContextType | undefined>(undefined);

export const LockScreenProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLocked, setIsLocked] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const lockScreen = useCallback(() => {
    // Hanya kunci jika pengguna terautentikasi
    if (isAuthenticated) {
      setIsLocked(true);
    }
  }, [isAuthenticated]);

  const resetTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    // Hanya set timer jika pengguna terautentikasi
    if (isAuthenticated) {
      timerRef.current = setTimeout(lockScreen, LOCK_TIMEOUT);
    }
  }, [isAuthenticated, lockScreen]);
  
  const unlockScreen = () => {
    setIsLocked(false);
    resetTimer();
  };

  useEffect(() => {
    const events: (keyof WindowEventMap)[] = ['mousemove', 'keydown', 'click', 'scroll'];
    const handleActivity = () => resetTimer();

    if (isAuthenticated && !isLocked) {
      resetTimer();
      events.forEach(event => window.addEventListener(event, handleActivity));
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      events.forEach(event => window.removeEventListener(event, handleActivity));
    };
  }, [resetTimer, isLocked, isAuthenticated]);

  return (
    <LockScreenContext.Provider value={{ isLocked, lockScreen, unlockScreen }}>
      {children}
    </LockScreenContext.Provider>
  );
};

export const useLockScreen = () => {
  const context = useContext(LockScreenContext);
  if (context === undefined) {
    throw new Error('useLockScreen must be used within a LockScreenProvider');
  }
  return context;
};