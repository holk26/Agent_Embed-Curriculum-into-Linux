import { useState, useEffect, useRef } from 'react';
import { useWindowManager } from './WindowManager';
import { useWindowMode } from '@/hooks/use-window-mode';


export default function Taskbar() {
  const { windows, activeWindowId, focusWindow, openWindow } = useWindowManager();
  const { toggleWindowMode } = useWindowMode();
  const [time, setTime] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [cpu, setCpu] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);

  /* Clock */
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  /* Fake CPU meter */
  useEffect(() => {
    const updateCpu = () => {
      setCpu(Math.floor(Math.random() * 30) + 5);
    };
    updateCpu();
    const timer = setInterval(updateCpu, 3000);
    return () => clearInterval(timer);
  }, []);

  /* Close menu when clicking outside */
  useEffect(() => {
    if (!showMenu) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    window.addEventListener('mousedown', handler);
    return () => window.removeEventListener('mousedown', handler);
  }, [showMenu]);

  return (
    <div className="absolute bottom-0 left-0 right-0 h-[32px] bg-terminal-black-alt border-t border-terminal-green-dim flex items-center z-[9999] select-none">
      {/* Applications menu */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="h-[32px] px-3 font-mono text-[12px] text-terminal-green hover:bg-terminal-green-dim hover:text-terminal-black transition-colors duration-100 flex items-center gap-2"
        >
          <span>◆</span>
          <span>Applications</span>
        </button>
        {showMenu && (
          <div
            className="absolute bottom-[32px] left-0 bg-terminal-black-alt border border-terminal-green-dim rounded-t-[4px] py-1 min-w-[180px] shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <MenuItem
              onClick={() => {
                openWindow('terminal');
                setShowMenu(false);
              }}
            >
              <span className="mr-2">{'>'}</span>Terminal
            </MenuItem>
            <MenuItem
              onClick={() => {
                openWindow('projects');
                setShowMenu(false);
              }}
            >
              <span className="mr-2">{'📁'}</span>Projects
            </MenuItem>
            <MenuItem
              onClick={() => {
                openWindow('contact');
                setShowMenu(false);
              }}
            >
              <span className="mr-2">{'@'}</span>Contact
            </MenuItem>
            <MenuItem
              onClick={() => {
                openWindow('blog');
                setShowMenu(false);
              }}
            >
              <span className="mr-2">{'📝'}</span>Blog
            </MenuItem>
            <div className="border-t border-terminal-gray-dark my-1" />
            <MenuItem
              onClick={() => {
                openWindow('settings');
                setShowMenu(false);
              }}
            >
              <span className="mr-2">{'⚙'}</span>Settings
            </MenuItem>
            <MenuItem
              onClick={() => {
                toggleWindowMode();
                setShowMenu(false);
              }}
            >
              Exit Window Mode
            </MenuItem>
          </div>
        )}
      </div>

      {/* Window list */}
      <div className="flex-1 flex items-center gap-1 px-2 overflow-x-auto">
        {windows.map((win) => (
          <button
            key={win.id}
            onClick={() => {
              if (activeWindowId === win.id && !win.minimized) {
                focusWindow(win.id);
              } else {
                focusWindow(win.id);
              }
            }}
            className={`h-[24px] px-3 font-mono text-[11px] rounded flex items-center gap-1.5 shrink-0 transition-colors duration-100 ${
              activeWindowId === win.id && !win.minimized
                ? 'bg-terminal-green-dim text-terminal-black'
                : 'text-terminal-gray hover:text-terminal-white hover:bg-terminal-gray-dark'
            }`}
          >
            <span>{win.icon}</span>
            <span className="truncate max-w-[120px]">{win.title}</span>
          </button>
        ))}
      </div>

      {/* System tray */}
      <div className="flex items-center gap-3 px-3 border-l border-terminal-gray-dark h-full shrink-0">
        <span
          className="font-mono text-[11px] text-terminal-gray tabular-nums"
          title="CPU usage"
        >
          CPU {cpu}%
        </span>
        <span className="font-mono text-[11px] text-terminal-gray" title="Network">
          📶
        </span>
        <span className="font-mono text-[11px] text-terminal-gray" title="Volume">
          🔊
        </span>
        <span className="font-mono text-[11px] text-terminal-white tabular-nums min-w-[40px] text-right">
          {time}
        </span>
      </div>
    </div>
  );
}

function MenuItem({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left px-3 py-1.5 font-mono text-[12px] text-terminal-white hover:bg-terminal-green-dim hover:text-terminal-black transition-colors duration-100 flex items-center"
    >
      {children}
    </button>
  );
}
