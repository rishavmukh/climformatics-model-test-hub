import { Link, NavLink } from 'react-router-dom';

const LINKS = [
  { to: '/', label: 'Providers', end: true },
  { to: '/dashboard', label: 'Testing', end: false },
  { to: '/compare', label: 'Compare', end: false },
  { to: '/settings', label: 'Settings', end: false },
];

export function AppNav(): JSX.Element {
  return (
    <nav aria-label="Sections" className="border-b border-hairline bg-surface-card">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5" aria-label="Climformatics — home">
          <img src="/climformatics-logo.jpg" alt="Climformatics" className="h-6 w-auto sm:h-7" />
          <span className="hidden border-l border-hairline pl-2.5 text-xs font-medium uppercase tracking-wide text-ink-muted sm:inline">
            Model Test Hub
          </span>
        </Link>

        <div className="flex gap-1">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-accent-50 text-accent-700'
                    : 'text-ink-muted hover:bg-surface-sunken hover:text-ink-primary'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}
