import { MaterialIcon } from '../components/ui/MaterialIcon';

export function TopNav() {
  return (
    <header className="h-16 sticky top-0 bg-surface/60 backdrop-blur-xl border-b border-white/30 z-40">
      <div className="max-w-container-max mx-auto flex justify-between items-center px-lg h-full">
        <div className="flex items-center bg-surface-container-low px-md py-xs rounded-xl border border-outline-variant/20 w-80 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
          <MaterialIcon name="search" className="text-outline" />
          <input
            className="bg-transparent border-none focus:ring-0 text-label-sm w-full ml-sm"
            placeholder="Search resources, topics..."
            type="text"
          />
        </div>
        <div className="flex items-center gap-lg">
          <button className="text-on-surface-variant hover:text-primary transition-colors relative">
            <MaterialIcon name="notifications" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-error rounded-full" />
          </button>
          <div className="h-8 w-8 rounded-full bg-primary-container flex items-center justify-center overflow-hidden">
            <MaterialIcon name="person" className="text-on-primary-container" />
          </div>
        </div>
      </div>
    </header>
  );
}
