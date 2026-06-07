import { useState, useEffect, useRef, useCallback } from 'react';

export interface WindowProps {
  id: string;
  title: string;
  icon?: string;
  defaultPosition?: { x: number; y: number };
  defaultSize?: { width: number; height: number };
  maximized?: boolean;
  active?: boolean;
  zIndex?: number;
  children: React.ReactNode;
  onClose?: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  onFocus?: () => void;
}

export default function Window({
  title,
  icon,
  defaultPosition = { x: 100, y: 80 },
  defaultSize = { width: 800, height: 560 },
  maximized = false,
  active = false,
  zIndex = 100,
  children,
  onClose,
  onMinimize,
  onMaximize,
  onFocus,
}: WindowProps) {
  const windowRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(defaultPosition);
  const [size, setSize] = useState(defaultSize);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const prevStateRef = useRef({ position: defaultPosition, size: defaultSize });

  // Track previous state for restore from maximize
  const handleMaximize = useCallback(() => {
    if (!maximized) {
      prevStateRef.current = { position, size };
    }
    onMaximize?.();
  }, [maximized, position, size, onMaximize]);

  // Drag start
  const handleTitleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (maximized) {
        // Dragging a maximized window restores it first
        if (e.buttons === 1) {
          handleMaximize();
          // Position window so mouse is near title bar center
          const newX = Math.max(0, e.clientX - size.width / 2);
          const newY = Math.max(0, e.clientY - 14);
          setPosition({ x: newX, y: newY });
          setDragOffset({ x: size.width / 2, y: 14 });
          setIsDragging(true);
        }
        return;
      }
      onFocus?.();
      setIsDragging(true);
      const rect = windowRef.current!.getBoundingClientRect();
      setDragOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    },
    [maximized, onFocus, size.width, handleMaximize]
  );

  // Resize start
  const handleResizeMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onFocus?.();
      setIsResizing(true);
    },
    [onFocus]
  );

  // Global mouse move / up for drag and resize
  useEffect(() => {
    if (!isDragging && !isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: Math.max(0, e.clientX - dragOffset.x),
          y: Math.max(0, e.clientY - dragOffset.y),
        });
      } else if (isResizing && windowRef.current) {
        const rect = windowRef.current.getBoundingClientRect();
        setSize({
          width: Math.max(320, e.clientX - rect.left),
          height: Math.max(200, e.clientY - rect.top),
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, dragOffset]);

  const handleWindowMouseDown = useCallback(() => {
    onFocus?.();
  }, [onFocus]);

  const style: React.CSSProperties = maximized
    ? {
        top: 0,
        left: 0,
        width: '100%',
        height: 'calc(100dvh - 32px)',
        zIndex,
      }
    : {
        top: position.y,
        left: position.x,
        width: size.width,
        height: size.height,
        zIndex,
      };

  return (
    <div
      ref={windowRef}
      className={`absolute flex flex-col rounded-[4px] overflow-hidden shadow-lg select-none ${
        active
          ? 'border border-terminal-green shadow-[0_0_12px_rgba(74,246,38,0.12)]'
          : 'border border-terminal-green-dim'
      }`}
      style={style}
      onMouseDown={handleWindowMouseDown}
    >
      {/* Title bar */}
      <div
        className={`flex items-center h-[28px] px-2 shrink-0 cursor-default ${
          active
            ? 'bg-terminal-black-alt border-b border-terminal-green'
            : 'bg-terminal-black border-b border-terminal-green-dim'
        }`}
        onMouseDown={handleTitleMouseDown}
      >
        <span className="mr-2 text-[12px] leading-none">{icon}</span>
        <span className="flex-1 font-mono text-[12px] text-terminal-white truncate">
          {title}
        </span>
        <div className="flex items-center gap-[2px]">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMinimize?.();
            }}
            className="w-[18px] h-[18px] flex items-center justify-center font-mono text-[11px] text-terminal-gray hover:text-terminal-white hover:bg-terminal-gray-dark rounded transition-colors duration-100"
            title="Minimize"
          >
            _
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleMaximize();
            }}
            className="w-[18px] h-[18px] flex items-center justify-center font-mono text-[11px] text-terminal-gray hover:text-terminal-white hover:bg-terminal-gray-dark rounded transition-colors duration-100"
            title={maximized ? 'Restore' : 'Maximize'}
          >
            {maximized ? '❐' : '□'}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose?.();
            }}
            className="w-[18px] h-[18px] flex items-center justify-center font-mono text-[11px] text-terminal-gray hover:text-terminal-white hover:bg-terminal-red rounded transition-colors duration-100"
            title="Close"
          >
            ×
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto bg-terminal-black-alt">
        {children}
      </div>

      {/* Resize handle */}
      {!maximized && (
        <div
          className="absolute bottom-0 right-0 w-[16px] h-[16px] cursor-se-resize z-10"
          onMouseDown={handleResizeMouseDown}
        >
          <div className="absolute bottom-[2px] right-[2px] w-[8px] h-[8px] border-r border-b border-terminal-green-dim" />
        </div>
      )}
    </div>
  );
}
