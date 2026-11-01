import { NavLink } from 'react-router-dom';
import { TAB_NAV } from '@/config/navigation';
import { cn } from '@/lib/cn';

export function TabBar() {
  return (
    <nav
      aria-label="Main tabs"
      className="glass fixed inset-x-0 bottom-0 z-40 flex items-stretch pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      {TAB_NAV.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              cn(
                'flex min-h-[56px] flex-1 flex-col items-center justify-center gap-1 text-caption font-medium transition-[color,transform] duration-200 ease-out active:scale-[0.96]',
                isActive ? 'text-accent-text' : 'text-label-secondary',
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={22}
                  strokeWidth={2}
                  aria-hidden
                  className={cn(isActive ? 'text-accent' : 'text-label-secondary')}
                />
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
}
