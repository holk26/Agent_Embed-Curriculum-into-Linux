import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

export default function Footer() {
  const location = useLocation();
  const [scrollInfo, setScrollInfo] = useState({ top: 0, height: 0, percent: 0 });

  useEffect(() => {
    const updateScroll = () => {
      const doc = document.documentElement;
      const scrollTop = window.scrollY || doc.scrollTop;
      const scrollHeight = doc.scrollHeight - doc.clientHeight;
      const percent = scrollHeight > 0 ? Math.round((scrollTop / scrollHeight) * 100) : 0;
      setScrollInfo({ top: Math.round(scrollTop), height: doc.scrollHeight, percent });
    };
    window.addEventListener('scroll', updateScroll, { passive: true });
    updateScroll();
    return () => window.removeEventListener('scroll', updateScroll);
  }, [location.pathname]);

  const pageName = location.pathname === '/' ? 'home.md' : location.pathname.slice(1) + (location.pathname === '/terminal' ? '.sh' : location.pathname === '/projects' ? '/' : '.txt');

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 h-[28px] bg-terminal-black-alt border-t border-terminal-gray-dark flex items-center justify-between px-3 select-none hidden md:flex">
      <span className="font-mono text-[11px] text-terminal-gray tracking-[0.5px] uppercase">
        NORMAL
      </span>
      <span className="font-mono text-[11px] text-terminal-gray tracking-[0.5px]">
        {pageName}
      </span>
      <span className="font-mono text-[11px] text-terminal-gray tracking-[0.5px]">
        ln {scrollInfo.top},0 --{scrollInfo.percent}%
      </span>
    </footer>
  );
}
