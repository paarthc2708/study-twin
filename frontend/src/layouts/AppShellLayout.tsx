import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { Footer } from './Footer';

interface AppShellLayoutProps {
  showTopNav?: boolean;
  /** Skips the padded/max-width content wrapper and footer, for pages (like AI Mentor) that manage their own full-bleed layout. */
  fullBleed?: boolean;
}

export function AppShellLayout({ showTopNav = true, fullBleed = false }: AppShellLayoutProps) {
  return (
    <div className="flex min-h-screen font-body-md text-on-surface">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0">
        {showTopNav && <TopNav />}
        {fullBleed ? (
          <Outlet />
        ) : (
          <>
            <div className="p-lg max-w-container-max mx-auto w-full space-y-xl flex-1">
              <Outlet />
            </div>
            <Footer />
          </>
        )}
      </main>
    </div>
  );
}
