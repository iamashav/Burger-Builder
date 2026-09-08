import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';
import { selectIsAuthenticated } from '../../store/authSlice';
import { SideDrawer } from '../SideDrawer/SideDrawer';
import { SiteHeader } from '../SiteHeader/SiteHeader';

export function Layout() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:bg-flood focus:px-4 focus:py-2 focus:font-mono focus:text-xs focus:text-ink"
      >
        Skip to content
      </a>

      <SiteHeader
        isAuthenticated={isAuthenticated}
        drawerOpen={drawerOpen}
        onToggleDrawer={() => setDrawerOpen((open) => !open)}
      />

      <SideDrawer
        open={drawerOpen}
        isAuthenticated={isAuthenticated}
        onClose={() => setDrawerOpen(false)}
      />

      <main id="main" className="mx-auto w-full max-w-5xl px-4 pt-20 pb-16 sm:px-6">
        <Outlet />
      </main>
    </>
  );
}
