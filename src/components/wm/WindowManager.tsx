import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Window from './Window';
import Desktop from './Desktop';
import Taskbar from './Taskbar';
import Terminal from '@/pages/Terminal';
import Projects from '@/pages/Projects';
import Contact from '@/pages/Contact';
import Blog from '@/pages/Blog';
import Settings from '@/pages/Settings';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface WindowState {
  id: string;
  title: string;
  icon: string;
  appType: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  minimized: boolean;
  maximized: boolean;
  zIndex: number;
}

interface WindowManagerContextValue {
  windows: WindowState[];
  activeWindowId: string | null;
  openWindow: (appType: string) => void;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
}

/* ------------------------------------------------------------------ */
/*  Context                                                            */
/* ------------------------------------------------------------------ */

const WindowManagerContext = createContext<WindowManagerContextValue | null>(null);

export function useWindowManager() {
  const ctx = useContext(WindowManagerContext);
  if (!ctx) throw new Error('useWindowManager must be used within WindowManager');
  return ctx;
}

/* ------------------------------------------------------------------ */
/*  Registry                                                           */
/* ------------------------------------------------------------------ */

const APP_REGISTRY: Record<string, { title: string; icon: string; component: React.ComponentType }> = {
  terminal: { title: 'Terminal', icon: '>', component: Terminal },
  projects: { title: 'Projects', icon: '📁', component: Projects },
  contact: { title: 'Contact', icon: '@', component: Contact },
  blog: { title: 'Blog', icon: '📝', component: Blog },
  settings: { title: 'Settings', icon: '⚙', component: Settings },
};

const PATH_TO_APP: Record<string, string> = {
  '/terminal': 'terminal',
  '/projects': 'projects',
  '/contact': 'contact',
  '/blog': 'blog',
  '/settings': 'settings',
};

const APP_TO_PATH: Record<string, string> = {
  terminal: '/terminal',
  projects: '/projects',
  contact: '/contact',
  blog: '/blog',
  settings: '/settings',
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function WindowManager({ currentPath }: { currentPath: string }) {
  const navigate = useNavigate();
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
  const nextZRef = useRef(100);

  /* Ensure a window exists for the given app type and focus it */
  const ensureWindow = useCallback((appType: string) => {
    let windowIdToFocus: string | null = null;

    setWindows((prev) => {
      const existing = prev.find((w) => w.appType === appType);
      if (existing) {
        const nextZ = nextZRef.current++;
        windowIdToFocus = existing.id;
        return prev.map((w) =>
          w.id === existing.id ? { ...w, minimized: false, zIndex: nextZ } : w
        );
      }

      const app = APP_REGISTRY[appType];
      const id = `${appType}-${Date.now()}`;
      windowIdToFocus = id;
      const newWindow: WindowState = {
        id,
        title: app.title,
        icon: app.icon,
        appType,
        position: { x: 40 + (prev.length % 5) * 30, y: 40 + (prev.length % 5) * 30 },
        size: { width: 900, height: 600 },
        minimized: false,
        maximized: false,
        zIndex: nextZRef.current++,
      };
      return [...prev, newWindow];
    });

    if (windowIdToFocus) {
      setActiveWindowId(windowIdToFocus);
    }
  }, []);

  /* Open/focus window for current route */
  useEffect(() => {
    const appType = PATH_TO_APP[currentPath];
    if (!appType) return;
    ensureWindow(appType);
  }, [currentPath, ensureWindow]);

  const openWindow = useCallback(
    (appType: string) => {
      ensureWindow(appType);
      const path = APP_TO_PATH[appType];
      if (path && currentPath !== path) {
        navigate(path);
      }
    },
    [ensureWindow, navigate, currentPath]
  );

  const closeWindow = useCallback((id: string) => {
    setWindows((prev) => prev.filter((w) => w.id !== id));
    setActiveWindowId((prev) => (prev === id ? null : prev));
  }, []);

  const minimizeWindow = useCallback((id: string) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, minimized: true } : w))
    );
    setActiveWindowId((prev) => (prev === id ? null : prev));
  }, []);

  const maximizeWindow = useCallback((id: string) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, maximized: !w.maximized } : w))
    );
  }, []);

  const focusWindow = useCallback((id: string) => {
    setActiveWindowId(id);
    setWindows((prev) =>
      prev.map((w) =>
        w.id === id ? { ...w, minimized: false, zIndex: nextZRef.current++ } : w
      )
    );
  }, []);

  const value: WindowManagerContextValue = {
    windows,
    activeWindowId,
    openWindow,
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    focusWindow,
  };

  return (
    <WindowManagerContext.Provider value={value}>
      <div className="relative h-[100dvh] w-full overflow-hidden bg-terminal-black">
        <Desktop />
        {windows.map((win) => {
          if (win.minimized) return null;
          const app = APP_REGISTRY[win.appType];
          if (!app) return null;
          const Component = app.component;
          return (
            <Window
              key={win.id}
              id={win.id}
              title={win.title}
              icon={win.icon}
              defaultPosition={win.position}
              defaultSize={win.size}
              maximized={win.maximized}
              active={activeWindowId === win.id}
              zIndex={win.zIndex}
              onClose={() => closeWindow(win.id)}
              onMinimize={() => minimizeWindow(win.id)}
              onMaximize={() => maximizeWindow(win.id)}
              onFocus={() => focusWindow(win.id)}
            >
              <Component />
            </Window>
          );
        })}
        <Taskbar />
      </div>
    </WindowManagerContext.Provider>
  );
}
