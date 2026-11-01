import { Home, Search, Plus, Radio, Clock, Mic2, Disc3, Music, Sparkles, type LucideIcon } from 'lucide-react';

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
}

export const PRIMARY_NAV: NavItem[] = [
  { label: 'Search', to: '/search', icon: Search },
  { label: 'Home', to: '/', icon: Home },
  { label: 'New', to: '/new', icon: Plus },
  { label: 'Radio', to: '/radio', icon: Radio },
];

export const LIBRARY_NAV: NavItem[] = [
  { label: 'Recently Added', to: '/library/recently-added', icon: Clock },
  { label: 'Artists', to: '/library/artists', icon: Mic2 },
  { label: 'Albums', to: '/library/albums', icon: Disc3 },
  { label: 'Songs', to: '/library/songs', icon: Music },
  { label: 'Made for You', to: '/library/made-for-you', icon: Sparkles },
];

export const TAB_NAV: NavItem[] = [
  { label: 'Home', to: '/', icon: Home },
  { label: 'Search', to: '/search', icon: Search },
  { label: 'New', to: '/new', icon: Plus },
  { label: 'Radio', to: '/radio', icon: Radio },
  { label: 'Library', to: '/library/recently-added', icon: Disc3 },
];
