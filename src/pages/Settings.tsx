import { useWindowMode } from '@/hooks/use-window-mode';

export default function Settings() {
  const { windowMode, toggleWindowMode } = useWindowMode();

  return (
    <div className="min-h-[100dvh] bg-terminal-black text-terminal-white font-mono p-6">
      <div className="max-w-[600px] mx-auto">
        <h1 className="text-terminal-green text-[18px] font-bold mb-4">
          {'┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓'}
        </h1>
        <h2 className="text-terminal-green text-[16px] font-bold mb-2 text-center">
          {'┃  SETTINGS                                                          ┃'}
        </h2>
        <div className="text-terminal-green text-[12px] mb-6 text-center">
          {'┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛'}
        </div>

        <div className="space-y-4">
          {/* Window Mode Toggle */}
          <div className="border border-terminal-green-dim p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[14px] text-terminal-white">
                Window Manager Mode
              </span>
              <button
                onClick={toggleWindowMode}
                className={`w-[44px] h-[22px] rounded-full relative transition-colors duration-200 ${
                  windowMode ? 'bg-terminal-green' : 'bg-terminal-gray-dark'
                }`}
                aria-pressed={windowMode}
              >
                <span
                  className={`absolute top-[2px] w-[18px] h-[18px] rounded-full bg-terminal-black transition-transform duration-200 ${
                    windowMode ? 'left-[24px]' : 'left-[2px]'
                  }`}
                />
              </button>
            </div>
            <p className="text-[12px] text-terminal-gray">
              Enable desktop environment with draggable windows, taskbar, and
              desktop icons.
            </p>
            <p className="text-[11px] text-terminal-gray mt-2">
              Shortcut:{' '}
              <span className="text-terminal-amber">Ctrl+Shift+W</span>
            </p>
          </div>

          {/* About */}
          <div className="border border-terminal-green-dim p-4">
            <p className="text-[14px] text-terminal-white mb-2">About</p>
            <p className="text-[12px] text-terminal-gray">
              Terminal CV — moonsbow OS 6.8.0
            </p>
            <p className="text-[12px] text-terminal-gray">
              Built with React, TypeScript, Tailwind CSS
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
