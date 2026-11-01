import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { Artwork, firstImageUrl } from '@/components/common/Artwork';
import { IconButton } from '@/components/common/IconButton';
import { Skeleton } from '@/components/common/Skeleton';
import { useAsync } from '@/hooks/useAsync';
import { cn } from '@/lib/cn';
import { fetchCurrentUser } from '@/services/spotify/api';
import { useAuthStore } from '@/store/authStore';

interface SidebarAccountProps {
  collapsed: boolean;
}

export function SidebarAccount({ collapsed }: SidebarAccountProps) {
  const setSession = useAuthStore((s) => s.setSession);
  const navigate = useNavigate();
  const { state } = useAsync((signal) => fetchCurrentUser(signal), []);

  function signOut() {
    setSession(null);
    navigate('/login', { replace: true });
  }

  const name = state.status === 'success' ? (state.data.display_name ?? 'Spotify user') : 'Signed in';
  const avatar = state.status === 'success' ? firstImageUrl(state.data.images) : undefined;

  return (
    <div
      className={cn(
        'flex items-center gap-3 border-t border-separator px-4 py-3',
        collapsed && 'flex-col px-2',
      )}
    >
      <Artwork src={avatar} alt={name} shape="circle" className="h-8 w-8 shrink-0" />
      {!collapsed && (
        <div className="min-w-0 flex-1">
          {state.status === 'loading' ? (
            <Skeleton className="h-3 w-24" />
          ) : (
            <p className="truncate text-body font-medium text-label">{name}</p>
          )}
        </div>
      )}
      <IconButton label="Sign out" onClick={signOut}>
        <LogOut size={16} strokeWidth={2} aria-hidden />
      </IconButton>
    </div>
  );
}
