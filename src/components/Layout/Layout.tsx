import { useCallback, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { redirectPathSet, selectIsAuthenticated } from '../../store/authSlice';
import {
  cartClosed,
  cartOpened,
  quantityChanged,
  selectCartCount,
  selectCartItems,
  selectCartOpen,
  selectCartTotal,
} from '../../store/cartSlice';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { CartDrawer } from '../CartDrawer/CartDrawer';
import { Drawer } from '../Drawer/Drawer';
import { Logo } from '../Logo/Logo';
import { NavLinks } from '../NavLinks/NavLinks';
import { SiteHeader } from '../SiteHeader/SiteHeader';

export function Layout() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const cartItems = useAppSelector(selectCartItems);
  const cartCount = useAppSelector(selectCartCount);
  const cartTotal = useAppSelector(selectCartTotal);
  const cartOpen = useAppSelector(selectCartOpen);
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const closeCart = useCallback(() => dispatch(cartClosed()), [dispatch]);

  const handleCheckout = () => {
    dispatch(cartClosed());
    if (isAuthenticated) {
      navigate('/checkout');
      return;
    }
    dispatch(redirectPathSet('/checkout'));
    navigate('/auth');
  };

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
        menuOpen={menuOpen}
        cartCount={cartCount}
        onToggleMenu={() => setMenuOpen((open) => !open)}
        onOpenCart={() => dispatch(cartOpened())}
      />

      <Drawer
        id="site-menu"
        label="Menu"
        open={menuOpen}
        onClose={closeMenu}
        mobileOnly
        className="w-70 max-w-[75%] p-6"
      >
        <Logo className="mb-8" />
        <nav aria-label="Main">
          <NavLinks isAuthenticated={isAuthenticated} orientation="vertical" onNavigate={closeMenu} />
        </nav>
      </Drawer>

      <CartDrawer
        open={cartOpen}
        items={cartItems}
        total={cartTotal}
        isAuthenticated={isAuthenticated}
        onClose={closeCart}
        onQuantityChange={(id, quantity) => dispatch(quantityChanged({ id, quantity }))}
        onCheckout={handleCheckout}
      />

      <main id="main" className="mx-auto w-full max-w-6xl px-4 pt-20 pb-16 sm:px-6">
        <Outlet />
      </main>
    </>
  );
}
