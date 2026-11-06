import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Shop from './pages/Shop';
import Product from './pages/Product';
import { useAuth } from './context/AuthContext';

const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const OrderConfirmation = lazy(() => import('./pages/OrderConfirmation'));
const TrackOrder = lazy(() => import('./pages/TrackOrder'));
const Account = lazy(() => import('./pages/Account'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const Info = lazy(() => import('./pages/Info'));
const Lookbook = lazy(() => import('./pages/Lookbook'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Admin = lazy(() => import('./admin/Admin'));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0 }); }, [pathname]);
  return null;
}

function PageLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-ink-200 border-t-ink" />
    </div>
  );
}

function RequireAuth({ children }) {
  const { user, ready } = useAuth();
  const loc = useLocation();
  if (!ready) return <PageLoader />;
  if (!user) return <Navigate to={`/account/login?next=${encodeURIComponent(loc.pathname)}`} replace />;
  return children;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/admin/*" element={<Admin />} />
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/men" element={<Shop gender="men" />} />
            <Route path="/women" element={<Shop gender="women" />} />
            <Route path="/new" element={<Shop collection="new-arrivals" />} />
            <Route path="/sale" element={<Shop collection="sale" />} />
            <Route path="/search" element={<Shop search />} />
            <Route path="/collections/:slug" element={<Shop />} />
            <Route path="/category/:slug" element={<Shop />} />
            <Route path="/products/:slug" element={<Product />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order/:id" element={<OrderConfirmation />} />
            <Route path="/track" element={<TrackOrder />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/lookbook" element={<Lookbook />} />
            <Route path="/account/login" element={<Account mode="login" />} />
            <Route path="/account/register" element={<Account mode="register" />} />
            <Route path="/account/*" element={<RequireAuth><Account /></RequireAuth>} />
            <Route path="/about" element={<Info page="about" />} />
            <Route path="/contact" element={<Info page="contact" />} />
            <Route path="/stores" element={<Info page="contact" />} />
            <Route path="/size-guide" element={<Info page="size-guide" />} />
            <Route path="/shipping" element={<Info page="shipping" />} />
            <Route path="/returns" element={<Info page="returns" />} />
            <Route path="/faq" element={<Info page="faq" />} />
            <Route path="/privacy" element={<Info page="privacy" />} />
            <Route path="/terms" element={<Info page="terms" />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Suspense>
    </>
  );
}
