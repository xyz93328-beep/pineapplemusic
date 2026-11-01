import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { useApplyTheme } from '@/hooks/useApplyTheme';
import { BrowsePage } from '@/pages/BrowsePage';
import { CallbackPage } from '@/pages/CallbackPage';
import { LoginPage } from '@/pages/LoginPage';
import { PlaceholderPage } from '@/pages/PlaceholderPage';
import { SearchPage } from '@/pages/SearchPage';

function App() {
  useApplyTheme();

  return (
    <Routes>
      <Route path="login" element={<LoginPage />} />
      <Route path="callback" element={<CallbackPage />} />
      <Route
        element={
          <RequireAuth>
            <AppShell />
          </RequireAuth>
        }
      >
        <Route index element={<BrowsePage />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="new" element={<PlaceholderPage title="New" />} />
        <Route path="radio" element={<PlaceholderPage title="Radio" />} />
        <Route path="library/recently-added" element={<PlaceholderPage title="Recently Added" />} />
        <Route path="library/artists" element={<PlaceholderPage title="Artists" />} />
        <Route path="library/albums" element={<PlaceholderPage title="Albums" />} />
        <Route path="library/songs" element={<PlaceholderPage title="Songs" />} />
        <Route path="library/made-for-you" element={<PlaceholderPage title="Made for You" />} />
        <Route path="albums/:id" element={<PlaceholderPage title="Album" />} />
        <Route path="playlists/:id" element={<PlaceholderPage title="Playlist" />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
