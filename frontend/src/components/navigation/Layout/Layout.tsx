import Menu from '../Menu/Menu';
import CookieBanner from '../../legal/CookieBanner/CookieBanner';
import { MenuProvider, useMenu } from '../../../contexts/MenuContext/MenuContext';
import useAnalytics from '../../../hooks/useAnalytics/useAnalytics';

function LayoutInner({ children }: { children: React.ReactNode }) {
  const { setMenuOpen } = useMenu();

  useAnalytics({
    trackPageViews: true,
    debug: process.env.NODE_ENV !== "production",
  });
  
  return (
    <>
      <Menu onMenuToggle={setMenuOpen} />
      <main className="container mt-5 pt-5">
        {children}
      </main>
      <CookieBanner
        autoShow={true}
        position="bottom"
      />
    </>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <MenuProvider>
      <LayoutInner>{children}</LayoutInner>
    </MenuProvider>
  );
}

export default Layout;