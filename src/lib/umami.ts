/**
 * Umami analytics helper — tracks custom events on metrics.moonsbow.com.
 *
 * The Umami tracker script (loaded in index.html) exposes `window.umami`.
 * This wrapper is a no-op when the script is blocked or hasn't loaded yet
 * (ad blockers, slow networks), so call sites never need to guard.
 *
 * Events currently tracked:
 *   - download-cv     hero "DOWNLOAD CV" button (PDF download)
 *   - link-<label>    profile/contact links (linkedin, github, email…)
 */

type UmamiFn = (eventName: string, eventData?: Record<string, unknown>) => void;

interface UmamiWindow extends Window {
  umami?: { track: UmamiFn };
}

export function track(eventName: string, eventData?: Record<string, unknown>): void {
  const w = window as UmamiWindow;
  if (typeof w.umami?.track === 'function') {
    w.umami.track(eventName, eventData);
  }
}
