import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { useWindowMode } from '@/hooks/use-window-mode';
import WindowManager from './wm/WindowManager';

function CRTOverlays() {
  return (
    <>
      <div className="crt-scanlines" aria-hidden="true" />
      <div className="crt-vignette" aria-hidden="true" />
      <div className="crt-noise" aria-hidden="true" />
    </>
  );
}

export default function Layout() {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const { windowMode, toggleWindowMode } = useWindowMode();

  /* Global keyboard shortcut: Ctrl+Shift+W toggles window mode */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && (e.key === 'W' || e.key === 'w')) {
        e.preventDefault();
        toggleWindowMode();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleWindowMode]);

  /* Window mode desktop environment */
  if (windowMode && !isHome) {
    return (
      <div className="h-[100dvh] bg-terminal-black text-terminal-white font-mono overflow-hidden">
        <CRTOverlays />
        <WindowManager currentPath={location.pathname} />
      </div>
    );
  }

  /* Standard layout */
  return (
    <div className="min-h-[100dvh] bg-terminal-black text-terminal-white font-mono">
      <CRTOverlays />
      {!isHome && <Navbar />}
      <main className={isHome ? '' : 'pt-[40px] pb-[28px] min-h-[100dvh]'}>
        <Outlet />
      </main>
      {!isHome && <Footer />}
    </div>
  );
}
