// ─── Structure type SVG icons + priority styling ───

export function StructureIcon({ type, size = 20 }: { type: string; size?: number }) {
  const half = size / 2;
  switch (type) {
    case 'point':
      return (
        <svg width={size} height={size} viewBox="0 0 20 20">
          <polygon points="10,2 18,16 2,16" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <line x1="10" y1="8" x2="10" y2="16" stroke="currentColor" strokeWidth="0.8" strokeDasharray="2,1" />
        </svg>
      );
    case 'bluff':
      return (
        <svg width={size} height={size} viewBox="0 0 20 20">
          <path d="M3,16 L3,5 Q5,3 10,4 Q15,5 17,3 L17,16" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <line x1="5" y1="6" x2="5" y2="16" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1,2" />
          <line x1="10" y1="5" x2="10" y2="16" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1,2" />
          <line x1="15" y1="4" x2="15" y2="16" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1,2" />
        </svg>
      );
    case 'hump':
      return (
        <svg width={size} height={size} viewBox="0 0 20 20">
          <ellipse cx="10" cy="10" rx="8" ry="5" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <ellipse cx="10" cy="10" rx="4" ry="2.5" fill="none" stroke="currentColor" strokeWidth="0.8" strokeDasharray="2,1" />
        </svg>
      );
    case 'flat':
      return (
        <svg width={size} height={size} viewBox="0 0 20 20">
          <rect x="3" y="6" width="14" height="8" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <line x1="5" y1="10" x2="15" y2="10" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2,2" />
        </svg>
      );
    case 'dock':
      return (
        <svg width={size} height={size} viewBox="0 0 20 20">
          <rect x="6" y="3" width="8" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <line x1="6" y1="7" x2="14" y2="7" stroke="currentColor" strokeWidth="0.8" />
          <line x1="6" y1="11" x2="14" y2="11" stroke="currentColor" strokeWidth="0.8" />
          <line x1="10" y1="3" x2="10" y2="17" stroke="currentColor" strokeWidth="0.8" />
        </svg>
      );
    case 'creek-channel':
      return (
        <svg width={size} height={size} viewBox="0 0 20 20">
          <path d="M4,3 Q8,8 6,12 Q4,16 8,18" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M8,3 Q12,8 10,12 Q8,16 12,18" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2,1" />
        </svg>
      );
    case 'grass':
      return (
        <svg width={size} height={size} viewBox="0 0 20 20">
          <path d="M4,16 L6,6 L8,16 M8,16 L10,4 L12,16 M12,16 L14,8 L16,16" fill="none" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      );
    case 'riprap':
      return (
        <svg width={size} height={size} viewBox="0 0 20 20">
          <circle cx="6" cy="8" r="2.5" fill="none" stroke="currentColor" strokeWidth="1" />
          <circle cx="13" cy="7" r="3" fill="none" stroke="currentColor" strokeWidth="1" />
          <circle cx="9" cy="14" r="2.5" fill="none" stroke="currentColor" strokeWidth="1" />
          <circle cx="15" cy="13" r="2" fill="none" stroke="currentColor" strokeWidth="1" />
        </svg>
      );
    case 'laydown':
      return (
        <svg width={size} height={size} viewBox="0 0 20 20">
          <line x1="3" y1="14" x2="17" y2="6" stroke="currentColor" strokeWidth="1.5" />
          <line x1="8" y1="10" x2="6" y2="6" stroke="currentColor" strokeWidth="1" />
          <line x1="12" y1="8" x2="14" y2="4" stroke="currentColor" strokeWidth="1" />
          <line x1="12" y1="8" x2="10" y2="5" stroke="currentColor" strokeWidth="0.8" />
        </svg>
      );
    default:
      return (
        <svg width={size} height={size} viewBox="0 0 20 20">
          <circle cx={half} cy={half} r={half - 2} fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      );
  }
}

export const priorityStyle: Record<string, { color: string; bg: string; ring: string; label: string }> = {
  primary: { color: '#34d399', bg: 'rgba(16,185,129,0.12)', ring: 'rgba(16,185,129,0.25)', label: 'Start Here' },
  secondary: { color: '#fbbf24', bg: 'rgba(245,158,11,0.10)', ring: 'rgba(245,158,11,0.20)', label: 'Secondary' },
  tertiary: { color: '#94a3b8', bg: 'rgba(100,116,139,0.10)', ring: 'rgba(100,116,139,0.15)', label: 'Backup' },
};
