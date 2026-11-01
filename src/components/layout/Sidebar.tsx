import { motion } from 'framer-motion';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { IconButton } from '@/components/common/IconButton';
import { Logo } from '@/components/common/Logo';
import { SearchField } from '@/components/common/SearchField';
import { LIBRARY_NAV, PRIMARY_NAV, type NavItem } from '@/config/navigation';
import { cn } from '@/lib/cn';
import { SPRING } from '@/lib/motion';
import { useUIStore } from '@/store/uiStore';
import { SidebarAccount } from '@/components/layout/SidebarAccount';
import { SidebarPlaylists } from '@/components/layout/SidebarPlaylists';

const EXPANDED_WIDTH = 284;
const COLLAPSED_WIDTH = 96;

interface SidebarLinkProps {
  item: NavItem;
  collapsed: boolean;
}

function SidebarLink({ item, collapsed }: SidebarLinkProps) {
  const Icon = item.icon;

  return (
    <NavLink
      to={item.to}
      end={item.to === '/'}
      aria-label={collapsed ? item.label : undefined}
      title={collapsed ? item.label : undefined}
      className={({ isActive }) =>
        cn(
          'flex h-9 items-center gap-3 rounded-[10px] px-3 text-body font-medium transition-[background-color,color,transform] duration-200 ease-out active:scale-[0.96]',
          collapsed && 'justify-center px-0',
          isActive ? 'bg-label/[0.08] text-accent-text' : 'text-label hover:bg-label/[0.05]',
        )
      }
    >
      {({ isActive }) => (
        <>
          <Icon
            size={18}
            strokeWidth={2}
            aria-hidden
            className={cn('shrink-0', isActive ? 'text-accent' : 'text-label-secondary')}
          />
          {!collapsed && <span className="truncate">{item.label}</span>}
        </>
      )}
    </NavLink>
  );
}

export function Sidebar() {
  const collapsed = useUIStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);

  return (
    <motion.aside
      aria-label="Sidebar"
      initial={false}
      animate={{ width: collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH }}
      transition={SPRING}
      className="hidden h-full shrink-0 p-3 md:block"
    >
      <div className="glass flex h-full flex-col overflow-hidden rounded-panel">
        <div
          className={cn(
            'flex items-center gap-2 px-4 pb-4 pt-5',
            collapsed ? 'flex-col' : 'justify-between',
          )}
        >
          <Logo collapsed={collapsed} />
          <IconButton
            label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-expanded={!collapsed}
            onClick={toggleSidebar}
          >
            {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </IconButton>
        </div>

        {!collapsed && (
          <div className="px-4 pb-3">
            <SearchField />
          </div>
        )}

        <nav aria-label="Primary" className="flex flex-col gap-0.5 px-3">
          {PRIMARY_NAV.map((item) => (
            <SidebarLink key={item.to} item={item} collapsed={collapsed} />
          ))}
        </nav>

        <div className="mt-5 flex-1 overflow-y-auto px-3 pb-4">
          {!collapsed && (
            <h2 className="px-3 pb-2 text-caption font-medium text-label-secondary">Library</h2>
          )}
          <nav aria-label="Library" className="flex flex-col gap-0.5">
            {LIBRARY_NAV.map((item) => (
              <SidebarLink key={item.to} item={item} collapsed={collapsed} />
            ))}
          </nav>
          {!collapsed && <SidebarPlaylists />}
        </div>

        <SidebarAccount collapsed={collapsed} />
      </div>
    </motion.aside>
  );
}
