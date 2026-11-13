import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';

const BOOT_LINES = [
  '[    0.000000] Linux version 6.8.0-homero (build@cv.x.moonsbow.com)',
  '[    0.004000] Command line: BOOT_IMAGE=/vmlinuz-6.8.0-homero root=/dev/sda1 quiet',
  '[    0.016000] KERNEL supported cpus: Intel GenuineIntel · AMD AuthenticAMD',
  '[    0.080000] BIOS-provided physical RAM map: NX (Execute Disable) protection: active',
  '[    0.500000] smpboot: CPU0: Intel(R) Xeon(R) CPU E5-2680 v4 @ 2.40GHz',
  '[    0.720000] devtmpfs: initialized · ACPI: bus type USB registered',
  '[    1.600000] pci 0000:00:0f.0: vgaarb: setting as boot VGA device',
  '[    2.600000] EXT4-fs (sda1): mounted filesystem with ordered data mode',
  '[    3.600000] systemd[1]: systemd 249.11-0ubuntu3.12 running in system mode',
  '[    5.200000] Started Network Service · Reached target Network.',
  '[    7.000000] Started OpenBSD secure shell server.',
  '[    7.600000] Startup finished in 3.421s (kernel) + 4.179s (userspace) = 7.600s.',
  '[    8.000000] [ OK ] Reached target graphical interface.',
  '[    8.100000] Boot complete.',
];

function parseBootLine(line: string): { timestamp: string; message: string; hasOk: boolean } {
  const match = line.match(/^(\[\s*[\d.]+\])\s*(.*)$/);
  if (!match) return { timestamp: '', message: line, hasOk: false };
  const timestamp = match[1];
  const message = match[2];
  const hasOk = message.includes('[ OK ]');
  return { timestamp, message, hasOk };
}

const BOOT_KEY = 'moonsbow_boot_complete';

function hasBooted(): boolean {
  try {
    return sessionStorage.getItem(BOOT_KEY) === 'true';
  } catch {
    return false;
  }
}

function markBooted(): void {
  try {
    sessionStorage.setItem(BOOT_KEY, 'true');
  } catch {
    // ignore
  }
}

const PROFILE = {
  name: 'HOMERO CABRERA',
  role: 'Senior AI / Agentic AI Engineer — Full-Stack Developer',
  summary:
    'I design, build and operate production AI systems end-to-end: agentic workflows (LangChain, Strands, MCP), RAG, and the Docker/VPS infrastructure behind them. Founder of Moonsbow — bilingual EN/ES, based in Vancouver.',
  links: [
    { label: 'LinkedIn', value: 'linkedin.com/in/homero-dev', url: 'https://linkedin.com/in/homero-dev' },
    { label: 'GitHub', value: 'github.com/holk26', url: 'https://github.com/holk26' },
    { label: 'Email', value: 'homero9726@gmail.com', url: 'mailto:homero9726@gmail.com' },
  ],
};

export default function Home() {
  const [booting, setBooting] = useState<boolean>(() => !hasBooted());
  const [visibleLines, setVisibleLines] = useState(0);
  const [cursorVisible, setCursorVisible] = useState(true);
  const bootTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Cursor blink
  useEffect(() => {
    const interval = setInterval(() => setCursorVisible((v) => !v), 530);
    return () => clearInterval(interval);
  }, []);

  // Fast boot sequence: ~1.2s total, any key/click skips instantly.
  useEffect(() => {
    if (!booting) return;

    const finishBoot = () => {
      if (bootTimerRef.current) clearTimeout(bootTimerRef.current);
      markBooted();
      setBooting(false);
    };

    const showNextLine = () => {
      setVisibleLines((prev) => {
        const next = prev + 1;
        if (next >= BOOT_LINES.length) {
          bootTimerRef.current = setTimeout(finishBoot, 250);
          return next;
        }
        bootTimerRef.current = setTimeout(showNextLine, 22 + Math.random() * 30);
        return next;
      });
    };

    bootTimerRef.current = setTimeout(showNextLine, 60);
    window.addEventListener('keydown', finishBoot);
    window.addEventListener('pointerdown', finishBoot);

    return () => {
      if (bootTimerRef.current) clearTimeout(bootTimerRef.current);
      window.removeEventListener('keydown', finishBoot);
      window.removeEventListener('pointerdown', finishBoot);
    };
  }, [booting]);

  // Auto-scroll during boot
  useEffect(() => {
    if (containerRef.current && booting) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [visibleLines, booting]);

  const renderBootLine = (line: string) => {
    const { timestamp, message, hasOk } = parseBootLine(line);
    if (hasOk) {
      const parts = message.split('[ OK ]');
      return (
        <span>
          <span className="text-terminal-gray">{timestamp} </span>
          <span className="text-terminal-white">{parts[0]}</span>
          <span className="text-terminal-green">[ OK ]</span>
          <span className="text-terminal-white">{parts[1]}</span>
        </span>
      );
    }
    return (
      <span>
        <span className="text-terminal-gray">{timestamp} </span>
        <span className="text-terminal-white">{message}</span>
      </span>
    );
  };

  const skipBoot = useCallback(() => {
    markBooted();
    setBooting(false);
  }, []);

  if (booting) {
    return (
      <div
        className="relative w-screen h-[100dvh] bg-terminal-black overflow-hidden select-none cursor-pointer"
        onClick={skipBoot}
      >
        <div className="absolute bottom-8 left-8 max-w-[800px] w-full">
          <div
            ref={containerRef}
            className="font-mono text-[14px] leading-[1.5] overflow-hidden"
            style={{ maxHeight: 'calc(16 * 1.5 * 14px)' }}
          >
            {BOOT_LINES.slice(0, visibleLines).map((line, i) => (
              <div key={i} className="whitespace-pre-wrap">
                {renderBootLine(line)}
              </div>
            ))}
          </div>
          <div className="absolute bottom-0 right-0 translate-y-full pt-2 text-right">
            <span className="font-mono text-[12px] text-terminal-gray-dark">
              press any key to skip
              <span
                className="inline-block w-[7px] h-[13px] bg-terminal-gray-dark ml-[4px] align-middle"
                style={{ opacity: cursorVisible ? 1 : 0, transition: 'opacity 530ms' }}
              />
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-terminal-black text-terminal-white font-mono flex items-center">
      <div className="w-full max-w-[860px] mx-auto px-6 py-10">
        <p className="text-terminal-gray text-[13px] mb-6">
          moonsbow@dev:~$ <span className="text-terminal-green">whoami</span>
        </p>

        <h1 className="text-[34px] md:text-[46px] font-extrabold tracking-[2px] text-terminal-white leading-tight">
          {PROFILE.name}
        </h1>
        <p className="text-terminal-green text-[15px] md:text-[18px] font-bold mt-2">
          {PROFILE.role}
        </p>

        <p className="text-terminal-gray text-[13.5px] md:text-[14.5px] leading-relaxed mt-5 max-w-[640px] text-justify">
          {PROFILE.summary}
        </p>

        <div className="mt-6 space-y-1.5">
          {PROFILE.links.map((link) => (
            <div key={link.label} className="text-[13px]">
              <span className="text-terminal-amber">{link.label.padEnd(8, ' ')}</span>
              <a
                href={link.url}
                target={link.url.startsWith('http') ? '_blank' : undefined}
                rel="noopener noreferrer"
                className="text-terminal-green hover:text-terminal-blue hover:underline transition-colors duration-150"
              >
                {link.value}
              </a>
            </div>
          ))}
        </div>

        <div className="mt-9 flex flex-wrap items-center gap-4">
          <a
            href="./Homero_Cabrera_CV.pdf"
            download="Homero_Cabrera_CV.pdf"
            className="inline-block border border-terminal-green bg-terminal-green text-terminal-black px-5 py-2.5 text-[13px] font-bold hover:bg-transparent hover:text-terminal-green transition-colors duration-200"
          >
            [ DOWNLOAD CV ]
          </a>
          <Link
            to="/contact"
            className="inline-block border border-terminal-green text-terminal-green px-5 py-2.5 text-[13px] font-bold hover:bg-terminal-green-dim transition-colors duration-200"
          >
            [ CONTACT ]
          </Link>
          <Link
            to="/terminal"
            className="text-terminal-gray text-[12.5px] hover:text-terminal-white hover:underline transition-colors duration-150"
          >
            or open the terminal →
          </Link>
        </div>

        <p className="text-terminal-gray-dark text-[11.5px] mt-12">
          moonsbow OS 6.8.0 · Vancouver, BC · available immediately
          <span
            className="inline-block w-[7px] h-[13px] bg-terminal-green ml-[6px] align-middle"
            style={{ opacity: cursorVisible ? 1 : 0, transition: 'opacity 530ms' }}
          />
        </p>
      </div>
    </div>
  );
}
