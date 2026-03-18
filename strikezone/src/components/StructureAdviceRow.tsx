import type { StructureTarget } from '@/lib/types';
import { StructureIcon, priorityStyle } from './StructureIcon';

interface StructureAdviceRowProps {
  target: StructureTarget;
  advice: string;
  anglerAccent: string;
}

export default function StructureAdviceRow({ target, advice, anglerAccent }: StructureAdviceRowProps) {
  const style = priorityStyle[target.priority];

  return (
    <div className="flex items-start gap-2.5 py-1.5">
      <div
        className="w-7 h-7 rounded flex items-center justify-center flex-shrink-0"
        style={{ background: style.bg, color: style.color }}
      >
        <StructureIcon type={target.type} size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-white">{target.name}</span>
          <span
            className="text-xs font-mono uppercase px-1.5 py-0.5 rounded"
            style={{ color: style.color, background: style.bg }}
          >
            {style.label}
          </span>
        </div>
        <p className="text-[11px] text-slate-400 leading-snug mt-0.5" style={{ borderLeft: `2px solid ${anglerAccent}30` }}>
          <span className="pl-2">{advice}</span>
        </p>
      </div>
    </div>
  );
}
