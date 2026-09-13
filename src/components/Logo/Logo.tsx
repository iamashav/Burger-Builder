import { BRAND_NAME } from '../../data/brand';
import { cn } from '../../lib/cn';

const PEARLS = [
  [13, 24],
  [16.4, 24],
  [19.4, 24],
  [14.6, 21],
  [18, 21],
];

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <svg viewBox="4 1 24 28" aria-hidden="true" className="h-8 w-auto">
        <path d="M8 10h16l-3 17H11z" fill="#c8a98f" />
        <rect x="7" y="8" width="18" height="2.5" rx="1.25" className="fill-bone" />
        <path d="M19 3h2.2l-3.6 23h-2.2z" className="fill-flood" />
        {PEARLS.map(([cx, cy]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={1.6} fill="#3b2418" />
        ))}
      </svg>
      <span className="font-display text-xl tracking-[0.06em] text-bone">{BRAND_NAME}</span>
    </span>
  );
}
