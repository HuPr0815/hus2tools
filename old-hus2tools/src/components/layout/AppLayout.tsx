import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import SearchDialog from './SearchDialog';
import { useRecentTools } from '@/hooks/useRecentTools';
import { cn } from '@/lib/utils';

export default function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();
  const { addRecent } = useRecentTools();

  const isHomePage = location.pathname === '/';

  useEffect(() => {
    const toolId = location.pathname.slice(1);
    if (toolId) addRecent(toolId);
  }, [location.pathname, addRecent]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="flex h-screen bg-bg-primary text-text-primary">
      {!isHomePage && (
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
        />
      )}
      <div className="flex flex-col flex-1 min-w-0">
        {!isHomePage && <Header onSearchClick={() => setSearchOpen(true)} />}
        <main
          className={cn(
            'flex-1 overflow-auto bg-bg-primary',
            isHomePage ? '' : 'p-4'
          )}
        >
          <div
            key={location.key}
            className={cn(
              'animate-fade-in',
              !isHomePage && 'rounded-clay-lg shadow-clay-inset bg-bg-primary min-h-full'
            )}
          >
            <Outlet />
          </div>
        </main>
      </div>
      <SearchDialog
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
      />
    </div>
  );
}
