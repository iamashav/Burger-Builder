import { useEffect, useRef } from 'react';
import { cn } from '../../lib/cn';
import { Logo } from '../Logo/Logo';
import { NavigationItems } from '../NavigationItems/NavigationItems';

export interface SideDrawerProps {
  open: boolean;
  isAuthenticated: boolean;
  onClose: () => void;
}

export function SideDrawer({ open, isAuthenticated, onClose }: SideDrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', onKeyDown);
    panelRef.current?.focus();
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-40 bg-ink/70 transition-opacity sm:hidden',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        ref={panelRef}
        id="site-drawer"
        tabIndex={-1}
        // aria-hidden keeps the offscreen panel and its links out of the a11y tree and
        // the tab order; the old drawer stayed focusable while visually hidden.
        aria-hidden={!open}
        inert={!open}
        className={cn(
          'fixed top-0 left-0 z-50 h-full w-70 max-w-[75%] bg-ash p-6 ring-1 ring-smoke/15 transition-transform duration-300 ease-out sm:hidden',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <Logo className="mb-8" />
        <nav aria-label="Main">
          <NavigationItems
            isAuthenticated={isAuthenticated}
            orientation="vertical"
            onNavigate={onClose}
          />
        </nav>
      </div>
    </>
  );
}
