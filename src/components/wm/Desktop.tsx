import { useState, useCallback, useEffect, useRef } from 'react';
import { useWindowManager } from './WindowManager';
import DesktopIcon from './DesktopIcon';

export default function Desktop() {
  const { openWindow } = useWindowManager();
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const desktopRef = useRef<HTMLDivElement>(null);

  const handleRightClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
    setSelectedIcon(null);
  }, []);

  const handleClick = useCallback(() => {
    setContextMenu(null);
    setSelectedIcon(null);
  }, []);

  useEffect(() => {
    const handler = () => setContextMenu(null);
    window.addEventListener('click', handler);
    return () => window.removeEventListener('click', handler);
  }, []);

  const icons = [
    { id: 'terminal', label: 'Terminal', icon: '>' },
    { id: 'projects', label: 'Projects', icon: '📁' },
    { id: 'contact', label: 'Contact', icon: '@' },
    { id: 'blog', label: 'Blog', icon: '📝' },
    { id: 'settings', label: 'Settings', icon: '⚙' },
  ];

  return (
    <div
      ref={desktopRef}
      className="absolute inset-0 bg-terminal-black"
      style={{
        backgroundImage: `
          linear-gradient(to right, rgba(45, 140, 22, 0.07) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(45, 140, 22, 0.07) 1px, transparent 1px)
        `,
        backgroundSize: '24px 24px',
      }}
      onContextMenu={handleRightClick}
      onClick={handleClick}
    >
      {/* Desktop icons - arranged vertically on the left */}
      <div className="flex flex-col gap-4 p-4 pt-6">
        {icons.map((icn) => (
          <DesktopIcon
            key={icn.id}
            label={icn.label}
            icon={icn.icon}
            selected={selectedIcon === icn.id}
            onSelect={() => setSelectedIcon(icn.id)}
            onDoubleClick={() => openWindow(icn.id)}
          />
        ))}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="absolute z-[9999] bg-terminal-black-alt border border-terminal-green-dim rounded-[4px] py-1 min-w-[160px] shadow-lg"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <ContextItem onClick={() => { openWindow('terminal'); setContextMenu(null); }}>
            Open Terminal
          </ContextItem>
          <ContextItem onClick={() => { openWindow('projects'); setContextMenu(null); }}>
            Open Projects
          </ContextItem>
          <div className="border-t border-terminal-gray-dark my-1" />
          <ContextItem onClick={() => { window.location.reload(); }}>
            Refresh
          </ContextItem>
          <ContextItem onClick={() => { openWindow('settings'); setContextMenu(null); }}>
            Settings
          </ContextItem>
        </div>
      )}
    </div>
  );
}

function ContextItem({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left px-3 py-1.5 font-mono text-[12px] text-terminal-white hover:bg-terminal-green-dim hover:text-terminal-black transition-colors duration-100"
    >
      {children}
    </button>
  );
}
