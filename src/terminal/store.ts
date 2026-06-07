import type { Line } from './types';

const HISTORY_KEY = 'terminal_history';
const DIR_KEY = 'terminal_dir';

export function loadHistory(): string[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveHistory(history: string[]): void {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(-500)));
  } catch {
    // ignore
  }
}

export function loadDir(): string {
  try {
    return localStorage.getItem(DIR_KEY) || '~/cv';
  } catch {
    return '~/cv';
  }
}

export function saveDir(dir: string): void {
  try {
    localStorage.setItem(DIR_KEY, dir);
  } catch {
    // ignore
  }
}

export function createLine(
  type: Line['type'],
  content: string,
  commandName?: string
): Line {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type,
    content,
    commandName,
  };
}
