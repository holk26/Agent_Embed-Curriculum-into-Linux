/* ------------------------------------------------------------------
   Live project sites opened as OS-style windows with an <iframe>.

   The framed sites are Homero's own public projects. Some sites send
   X-Frame-Options / CSP frame-ancestors headers that refuse framing;
   the header bar always offers an "open in new tab" fallback so the
   window is never a dead end.
   ------------------------------------------------------------------ */

export interface LiveSite {
  appType: string;
  title: string;
  label: string;
  icon: string;
  url: string;
}

export const LIVE_SITES: LiveSite[] = [
  {
    appType: 'site-hiresonny',
    title: 'hiresonny.com — Sonny, AI Marketing Employee',
    label: 'Sonny',
    icon: '🤖',
    url: 'https://hiresonny.com',
  },
  {
    appType: 'site-moonsbow',
    title: 'moonsbow.com',
    label: 'Moonsbow',
    icon: '🌙',
    url: 'https://moonsbow.com',
  },
  {
    appType: 'site-ubsafety',
    title: 'ubsafety.ca — Safety Training Platform',
    label: 'UbSafety',
    icon: '🦺',
    url: 'https://ubsafety.ca',
  },
  {
    appType: 'site-loba',
    title: 'Loba Solutions — demo site',
    label: 'Loba demo',
    icon: '🏗️',
    url: 'https://lobasolutions.vercel.app',
  },
];

export const LIVE_SITE_APP_TYPES = new Set(LIVE_SITES.map((s) => s.appType));

export default function IframeWindow({ url }: { url: string }) {
  return (
    <div className="flex h-full flex-col bg-terminal-black">
      {/* Fallback bar: always visible, so a site that refuses framing
          still leaves the visitor one click away from the live site. */}
      <div className="flex shrink-0 items-center gap-2 border-b border-terminal-green-dim bg-terminal-black-alt px-2 py-1">
        <span className="font-mono text-[11px] text-terminal-green">$ open</span>
        <span className="min-w-0 flex-1 truncate font-mono text-[11px] text-terminal-gray">
          {url}
        </span>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 font-mono text-[11px] font-bold text-terminal-green hover:text-terminal-blue hover:underline"
        >
          [ ↗ NEW TAB ]
        </a>
      </div>
      <iframe
        src={url}
        title={`Live preview of ${url}`}
        className="w-full flex-1 border-0 bg-terminal-white"
        allowFullScreen
      />
    </div>
  );
}

/* One stable component per site, so the window registry can mount
   them without props (same shape as the other registered apps). */
export function HiresonnySiteWindow() {
  return <IframeWindow url="https://hiresonny.com" />;
}

export function MoonsbowSiteWindow() {
  return <IframeWindow url="https://moonsbow.com" />;
}

export function UbSafetySiteWindow() {
  return <IframeWindow url="https://ubsafety.ca" />;
}

export function LobaSiteWindow() {
  return <IframeWindow url="https://lobasolutions.vercel.app" />;
}

export const SITE_WINDOW_COMPONENTS: Record<string, React.ComponentType> = {
  'site-hiresonny': HiresonnySiteWindow,
  'site-moonsbow': MoonsbowSiteWindow,
  'site-ubsafety': UbSafetySiteWindow,
  'site-loba': LobaSiteWindow,
};
