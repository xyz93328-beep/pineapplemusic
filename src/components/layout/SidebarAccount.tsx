import { LogOut, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApiKeyStore } from '@/store/apiKeyStore';
import { IconButton } from '@/components/common/IconButton';
import { cn } from '@/lib/cn';

export function SidebarAccount({ collapsed }: { collapsed: boolean }) {
  const { apiKey, clearApiKey } = useApiKeyStore();
  const navigate = useNavigate();
  const hasEnvKey = Boolean(import.meta.env.VITE_YT_API_KEY);

  // If the key is purely from the environment (public deployment), don't
  // show any account row at all — there's nothing for the user to manage.
  if (hasEnvKey && !apiKey) return null;

  // User has a personal persisted key — let them remove it.
  function handleClear() {
    clearApiKey();
    if (!import.meta.env.VITE_YT_API_KEY) {
      navigate('/login', { replace: true });
    }
  }

  return (
    <div className={cn(
      'flex items-center gap-3 border-t border-separator px-4 py-3',
      collapsed && 'flex-col px-2',
    )}>
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-raised text-label-secondary">
        <Settings size={14} aria-hidden />
      </div>
      {!collapsed && (
        <div className="min-w-0 flex-1">
          <p className="text-caption font-medium text-label">API Key</p>
          <p className="truncate text-caption text-label-secondary">
            {apiKey ? `•••${apiKey.slice(-6)}` : 'From environment'}
          </p>
        </div>
      )}
      <IconButton label="Remove API key" onClick={handleClear}>
        <LogOut size={16} strokeWidth={2} aria-hidden />
      </IconButton>
    </div>
  );
}
