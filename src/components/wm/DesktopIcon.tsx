interface DesktopIconProps {
  label: string;
  icon: string;
  selected?: boolean;
  onSelect?: () => void;
  onDoubleClick: () => void;
}

export default function DesktopIcon({
  label,
  icon,
  selected = false,
  onSelect,
  onDoubleClick,
}: DesktopIconProps) {
  return (
    <div
      className={`flex flex-col items-center gap-1 w-[72px] p-2 rounded cursor-pointer select-none transition-colors duration-100 ${
        selected
          ? 'bg-[rgba(74,246,38,0.15)] border border-terminal-green-dim'
          : 'hover:bg-[rgba(74,246,38,0.08)]'
      }`}
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.();
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        onDoubleClick();
      }}
    >
      <span className="text-[24px] leading-none">{icon}</span>
      <span className="font-mono text-[11px] text-terminal-white text-center leading-tight break-words w-full">
        {label}
      </span>
    </div>
  );
}
