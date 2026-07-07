import { NavLink } from 'react-router-dom';
import { MaterialIcon } from '../components/ui/MaterialIcon';

const NAV_ITEMS = [
  { to: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { to: '/mentor', icon: 'psychology', label: 'AI Mentor' },
  { to: '/quiz', icon: 'quiz', label: 'Quiz' },
  { to: '/strategy', icon: 'auto_stories', label: 'Strategy' },
  { to: '/analytics', icon: 'analytics', label: 'Analytics' },
  { to: '/digital-twin', icon: 'smart_toy', label: 'Digital Twin' },
];

const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-md px-lg py-md transition-all duration-200 ${
    isActive
      ? 'text-primary font-bold sidebar-item-active bg-primary/5'
      : 'text-on-surface-variant hover:bg-primary/10'
  }`;

export function Sidebar() {
  return (
    <aside className="w-[260px] h-screen sticky left-0 top-0 bg-surface/80 backdrop-blur-xl border-r border-white/30 flex flex-col py-lg z-50">
      <div className="px-lg mb-xl">
        <h1 className="font-headline-md text-headline-md font-bold text-primary">StudyTwin AI</h1>
        <p className="font-label-sm text-label-sm text-on-surface-variant">Learning Partner</p>
      </div>
      <nav className="flex-1 space-y-unit">
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.to} to={item.to} className={navLinkClasses}>
            <MaterialIcon name={item.icon} />
            <span className="font-body-md">{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto px-lg border-t border-outline-variant/30 pt-lg">
        <NavLink
          to="/settings"
          className="flex items-center gap-md py-md text-on-surface-variant hover:bg-primary/10 transition-all duration-200"
        >
          <MaterialIcon name="person" />
          <span className="font-body-md">Profile</span>
        </NavLink>
      </div>
    </aside>
  );
}
