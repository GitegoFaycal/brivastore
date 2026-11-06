import { Outlet } from 'react-router-dom';
import PromoBar from './PromoBar';
import Header from './Header';
import Footer from './Footer';
import CartDrawer from './CartDrawer';
import WhatsAppButton from './WhatsAppButton';

export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <PromoBar />
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
      <WhatsAppButton />
    </div>
  );
}
