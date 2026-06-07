import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const PANIC_TEXT = `Kernel panic - not syncing: VFS: Unable to mount root fs on unknown-block(0,0)
CPU: 0 PID: 1 Comm: init Not tainted 6.8.0-homero #1
Hardware name: Moonsbow Virtual Developer Workstation
Call Trace:
 <IRQ>
 dump_stack_lvl+0x48/0x70
 panic+0x104/0x2e0
 mount_block_root+0x1e4/0x2e8
 prepare_namespace+0x136/0x170
 kernel_init+0x16/0x110
 ret_from_fork+0x2c/0x50
 </IRQ>`;

export default function NotFound() {
  const navigate = useNavigate();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        navigate('/');
      }
    },
    [navigate]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="min-h-[100dvh] bg-terminal-black flex flex-col items-center justify-center px-4 py-8 font-mono">
      <div className="w-full max-w-[800px]">
        <pre className="whitespace-pre-wrap text-terminal-red text-[12px] md:text-[14px] leading-relaxed">
          {PANIC_TEXT}
        </pre>

        <div className="mt-4 text-terminal-red text-[12px] md:text-[14px]">
          [ 404.000000] Page not found. The requested URL was not found on this server.
        </div>

        <div className="mt-8 flex items-center text-terminal-gray text-[13px] md:text-[14px]">
          <span className="mr-2">Press [Enter] to reboot system</span>
          <span className="inline-block w-[8px] h-[15px] bg-terminal-red animate-cursor-blink" />
        </div>
      </div>
    </div>
  );
}
