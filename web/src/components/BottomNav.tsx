import { Link, useMatchRoute } from '@tanstack/react-router';
import { Bird, Home, Info, MapPinned, PlusCircle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type NavItem = {
  to: '/' | '/burung' | '/spotting' | '/catat' | '/tentang';
  label: string;
  icon: LucideIcon;
  exact: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Beranda', icon: Home, exact: true },
  { to: '/burung', label: 'Katalog', icon: Bird, exact: false },
  { to: '/spotting', label: 'Spotting', icon: MapPinned, exact: false },
  { to: '/catat', label: 'Catat', icon: PlusCircle, exact: false },
  { to: '/tentang', label: 'Tentang', icon: Info, exact: false },
];

export function BottomNav() {
  const matchRoute = useMatchRoute();

  return (
    <nav
      aria-label="Navigasi utama"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-rule bg-cream/95 backdrop-blur-sm"
    >
      <div className="mx-auto grid w-full max-w-3xl grid-cols-5">
        {NAV_ITEMS.map((item) => {
          const active = Boolean(matchRoute({ to: item.to, fuzzy: !item.exact }));
          const Icon = item.icon;

          return (
            <Link
              key={item.to}
              to={item.to}
              aria-current={active ? 'page' : undefined}
              className={`relative flex min-h-[52px] flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors duration-150 ${
                active ? 'text-forest-deep' : 'text-muted hover:text-ink'
              }`}
            >
              <Icon
                className="h-[18px] w-[18px]"
                strokeWidth={active ? 2 : 1.6}
                aria-hidden="true"
              />
              <span className="leading-tight">{item.label}</span>
              <span
                className={`absolute bottom-0 h-[2px] w-5 rounded-full bg-forest transition-opacity duration-150 ${
                  active ? 'opacity-100' : 'opacity-0'
                }`}
                aria-hidden="true"
              />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
