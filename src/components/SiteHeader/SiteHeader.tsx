import { Link } from 'react-router-dom';
import { Logo } from '../Logo/Logo';
import { NavLinks } from '../NavLinks/NavLinks';

export interface SiteHeaderProps {
  isAuthenticated: boolean;
  menuOpen: boolean;
  cartCount: number;
  onToggleMenu: () => void;
  onOpenCart: () => void;
}

export function SiteHeader({
  isAuthenticated,
  menuOpen,
  cartCount,
  onToggleMenu,
  onOpenCart,
}: SiteHeaderProps) {
  return (
    <header className="fixed top-0 left-0 z-30 flex h-14 w-full items-center justify-between gap-3 border-b border-smoke/15 bg-ink/95 px-4 backdrop-blur sm:px-6">
      <button
        type="button"
        onClick={onToggleMenu}
        aria-expanded={menuOpen}
        aria-controls="site-menu"
        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        className="flex size-9 cursor-pointer flex-col items-center justify-center gap-1.5 sm:hidden"
      >
        <span className="h-0.5 w-5 bg-bone" />
        <span className="h-0.5 w-5 bg-bone" />
        <span className="h-0.5 w-5 bg-bone" />
      </button>

      <Link to="/" className="inline-flex">
        <Logo />
      </Link>

      <div className="flex items-center gap-2">
        <nav aria-label="Main" className="hidden sm:block">
          <NavLinks isAuthenticated={isAuthenticated} />
        </nav>

        <button
          type="button"
          onClick={onOpenCart}
          aria-controls="cart-drawer"
          aria-label={`Open order, ${cartCount} ${cartCount === 1 ? 'drink' : 'drinks'}`}
          className="flex cursor-pointer items-center gap-2 px-3 py-2 font-mono text-xs tracking-[0.14em] text-bone uppercase ring-1 ring-smoke/30 transition-colors ring-inset hover:text-flood hover:ring-flood"
        >
          Order
          <span className="min-w-5 rounded-full bg-flood px-1.5 text-center text-ink tabular-nums">
            {cartCount}
          </span>
        </button>
      </div>
    </header>
  );
}
