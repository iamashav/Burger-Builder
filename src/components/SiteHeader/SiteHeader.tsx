import { Link } from 'react-router-dom';
import { Logo } from '../Logo/Logo';
import { NavigationItems } from '../NavigationItems/NavigationItems';

export interface SiteHeaderProps {
  isAuthenticated: boolean;
  drawerOpen: boolean;
  onToggleDrawer: () => void;
}

export function SiteHeader({ isAuthenticated, drawerOpen, onToggleDrawer }: SiteHeaderProps) {
  return (
    <header className="fixed top-0 left-0 z-30 flex h-14 w-full items-center justify-between border-b border-smoke/15 bg-ink/95 px-4 backdrop-blur sm:px-6">
      <button
        type="button"
        onClick={onToggleDrawer}
        aria-expanded={drawerOpen}
        aria-controls="site-drawer"
        aria-label={drawerOpen ? 'Close menu' : 'Open menu'}
        className="flex size-9 cursor-pointer flex-col items-center justify-center gap-1.5 sm:hidden"
      >
        <span className="h-0.5 w-5 bg-bone" />
        <span className="h-0.5 w-5 bg-bone" />
        <span className="h-0.5 w-5 bg-bone" />
      </button>

      <Link to="/" className="inline-flex">
        <Logo />
      </Link>

      <nav aria-label="Main" className="hidden sm:block">
        <NavigationItems isAuthenticated={isAuthenticated} />
      </nav>
    </header>
  );
}
