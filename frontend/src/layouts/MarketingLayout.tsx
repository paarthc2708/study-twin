import { Link, Outlet } from 'react-router-dom';
import { Footer } from './Footer';

export function MarketingLayout() {
  return (
    <div className="flex flex-col min-h-screen font-body-md text-on-surface">
      <header className="sticky top-0 z-40 bg-surface/70 backdrop-blur-xl border-b border-white/30">
        <div className="max-w-container-max mx-auto flex justify-between items-center px-lg h-16">
          <Link to="/" className="font-headline-md text-headline-md font-bold text-primary">
            StudyTwin AI
          </Link>
          <Link
            to="/sign-in"
            className="px-lg py-sm rounded-lg bg-primary text-on-primary font-label-sm text-label-sm font-bold transition-all duration-200 active:scale-95"
          >
            Sign In
          </Link>
        </div>
      </header>
      <div className="flex-1">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}
