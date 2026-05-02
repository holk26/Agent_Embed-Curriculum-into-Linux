import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

export default function Layout() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div className="min-h-[100dvh] bg-terminal-black text-terminal-white font-mono">
      {/* CRT overlays */}
      <div className="crt-scanlines" aria-hidden="true" />
      <div className="crt-vignette" aria-hidden="true" />
      <div className="crt-noise" aria-hidden="true" />

      {/* Navbar - hidden on home page during boot */}
      {!isHome && <Navbar />}

      {/* Main content area with top padding for navbar on non-home pages */}
      <main className={isHome ? '' : 'pt-[40px] pb-[28px] min-h-[100dvh]'}>
        <Outlet />
      </main>

      {/* Footer - hidden on home page */}
      {!isHome && <Footer />}
    </div>
  );
}
