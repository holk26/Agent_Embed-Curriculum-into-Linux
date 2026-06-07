import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'terminal-cv:window-mode';

export function useWindowMode() {
  const [windowMode, setWindowMode] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        setWindowMode(e.newValue === 'true');
      }
    };
    const handleCustom = () => {
      try {
        setWindowMode(localStorage.getItem(STORAGE_KEY) === 'true');
      } catch {
        // ignore
      }
    };
    window.addEventListener('storage', handleStorage);
    window.addEventListener('windowmodechange', handleCustom);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('windowmodechange', handleCustom);
    };
  }, []);

  const setMode = useCallback((value: boolean) => {
    try {
      localStorage.setItem(STORAGE_KEY, value.toString());
    } catch {
      // ignore
    }
    setWindowMode(value);
    window.dispatchEvent(new CustomEvent('windowmodechange'));
  }, []);

  const toggleWindowMode = useCallback(() => {
    setMode(!windowMode);
  }, [windowMode, setMode]);

  return { windowMode, setWindowMode: setMode, toggleWindowMode };
}
