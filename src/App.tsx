import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout/Layout';
import { Spinner } from './components/Spinner/Spinner';
import { BuilderPage } from './routes/BuilderPage';
import { RequireAuth } from './routes/RequireAuth';

// The builder is the landing route so it stays in the main bundle; everything behind a
// click or a sign-in is split out.
const AuthPage = lazy(() =>
  import('./routes/AuthPage').then((module) => ({ default: module.AuthPage })),
);
const CheckoutPage = lazy(() =>
  import('./routes/CheckoutPage').then((module) => ({ default: module.CheckoutPage })),
);
const OrdersPage = lazy(() =>
  import('./routes/OrdersPage').then((module) => ({ default: module.OrdersPage })),
);
const FavouritesPage = lazy(() =>
  import('./routes/FavouritesPage').then((module) => ({ default: module.FavouritesPage })),
);
const LogoutPage = lazy(() =>
  import('./routes/LogoutPage').then((module) => ({ default: module.LogoutPage })),
);

function App() {
  return (
    <Routes>
      <Route
        element={
          <Suspense fallback={<Spinner />}>
            <Layout />
          </Suspense>
        }
      >
        <Route index element={<BuilderPage />} />
        <Route path="auth" element={<AuthPage />} />

        <Route element={<RequireAuth />}>
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="favourites" element={<FavouritesPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="logout" element={<LogoutPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
