import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const BOOT_LINES = [
  '[    0.000000] Linux version 6.8.0-homero (build@homerocabrera.dev)',
  '[    0.004000] Command line: BOOT_IMAGE=/vmlinuz-6.8.0-homero root=/dev/sda1 quiet',
  '[    0.016000] KERNEL supported cpus:',
  '[    0.020000]   Intel GenuineIntel',
  '[    0.024000]   AMD AuthenticAMD',
  '[    0.040000] x86/fpu: Supporting XSAVE feature 0x001',
  '[    0.064000] BIOS-provided physical RAM map:',
  '[    0.080000] NX (Execute Disable) protection: active',
  '[    0.120000] DMI: innotek GmbH VirtualBox',
  '[    0.160000] tsc: Fast TSC calibration using PIT',
  '[    0.200000] Last level iTLB entries: 4KB 64, 2MB 8, 4MB 8',
  '[    0.300000] Spectre V1 : Mitigation: usercopy/swapgs barriers',
  '[    0.340000] Spectre V2 : Mitigation: Retpolines',
  '[    0.400000] Freeing SMP alternatives memory: 48K',
  '[    0.500000] smpboot: CPU0: Intel(R) Xeon(R) CPU E5-2680 v4 @ 2.40GHz',
  '[    0.600000] smpboot: Total of 2 processors activated (5187.82 BogoMIPS)',
  '[    0.720000] devtmpfs: initialized',
  '[    0.800000] ACPI: bus type USB registered',
  '[    0.900000] usbcore: registered new interface driver usbfs',
  '[    1.000000] PCI: Using ACPI for IRQ routing',
  '[    1.120000] VFS: Disk quotas dquot_6.6.0',
  '[    1.200000] pnp: PnP ACPI init',
  '[    1.300000] NET: Registered PF_INET protocol family',
  '[    1.400000] TCP: Hash tables configured',
  '[    1.500000] UDP: Hash tables configured',
  '[    1.600000] pci 0000:00:0f.0: vgaarb: setting as boot VGA device',
  '[    1.720000] vgaarb: loaded',
  '[    1.800000] SCSI subsystem initialized',
  '[    1.900000] libata version 3.00 loaded.',
  '[    2.000000] ata1.00: ATA-8: VBOX HARDDISK, 1.0, max UDMA/133',
  '[    2.100000] ata1.00: 41943040 sectors, multi 1: LBA48 NCQ (depth 32)',
  '[    2.200000] scsi 0:0:0:0: Direct-Access ATA VBOX HARDDISK 1.0 PQ: 0 ANSI: 5',
  '[    2.300000] sd 0:0:0:0: [sda] 41943040 512-byte logical blocks: (21.4 GB/20.0 GiB)',
  '[    2.400000] sd 0:0:0:0: [sda] Write Protect is off',
  '[    2.500000]  sda: sda1 sda2',
  '[    2.600000] EXT4-fs (sda1): mounted filesystem with ordered data mode',
  '[    2.700000] VFS: Mounted root (ext4 filesystem) readonly on device 8:1.',
  '[    2.800000] Freeing unused decrypted memory: 2048K',
  '[    2.900000] Freeing unused kernel image (initmem) memory: 2728K',
  '[    3.000000] Write protecting the kernel read-only data: 20480k',
  '[    3.100000] Run /init as init process',
  '[    3.200000] systemd[1]: Inserted module \'autofs4\'',
  '[    3.300000] systemd[1]: systemd 249.11-0ubuntu3.12 running in system mode',
  '[    3.400000] systemd[1]: Detected virtualization oracle.',
  '[    3.500000] systemd[1]: Detected architecture x86-64.',
  '[    3.600000] systemd[1]: Hostname set to <homerocabrera>.',
  '[    3.700000] systemd[1]: Queued start job for default target Graphical Interface.',
  '[    3.800000] systemd[1]: Created slice system-modprobe.slice.',
  '[    3.900000] systemd[1]: Finished monitoring of LVM2 mirrors...',
  '[    4.000000] systemd[1]: Finished Remount Root and Kernel File Systems.',
  '[    4.100000] systemd[1]: Mounting FUSE Control File System...',
  '[    4.200000] systemd[1]: Starting pstore...',
  '[    4.300000] systemd[1]: Finished pstore.',
  '[    4.400000] systemd[1]: Starting Update the bootloader random seed...',
  '[    4.500000] systemd[1]: Finished Update the bootloader random seed.',
  '[    4.600000] systemd[1]: Finished coldplug all udev devices.',
  '[    4.700000] systemd[1]: Mounted FUSE Control File System.',
  '[    4.800000] systemd[1]: Finished Create System Users.',
  '[    4.900000] systemd[1]: Finished Create Static Device Nodes in /dev.',
  '[    5.000000] systemd[1]: Starting Rule-based Manager for Device Events and Files...',
  '[    5.100000] systemd[1]: Started Rule-based Manager for Device Events and Files.',
  '[    5.200000] systemd[1]: Starting Network Service...',
  '[    5.300000] systemd[1]: Started Network Service.',
  '[    5.400000] systemd[1]: Finished Availability of block devices.',
  '[    5.500000] systemd[1]: Starting File System Check on /dev/disk/by-uuid/...',
  '[    5.600000] systemd[1]: Finished File System Check on /dev/disk/by-uuid/...',
  '[    5.700000] systemd[1]: Mounting /boot...',
  '[    5.800000] systemd[1]: Mounted /boot.',
  '[    5.900000] systemd[1]: Reached target Local File Systems.',
  '[    6.000000] systemd[1]: Starting Set console font and keymap...',
  '[    6.100000] systemd[1]: Finished Set console font and keymap.',
  '[    6.200000] systemd[1]: Starting Create Volatile Files and Directories...',
  '[    6.300000] systemd[1]: Finished Create Volatile Files and Directories.',
  '[    6.400000] systemd[1]: Starting Network Name Resolution...',
  '[    6.500000] systemd[1]: Started Network Name Resolution.',
  '[    6.600000] systemd[1]: Reached target Host and Network Name Lookups.',
  '[    6.700000] systemd[1]: Reached target Network.',
  '[    6.800000] systemd[1]: Starting Permit User Sessions...',
  '[    6.900000] systemd[1]: Finished Permit User Sessions.',
  '[    7.000000] systemd[1]: Started OpenBSD secure shell server.',
  '[    7.100000] systemd[1]: Starting Light Display Manager...',
  '[    7.200000] systemd[1]: Started Light Display Manager.',
  '[    7.300000] systemd[1]: Reached target Graphical Interface.',
  '[    7.400000] systemd[1]: Starting Update UTMP about System Runlevel Changes...',
  '[    7.500000] systemd[1]: Finished Update UTMP about System Runlevel Changes.',
  '[    7.600000] systemd[1]: Startup finished in 3.421s (kernel) + 4.179s (userspace) = 7.600s.',
  '[    7.700000] [ OK ] Started kernel.',
  '[    7.800000] [ OK ] Mounted /dev/sda1.',
  '[    7.900000] [ OK ] Started network service.',
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

export default function Home() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<'boot' | 'login' | 'password' | 'success' | 'transition'>('boot');
  const [visibleLines, setVisibleLines] = useState<number>(0);
  const [loginInput, setLoginInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [cursorVisible, setCursorVisible] = useState(true);
  const [skipHintVisible, setSkipHintVisible] = useState(true);
  const [accelerated, setAccelerated] = useState(false);
  const [flashPhase, setFlashPhase] = useState<'none' | 'white' | 'black' | 'message'>('none');
  const [_typingLogin, setTypingLogin] = useState(false);
  const [_typingPassword, setTypingPassword] = useState(false);
  const bootTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const loginTypedRef = useRef(false);
  const passwordTypedRef = useRef(false);

  // Cursor blink
  useEffect(() => {
    const interval = setInterval(() => {
      setCursorVisible((v) => !v);
    }, 530);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll to bottom during boot
  useEffect(() => {
    if (containerRef.current && phase === 'boot') {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [visibleLines, phase]);

  // Boot sequence
  useEffect(() => {
    if (phase !== 'boot') return;

    const showNextLine = () => {
      setVisibleLines((prev) => {
        const next = prev + 1;
        if (next >= BOOT_LINES.length) {
          // All lines shown, wait 800ms then go to login
          bootTimerRef.current = setTimeout(() => {
            setPhase('login');
          }, 800);
          return next;
        }
        const delay = accelerated ? 5 : 30 + Math.random() * 50;
        bootTimerRef.current = setTimeout(showNextLine, delay);
        return next;
      });
    };

    const initialDelay = accelerated ? 5 : 30 + Math.random() * 50;
    bootTimerRef.current = setTimeout(showNextLine, initialDelay);

    return () => {
      if (bootTimerRef.current) clearTimeout(bootTimerRef.current);
    };
  }, [phase, accelerated]);

  // Auto-type login name
  useEffect(() => {
    if (phase === 'login' && !loginTypedRef.current) {
      loginTypedRef.current = true;
      setTypingLogin(true);
      const target = 'homerocabrera';
      let idx = 0;
      const typeChar = () => {
        idx++;
        setLoginInput(target.slice(0, idx));
        if (idx < target.length) {
          setTimeout(typeChar, 40);
        } else {
          setTypingLogin(false);
        }
      };
      setTimeout(typeChar, 40);
    }
  }, [phase]);

  // Auto-type password
  useEffect(() => {
    if (phase === 'password' && !passwordTypedRef.current) {
      passwordTypedRef.current = true;
      setTypingPassword(true);
      const target = 'password';
      let idx = 0;
      const typeChar = () => {
        idx++;
        setPasswordInput('*'.repeat(idx));
        if (idx < target.length) {
          setTimeout(typeChar, 40);
        } else {
          setTypingPassword(false);
          // Auto-submit after password typed
          setTimeout(() => {
            setPhase('success');
          }, 300);
        }
      };
      setTimeout(typeChar, 40);
    }
  }, [phase]);

  // Success -> transition
  useEffect(() => {
    if (phase === 'success') {
      const t1 = setTimeout(() => {
        setFlashPhase('white');
      }, 600);
      const t2 = setTimeout(() => {
        setFlashPhase('black');
      }, 650);
      const t3 = setTimeout(() => {
        setFlashPhase('message');
      }, 700);
      const t4 = setTimeout(() => {
        navigate('/terminal');
      }, 1000);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
        clearTimeout(t4);
      };
    }
  }, [phase, navigate]);

  // Keyboard handler
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (phase === 'boot') {
        if (e.key === 'Enter') {
          // Skip to login
          if (bootTimerRef.current) clearTimeout(bootTimerRef.current);
          setVisibleLines(BOOT_LINES.length);
          setPhase('login');
        } else {
          setAccelerated(true);
        }
      } else if (phase === 'login') {
        if (e.key === 'Enter') {
          setPhase('password');
        } else if (e.key === 'Backspace') {
          setLoginInput((prev) => prev.slice(0, -1));
        } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
          setLoginInput((prev) => prev + e.key);
        }
      } else if (phase === 'password') {
        if (e.key === 'Enter') {
          setPhase('success');
        } else if (e.key === 'Backspace') {
          setPasswordInput((prev) => prev.slice(0, -1));
        } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
          setPasswordInput((prev) => prev + '*');
        }
      }
    },
    [phase]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Hide skip hint after a few seconds
  useEffect(() => {
    if (phase !== 'boot') {
      setSkipHintVisible(false);
      return;
    }
    const t = setTimeout(() => setSkipHintVisible(false), 3000);
    const t2 = setTimeout(() => setSkipHintVisible(true), 5000);
    return () => {
      clearTimeout(t);
      clearTimeout(t2);
    };
  }, [phase]);

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

  const currentDate = new Date().toUTCString();

  return (
    <div className="relative w-screen h-[100dvh] bg-terminal-black overflow-hidden select-none">
      {/* Flash overlay for transition */}
      {flashPhase !== 'none' && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center"
          style={{
            backgroundColor:
              flashPhase === 'white'
                ? '#F0F0F0'
                : flashPhase === 'black'
                ? '#0C0C0C'
                : '#0C0C0C',
            transition: 'background-color 50ms',
          }}
        >
          {flashPhase === 'message' && (
            <span className="text-terminal-gray font-mono text-[16px] font-bold tracking-[1px]">
              Switching to TTY1...
            </span>
          )}
        </div>
      )}

      {/* Boot output area */}
      {phase === 'boot' && (
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

          {/* Skip hint */}
          {skipHintVisible && (
            <div className="absolute bottom-0 right-0 translate-y-full pt-2 text-right">
              <span className="font-mono text-[12px] text-terminal-gray-dark hover:text-terminal-gray transition-colors duration-150 cursor-pointer">
                Press [Enter] to skip boot
              </span>
            </div>
          )}
        </div>
      )}

      {/* Login prompt */}
      {(phase === 'login' || phase === 'password' || phase === 'success') && (
        <div className="absolute bottom-8 left-8 max-w-[800px] w-full font-mono text-[14px] leading-[1.5]">
          <div className="text-terminal-white mb-1">
            Welcome to homerocabrera OS 6.8.0 (GNU/Linux 6.8.0-homero x86_64)
          </div>
          <div className="mb-3" />
          <div className="text-terminal-white">
            <span className="text-terminal-gray">* </span>
            Documentation:{' '}
            <span className="text-terminal-green underline cursor-pointer">https://homerocabrera.dev</span>
          </div>
          <div className="text-terminal-white">
            <span className="text-terminal-gray">* </span>
            Support:{'       '}
            <span className="text-terminal-green underline cursor-pointer">homero9726@gmail.com</span>
          </div>
          <div className="mb-3" />
          <div className="text-terminal-gray">0 packages can be updated.</div>
          <div className="text-terminal-gray">0 updates are security updates.</div>
          <div className="mb-3" />

          {/* Login field */}
          <div className="flex items-center text-terminal-white">
            <span>homerocabrera login: </span>
            {phase === 'login' && (
              <>
                <span>{loginInput}</span>
                <span
                  className="inline-block w-[8px] h-[16px] bg-terminal-white ml-[1px]"
                  style={{ opacity: cursorVisible ? 1 : 0, transition: 'opacity 530ms' }}
                />
              </>
            )}
            {phase !== 'login' && <span className="text-terminal-white">{loginInput}</span>}
          </div>

          {/* Password field */}
          {(phase === 'password' || phase === 'success') && (
            <div className="flex items-center text-terminal-white mt-1">
              <span>Password: </span>
              {phase === 'password' && (
                <>
                  <span>{passwordInput}</span>
                  <span
                    className="inline-block w-[8px] h-[16px] bg-terminal-white ml-[1px]"
                    style={{ opacity: cursorVisible ? 1 : 0, transition: 'opacity 530ms' }}
                  />
                </>
              )}
              {phase === 'success' && <span>{passwordInput}</span>}
            </div>
          )}

          {/* Success message */}
          {phase === 'success' && (
            <div className="mt-2 text-terminal-green">
              Last login: {currentDate}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
