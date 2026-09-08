import burgerLogo from '../../assets/images/burger-logo.png';
import { cn } from '../../lib/cn';

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <img src={burgerLogo} alt="" aria-hidden="true" className="h-8 w-auto" />
      <span className="font-display text-xl tracking-[0.06em] text-bone">MyBurger</span>
    </span>
  );
}
