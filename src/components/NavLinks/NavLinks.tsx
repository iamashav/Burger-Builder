import { NavLink } from 'react-router-dom';
import { cn } from '../../lib/cn';

export interface NavLinksProps {
  isAuthenticated: boolean;
  orientation?: 'horizontal' | 'vertical';
  onNavigate?: () => void;
}

interface NavItem {
  to: string;
  label: string;
}

const PUBLIC_ITEMS: NavItem[] = [
  { to: '/', label: 'Build a drink' },
  { to: '/auth', label: 'Sign in' },
];

const PRIVATE_ITEMS: NavItem[] = [
  { to: '/', label: 'Build a drink' },
  { to: '/orders', label: 'Orders' },
  { to: '/logout', label: 'Log out' },
];

export function NavLinks({
  isAuthenticated,
  orientation = 'horizontal',
  onNavigate,
}: NavLinksProps) {
  const items = isAuthenticated ? PRIVATE_ITEMS : PUBLIC_ITEMS;

  return (
    <ul
      className={cn(
        'flex list-none gap-1 p-0',
        orientation === 'vertical' ? 'flex-col items-stretch' : 'flex-row items-center',
      )}
    >
      {items.map((item) => (
        <li key={item.to}>
          <NavLink
            to={item.to}
            end={item.to === '/'}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'block px-3 py-2 font-mono text-xs tracking-[0.14em] uppercase transition-colors',
                isActive ? 'text-flood' : 'text-smoke hover:text-bone',
              )
            }
          >
            {item.label}
          </NavLink>
        </li>
      ))}
    </ul>
  );
}
