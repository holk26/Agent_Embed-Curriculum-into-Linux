import { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'green' | 'amber' | 'white' | 'red' | 'blue';

interface ThemeContextType {
  theme: Theme;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'green',
  setTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

const STORAGE_KEY = 'terminal-theme';

const THEME_COLORS: Record<Theme, { green: string; 'green-dim': string; white: string; amber: string; red: string; blue: string; cyan: string; glow: string; selection: string }> = {
  green: {
    green: '#4AF626',
    'green-dim': '#2D8C16',
    white: '#F0F0F0',
    amber: '#FFB000',
    red: '#FF3333',
    blue: '#00A2FF',
    cyan: '#00D4AA',
    glow: 'rgba(74, 246, 38, 0.3)',
    selection: 'rgba(74, 246, 38, 0.3)',
  },
  amber: {
    green: '#FFB000',
    'green-dim': '#B37A00',
    white: '#FFF0CC',
    amber: '#FFCC33',
    red: '#FF6633',
    blue: '#66CCFF',
    cyan: '#FFCC66',
    glow: 'rgba(255, 176, 0, 0.3)',
    selection: 'rgba(255, 176, 0, 0.3)',
  },
  white: {
    green: '#E0E0E0',
    'green-dim': '#808080',
    white: '#FFFFFF',
    amber: '#CCCCCC',
    red: '#FF6666',
    blue: '#99CCFF',
    cyan: '#CCFFFF',
    glow: 'rgba(224, 224, 224, 0.3)',
    selection: 'rgba(224, 224, 224, 0.3)',
  },
  red: {
    green: '#FF3333',
    'green-dim': '#B32424',
    white: '#FFE0E0',
    amber: '#FF6666',
    red: '#FF9999',
    blue: '#FF5555',
    cyan: '#FF7777',
    glow: 'rgba(255, 51, 51, 0.3)',
    selection: 'rgba(255, 51, 51, 0.3)',
  },
  blue: {
    green: '#33CCFF',
    'green-dim': '#1A80B3',
    white: '#E0F7FF',
    amber: '#66DDFF',
    red: '#FF6666',
    blue: '#99EEFF',
    cyan: '#AAFFFF',
    glow: 'rgba(51, 204, 255, 0.3)',
    selection: 'rgba(51, 204, 255, 0.3)',
  },
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Theme;
      if (stored && THEME_COLORS[stored]) return stored;
    } catch {}
    return 'green';
  });

  const setTheme = (t: Theme) => {
    setThemeState(t);
    try {
      localStorage.setItem(STORAGE_KEY, t);
    } catch {}
  };

  useEffect(() => {
    const colors = THEME_COLORS[theme];
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    root.style.setProperty('--terminal-green', colors.green);
    root.style.setProperty('--terminal-green-dim', colors['green-dim']);
    root.style.setProperty('--terminal-white', colors.white);
    root.style.setProperty('--terminal-amber', colors.amber);
    root.style.setProperty('--terminal-red', colors.red);
    root.style.setProperty('--terminal-blue', colors.blue);
    root.style.setProperty('--terminal-cyan', colors.cyan);
    root.style.setProperty('--terminal-glow', colors.glow);
    root.style.setProperty('--terminal-selection', colors.selection);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
